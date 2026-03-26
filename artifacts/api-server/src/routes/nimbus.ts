import { Router } from "express";
import { z } from "zod";
import { db } from "@szl-holdings/db";
import { nimbusPredictionsTable, nimbusAlertsTable, insertNimbusPredictionSchema, insertNimbusAlertSchema } from "@szl-holdings/db/schema";
import { inArray } from "drizzle-orm";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";
import { asyncHandler } from "../middleware/errorHandler";
import { nimbusService } from "../services/nimbus";
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

router.get("/nimbus/health", (_req, res) => {
  res.json({ ok: true, group: "nimbus", timestamp: new Date().toISOString() });
});

router.get("/nimbus/predictions", requireAuth, asyncHandler(async (_req, res) => {
  const predictions = await nimbusService.listPredictions();
  res.json(predictions);
}));

router.get("/nimbus/list/predictions", requireAuth, asyncHandler(async (req, res) => {
  const pagination = parsePagination(req);
  let predictions = await nimbusService.listPredictions();
  predictions = filterByFields(predictions, req.query as Record<string, string | string[] | undefined>, ["status", "category", "outcome"]);
  predictions = sortArray(predictions, pagination.sort, pagination.order);
  res.json(paginateArray(predictions, pagination));
}));

router.post("/nimbus/predictions", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertNimbusPredictionSchema), asyncHandler(async (req, res) => {
  const created = await nimbusService.createPrediction(req.body);
  broadcastSSE("prediction:created", created);
  res.status(201).json(created);
}));

router.delete("/nimbus/predictions/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await nimbusService.deletePrediction(id);
  broadcastSSE("prediction:deleted", { id });
  res.status(204).send();
}));

router.get("/nimbus/alerts", requireAuth, asyncHandler(async (_req, res) => {
  const alerts = await nimbusService.listAlerts();
  res.json(alerts);
}));

router.get("/nimbus/list/alerts", requireAuth, asyncHandler(async (req, res) => {
  const pagination = parsePagination(req);
  let alerts = await nimbusService.listAlerts();
  alerts = filterByFields(alerts, req.query as Record<string, string | string[] | undefined>, ["severity", "category"]);
  alerts = sortArray(alerts, pagination.sort, pagination.order);
  res.json(paginateArray(alerts, pagination));
}));

router.post("/nimbus/alerts", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertNimbusAlertSchema), asyncHandler(async (req, res) => {
  const created = await nimbusService.createAlert(req.body);
  broadcastSSE("alert:created", created);
  res.status(201).json(created);
}));

router.delete("/nimbus/alerts/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await nimbusService.deleteAlert(id);
  broadcastSSE("alert:deleted", { id });
  res.status(204).send();
}));

router.get("/nimbus/analytics/prediction-accuracy", requireAuth, asyncHandler(async (_req, res) => {
  const predictions = await db.select().from(nimbusPredictionsTable);

  const byMonth: Record<string, { total: number; correct: number; totalConfidence: number }> = {};
  for (const p of predictions) {
    const month = p.createdAt.toISOString().substring(0, 7);
    if (!byMonth[month]) byMonth[month] = { total: 0, correct: 0, totalConfidence: 0 };
    byMonth[month].total++;
    byMonth[month].totalConfidence += Number(p.confidence);
    if (p.status === "verified" || p.outcome === "correct") byMonth[month].correct++;
  }

  const trend = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      avgConfidence: data.total > 0 ? Math.round((data.totalConfidence / data.total) * 100) / 100 : 0,
    }));

  const totalCorrect = predictions.filter(p => p.status === "verified" || p.outcome === "correct").length;
  res.json({
    total: predictions.length,
    overallAccuracy: predictions.length > 0 ? Math.round((totalCorrect / predictions.length) * 100) : 0,
    avgConfidence: predictions.length > 0 ? Math.round(predictions.reduce((s, p) => s + Number(p.confidence), 0) / predictions.length * 100) / 100 : 0,
    trend,
  });
}));

router.get("/nimbus/analytics/alert-frequency", requireAuth, asyncHandler(async (_req, res) => {
  const alerts = await db.select().from(nimbusAlertsTable);

  const bySeverity: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byMonth: Record<string, Record<string, number>> = {};

  for (const a of alerts) {
    bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;

    const month = a.createdAt.toISOString().substring(0, 7);
    if (!byMonth[month]) byMonth[month] = {};
    byMonth[month][a.severity] = (byMonth[month][a.severity] || 0) + 1;
  }

  const trend = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, severities]) => ({
      month,
      ...severities,
      total: Object.values(severities).reduce((s, v) => s + v, 0),
    }));

  res.json({
    total: alerts.length,
    bySeverity,
    byCategory,
    unread: alerts.filter(a => !a.isRead).length,
    trend,
  });
}));

