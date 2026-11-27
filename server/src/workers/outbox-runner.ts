import { connectRabbitMQ } from '@/config/rabbitmq';
import { publishOutboxEvents } from './outbox.worker';
import logger from '@/utils/logger';

const POLL_INTERVAL_MS = 2000;

const start = async () => {
  await connectRabbitMQ();

  logger.info('Outbox publisher started');

  let isShuttingDown = false;
  let timer: NodeJS.Timeout | null = null;

  const scheduleNextRun = () => {
    if (isShuttingDown) return;

    timer = setTimeout(async () => {
      try {
        await publishOutboxEvents();
      } catch (error) {
        logger.error('Outbox publishing failed:', error);
      } finally {
        scheduleNextRun();
      }
    }, POLL_INTERVAL_MS);
  };

  const shutdown = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}, stopping outbox runner...`);
    if (timer) {
      clearTimeout(timer);
    }
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Run immediately on startup, then schedule the next run only after completion
  try {
    await publishOutboxEvents();
  } catch (error) {
    logger.error('Outbox publishing failed:', error);
  } finally {
    scheduleNextRun();
  }
};

start().catch((error) => {
  logger.error('Something went wrong in start outbox runner:', error);
  process.exit(1);
});
