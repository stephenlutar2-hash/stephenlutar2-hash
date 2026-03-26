import type { Request, Response, NextFunction } from "express";
import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  requestId: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export function requestContextMiddleware() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const requestId = (req as any).id as string || crypto.randomUUID();
    asyncLocalStorage.run({ requestId }, () => next());
  };
}

export function getRequestId(): string | undefined {
  return asyncLocalStorage.getStore()?.requestId;
}

export function getRequestIdFromReq(req: Request): string | undefined {
  return (req as any).id as string | undefined;
}
