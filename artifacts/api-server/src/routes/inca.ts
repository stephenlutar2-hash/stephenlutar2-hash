import { Router } from "express";
import { db } from "@workspace/db";
import { incaProjectsTable, incaExperimentsTable, insertIncaProjectSchema, insertIncaExperimentSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Projects
router.get("/inca/projects", async (_req, res) => {
  try {
    const projects = await db.select().from(incaProjectsTable).orderBy(incaProjectsTable.createdAt);
    res.json(projects.map(p => ({ ...p, accuracy: Number(p.accuracy) })));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/inca/projects", async (req, res) => {
  try {
    const parsed = insertIncaProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(incaProjectsTable).values(parsed.data).returning();
    res.status(201).json({ ...created, accuracy: Number(created.accuracy) });
  } catch (e) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.put("/inca/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertIncaProjectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [updated] = await db.update(incaProjectsTable).set(parsed.data).where(eq(incaProjectsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ ...updated, accuracy: Number(updated.accuracy) });
  } catch (e) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/inca/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(incaProjectsTable).where(eq(incaProjectsTable.id, id));
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Experiments
router.get("/inca/experiments", async (_req, res) => {
  try {
    const experiments = await db.select().from(incaExperimentsTable).orderBy(incaExperimentsTable.createdAt);
    res.json(experiments.map(e => ({ ...e, accuracy: Number(e.accuracy) })));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch experiments" });
  }
});

router.post("/inca/experiments", async (req, res) => {
  try {
    const parsed = insertIncaExperimentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(incaExperimentsTable).values(parsed.data).returning();
    res.status(201).json({ ...created, accuracy: Number(created.accuracy) });
  } catch (e) {
    res.status(500).json({ error: "Failed to create experiment" });
  }
});

export default router;
