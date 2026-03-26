import { Router } from "express";
import { db } from "@szl-holdings/db";
import { beaconMetricsTable, beaconProjectsTable, insertBeaconMetricSchema, insertBeaconProjectSchema } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";

const router = Router();

router.get("/beacon/health", (_req, res) => {
  res.json({ ok: true, group: "beacon", timestamp: new Date().toISOString() });
});

router.get("/beacon/metrics", requireAuth, async (_req, res) => {
  try {
    const metrics = await db.select().from(beaconMetricsTable).orderBy(beaconMetricsTable.createdAt);
    return res.json(metrics.map(m => ({ ...m, value: Number(m.value), change: Number(m.change) })));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

router.post("/beacon/metrics", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertBeaconMetricSchema), async (req, res) => {
  try {
    const [created] = await db.insert(beaconMetricsTable).values(req.body).returning();
    return res.status(201).json({ ...created, value: Number(created.value), change: Number(created.change) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create metric" });
  }
});

router.put("/beacon/metrics/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertBeaconMetricSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(beaconMetricsTable).set(req.body).where(eq(beaconMetricsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json({ ...updated, value: Number(updated.value), change: Number(updated.change) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update metric" });
  }
});

router.delete("/beacon/metrics/:id", requireAuth, requireOperator(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(beaconMetricsTable).where(eq(beaconMetricsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete metric" });
  }
});

router.get("/beacon/projects", requireAuth, async (_req, res) => {
  try {
    const projects = await db.select().from(beaconProjectsTable).orderBy(beaconProjectsTable.createdAt);
    return res.json(projects);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/beacon/projects", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertBeaconProjectSchema), async (req, res) => {
  try {
    const [created] = await db.insert(beaconProjectsTable).values(req.body).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create project" });
  }
});

router.put("/beacon/projects/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertBeaconProjectSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(beaconProjectsTable).set(req.body).where(eq(beaconProjectsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/beacon/projects/:id", requireAuth, requireOperator(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(beaconProjectsTable).where(eq(beaconProjectsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
