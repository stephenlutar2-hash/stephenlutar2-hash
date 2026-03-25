import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

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
}

const AUDITED_PATHS = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/entra-login",
  "/api/stripe/",
  "/api/plaid/",
  "/api/social/",
];

export function auditMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const shouldAudit = AUDITED_PATHS.some((p) => req.originalUrl.startsWith(p));
    if (!shouldAudit || req.method === "GET") {
      next();
      return;
    }

    const user = (req as Record<string, unknown>).user as { username?: string } | undefined;

    res.on("finish", () => {
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
