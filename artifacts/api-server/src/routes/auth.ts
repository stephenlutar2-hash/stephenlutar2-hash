import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { sessionsTable } from "@workspace/db/schema";
import { eq, gt } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

const VALID_USERNAME = "slutar";
const VALID_PASSWORD = "Topshelf14@";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.slice(7);
  const [session] = await db.select().from(sessionsTable)
    .where(eq(sessionsTable.token, token))
    .limit(1);
  if (!session || new Date(session.expiresAt) < new Date()) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  (req as any).user = { username: session.username, role: "emperor" };
  next();
}

router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.insert(sessionsTable).values({ token, username, expiresAt });
    res.json({ token, username, expiresAt: expiresAt.toISOString() });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
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
    res.json({ username: session.username, role: "emperor" });
  } catch (e) {
    res.status(500).json({ error: "Auth check failed" });
  }
});

router.post("/auth/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Logout failed" });
  }
});

export default router;
