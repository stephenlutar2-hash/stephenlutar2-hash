import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { auditLogsTable } from "@szl-holdings/db/schema";
import type { AuthenticatedRequest } from "../types";

interface AuditEntry {
  type: "audit";
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  outcome: "success" | "failure";
  ip: string;
  method: string;
  path: string;
  statusCode?: number;
}

const auditLogger = logger.child({ component: "audit" });

export function logAudit(entry: Omit<AuditEntry, "type" | "timestamp">): void {
  auditLogger.info({ ...entry, type: "audit", timestamp: new Date().toISOString() });

  if (isDatabaseAvailable()) {
    db.insert(auditLogsTable)
      .values({
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        method: entry.method,
        path: entry.path,
        statusCode: entry.statusCode,
        outcome: entry.outcome,
        ip: entry.ip,
      })
      .catch((err) => {
        auditLogger.error({ err }, "Failed to write audit log to database");
      });
  }
}

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function auditMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!MUTATING_METHODS.has(req.method)) {
      next();
      return;
    }

    res.on("finish", () => {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user;

      logAudit({
        userId: user?.username || "anonymous",
        action: `${req.method} ${req.route?.path || req.path}`,
        resource: req.originalUrl.split("?")[0],
        outcome: res.statusCode < 400 ? "success" : "failure",
        ip: req.ip || req.socket.remoteAddress || "unknown",
        method: req.method,
        path: req.originalUrl.split("?")[0],
        statusCode: res.statusCode,
      });
    });

    next();
  };
}
