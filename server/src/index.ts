import express from 'express';
import logger from './utils/logger';
import { closePool, connectDB } from './config/db';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOrigins from './config/corsOrigins';
import router from './routes/router';
import { swaggerDocs, swaggerUi } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundErrorHandler } from './middlewares/notFound.middleware';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';
import { csrfProtection } from './middlewares/csrf.middleware';
import helmet from 'helmet';
import helmetOptions from './config/helmet';
import type { Server } from 'http';
import { closeRedis } from './config/redis';

const app = express();

const PORT = process.env.PORT || 3500;
const apiPrefix = `/api/${process.env.API_VERSION}`;

app.use(helmet(helmetOptions));

app.use(cors(corsOrigins));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiPrefix, globalRateLimiter);
app.use(apiPrefix, csrfProtection);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(apiPrefix, router);

app.use(notFoundErrorHandler);

app.use(errorHandler);

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

export default app;