router.get("/nimbus/analytics/confidence-distribution", requireAuth, asyncHandler(async (_req, res) => {
  const predictions = await db.select().from(nimbusPredictionsTable);

  const buckets: Record<string, number> = {
    "0-20": 0,
    "20-40": 0,
    "40-60": 0,
    "60-80": 0,
    "80-100": 0,
  };

  for (const p of predictions) {
    const conf = Number(p.confidence);
    if (conf < 20) buckets["0-20"]++;
    else if (conf < 40) buckets["20-40"]++;
    else if (conf < 60) buckets["40-60"]++;
    else if (conf < 80) buckets["60-80"]++;
    else buckets["80-100"]++;
  }

  const byCategory: Record<string, { avg: number; count: number }> = {};
  for (const p of predictions) {
    if (!byCategory[p.category]) byCategory[p.category] = { avg: 0, count: 0 };
    byCategory[p.category].avg += Number(p.confidence);
    byCategory[p.category].count++;
  }

  const categoryDistribution = Object.entries(byCategory).map(([category, data]) => ({
    category,
    avgConfidence: Math.round((data.avg / data.count) * 100) / 100,
    count: data.count,
  }));

  res.json({
    distribution: buckets,
    categoryDistribution,
    overall: {
      avg: predictions.length > 0 ? Math.round(predictions.reduce((s, p) => s + Number(p.confidence), 0) / predictions.length * 100) / 100 : 0,
      median: predictions.length > 0
        ? Number([...predictions].sort((a, b) => Number(a.confidence) - Number(b.confidence))[Math.floor(predictions.length / 2)].confidence)
        : 0,
      min: predictions.length > 0 ? Math.min(...predictions.map(p => Number(p.confidence))) : 0,
      max: predictions.length > 0 ? Math.max(...predictions.map(p => Number(p.confidence))) : 0,
    },
  });
}));

router.get("/nimbus/search", requireAuth, asyncHandler(async (req, res) => {
  const q = req.query.q as string;
  if (!q || q.trim() === "") {
    res.json({ predictions: [], alerts: [] });
    return;
  }

  const predictions = await nimbusService.listPredictions();
  const alerts = await nimbusService.listAlerts();

  const matchedPredictions = searchItems(predictions, q, ["title", "description", "category", "outcome"]);
  const matchedAlerts = searchItems(alerts, q, ["title", "message", "category"]);

  res.json({
    predictions: matchedPredictions,
    alerts: matchedAlerts,
    totalResults: matchedPredictions.length + matchedAlerts.length,
  });
}));

const bulkStatusSchema = z.object({
  ids: z.array(z.number().int()).min(1).max(100),
  status: z.string().min(1),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int()).min(1).max(100),
});

router.patch("/nimbus/predictions/bulk/status", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const parsed = bulkStatusSchema.safeParse(req.body);
  if (!parsed.success) throw AppError.badRequest("Validation failed", parsed.error.message);
  const { ids, status } = parsed.data;

  const updated = await db.update(nimbusPredictionsTable)
    .set({ status })
    .where(inArray(nimbusPredictionsTable.id, ids))
    .returning();

  broadcastSSE("predictions:bulk-updated", { ids, status });
  res.json({ updated: updated.length, records: updated.map(u => ({ ...u, confidence: Number(u.confidence) })) });
}));

router.delete("/nimbus/predictions/bulk", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const parsed = bulkDeleteSchema.safeParse(req.body);
  if (!parsed.success) throw AppError.badRequest("Validation failed", parsed.error.message);
  const { ids } = parsed.data;

  await db.delete(nimbusPredictionsTable).where(inArray(nimbusPredictionsTable.id, ids));
  broadcastSSE("predictions:bulk-deleted", { ids });
  res.json({ deleted: ids.length });
}));

const bulkAlertUpdateSchema = z.object({
  ids: z.array(z.number().int()).min(1).max(100),
  isRead: z.boolean().optional(),
  severity: z.string().optional(),
});

router.patch("/nimbus/alerts/bulk/status", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const parsed = bulkAlertUpdateSchema.safeParse(req.body);
  if (!parsed.success) throw AppError.badRequest("Validation failed", parsed.error.message);
  const { ids, isRead, severity } = parsed.data;

  const updates: Partial<{ isRead: boolean; severity: string }> = {};
  if (isRead !== undefined) updates.isRead = isRead;
  if (severity) updates.severity = severity;

  if (Object.keys(updates).length === 0) throw AppError.badRequest("No updates provided");

  const updated = await db.update(nimbusAlertsTable)
    .set(updates)
    .where(inArray(nimbusAlertsTable.id, ids))
    .returning();

  broadcastSSE("alerts:bulk-updated", { ids, updates });
  res.json({ updated: updated.length, records: updated });
}));

router.delete("/nimbus/alerts/bulk", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const parsed = bulkDeleteSchema.safeParse(req.body);
  if (!parsed.success) throw AppError.badRequest("Validation failed", parsed.error.message);
  const { ids } = parsed.data;

  await db.delete(nimbusAlertsTable).where(inArray(nimbusAlertsTable.id, ids));
  broadcastSSE("alerts:bulk-deleted", { ids });
  res.json({ deleted: ids.length });
}));

router.get("/nimbus/stream", requireAuth, (req, res) => {
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
