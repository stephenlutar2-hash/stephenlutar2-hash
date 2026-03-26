import type { Request, Response, NextFunction } from "express";
import { isDatabaseAvailable } from "@szl-holdings/db";
import { formatErrorResponse } from "./errors";

export function requireDatabase(req: Request, res: Response, next: NextFunction): void {
  if (!isDatabaseAvailable()) {
    const requestId = (req as any).id as string | undefined;
    res.status(503).json(
      formatErrorResponse(503, "SERVICE_UNAVAILABLE", "Database unavailable", requestId, "DATABASE_URL not configured"),
    );
    return;
  }
  next();
}
