import logger from '@/utils/logger';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL as string;

export const redis = new Redis(REDIS_URL);

let isRedisClosed = false;

export const closeRedis = async (): Promise<void> => {
  if (isRedisClosed) return;
  isRedisClosed = true;

  if (redis.status !== 'end') {
    await redis.quit();
  }
  logger.info('Redis connection closed');
};
