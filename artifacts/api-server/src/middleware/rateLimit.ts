import type { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyFn?: (req: Request) => string;
  message?: string;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function cleanupStore(store: Map<string, RateLimitEntry>): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

function getClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyFn,
    message = "Too many requests, please try again later",
  } = options;

  const storeId = `${windowMs}-${maxRequests}-${Math.random().toString(36).slice(2)}`;
  const store = new Map<string, RateLimitEntry>();
  stores.set(storeId, store);

  setInterval(() => cleanupStore(store), Math.min(windowMs, 60000));

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyFn ? keyFn(req) : getClientIp(req);
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
      next();
      return;
    }

    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil(entry.resetAt / 1000).toString(),
    );

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter.toString());
      const requestId = (req as any).id as string | undefined;
      res.status(429).json({
        status: 429,
        code: "RATE_LIMITED",
        message,
        ...(requestId && { requestId }),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 20,
  message: "Too many authentication attempts, please try again later",
});

export const writeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 60,
  keyFn: (req: Request) => {
    const user = (req as Request & { user?: { username?: string } }).user;
    if (user?.username) {
      return `user:${user.username}`;
    }
    return `ip:${getClientIp(req)}`;
  },
  message: "Too many write requests, please slow down",
});
