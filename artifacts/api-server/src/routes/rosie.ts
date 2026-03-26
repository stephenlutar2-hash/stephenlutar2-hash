import { Router } from "express";
import { db } from "@szl-holdings/db";
import { rosieThreatsTable, rosieIncidentsTable, rosieScansTable, insertRosieThreatSchema, insertRosieIncidentSchema, insertRosieScanSchema } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";

const router = Router();

router.get("/rosie/health", (_req, res) => {
  res.json({ ok: true, group: "rosie", timestamp: new Date().toISOString() });
});

router.get("/rosie/threats", requireAuth, async (_req, res) => {
  try {
    const threats = await db.select().from(rosieThreatsTable).orderBy(rosieThreatsTable.createdAt);
    return res.json(threats);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch threats" });
  }
});

router.post("/rosie/threats", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertRosieThreatSchema), async (req, res) => {
  try {
    const [created] = await db.insert(rosieThreatsTable).values(req.body).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create threat" });
  }
});

router.delete("/rosie/threats/:id", requireAuth, requireOperator(), async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(rosieThreatsTable).where(eq(rosieThreatsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete threat" });
  }
});

router.get("/rosie/incidents", requireAuth, async (_req, res) => {
  try {
    const incidents = await db.select().from(rosieIncidentsTable).orderBy(rosieIncidentsTable.createdAt);
    return res.json(incidents);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

router.post("/rosie/incidents", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertRosieIncidentSchema), async (req, res) => {
  try {
    const [created] = await db.insert(rosieIncidentsTable).values(req.body).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create incident" });
  }
});

router.put("/rosie/incidents/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertRosieIncidentSchema), async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [updated] = await db.update(rosieIncidentsTable).set(req.body).where(eq(rosieIncidentsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ error: "Failed to update incident" });
  }
});

router.delete("/rosie/incidents/:id", requireAuth, requireOperator(), async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(rosieIncidentsTable).where(eq(rosieIncidentsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete incident" });
  }
});

router.get("/rosie/scans", requireAuth, async (_req, res) => {
  try {
    const scans = await db.select().from(rosieScansTable).orderBy(rosieScansTable.createdAt);
    return res.json(scans);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch scans" });
  }
});

router.post("/rosie/scans", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertRosieScanSchema), async (req, res) => {
  try {
    const [created] = await db.insert(rosieScansTable).values(req.body).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create scan" });
  }
});

export default router;
