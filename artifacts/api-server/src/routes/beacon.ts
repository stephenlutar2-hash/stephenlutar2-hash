import { Router } from "express";
import { db } from "@workspace/db";
import { beaconMetricsTable, beaconProjectsTable, insertBeaconMetricSchema, insertBeaconProjectSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/beacon/metrics", async (_req, res) => {
  try {
    const metrics = await db.select().from(beaconMetricsTable).orderBy(beaconMetricsTable.createdAt);
    return res.json(metrics.map(m => ({ ...m, value: Number(m.value), change: Number(m.change) })));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

router.post("/beacon/metrics", async (req, res) => {
  try {
    const parsed = insertBeaconMetricSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(beaconMetricsTable).values(parsed.data).returning();
    return res.status(201).json({ ...created, value: Number(created.value), change: Number(created.change) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create metric" });
  }
});

router.put("/beacon/metrics/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertBeaconMetricSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [updated] = await db.update(beaconMetricsTable).set(parsed.data).where(eq(beaconMetricsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json({ ...updated, value: Number(updated.value), change: Number(updated.change) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update metric" });
  }
});

router.delete("/beacon/metrics/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(beaconMetricsTable).where(eq(beaconMetricsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete metric" });
  }
});

router.get("/beacon/projects", async (_req, res) => {
  try {
    const projects = await db.select().from(beaconProjectsTable).orderBy(beaconProjectsTable.createdAt);
    return res.json(projects);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/beacon/projects", async (req, res) => {
  try {
    const parsed = insertBeaconProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(beaconProjectsTable).values(parsed.data).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create project" });
  }
});

router.put("/beacon/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertBeaconProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [updated] = await db.update(beaconProjectsTable).set(parsed.data).where(eq(beaconProjectsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/beacon/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(beaconProjectsTable).where(eq(beaconProjectsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
