import { Router } from "express";
import { db } from "@szl-holdings/db";
import { zeusModulesTable, zeusLogsTable, insertZeusModuleSchema, insertZeusLogSchema } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/zeus/modules", async (_req, res) => {
  try {
    const modules = await db.select().from(zeusModulesTable).orderBy(zeusModulesTable.createdAt);
    return res.json(modules.map(m => ({ ...m, uptime: Number(m.uptime) })));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch modules" });
  }
});

router.post("/zeus/modules", async (req, res) => {
  try {
    const parsed = insertZeusModuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(zeusModulesTable).values(parsed.data).returning();
    return res.status(201).json({ ...created, uptime: Number(created.uptime) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create module" });
  }
});

router.put("/zeus/modules/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertZeusModuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [updated] = await db.update(zeusModulesTable).set(parsed.data).where(eq(zeusModulesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json({ ...updated, uptime: Number(updated.uptime) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update module" });
  }
});

router.delete("/zeus/modules/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(zeusModulesTable).where(eq(zeusModulesTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete module" });
  }
});

router.get("/zeus/logs", async (_req, res) => {
  try {
    const logs = await db.select().from(zeusLogsTable).orderBy(zeusLogsTable.createdAt);
    return res.json(logs);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
});

router.post("/zeus/logs", async (req, res) => {
  try {
    const parsed = insertZeusLogSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(zeusLogsTable).values(parsed.data).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create log" });
  }
});

export default router;
