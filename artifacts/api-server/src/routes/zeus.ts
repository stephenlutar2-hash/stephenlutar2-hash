import { Router } from "express";
import { insertZeusModuleSchema, insertZeusLogSchema } from "@szl-holdings/db/schema";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";
import { asyncHandler } from "../middleware/errorHandler";
import { zeusService } from "../services/zeus";
import { AppError } from "../lib/errors";

const router = Router();

router.get("/zeus/health", (_req, res) => {
  res.json({ ok: true, group: "zeus", timestamp: new Date().toISOString() });
});

router.get("/zeus/modules", requireAuth, asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, category, status } = req.query;
  if (page || limit || sortBy || sortOrder || search || category || status) {
    const result = await zeusService.listModulesPaginated({
      page: page ? parseInt(String(page)) : undefined,
      limit: limit ? parseInt(String(limit)) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder === "desc" ? "desc" : sortOrder === "asc" ? "asc" : undefined,
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      status: status ? String(status) : undefined,
    });
    res.json(result);
    return;
  }
  const modules = await zeusService.listModules();
  res.json(modules);
}));

router.post("/zeus/modules", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertZeusModuleSchema), asyncHandler(async (req, res) => {
  const created = await zeusService.createModule(req.body);
  res.status(201).json(created);
}));

router.put("/zeus/modules/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertZeusModuleSchema), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const updated = await zeusService.updateModule(id, req.body);
  if (!updated) throw AppError.notFound("Module not found");
  res.json(updated);
}));

router.delete("/zeus/modules/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await zeusService.deleteModule(id);
  res.status(204).send();
}));

router.get("/zeus/logs", requireAuth, asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, level, module } = req.query;
  if (page || limit || sortBy || sortOrder || search || level || module) {
    const result = await zeusService.listLogsPaginated({
      page: page ? parseInt(String(page)) : undefined,
      limit: limit ? parseInt(String(limit)) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder === "desc" ? "desc" : sortOrder === "asc" ? "asc" : undefined,
      search: search ? String(search) : undefined,
      level: level ? String(level) : undefined,
      module: module ? String(module) : undefined,
    });
    res.json(result);
    return;
  }
  const logs = await zeusService.listLogs();
  res.json(logs);
}));

router.post("/zeus/logs", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertZeusLogSchema), asyncHandler(async (req, res) => {
  const created = await zeusService.createLog(req.body);
  res.status(201).json(created);
}));

router.get("/zeus/analytics/module-uptime", requireAuth, asyncHandler(async (_req, res) => {
  const uptime = await zeusService.getModuleUptimeTracking();
  res.json(uptime);
}));

router.get("/zeus/analytics/log-volume", requireAuth, asyncHandler(async (_req, res) => {
  const volume = await zeusService.getLogVolumeByLevel();
  res.json(volume);
}));

router.get("/zeus/analytics/error-rates", requireAuth, asyncHandler(async (_req, res) => {
  const rates = await zeusService.getErrorRates();
  res.json(rates);
}));

router.get("/zeus/analytics/system-health", requireAuth, asyncHandler(async (_req, res) => {
  const health = await zeusService.getSystemHealthScore();
  res.json(health);
}));

router.get("/zeus/export/logs", requireAuth, asyncHandler(async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";
  const result = await zeusService.exportLogs(format);
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.data);
}));

router.get("/zeus/export/modules", requireAuth, asyncHandler(async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";
  const result = await zeusService.exportModules(format);
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.data);
}));

export default router;
