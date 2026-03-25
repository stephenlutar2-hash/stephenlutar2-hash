import { Router } from "express";
import { db } from "@workspace/db";
import { beaconMetricsTable, beaconProjectsTable, insertBeaconMetricSchema, insertBeaconProjectSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Metrics
router.get("/beacon/metrics", async (_req, res) => {
  try {
    const metrics = await db.select().from(beaconMetricsTable).orderBy(beaconMetricsTable.createdAt);
    res.json(metrics.map(m => ({ ...m, value: Number(m.value), change: Number(m.change) })));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

router.post("/beacon/metrics", async (req, res) => {
  try {
    const parsed = insertBeaconMetricSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(beaconMetricsTable).values(parsed.data).returning();
    res.status(201).json({ ...created, value: Number(created.value), change: Number(created.change) });
  } catch (e) {
    res.status(500).json({ error: "Failed to create metric" });
  }
});

router.put("/beacon/metrics/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertBeaconMetricSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [updated] = await db.update(beaconMetricsTable).set(parsed.data).where(eq(beaconMetricsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ ...updated, value: Number(updated.value), change: Number(updated.change) });
  } catch (e) {
    res.status(500).json({ error: "Failed to update metric" });
  }
});

router.delete("/beacon/metrics/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(beaconMetricsTable).where(eq(beaconMetricsTable.id, id));
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete metric" });
  }
});

// Projects
router.get("/beacon/projects", async (_req, res) => {
  try {
    const projects = await db.select().from(beaconProjectsTable).orderBy(beaconProjectsTable.createdAt);
    res.json(projects);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/beacon/projects", async (req, res) => {
  try {
    const parsed = insertBeaconProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(beaconProjectsTable).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.put("/beacon/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertBeaconProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [updated] = await db.update(beaconProjectsTable).set(parsed.data).where(eq(beaconProjectsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/beacon/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(beaconProjectsTable).where(eq(beaconProjectsTable.id, id));
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
