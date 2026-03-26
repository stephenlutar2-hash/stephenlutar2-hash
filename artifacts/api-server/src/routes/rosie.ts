import { Router } from "express";
import { insertRosieThreatSchema, insertRosieIncidentSchema, insertRosieScanSchema } from "@szl-holdings/db/schema";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";
import { asyncHandler } from "../middleware/errorHandler";
import { rosieService } from "../services/rosie";
import { AppError } from "../lib/errors";

const router = Router();

router.get("/rosie/health", (_req, res) => {
  res.json({ ok: true, group: "rosie", timestamp: new Date().toISOString() });
});

router.get("/rosie/threats", requireAuth, asyncHandler(async (_req, res) => {
  const threats = await rosieService.listThreats();
  res.json(threats);
}));

router.post("/rosie/threats", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertRosieThreatSchema), asyncHandler(async (req, res) => {
  const created = await rosieService.createThreat(req.body);
  res.status(201).json(created);
}));

router.delete("/rosie/threats/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(String(req.params.id));
  await rosieService.deleteThreat(id);
  res.status(204).send();
}));

router.get("/rosie/incidents", requireAuth, asyncHandler(async (_req, res) => {
  const incidents = await rosieService.listIncidents();
  res.json(incidents);
}));

router.post("/rosie/incidents", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertRosieIncidentSchema), asyncHandler(async (req, res) => {
  const created = await rosieService.createIncident(req.body);
  res.status(201).json(created);
}));

router.put("/rosie/incidents/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertRosieIncidentSchema), asyncHandler(async (req, res) => {
  const id = parseInt(String(req.params.id));
  const updated = await rosieService.updateIncident(id, req.body);
  if (!updated) throw AppError.notFound("Incident not found");
  res.json(updated);
}));

router.delete("/rosie/incidents/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(String(req.params.id));
  await rosieService.deleteIncident(id);
  res.status(204).send();
}));

router.get("/rosie/scans", requireAuth, asyncHandler(async (_req, res) => {
  const scans = await rosieService.listScans();
  res.json(scans);
}));

router.post("/rosie/scans", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertRosieScanSchema), asyncHandler(async (req, res) => {
  const created = await rosieService.createScan(req.body);
  res.status(201).json(created);
}));

export default router;
