import { logger } from "./logger";

let redisClient: any = null;
let redisReady = false;

export async function initRedis(): Promise<void> {
  const redisUrl = process.env.AZURE_REDIS_URL;
  if (!redisUrl) {
    logger.info("AZURE_REDIS_URL not set — using in-memory session/cache storage");
    return;
  }

  try {
    const { default: Redis } = await import("ioredis");
    redisClient = new Redis(redisUrl, {
      tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: true } : undefined,
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on("connect", () => {
      redisReady = true;
      logger.info("Redis connected");
    });
    redisClient.on("error", (err: Error) => {
      logger.error({ err }, "Redis error");
      redisReady = false;
    });
    redisClient.on("close", () => {
      redisReady = false;
    });

    await redisClient.connect();
  } catch (err) {
    logger.error({ err }, "Failed to initialize Redis — falling back to in-memory");
    redisClient = null;
  }
}

const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

export async function cacheGet(key: string): Promise<string | null> {
  if (redisClient && redisReady) {
    try {
      return await redisClient.get(key);
    } catch {
      return memoryFallbackGet(key);
    }
  }
  return memoryFallbackGet(key);
}

export async function cacheSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (redisClient && redisReady) {
    try {
      if (ttlSeconds) {
        await redisClient.set(key, value, "EX", ttlSeconds);
      } else {
        await redisClient.set(key, value);
      }
      return;
    } catch {
      memoryFallbackSet(key, value, ttlSeconds);
      return;
    }
  }
  memoryFallbackSet(key, value, ttlSeconds);
}

export async function cacheDel(key: string): Promise<void> {
  if (redisClient && redisReady) {
    try {
      await redisClient.del(key);
      return;
    } catch {
      memoryStore.delete(key);
      return;
    }
  }
  memoryStore.delete(key);
}

function memoryFallbackGet(key: string): string | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

function memoryFallbackSet(key: string, value: string, ttlSeconds?: number): void {
  memoryStore.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
  });
}

export function isRedisConfigured(): boolean {
  return !!process.env.AZURE_REDIS_URL;
}

export function isRedisReady(): boolean {
  return redisReady;
}

export function getRedisClient(): any {
  return redisClient;
}
