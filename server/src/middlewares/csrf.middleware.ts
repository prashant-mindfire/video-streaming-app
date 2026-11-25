import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app.error';
import { allowedOrigins } from '@/config/corsOrigins';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const issueCsrfCookie = (res: Response, maxAge?: number): string => {
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(maxAge !== undefined ? { maxAge } : {}),
  });
  return csrfToken;
};

export const clearCsrfCookie = (res: Response): void => {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
};

export const csrfProtection = (req: Request, _res: Response, next: NextFunction): void => {
  // Safe HTTP methods do not mutate state
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Requests authenticated via Authorization: Bearer are immune to browser CSRF
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  // Unauthenticated requests (no session cookie, e.g. login/register) skip CSRF
  if (!req.cookies?.session) {
    return next();
  }

  // Verify Origin (or Referer fallback) matches allowedOrigins
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    throw new AppError('Invalid request origin', 403);
  }

  if (!origin && req.headers.referer) {
    try {
      const refererOrigin = new URL(req.headers.referer).origin;
      if (!allowedOrigins.includes(refererOrigin)) {
        throw new AppError('Invalid request referer', 403);
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Malformed referer header', 403);
    }
  }

  // Double-Submit Cookie Validation (constant-time comparison)
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (
    typeof cookieToken !== 'string' ||
    typeof headerToken !== 'string' ||
    cookieToken.length !== headerToken.length ||
    !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    throw new AppError('Invalid or missing CSRF token', 403);
  }

  return next();
};
