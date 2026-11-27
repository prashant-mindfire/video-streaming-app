import { connectRabbitMQ, closeRabbitMQ } from '@/config/rabbitmq';
import { closePool } from '@/config/db';
import { publishOutboxEvents } from './outbox.worker';
import logger from '@/utils/logger';

const POLL_INTERVAL_MS = 2000;

const start = async () => {
  await connectRabbitMQ();

  logger.info('Outbox publisher started');

  let isShuttingDown = false;
  let isProcessing = false;
  let timer: NodeJS.Timeout | null = null;

  const runBatch = async () => {
    if (isShuttingDown) return;

    isProcessing = true;
    try {
      await publishOutboxEvents();
    } catch (error) {
      logger.error('Outbox publishing failed:', error);
    } finally {
      isProcessing = false;
      if (!isShuttingDown) {
        timer = setTimeout(runBatch, POLL_INTERVAL_MS);
      }
    }
  };

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}, stopping outbox runner...`);
    if (timer) {
      clearTimeout(timer);
    }

    // Wait for any in-flight DB transaction + RabbitMQ publish to finish
    while (isProcessing) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    await closeRabbitMQ();
    await closePool();

    logger.info('Outbox runner shutdown complete');
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  await runBatch();
};

start().catch(async (error) => {
  logger.error('Something went wrong in start outbox runner:', error);
  await closeRabbitMQ();
  await closePool();
  process.exit(1);
});
