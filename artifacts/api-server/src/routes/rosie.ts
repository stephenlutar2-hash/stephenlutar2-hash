import { Router } from "express";
import { db } from "@szl-holdings/db";
import { rosieThreatsTable, rosieIncidentsTable, rosieScansTable, insertRosieThreatSchema, insertRosieIncidentSchema, insertRosieScanSchema } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/rosie/threats", async (_req, res) => {
  try {
    const threats = await db.select().from(rosieThreatsTable).orderBy(rosieThreatsTable.createdAt);
    return res.json(threats);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch threats" });
  }
});

router.post("/rosie/threats", requireAuth, async (req, res) => {
  try {
    const parsed = insertRosieThreatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(rosieThreatsTable).values(parsed.data).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create threat" });
  }
});

router.delete("/rosie/threats/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(rosieThreatsTable).where(eq(rosieThreatsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete threat" });
  }
});

router.get("/rosie/incidents", async (_req, res) => {
  try {
    const incidents = await db.select().from(rosieIncidentsTable).orderBy(rosieIncidentsTable.createdAt);
    return res.json(incidents);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

router.post("/rosie/incidents", requireAuth, async (req, res) => {
  try {
    const parsed = insertRosieIncidentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(rosieIncidentsTable).values(parsed.data).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create incident" });
  }
});

router.put("/rosie/incidents/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const parsed = insertRosieIncidentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [updated] = await db.update(rosieIncidentsTable).set(parsed.data).where(eq(rosieIncidentsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ error: "Failed to update incident" });
  }
});

router.delete("/rosie/incidents/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(rosieIncidentsTable).where(eq(rosieIncidentsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete incident" });
  }
});

router.get("/rosie/scans", async (_req, res) => {
  try {
    const scans = await db.select().from(rosieScansTable).orderBy(rosieScansTable.createdAt);
    return res.json(scans);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch scans" });
  }
});

router.post("/rosie/scans", requireAuth, async (req, res) => {
  try {
    const parsed = insertRosieScanSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(rosieScansTable).values(parsed.data).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create scan" });
  }
});

export default router;
