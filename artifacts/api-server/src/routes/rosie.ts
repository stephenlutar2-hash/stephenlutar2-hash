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

router.get("/rosie/threats", requireAuth, asyncHandler(async (req, res) => {
  const query = req.query as Record<string, string | undefined>;
  const pagination = rosieService.parsePagination(query);
  const filters = rosieService.parseFilters(query);
  const result = await rosieService.listThreats(pagination, filters);
  res.json(result);
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

router.get("/rosie/incidents", requireAuth, asyncHandler(async (req, res) => {
  const query = req.query as Record<string, string | undefined>;
  const pagination = rosieService.parsePagination(query);
  const filters = rosieService.parseFilters(query);
  const result = await rosieService.listIncidents(pagination, filters);
  res.json(result);
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

router.get("/rosie/scans", requireAuth, asyncHandler(async (req, res) => {
  const query = req.query as Record<string, string | undefined>;
  const pagination = rosieService.parsePagination(query);
  const filters = rosieService.parseFilters(query);
  const result = await rosieService.listScans(pagination, filters);
  res.json(result);
}));

router.post("/rosie/scans", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertRosieScanSchema), asyncHandler(async (req, res) => {
  const created = await rosieService.createScan(req.body);
  res.status(201).json(created);
}));

router.get("/rosie/analytics/threat-trends", requireAuth, asyncHandler(async (_req, res) => {
  const trends = await rosieService.getThreatTrends();
  res.json(trends);
}));

router.get("/rosie/analytics/incident-resolution", requireAuth, asyncHandler(async (_req, res) => {
  const metrics = await rosieService.getIncidentResolutionMetrics();
  res.json(metrics);
}));

router.get("/rosie/analytics/scan-coverage", requireAuth, asyncHandler(async (_req, res) => {
  const coverage = await rosieService.getScanCoverageSummary();
  res.json(coverage);
}));

router.get("/rosie/analytics/severity-distribution", requireAuth, asyncHandler(async (_req, res) => {
  const distribution = await rosieService.getSeverityDistribution();
  res.json(distribution);
}));

router.get("/rosie/timeline", requireAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit)) || 50));
  const timeline = await rosieService.getIncidentTimeline(limit);
  res.json(timeline);
}));

function validateBulkIds(ids: unknown): number[] {
  if (!Array.isArray(ids) || ids.length === 0) throw AppError.badRequest("ids must be a non-empty array");
  if (ids.length > 100) throw AppError.badRequest("Maximum 100 incidents per bulk operation");
  const parsed = ids.map((id) => {
    const n = Number(id);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
      throw AppError.badRequest(`Invalid id: ${id}`);
    }
    return n;
  });
  return parsed;
}

router.post("/rosie/incidents/bulk/assign", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const validIds = validateBulkIds(req.body.ids);
  const { assignee } = req.body;
  if (!assignee || typeof assignee !== "string") throw AppError.badRequest("assignee is required");
  const result = await rosieService.bulkUpdateIncidents(validIds, { assignee });
  res.json(result);
}));

router.post("/rosie/incidents/bulk/resolve", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const validIds = validateBulkIds(req.body.ids);
  const result = await rosieService.bulkUpdateIncidents(validIds, { resolved: true, status: "resolved" });
  res.json(result);
}));

router.post("/rosie/incidents/bulk/acknowledge", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const validIds = validateBulkIds(req.body.ids);
  const result = await rosieService.bulkUpdateIncidents(validIds, { status: "acknowledged" });
  res.json(result);
}));

export default router;
