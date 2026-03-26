import type { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError, formatErrorResponse } from "../lib/errors";
import { logger } from "../lib/logger";

function getRequestId(req: Request): string | undefined {
  return (req as any).id as string | undefined;
}

export function errorHandler() {
  return (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    const requestId = getRequestId(req);

    if (err instanceof AppError) {
      if (err.status >= 500) {
        logger.error({ err, requestId }, err.message);
      } else {
        logger.warn({ requestId, code: err.code, status: err.status }, err.message);
      }
      res.status(err.status).json(err.toResponseBody(requestId));
      return;
    }

    logger.error({ err, requestId }, "Unhandled error");

    res.status(500).json(
      formatErrorResponse(500, "INTERNAL_ERROR", "Internal server error", requestId),
    );
  };
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
