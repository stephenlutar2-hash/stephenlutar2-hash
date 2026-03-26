import type { Request, Response, NextFunction } from "express";
import { isDatabaseAvailable } from "@szl-holdings/db";

export function requireDatabase(req: Request, res: Response, next: NextFunction): void {
  if (!isDatabaseAvailable()) {
    res.status(503).json({ error: "Database unavailable", message: "DATABASE_URL not configured" });
    return;
  }
  next();
}
