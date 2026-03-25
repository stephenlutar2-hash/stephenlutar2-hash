import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

type Role = "emperor" | "admin" | "operator" | "client" | "user";

const ROLE_HIERARCHY: Record<Role, number> = {
  emperor: 100,
  admin: 80,
  operator: 60,
  client: 40,
  user: 20,
};

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as Record<string, unknown>).user as { username?: string; role?: string } | undefined;

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (allowedRoles.length === 0 || !user.role) {
      next();
      return;
    }

    const userRole = user.role as Role;
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const hasAccess = allowedRoles.some((r) => userLevel >= (ROLE_HIERARCHY[r] ?? 0));

    if (!hasAccess) {
      logger.warn({ username: user.username, userRole, requiredRoles: allowedRoles }, "Access denied — insufficient role");
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}

export function getUserRole(req: Request): Role {
  const user = (req as Record<string, unknown>).user as { role?: string } | undefined;
  return ((user?.role as Role) || "operator") as Role;
}
