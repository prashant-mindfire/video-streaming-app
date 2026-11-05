import logger from '../utils/logger';
import { AppError } from '../utils/app.error';
import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`❌ Error caught by global error handler: ${err}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    // Optionally include stack traces only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
