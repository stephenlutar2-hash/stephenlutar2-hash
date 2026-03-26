import { Router } from "express";
import { z } from "zod";
import { insertIncaProjectSchema, insertIncaExperimentSchema } from "@szl-holdings/db/schema";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";
import { asyncHandler } from "../middleware/errorHandler";
import { incaService } from "../services/inca";
import { AppError } from "../lib/errors";

const router = Router();

router.get("/inca/health", (_req, res) => {
  res.json({ ok: true, group: "inca", timestamp: new Date().toISOString() });
});

router.get("/inca/projects", requireAuth, asyncHandler(async (_req, res) => {
  const projects = await incaService.listProjects();
  res.json(projects);
}));

router.post("/inca/projects", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaProjectSchema), asyncHandler(async (req, res) => {
  const created = await incaService.createProject(req.body);
  res.status(201).json(created);
}));

router.put("/inca/projects/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaProjectSchema), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw AppError.badRequest("Invalid ID", "id: must be a valid integer");
  const updated = await incaService.updateProject(id, req.body);
  if (!updated) throw AppError.notFound("Project not found");
  res.json(updated);
}));

router.delete("/inca/projects/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw AppError.badRequest("Invalid ID", "id: must be a valid integer");
  await incaService.deleteProject(id);
  res.status(204).send();
}));

router.get("/inca/experiments", requireAuth, asyncHandler(async (_req, res) => {
  const experiments = await incaService.listExperiments();
  res.json(experiments);
}));

router.post("/inca/experiments", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaExperimentSchema), asyncHandler(async (req, res) => {
  const created = await incaService.createExperiment(req.body);
  res.status(201).json(created);
}));

router.put("/inca/experiments/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaExperimentSchema), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw AppError.badRequest("Invalid ID", "id: must be a valid integer");
  const updated = await incaService.updateExperiment(id, req.body);
  if (!updated) throw AppError.notFound("Experiment not found");
  res.json(updated);
}));

router.delete("/inca/experiments/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw AppError.badRequest("Invalid ID", "id: must be a valid integer");
  await incaService.deleteExperiment(id);
  res.status(204).send();
}));

export default router;
