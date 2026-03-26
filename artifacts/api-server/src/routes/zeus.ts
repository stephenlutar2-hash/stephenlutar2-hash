import { Router } from "express";
import { db } from "@szl-holdings/db";
import { zeusModulesTable, zeusLogsTable, insertZeusModuleSchema, insertZeusLogSchema } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";

const router = Router();

router.get("/zeus/health", (_req, res) => {
  res.json({ ok: true, group: "zeus", timestamp: new Date().toISOString() });
});

router.get("/zeus/modules", requireAuth, async (_req, res) => {
  try {
    const modules = await db.select().from(zeusModulesTable).orderBy(zeusModulesTable.createdAt);
    return res.json(modules.map(m => ({ ...m, uptime: Number(m.uptime) })));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch modules" });
  }
});

router.post("/zeus/modules", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertZeusModuleSchema), async (req, res) => {
  try {
    const [created] = await db.insert(zeusModulesTable).values(req.body).returning();
    return res.status(201).json({ ...created, uptime: Number(created.uptime) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create module" });
  }
});

router.put("/zeus/modules/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertZeusModuleSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(zeusModulesTable).set(req.body).where(eq(zeusModulesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json({ ...updated, uptime: Number(updated.uptime) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update module" });
  }
});

router.delete("/zeus/modules/:id", requireAuth, requireOperator(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(zeusModulesTable).where(eq(zeusModulesTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete module" });
  }
});

router.get("/zeus/logs", requireAuth, async (_req, res) => {
  try {
    const logs = await db.select().from(zeusLogsTable).orderBy(zeusLogsTable.createdAt);
    return res.json(logs);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
});

router.post("/zeus/logs", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertZeusLogSchema), async (req, res) => {
  try {
    const [created] = await db.insert(zeusLogsTable).values(req.body).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create log" });
  }
});

export default router;
