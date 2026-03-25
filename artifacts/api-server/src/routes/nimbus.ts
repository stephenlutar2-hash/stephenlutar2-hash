import { Router } from "express";
import { db } from "@workspace/db";
import { nimbusPredictionsTable, nimbusAlertsTable, insertNimbusPredictionSchema, insertNimbusAlertSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Predictions
router.get("/nimbus/predictions", async (_req, res) => {
  try {
    const predictions = await db.select().from(nimbusPredictionsTable).orderBy(nimbusPredictionsTable.createdAt);
    res.json(predictions.map(p => ({ ...p, confidence: Number(p.confidence) })));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
});

router.post("/nimbus/predictions", async (req, res) => {
  try {
    const parsed = insertNimbusPredictionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(nimbusPredictionsTable).values(parsed.data).returning();
    res.status(201).json({ ...created, confidence: Number(created.confidence) });
  } catch (e) {
    res.status(500).json({ error: "Failed to create prediction" });
  }
});

router.delete("/nimbus/predictions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(nimbusPredictionsTable).where(eq(nimbusPredictionsTable.id, id));
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete prediction" });
  }
});

// Alerts
router.get("/nimbus/alerts", async (_req, res) => {
  try {
    const alerts = await db.select().from(nimbusAlertsTable).orderBy(nimbusAlertsTable.createdAt);
    res.json(alerts);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

router.post("/nimbus/alerts", async (req, res) => {
  try {
    const parsed = insertNimbusAlertSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(nimbusAlertsTable).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: "Failed to create alert" });
  }
});

router.delete("/nimbus/alerts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(nimbusAlertsTable).where(eq(nimbusAlertsTable.id, id));
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete alert" });
  }
});

export default router;
