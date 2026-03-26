import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { sessionsTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { isEntraConfigured, getEntraPublicConfig, validateEntraToken } from "../lib/entra";
import { sessionGet, sessionSet, sessionDel } from "../lib/redis";
import { validateBody } from "../middleware/validate";
import { sanitizeString } from "../lib/sanitize";
import type { AuthenticatedRequest, AuthenticatedUser } from "../types";

const router = Router();

const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || "24", 10);

const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

const entraLoginSchema = z.object({
  idToken: z.string().min(1),
});

function getUsers(): Record<string, { password: string; role: string }> {
  const username = process.env.DEMO_ADMIN_USERNAME;
  const password = process.env.DEMO_ADMIN_PASSWORD;
  if (!username || !password) {
    return {};
  }
  return {
    [username]: { password, role: "emperor" },
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const token = authHeader.slice(7);

  if (isEntraConfigured()) {
    const result = await validateEntraToken(token);
    if (result.valid) {
      const entraUsername = result.claims.preferred_username || result.claims.name || result.claims.sub || "entra-user";
      const { getUserRole } = await import("../middleware/rbac");
      const entraRole = await getUserRole(entraUsername);
      const user: AuthenticatedUser = {
        username: entraUsername,
        role: entraRole,
        authMethod: "entra",
      };
      (req as AuthenticatedRequest).user = user;
      return next();
    }
  }

  const cached = await sessionGet(token);
  if (cached) {
    try {
      const sessionData = JSON.parse(cached) as { username: string; role: string; expiresAt: string };
      if (new Date(sessionData.expiresAt) >= new Date()) {
        const user: AuthenticatedUser = {
          username: sessionData.username,
          role: sessionData.role,
          authMethod: "demo",
        };
        (req as AuthenticatedRequest).user = user;
        return next();
      }
      await sessionDel(token);
    } catch { /* fall through to DB */ }
  }

  if (!isDatabaseAvailable()) {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  const [session] = await db.select().from(sessionsTable)
    .where(eq(sessionsTable.token, token))
    .limit(1);
  if (!session || new Date(session.expiresAt) < new Date()) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  const role = session.role || "viewer";

  const ttlSeconds = Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000);
  if (ttlSeconds > 0) {
    await sessionSet(token, JSON.stringify({ username: session.username, role, expiresAt: session.expiresAt }), ttlSeconds);
  }

  const user: AuthenticatedUser = {
    username: session.username,
    role,
    authMethod: "demo",
  };
  (req as AuthenticatedRequest).user = user;
  next();
}

router.get("/auth/health", (_req, res) => {
  res.json({ ok: true, group: "auth", entraConfigured: isEntraConfigured(), timestamp: new Date().toISOString() });
});

router.get("/auth/entra-config", (_req, res) => {
  const config = getEntraPublicConfig();
  if (!config) {
    return res.json({ configured: false });
  }
  return res.json({ configured: true, ...config });
});

router.post("/auth/entra-login", validateBody(entraLoginSchema), async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!isEntraConfigured()) {
      return res.status(400).json({ error: "Entra External ID is not configured" });
    }

    const result = await validateEntraToken(idToken);
    if (!result.valid) {
      return res.status(401).json({ error: result.error });
    }

    const username = sanitizeString(
      result.claims.preferred_username || result.claims.name || result.claims.sub || "entra-user",
    );
    const { getUserRole } = await import("../middleware/rbac");
    const role = await getUserRole(username);
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ token, username, role, expiresAt });

    return res.json({
      token,
      username,
      role,
      expiresAt: expiresAt.toISOString(),
      authMethod: "entra",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Entra login failed";
    return res.status(500).json({ error: message });
  }
});

router.post("/auth/login", validateBody(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users[username];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const { getUserRole } = await import("../middleware/rbac");
    const dbRole = await getUserRole(username);
    const role = dbRole !== "viewer" ? dbRole : user.role;
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ token, username, role, expiresAt });
    const ttlSeconds = SESSION_TTL_HOURS * 60 * 60;
    await sessionSet(token, JSON.stringify({ username, role, expiresAt: expiresAt.toISOString() }), ttlSeconds);
    return res.json({ token, username, role, expiresAt: expiresAt.toISOString(), authMethod: "demo" });
  } catch (e) {
    return res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.slice(7);

    if (isEntraConfigured()) {
      const result = await validateEntraToken(token);
      if (result.valid) {
        const entraUsername = result.claims.preferred_username || result.claims.name || result.claims.sub || "entra-user";
        const { getUserRole } = await import("../middleware/rbac");
        const entraRole = await getUserRole(entraUsername);
        return res.json({
          username: entraUsername,
          role: entraRole,
          authMethod: "entra",
        });
      }
    }

    const [session] = await db.select().from(sessionsTable)
      .where(eq(sessionsTable.token, token))
      .limit(1);
    if (!session || new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.json({ username: session.username, role: session.role || "viewer" });
  } catch (e) {
    return res.status(500).json({ error: "Auth check failed" });
  }
});

router.post("/auth/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      await sessionDel(token);
      await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
    }
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
