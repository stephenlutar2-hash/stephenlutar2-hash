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

router.get("/zeus/modules", requireAuth, asyncHandler(async (_req, res) => {
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

router.get("/zeus/logs", requireAuth, asyncHandler(async (_req, res) => {
  const logs = await zeusService.listLogs();
  res.json(logs);
}));

router.post("/zeus/logs", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertZeusLogSchema), asyncHandler(async (req, res) => {
  const created = await zeusService.createLog(req.body);
  res.status(201).json(created);
}));

export default router;
