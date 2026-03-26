import type { CacheProvider } from "./index";
import {
  cacheGet,
  cacheSet,
  cacheDel,
} from "../lib/redis";

export class LiveCacheProvider implements CacheProvider {
  async get(key: string): Promise<string | null> {
    return cacheGet(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    return cacheSet(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    return cacheDel(key);
  }
}

export class MockCacheProvider implements CacheProvider {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}
