import type { ProcessingJobForRetry } from '@/models/processing-job.model';
import type { PoolClient } from 'pg';

export const findProcessingJobForUpdate = async (
  client: PoolClient,
  jobId: string,
): Promise<ProcessingJobForRetry | null> => {
  const result = await client.query<ProcessingJobForRetry>(
    `SELECT
       pj.id,
       pj.video_id,
       pj.status,
       v.user_id,
       v.original_object_key
     FROM processing_jobs pj
     INNER JOIN videos v ON v.id = pj.video_id
     WHERE pj.id = $1
     FOR UPDATE OF pj`,
    [jobId],
  );

  return result.rows[0] ?? null;
};

export const resetProcessingJobForRetry = async (client: PoolClient, jobId: string) => {
  await client.query(
    `UPDATE processing_jobs
     SET status = 'queued',
         attempts = 0,
         progress = 0,
         last_error = NULL,
         next_retry_at = NULL,
         started_at = NULL,
         completed_at = NULL,
         dead_lettered_at = NULL,
         updated_at = NOW()
     WHERE id = $1`,
    [jobId],
  );
};

export const resetVideoForRetry = async (client: PoolClient, videoId: string) => {
  await client.query(
    `UPDATE videos
     SET status = 'queued',
         updated_at = NOW()
     WHERE id = $1`,
    [videoId],
  );
};

export const createProcessingOutboxEvent = async (
  client: PoolClient,
  job: ProcessingJobForRetry,
) => {
  const payload = {
    jobId: job.id,
    videoId: job.video_id,
    userId: job.user_id,
    originalObjectKey: job.original_object_key,
  };

  await client.query(
    `INSERT INTO outbox_events (
       job_id,
       event_type,
       payload,
       status,
       available_at,
       created_at
     )
     VALUES ($1, $2, $3, 'pending', NOW(), NOW())`,
    [job.id, 'video.processing.requested', JSON.stringify(payload)],
  );
};
