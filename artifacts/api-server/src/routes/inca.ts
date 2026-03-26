import { Router } from "express";
import { db } from "@szl-holdings/db";
import { incaProjectsTable, incaExperimentsTable, insertIncaProjectSchema, insertIncaExperimentSchema } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";

const router = Router();

router.get("/inca/health", (_req, res) => {
  res.json({ ok: true, group: "inca", timestamp: new Date().toISOString() });
});

router.get("/inca/projects", requireAuth, async (_req, res) => {
  try {
    const projects = await db.select().from(incaProjectsTable).orderBy(incaProjectsTable.createdAt);
    return res.json(projects.map(p => ({ ...p, accuracy: Number(p.accuracy) })));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/inca/projects", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaProjectSchema), async (req, res) => {
  try {
    const [created] = await db.insert(incaProjectsTable).values(req.body).returning();
    return res.status(201).json({ ...created, accuracy: Number(created.accuracy) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create project" });
  }
});

router.put("/inca/projects/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaProjectSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Validation failed", details: "id: must be a valid integer" });
    const [updated] = await db.update(incaProjectsTable).set(req.body).where(eq(incaProjectsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json({ ...updated, accuracy: Number(updated.accuracy) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/inca/projects/:id", requireAuth, requireOperator(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Validation failed", details: "id: must be a valid integer" });
    await db.delete(incaProjectsTable).where(eq(incaProjectsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete project" });
  }
});

router.get("/inca/experiments", requireAuth, async (_req, res) => {
  try {
    const experiments = await db.select().from(incaExperimentsTable).orderBy(incaExperimentsTable.createdAt);
    return res.json(experiments.map(e => ({ ...e, accuracy: Number(e.accuracy) })));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch experiments" });
  }
});

router.post("/inca/experiments", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaExperimentSchema), async (req, res) => {
  try {
    const [created] = await db.insert(incaExperimentsTable).values(req.body).returning();
    return res.status(201).json({ ...created, accuracy: Number(created.accuracy) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create experiment" });
  }
});

router.put("/inca/experiments/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaExperimentSchema), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Validation failed", details: "id: must be a valid integer" });
    const [updated] = await db.update(incaExperimentsTable).set(req.body).where(eq(incaExperimentsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json({ ...updated, accuracy: Number(updated.accuracy) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update experiment" });
  }
});

router.delete("/inca/experiments/:id", requireAuth, requireOperator(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Validation failed", details: "id: must be a valid integer" });
    await db.delete(incaExperimentsTable).where(eq(incaExperimentsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete experiment" });
  }
});

export default router;
