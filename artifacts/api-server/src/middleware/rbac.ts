import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { userRolesTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";

export type Role = "admin" | "operator" | "viewer";

const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 30,
  operator: 20,
  viewer: 10,
};

const ROLE_ALIASES: Record<string, Role> = {
  emperor: "admin",
  admin: "admin",
  operator: "operator",
  viewer: "viewer",
  user: "viewer",
};

export function resolveRole(raw: string | undefined): Role {
  if (!raw) return "viewer";
  return ROLE_ALIASES[raw.toLowerCase()] || "viewer";
}

export async function getUserRole(username: string): Promise<Role> {
  if (!isDatabaseAvailable()) return "viewer";
  try {
    const [row] = await db
      .select({ role: userRolesTable.role })
      .from(userRolesTable)
      .where(eq(userRolesTable.username, username))
      .limit(1);
    return row ? resolveRole(row.role) : "viewer";
  } catch {
    return "viewer";
  }
}

export async function setUserRole(username: string, role: Role, assignedBy: string): Promise<void> {
  if (!isDatabaseAvailable()) return;
  await db
    .insert(userRolesTable)
    .values({ username, role, assignedBy })
    .onConflictDoUpdate({
      target: userRolesTable.username,
      set: { role, assignedBy, updatedAt: new Date() },
    });
}

export function requireRole(minimumRole: Role) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const userRole = resolveRole(user.role);
    const requiredLevel = ROLE_HIERARCHY[minimumRole];
    const userLevel = ROLE_HIERARCHY[userRole];

    if (userLevel < requiredLevel) {
      res.status(403).json({
        error: "Insufficient permissions",
        required: minimumRole,
        current: userRole,
      });
      return;
    }

    next();
  };
}

export function requireAdmin() {
  return requireRole("admin");
}

export function requireOperator() {
  return requireRole("operator");
}
