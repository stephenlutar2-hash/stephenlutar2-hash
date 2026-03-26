import { cacheGet, cacheSet, cacheDel } from "./redis";
import { logger } from "./logger";

export interface CacheOptions {
  ttlSeconds: number;
  prefix?: string;
}

const DEFAULT_TTL = 300;
const CACHE_PREFIX = "cache:";

export function buildCacheKey(prefix: string, ...parts: string[]): string {
  return `${CACHE_PREFIX}${prefix}:${parts.join(":")}`;
}

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions,
): Promise<T> {
  const ttl = options?.ttlSeconds ?? DEFAULT_TTL;

  try {
    const cached = await cacheGet(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    logger.warn({ err, key }, "Cache read failed, falling through to fetcher");
  }

  const result = await fetcher();

  try {
    await cacheSet(key, JSON.stringify(result), ttl);
  } catch (err) {
    logger.warn({ err, key }, "Cache write failed");
  }

  return result;
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await cacheDel(key);
  } catch (err) {
    logger.warn({ err, key }, "Cache invalidation failed");
  }
}

export async function invalidateCacheByKeys(...keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => invalidateCache(key)));
}

export const CACHE_KEYS = {
  PORTFOLIO_SUMMARY: buildCacheKey("szl", "portfolio-summary"),
  ECOSYSTEM_HEALTH: buildCacheKey("szl", "ecosystem-health"),
  PLATFORM_DASHBOARD: buildCacheKey("platform", "dashboard"),
  CARLOTA_JO_STATS: buildCacheKey("carlota-jo", "stats"),
} as const;

export const CACHE_TTLS = {
  PORTFOLIO_SUMMARY: 120,
  ECOSYSTEM_HEALTH: 60,
  PLATFORM_DASHBOARD: 90,
  CARLOTA_JO_STATS: 180,
} as const;
