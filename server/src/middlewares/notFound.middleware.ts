import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/app.error';

export const notFoundErrorHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};
