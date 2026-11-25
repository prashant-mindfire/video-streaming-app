import type { CorsOptions } from 'cors';

export const allowedOrigins: string[] = [...(process.env.ALLOWED_ORIGINS?.split(',') || [])];

const corsOrigins: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ): void => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS error'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

export default corsOrigins;
