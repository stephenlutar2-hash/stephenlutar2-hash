import { Router } from "express";
import { insertNimbusPredictionSchema, insertNimbusAlertSchema } from "@szl-holdings/db/schema";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";
import { asyncHandler } from "../middleware/errorHandler";
import { nimbusService } from "../services/nimbus";

const router = Router();

router.get("/nimbus/health", (_req, res) => {
  res.json({ ok: true, group: "nimbus", timestamp: new Date().toISOString() });
});

router.get("/nimbus/predictions", requireAuth, asyncHandler(async (_req, res) => {
  const predictions = await nimbusService.listPredictions();
  res.json(predictions);
}));

router.post("/nimbus/predictions", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertNimbusPredictionSchema), asyncHandler(async (req, res) => {
  const created = await nimbusService.createPrediction(req.body);
  res.status(201).json(created);
}));

router.delete("/nimbus/predictions/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await nimbusService.deletePrediction(id);
  res.status(204).send();
}));

router.get("/nimbus/alerts", requireAuth, asyncHandler(async (_req, res) => {
  const alerts = await nimbusService.listAlerts();
  res.json(alerts);
}));

router.post("/nimbus/alerts", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertNimbusAlertSchema), asyncHandler(async (req, res) => {
  const created = await nimbusService.createAlert(req.body);
  res.status(201).json(created);
}));

router.delete("/nimbus/alerts/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await nimbusService.deleteAlert(id);
  res.status(204).send();
}));

export default router;
