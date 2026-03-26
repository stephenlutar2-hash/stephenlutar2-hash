import { Router, type Request, type Response, type NextFunction } from "express";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { sessionsTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { isEntraConfigured, getEntraPublicConfig, validateEntraToken } from "../lib/entra";
import { sessionGet, sessionSet, sessionDel } from "../lib/redis";

const router = Router();

const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || "24", 10);

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
      (req as any).user = {
        username: result.claims.preferred_username || result.claims.name || result.claims.sub || "entra-user",
        role: "emperor",
        authMethod: "entra",
      };
      return next();
    }
  }

  const cached = await sessionGet(token);
  if (cached) {
    try {
      const sessionData = JSON.parse(cached) as { username: string; role: string; expiresAt: string };
      if (new Date(sessionData.expiresAt) >= new Date()) {
        (req as any).user = { username: sessionData.username, role: sessionData.role, authMethod: "demo" };
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
  const users = getUsers();
  const userInfo = users[session.username];
  const role = userInfo?.role || "user";

  const ttlSeconds = Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000);
  if (ttlSeconds > 0) {
    await sessionSet(token, JSON.stringify({ username: session.username, role, expiresAt: session.expiresAt }), ttlSeconds);
  }

  (req as any).user = { username: session.username, role, authMethod: "demo" };
  next();
}

router.get("/auth/entra-config", (_req, res) => {
  const config = getEntraPublicConfig();
  if (!config) {
    return res.json({ configured: false });
  }
  return res.json({ configured: true, ...config });
});

router.post("/auth/entra-login", async (req, res) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) {
      return res.status(400).json({ error: "ID token required" });
    }

    if (!isEntraConfigured()) {
      return res.status(400).json({ error: "Entra External ID is not configured" });
    }

    const result = await validateEntraToken(idToken);
    if (!result.valid) {
      return res.status(401).json({ error: result.error });
    }

    const username = result.claims.preferred_username || result.claims.name || result.claims.sub || "entra-user";
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ token, username, expiresAt });

    return res.json({
      token,
      username,
      role: "emperor",
      expiresAt: expiresAt.toISOString(),
      authMethod: "entra",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Entra login failed";
    return res.status(500).json({ error: message });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users[username];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ token, username, expiresAt });
    const ttlSeconds = SESSION_TTL_HOURS * 60 * 60;
    await sessionSet(token, JSON.stringify({ username, role: user.role, expiresAt: expiresAt.toISOString() }), ttlSeconds);
    return res.json({ token, username, role: user.role, expiresAt: expiresAt.toISOString(), authMethod: "demo" });
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
        return res.json({
          username: result.claims.preferred_username || result.claims.name || result.claims.sub || "entra-user",
          role: "emperor",
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
    const users = getUsers();
    const userInfo = users[session.username];
    return res.json({ username: session.username, role: userInfo?.role || "user" });
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
