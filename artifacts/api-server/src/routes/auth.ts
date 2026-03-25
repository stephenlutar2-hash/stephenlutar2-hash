import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { sessionsTable } from "@workspace/db/schema";
import { eq, gt } from "drizzle-orm";
import crypto from "crypto";

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
  const [session] = await db.select().from(sessionsTable)
    .where(eq(sessionsTable.token, token))
    .limit(1);
  if (!session || new Date(session.expiresAt) < new Date()) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  const users = getUsers();
  const userInfo = users[session.username];
  (req as any).user = { username: session.username, role: userInfo?.role || "user" };
  next();
}

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
    return res.json({ token, username, role: user.role, expiresAt: expiresAt.toISOString() });
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
      await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
    }
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
