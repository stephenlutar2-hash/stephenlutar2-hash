import { Router } from "express";
import { insertBeaconMetricSchema, insertBeaconProjectSchema } from "@szl-holdings/db/schema";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";
import { asyncHandler } from "../middleware/errorHandler";
import { beaconService } from "../services/beacon";
import { AppError } from "../lib/errors";

const router = Router();

router.get("/beacon/health", (_req, res) => {
  res.json({ ok: true, group: "beacon", timestamp: new Date().toISOString() });
});

router.get("/beacon/metrics", requireAuth, asyncHandler(async (_req, res) => {
  const metrics = await beaconService.listMetrics();
  res.json(metrics);
}));

router.post("/beacon/metrics", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertBeaconMetricSchema), asyncHandler(async (req, res) => {
  const created = await beaconService.createMetric(req.body);
  res.status(201).json(created);
}));

router.put("/beacon/metrics/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertBeaconMetricSchema), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const updated = await beaconService.updateMetric(id, req.body);
  if (!updated) throw AppError.notFound("Metric not found");
  res.json(updated);
}));

router.delete("/beacon/metrics/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await beaconService.deleteMetric(id);
  res.status(204).send();
}));

router.get("/beacon/projects", requireAuth, asyncHandler(async (_req, res) => {
  const projects = await beaconService.listProjects();
  res.json(projects);
}));

router.post("/beacon/projects", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertBeaconProjectSchema), asyncHandler(async (req, res) => {
  const created = await beaconService.createProject(req.body);
  res.status(201).json(created);
}));

router.put("/beacon/projects/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertBeaconProjectSchema), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const updated = await beaconService.updateProject(id, req.body);
  if (!updated) throw AppError.notFound("Project not found");
  res.json(updated);
}));

router.delete("/beacon/projects/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await beaconService.deleteProject(id);
  res.status(204).send();
}));

export default router;
