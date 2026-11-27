import logger from '../utils/logger';
import { AppError } from '../utils/app.error';
import type { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error(`❌ Error caught by global error handler: ${err}`);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    // Optionally include stack traces only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
