import { Router } from "express";
import { db } from "@szl-holdings/db";
import { nimbusPredictionsTable, nimbusAlertsTable, insertNimbusPredictionSchema, insertNimbusAlertSchema } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";

const router = Router();

router.get("/nimbus/health", (_req, res) => {
  res.json({ ok: true, group: "nimbus", timestamp: new Date().toISOString() });
});

router.get("/nimbus/predictions", requireAuth, async (_req, res) => {
  try {
    const predictions = await db.select().from(nimbusPredictionsTable).orderBy(nimbusPredictionsTable.createdAt);
    return res.json(predictions.map(p => ({ ...p, confidence: Number(p.confidence) })));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch predictions" });
  }
});

router.post("/nimbus/predictions", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertNimbusPredictionSchema), async (req, res) => {
  try {
    const [created] = await db.insert(nimbusPredictionsTable).values(req.body).returning();
    return res.status(201).json({ ...created, confidence: Number(created.confidence) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to create prediction" });
  }
});

router.delete("/nimbus/predictions/:id", requireAuth, requireOperator(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(nimbusPredictionsTable).where(eq(nimbusPredictionsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete prediction" });
  }
});

router.get("/nimbus/alerts", requireAuth, async (_req, res) => {
  try {
    const alerts = await db.select().from(nimbusAlertsTable).orderBy(nimbusAlertsTable.createdAt);
    return res.json(alerts);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

router.post("/nimbus/alerts", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertNimbusAlertSchema), async (req, res) => {
  try {
    const [created] = await db.insert(nimbusAlertsTable).values(req.body).returning();
    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create alert" });
  }
});

router.delete("/nimbus/alerts/:id", requireAuth, requireOperator(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(nimbusAlertsTable).where(eq(nimbusAlertsTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete alert" });
  }
});

export default router;
