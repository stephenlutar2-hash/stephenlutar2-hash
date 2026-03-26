import { Router, type IRouter } from "express";
import { z } from "zod";
import { isDatabaseAvailable, pool, db } from "@szl-holdings/db";
import { userRolesTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import { isKeyVaultConfigured } from "../lib/keyvault";
import { isRedisConfigured, isRedisReady } from "../lib/redis";
import { isBlobStorageConfigured } from "../lib/blobStorage";
import { getAllFlags, isFeatureEnabled } from "../lib/featureFlags";
import { requireAuth } from "./auth";
import { requireAdmin, setUserRole, resolveRole } from "../middleware/rbac";
import type { Role } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";

const setFlagSchema = z.object({
  key: z.string().min(1).max(100),
  enabled: z.boolean(),
  description: z.string().max(500).optional(),
});

const setRoleSchema = z.object({
  username: z.string().min(1).max(100),
  role: z.enum(["admin", "operator", "viewer"]),
});

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({
    ok: true,
    project: "SZL Holdings",
    timestamp: new Date().toISOString(),
  });
});

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    project: "SZL Holdings",
    timestamp: new Date().toISOString(),
  });
});

router.get("/readyz", async (_req, res) => {
  const checks: Record<string, { ready: boolean; error?: string }> = {};

  checks.database = { ready: isDatabaseAvailable() };
  if (isDatabaseAvailable() && pool) {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      checks.database = { ready: true };
    } catch (err) {
      checks.database = {
        ready: false,
        error: err instanceof Error ? err.message : "Connection failed",
      };
    }
  }

  checks.redis = { ready: isRedisReady() };
  checks.keyVault = { ready: isKeyVaultConfigured() };
  checks.blobStorage = { ready: isBlobStorageConfigured() };

  const criticalReady = checks.database.ready;
  const allReady =
    criticalReady &&
    (!isRedisConfigured() || checks.redis.ready) &&
    (!isKeyVaultConfigured() || checks.keyVault.ready);
  const statusCode = allReady ? 200 : 503;

  res.status(statusCode).json({
    ok: allReady,
    project: "SZL Holdings",
    timestamp: new Date().toISOString(),
    checks,
  });
});

router.get("/feature-flags", requireAuth, async (_req, res) => {
  try {
    const flags = await getAllFlags();
    res.json({ flags });
  } catch {
    res.status(500).json({ error: "Failed to fetch feature flags" });
  }
});

router.get("/feature-flags/:key", requireAuth, async (req, res) => {
  try {
    const key = req.params.key;
    const enabled = await isFeatureEnabled(key);
    res.json({ key, enabled });
  } catch {
    res.status(500).json({ error: "Failed to check feature flag" });
  }
});

router.post("/feature-flags", requireAuth, requireAdmin(), validateBody(setFlagSchema), async (req, res) => {
  try {
    const { key, enabled, description } = req.body;
    const { setFlag } = await import("../lib/featureFlags");
    await setFlag(key, enabled, description);
    return res.json({ key, enabled, description });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to set feature flag";
    return res.status(500).json({ error: message });
  }
});

router.get("/roles", requireAuth, requireAdmin(), async (_req, res) => {
  try {
    const roles = await db.select().from(userRolesTable);
    res.json({ roles });
  } catch {
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

router.post("/roles", requireAuth, requireAdmin(), validateBody(setRoleSchema), async (req, res) => {
  try {
    const { username, role } = req.body as { username: string; role: Role };
    const adminUser = (req as import("../types").AuthenticatedRequest).user;
    await setUserRole(username, role, adminUser?.username || "system");
    res.json({ username, role });
  } catch {
    res.status(500).json({ error: "Failed to set role" });
  }
});

router.get("/roles/:username", requireAuth, requireAdmin(), async (req, res) => {
  try {
    const username = req.params.username;
    const [row] = await db.select().from(userRolesTable).where(eq(userRolesTable.username, username)).limit(1);
    const role = row ? resolveRole(row.role) : "viewer";
    res.json({ username, role });
  } catch {
    res.status(500).json({ error: "Failed to fetch role" });
  }
});

export default router;
