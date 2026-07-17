import { createClient } from 'redis';

// Graceful Mock Cache fallback in case Redis server is not running locally
class MemoryCache {
  private cache = new Map<string, string>();

  async connect() {
    console.log('Cache client loaded: using Local In-Memory Cache.');
  }

  async get(key: string): Promise<string | null> {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: string, options?: { EX?: number }) {
    this.cache.set(key, value);
    if (options?.EX) {
      setTimeout(() => {
        this.cache.delete(key);
      }, options.EX * 1000);
    }
  }

  async del(key: string) {
    this.cache.delete(key);
  }
}

let redisClient: any;

if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err: any) => {
    console.error('Redis client error, falling back to local memory cache:', err.message);
    redisClient = new MemoryCache();
    redisClient.connect();
  });
  redisClient.connect().catch((err: any) => {
    console.warn('Could not connect to Redis server. Falling back to Local Memory Cache.');
    redisClient = new MemoryCache();
    redisClient.connect();
  });
} else {
  redisClient = new MemoryCache();
  redisClient.connect();
}

export { redisClient };
