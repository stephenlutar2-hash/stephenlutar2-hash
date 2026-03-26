import { Router } from "express";
import { z } from "zod";
import { db } from "@szl-holdings/db";
import { incaProjectsTable, incaExperimentsTable, insertIncaProjectSchema, insertIncaExperimentSchema } from "@szl-holdings/db/schema";
import { eq, inArray } from "drizzle-orm";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";
import { asyncHandler } from "../middleware/errorHandler";
import { incaService } from "../services/inca";
import { AppError } from "../lib/errors";
import {
  parsePagination,
  paginateArray,
  sortArray,
  filterByFields,
  searchItems,
} from "../middleware/pagination";

const router = Router();

const sseClients: Set<import("express").Response> = new Set();

function broadcastSSE(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

router.get("/inca/health", (_req, res) => {
  res.json({ ok: true, group: "inca", timestamp: new Date().toISOString() });
});

router.get("/inca/projects", requireAuth, asyncHandler(async (_req, res) => {
  const projects = await incaService.listProjects();
  res.json(projects);
}));

router.get("/inca/list/projects", requireAuth, asyncHandler(async (req, res) => {
  const pagination = parsePagination(req);
  let projects = await incaService.listProjects();
  projects = filterByFields(projects, req.query as Record<string, string | string[] | undefined>, ["status", "aiModel"]);
  projects = sortArray(projects, pagination.sort, pagination.order);
  res.json(paginateArray(projects, pagination));
}));

router.post("/inca/projects", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaProjectSchema), asyncHandler(async (req, res) => {
  const created = await incaService.createProject(req.body);
  broadcastSSE("project:created", created);
  res.status(201).json(created);
}));

router.put("/inca/projects/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaProjectSchema), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw AppError.badRequest("Invalid ID", "id: must be a valid integer");
  const updated = await incaService.updateProject(id, req.body);
  if (!updated) throw AppError.notFound("Project not found");
  broadcastSSE("project:updated", updated);
  res.json(updated);
}));

router.delete("/inca/projects/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw AppError.badRequest("Invalid ID", "id: must be a valid integer");
  await incaService.deleteProject(id);
  broadcastSSE("project:deleted", { id });
  res.status(204).send();
}));

router.get("/inca/experiments", requireAuth, asyncHandler(async (_req, res) => {
  const experiments = await incaService.listExperiments();
  res.json(experiments);
}));

router.get("/inca/list/experiments", requireAuth, asyncHandler(async (req, res) => {
  const pagination = parsePagination(req);
  let experiments = await incaService.listExperiments();
  experiments = filterByFields(experiments, req.query as Record<string, string | string[] | undefined>, ["status", "result"]);
  if (req.query.projectId) {
    const pid = parseInt(req.query.projectId as string);
    if (!isNaN(pid)) experiments = experiments.filter(e => e.projectId === pid);
  }
  experiments = sortArray(experiments, pagination.sort, pagination.order);
  res.json(paginateArray(experiments, pagination));
}));

router.post("/inca/experiments", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaExperimentSchema), asyncHandler(async (req, res) => {
  const created = await incaService.createExperiment(req.body);
  broadcastSSE("experiment:created", created);
  res.status(201).json(created);
}));

router.put("/inca/experiments/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertIncaExperimentSchema), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw AppError.badRequest("Invalid ID", "id: must be a valid integer");
  const updated = await incaService.updateExperiment(id, req.body);
  if (!updated) throw AppError.notFound("Experiment not found");
  broadcastSSE("experiment:updated", updated);
  res.json(updated);
}));

router.delete("/inca/experiments/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw AppError.badRequest("Invalid ID", "id: must be a valid integer");
  await incaService.deleteExperiment(id);
  broadcastSSE("experiment:deleted", { id });
  res.status(204).send();
}));

router.get("/inca/analytics/experiment-success-rates", requireAuth, asyncHandler(async (_req, res) => {
  const experiments = await db.select().from(incaExperimentsTable);
  const total = experiments.length;
  const byStatus: Record<string, number> = {};
  for (const e of experiments) {
    byStatus[e.status] = (byStatus[e.status] || 0) + 1;
  }

  const byMonth: Record<string, { total: number; successful: number }> = {};
  for (const e of experiments) {
    const month = e.createdAt.toISOString().substring(0, 7);
    if (!byMonth[month]) byMonth[month] = { total: 0, successful: 0 };
    byMonth[month].total++;
    if (e.status === "completed" || e.result === "success") byMonth[month].successful++;
  }

  const trend = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      total: data.total,
      successful: data.successful,
      successRate: data.total > 0 ? Math.round((data.successful / data.total) * 100) : 0,
    }));

  res.json({
    total,
    byStatus,
    overallSuccessRate: total > 0 ? Math.round(experiments.filter(e => e.status === "completed" || e.result === "success").length / total * 100) : 0,
    trend,
  });
}));

router.get("/inca/analytics/model-leaderboard", requireAuth, asyncHandler(async (_req, res) => {
  const experiments = await db.select().from(incaExperimentsTable);
  const projects = await db.select().from(incaProjectsTable);

  const modelMap: Record<string, { totalAccuracy: number; count: number; experiments: number; successCount: number }> = {};

  for (const p of projects) {
    if (!modelMap[p.aiModel]) modelMap[p.aiModel] = { totalAccuracy: 0, count: 0, experiments: 0, successCount: 0 };
    modelMap[p.aiModel].totalAccuracy += Number(p.accuracy);
    modelMap[p.aiModel].count++;
  }

  const projectModelMap = new Map(projects.map(p => [p.id, p.aiModel]));
  for (const e of experiments) {
    const model = projectModelMap.get(e.projectId);
    if (model && modelMap[model]) {
      modelMap[model].experiments++;
      if (e.status === "completed" || e.result === "success") modelMap[model].successCount++;
    }
  }

  const leaderboard = Object.entries(modelMap)
    .map(([model, stats]) => ({
      model,
      avgAccuracy: stats.count > 0 ? Math.round((stats.totalAccuracy / stats.count) * 100) / 100 : 0,
      projectCount: stats.count,
      experimentCount: stats.experiments,
      successRate: stats.experiments > 0 ? Math.round((stats.successCount / stats.experiments) * 100) : 0,
    }))
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy);

  res.json({ leaderboard });
}));

