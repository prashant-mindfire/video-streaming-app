import type { Server } from 'http';
import { closePool, connectDB } from './config/db';
import app from './app';
import { closeRedis } from './config/redis';
import logger from './utils/logger';

const PORT = process.env.PORT || 3500;

const registerShutdownHandlers = (server?: Server): void => {
  let isShuttingDown = false;

  const gracefulShutdown = async (signal: string): Promise<void> => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Shutting down gracefully...`);

    const forceExitTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10_000);
    forceExitTimer.unref();

    try {
      if (server) {
        await new Promise<void>((resolve, reject) => {
          server.close((err) => (err ? reject(err) : resolve()));
        });
        logger.info('HTTP server closed');
      }

      await Promise.all([closePool(), closeRedis()]);

      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  process.once('SIGINT', () => gracefulShutdown('SIGINT'));
  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
    logger.info(`Swagger Docs: http://localhost:${PORT}/api-docs`);
  });

  registerShutdownHandlers(server);
});
