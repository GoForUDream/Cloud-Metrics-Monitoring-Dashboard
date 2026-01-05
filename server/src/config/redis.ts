import { Redis } from 'ioredis';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

export const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err: Error) => {
  logger.error('Redis connection error', { error: err.message });
});

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  logger.info('Redis connection closed');
}
