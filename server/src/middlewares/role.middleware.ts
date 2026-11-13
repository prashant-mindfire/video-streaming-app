import type { UserRole } from '@/types/user';
import { AppError } from '@/utils/app.error';
import type { Request, Response, NextFunction } from 'express';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth?.userId) {
      return next(new AppError('Authentication required', 401));
    }

    if (!req.auth.role || !allowedRoles.includes(req.auth.role)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }

    next();
  };
};
