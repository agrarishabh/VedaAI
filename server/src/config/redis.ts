import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required for BullMQ compatibility
  tls: {},
  retryStrategy(times: number): number | null {
    if (times > 10) {
      console.error('❌ Redis: Max retries reached. Giving up.');
      return null;
    }
    const delay = Math.min(times * 200, 5000);
    console.log(`⏳ Redis: Retrying connection in ${delay}ms (attempt ${times})`);
    return delay;
  },
  lazyConnect: false,
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis connection error:', err.message);
});

redis.on('close', () => {
  console.warn('⚠️ Redis connection closed');
});

export interface BullMQConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  tls: Record<string, unknown>;
  maxRetriesPerRequest: null;
}

function parseRedisUrl(url: string): BullMQConnectionConfig {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port, 10) || 6379,
    username: parsed.username || 'default',
    password: decodeURIComponent(parsed.password),
    tls: {},
    maxRetriesPerRequest: null,
  };
}

export function getBullMQConnection(): BullMQConnectionConfig {
  return parseRedisUrl(env.REDIS_URL);
}

export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();
    console.log('✅ Redis disconnected gracefully');
  } catch (error) {
    const err = error instanceof Error ? error.message : String(error);
    console.error('❌ Error disconnecting Redis:', err);
  }
}
