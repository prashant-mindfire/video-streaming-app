import { Request } from 'express';
import type { UserRole } from './user';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        role?: UserRole;
      };
    }
  }
}
