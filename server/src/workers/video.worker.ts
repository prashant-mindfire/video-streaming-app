import type { VideoProcessingMessage } from '@/types/processing';
import { connectRabbitMQ, getRabbitMQConsumerChannel } from '../config/rabbitmq';
import { processVideo } from './video.processor';
import { pool } from '@/config/db';
import logger from '@/utils/logger';

const MAX_ATTEMPTS = 3;

export const startVideoWorker = async () => {
  await connectRabbitMQ();

  const channel = getRabbitMQConsumerChannel();

  logger.info('Video worker started. Waiting for jobs...');

  await channel.consume(
    'video.processing',
    async (message) => {
      if (!message) return;

      let job: VideoProcessingMessage;

      try {
        job = JSON.parse(message.content.toString()) as VideoProcessingMessage;

        const attempt = Number(message.properties.headers?.['x-attempt'] || 1);

        logger.info(`Processing video ${job.videoId}, attempt ${attempt}`);

        await pool.query(
          `UPDATE processing_jobs
           SET status = 'running',
               attempts = $2,
               started_at = COALESCE(started_at, NOW())
           WHERE id = $1`,
          [job.jobId, attempt],
        );

        await pool.query(`UPDATE videos SET status = 'processing' WHERE id = $1`, [job.videoId]);

        await processVideo(job);

        // Acknowledge only after processing and database updates succeed.
        channel.ack(message);

        logger.info(`Video ${job.videoId} processed successfully`);
      } catch (error) {
        logger.error('Video processing failed:', error);

        const attempt = Number(message.properties.headers?.['x-attempt'] || 1);

        const nextAttempt = attempt + 1;

        if (nextAttempt <= MAX_ATTEMPTS) {
          channel.sendToQueue('video.processing.retry', message.content, {
            persistent: true,
            contentType: 'application/json',
            messageId: message.properties.messageId,
            headers: {
              ...message.properties.headers,
              'x-attempt': nextAttempt,
            },
          });

          await pool
            .query(
              `UPDATE processing_jobs
             SET status = 'retry_scheduled',
                 last_error = $2
             WHERE id = $1`,
              [
                // For malformed messages, update the job only if its ID is known.
                (() => {
                  try {
                    return JSON.parse(message.content.toString()).jobId;
                  } catch {
                    return null;
                  }
                })(),
                error instanceof Error ? error.message : 'Unknown error',
              ],
            )
            .catch(() => undefined);
        } else {
          channel.sendToQueue('video.processing.dlq', message.content, {
            persistent: true,
            contentType: 'application/json',
            messageId: message.properties.messageId,
            headers: {
              ...message.properties.headers,
              'x-attempt': attempt,
              'x-failure-reason': error instanceof Error ? error.message : 'Unknown error',
            },
          });

          try {
            const failedJob = JSON.parse(message.content.toString());

            await pool.query(
              `UPDATE processing_jobs
               SET status = 'dead_lettered',
                   last_error = $2,
                   dead_lettered_at = NOW()
               WHERE id = $1`,
              [failedJob.jobId, error instanceof Error ? error.message : 'Unknown error'],
            );
          } catch {
            logger.error('Could not update failed job record');
          }
        }

        // Acknowledge original only after routing it to retry or DLQ.
        channel.ack(message);
      }
    },
    { noAck: false },
  );
};

startVideoWorker().catch((error) =>
  logger.error('Something went wrong in start video worker:', error),
);