router.get("/inca/analytics/project-health", requireAuth, asyncHandler(async (_req, res) => {
  const projects = await db.select().from(incaProjectsTable);
  const experiments = await db.select().from(incaExperimentsTable);

  const experimentsByProject: Record<number, typeof experiments> = {};
  for (const e of experiments) {
    if (!experimentsByProject[e.projectId]) experimentsByProject[e.projectId] = [];
    experimentsByProject[e.projectId].push(e);
  }

  const projectHealth = projects.map(p => {
    const exps = experimentsByProject[p.id] || [];
    const completedExps = exps.filter(e => e.status === "completed" || e.result === "success").length;
    const avgExpAccuracy = exps.length > 0 ? exps.reduce((s, e) => s + Number(e.accuracy), 0) / exps.length : 0;
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      accuracy: Number(p.accuracy),
      experimentCount: exps.length,
      completedExperiments: completedExps,
      avgExperimentAccuracy: Math.round(avgExpAccuracy * 100) / 100,
      healthScore: Math.round(
        (Number(p.accuracy) * 0.4 + avgExpAccuracy * 0.3 + (exps.length > 0 ? (completedExps / exps.length) * 100 : 0) * 0.3),
      ),
    };
  });

  const summary = {
    totalProjects: projects.length,
    byStatus: {} as Record<string, number>,
    avgAccuracy: projects.length > 0 ? Math.round(projects.reduce((s, p) => s + Number(p.accuracy), 0) / projects.length * 100) / 100 : 0,
    totalExperiments: experiments.length,
    avgHealthScore: projectHealth.length > 0 ? Math.round(projectHealth.reduce((s, p) => s + p.healthScore, 0) / projectHealth.length) : 0,
  };

  for (const p of projects) {
    summary.byStatus[p.status] = (summary.byStatus[p.status] || 0) + 1;
  }

  res.json({ projects: projectHealth, summary });
}));

router.get("/inca/search", requireAuth, asyncHandler(async (req, res) => {
  const q = req.query.q as string;
  if (!q || q.trim() === "") {
    res.json({ projects: [], experiments: [] });
    return;
  }

  const projects = await incaService.listProjects();
  const experiments = await incaService.listExperiments();

  const matchedProjects = searchItems(projects, q, ["name", "description", "aiModel"]);
  const matchedExperiments = searchItems(experiments, q, ["name", "hypothesis", "result"]);

  res.json({
    projects: matchedProjects,
    experiments: matchedExperiments,
    totalResults: matchedProjects.length + matchedExperiments.length,
  });
}));

const bulkStatusSchema = z.object({
  ids: z.array(z.number().int()).min(1).max(100),
  status: z.string().min(1),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int()).min(1).max(100),
});

router.patch("/inca/projects/bulk/status", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const parsed = bulkStatusSchema.safeParse(req.body);
  if (!parsed.success) throw AppError.badRequest("Validation failed", parsed.error.message);
  const { ids, status } = parsed.data;

  const updated = await db.update(incaProjectsTable)
    .set({ status })
    .where(inArray(incaProjectsTable.id, ids))
    .returning();

  broadcastSSE("projects:bulk-updated", { ids, status });
  res.json({ updated: updated.length, records: updated.map(u => ({ ...u, accuracy: Number(u.accuracy) })) });
}));

router.delete("/inca/projects/bulk", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const parsed = bulkDeleteSchema.safeParse(req.body);
  if (!parsed.success) throw AppError.badRequest("Validation failed", parsed.error.message);
  const { ids } = parsed.data;

  await db.delete(incaProjectsTable).where(inArray(incaProjectsTable.id, ids));
  broadcastSSE("projects:bulk-deleted", { ids });
  res.json({ deleted: ids.length });
}));

router.patch("/inca/experiments/bulk/status", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const parsed = bulkStatusSchema.safeParse(req.body);
  if (!parsed.success) throw AppError.badRequest("Validation failed", parsed.error.message);
  const { ids, status } = parsed.data;

  const updated = await db.update(incaExperimentsTable)
    .set({ status })
    .where(inArray(incaExperimentsTable.id, ids))
    .returning();

  broadcastSSE("experiments:bulk-updated", { ids, status });
  res.json({ updated: updated.length, records: updated.map(u => ({ ...u, accuracy: Number(u.accuracy) })) });
}));

router.delete("/inca/experiments/bulk", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const parsed = bulkDeleteSchema.safeParse(req.body);
  if (!parsed.success) throw AppError.badRequest("Validation failed", parsed.error.message);
  const { ids } = parsed.data;

  await db.delete(incaExperimentsTable).where(inArray(incaExperimentsTable.id, ids));
  broadcastSSE("experiments:bulk-deleted", { ids });
  res.json({ deleted: ids.length });
}));

router.get("/inca/stream", requireAuth, (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("event: connected\ndata: {\"status\":\"connected\"}\n\n");
  sseClients.add(res);
  req.on("close", () => {
    sseClients.delete(res);
  });
});

export default router;
