import { Router } from "express";
import { insertBeaconMetricSchema, insertBeaconProjectSchema, beaconMetricsTable, beaconProjectsTable } from "@szl-holdings/db/schema";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { count } from "drizzle-orm";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";
import { asyncHandler } from "../middleware/errorHandler";
import { beaconService } from "../services/beacon";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

const router = Router();

let seeded = false;
let seedingPromise: Promise<void> | null = null;

async function ensureSeeded() {
  if (seeded || !isDatabaseAvailable()) return;
  if (seedingPromise) return seedingPromise;
  seedingPromise = doSeed().finally(() => { seedingPromise = null; });
  return seedingPromise;
}

async function doSeed() {
  if (seeded) return;
  const [metricsCount, projectsCount] = await Promise.all([
    db.select({ cnt: count() }).from(beaconMetricsTable),
    db.select({ cnt: count() }).from(beaconProjectsTable),
  ]);
  if (metricsCount[0].cnt > 0 && projectsCount[0].cnt > 0) { seeded = true; return; }

  if (metricsCount[0].cnt === 0) await db.insert(beaconMetricsTable).values([
    { name: "Total Revenue", value: "4820000", unit: "$", change: "23.4", category: "Financial" },
    { name: "Active Projects", value: "7", unit: "projects", change: "16.7", category: "Operations" },
    { name: "Empire Growth", value: "340", unit: "%", change: "12.1", category: "Growth" },
    { name: "Team Size", value: "24", unit: "people", change: "33.3", category: "HR" },
    { name: "Monthly Recurring Revenue", value: "182000", unit: "$", change: "8.5", category: "Financial" },
    { name: "Client Satisfaction", value: "97.4", unit: "%", change: "2.1", category: "Quality" },
  ]).onConflictDoNothing();

  if (projectsCount[0].cnt === 0) await db.insert(beaconProjectsTable).values([
    { name: "ROSIE", description: "AI-powered security monitoring platform for real-time threat detection", status: "active", progress: 95, platform: "Security" },
    { name: "AEGIS", description: "Enterprise-grade security fortress with zero-trust architecture", status: "active", progress: 88, platform: "Security" },
    { name: "NIMBUS", description: "Predictive AI analytics and forecasting engine", status: "building", progress: 72, platform: "AI" },
    { name: "ZEUS", description: "Modular infrastructure core powering all SZL platforms", status: "building", progress: 65, platform: "Infrastructure" },
    { name: "INCA AI", description: "Advanced AI research and innovation laboratory", status: "planning", progress: 40, platform: "AI" },
    { name: "DREAM ERA", description: "Premium media and content production platform", status: "planning", progress: 30, platform: "Media" },
    { name: "LUTAR", description: "Personal empire management and command center", status: "active", progress: 82, platform: "Management" },
  ]).onConflictDoNothing();

  seeded = true;
  logger.info("Beacon seed data loaded successfully");
}

router.get("/beacon/health", (_req, res) => {
  res.json({ ok: true, group: "beacon", timestamp: new Date().toISOString() });
});

router.get("/beacon/metrics", requireAuth, asyncHandler(async (req, res) => {
  await ensureSeeded();
  const { page, limit, sortBy, sortOrder, search, category } = req.query;
  if (page || limit || sortBy || sortOrder || search || category) {
    const result = await beaconService.listMetricsPaginated({
      page: page ? parseInt(String(page)) : undefined,
      limit: limit ? parseInt(String(limit)) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder === "desc" ? "desc" : sortOrder === "asc" ? "asc" : undefined,
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
    });
    res.json(result);
    return;
  }
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

router.get("/beacon/projects", requireAuth, asyncHandler(async (req, res) => {
  await ensureSeeded();
  const { page, limit, sortBy, sortOrder, search, status } = req.query;
  if (page || limit || sortBy || sortOrder || search || status) {
    const result = await beaconService.listProjectsPaginated({
      page: page ? parseInt(String(page)) : undefined,
      limit: limit ? parseInt(String(limit)) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder === "desc" ? "desc" : sortOrder === "asc" ? "asc" : undefined,
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
    });
    res.json(result);
    return;
  }
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

router.get("/beacon/analytics/metric-trends", requireAuth, asyncHandler(async (req, res) => {
  await ensureSeeded();
  const window = req.query.window as "hourly" | "daily" | "weekly" | undefined;
  const metricName = req.query.metricName ? String(req.query.metricName) : undefined;
  const trends = await beaconService.getMetricTrends(window || "daily", metricName);
  res.json(trends);
}));

router.get("/beacon/analytics/project-progress", requireAuth, asyncHandler(async (_req, res) => {
  await ensureSeeded();
  const summary = await beaconService.getProjectProgressSummary();
  res.json(summary);
}));

router.get("/beacon/analytics/kpi-summary", requireAuth, asyncHandler(async (_req, res) => {
  await ensureSeeded();
  const kpis = await beaconService.getKpiSummary();
  res.json(kpis);
}));

router.post("/beacon/alerts/evaluate", requireAuth, asyncHandler(async (req, res) => {
  const { rules } = req.body;
  if (!rules || !Array.isArray(rules)) {
    throw AppError.badRequest("Request body must include 'rules' array");
  }
  for (const rule of rules) {
    if (!rule.metricName || !rule.operator || rule.threshold === undefined) {
      throw AppError.badRequest("Each rule must have metricName, operator, and threshold");
    }
    if (typeof rule.threshold !== "number" || !Number.isFinite(rule.threshold)) {
      throw AppError.badRequest("Threshold must be a finite number");
    }
    if (!["gt", "lt", "gte", "lte", "eq"].includes(rule.operator)) {
      throw AppError.badRequest(`Invalid operator: ${rule.operator}. Must be one of: gt, lt, gte, lte, eq`);
    }
  }
  const evaluations = await beaconService.evaluateAlerts(rules);
  const triggered = evaluations.filter(e => e.triggered);
  res.json({
    evaluations,
    summary: {
      total: evaluations.length,
      triggered: triggered.length,
      critical: triggered.filter(e => e.severity === "critical").length,
      warning: triggered.filter(e => e.severity === "warning").length,
    },
    timestamp: new Date().toISOString(),
  });
}));

router.get("/beacon/webhooks", requireAuth, requireOperator(), asyncHandler(async (_req, res) => {
  const webhooks = beaconService.listWebhooks();
  res.json(webhooks);
}));

router.get("/beacon/webhooks/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const webhook = beaconService.getWebhook(req.params.id);
  if (!webhook) throw AppError.notFound("Webhook not found");
  res.json(webhook);
}));

router.post("/beacon/webhooks", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const { url, name, events, secret } = req.body;
  if (!url || !name || !events || !Array.isArray(events) || events.length === 0) {
    throw AppError.badRequest("Webhook requires url, name, and events array");
  }
  const validEvents = ["alert.triggered", "alert.resolved", "metric.created", "metric.updated", "*"];
  for (const event of events) {
    if (!validEvents.includes(event)) {
      throw AppError.badRequest(`Invalid event type: ${event}. Valid types: ${validEvents.join(", ")}`);
    }
  }
  try {
    const webhook = beaconService.createWebhook({ url, name, events, secret });
    res.status(201).json(webhook);
  } catch (err) {
    throw AppError.badRequest(err instanceof Error ? err.message : "Invalid webhook configuration");
  }
}));

router.put("/beacon/webhooks/:id", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  try {
    const updated = beaconService.updateWebhook(req.params.id, req.body);
    if (!updated) throw AppError.notFound("Webhook not found");
    res.json(updated);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.badRequest(err instanceof Error ? err.message : "Invalid webhook configuration");
  }
}));

router.delete("/beacon/webhooks/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const deleted = beaconService.deleteWebhook(req.params.id);
  if (!deleted) throw AppError.notFound("Webhook not found");
  res.status(204).send();
}));

router.post("/beacon/webhooks/:id/test", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const result = await beaconService.testWebhook(req.params.id);
  res.json(result);
}));

router.post("/beacon/alerts/dispatch", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const { rules } = req.body;
  if (!rules || !Array.isArray(rules)) {
    throw AppError.badRequest("Request body must include 'rules' array");
  }
  for (const rule of rules) {
    if (!rule.metricName || !rule.operator || rule.threshold === undefined) {
      throw AppError.badRequest("Each rule must have metricName, operator, and threshold");
    }
    if (typeof rule.threshold !== "number" || !Number.isFinite(rule.threshold)) {
      throw AppError.badRequest("Threshold must be a finite number");
    }
    if (!["gt", "lt", "gte", "lte", "eq"].includes(rule.operator)) {
      throw AppError.badRequest(`Invalid operator: ${rule.operator}. Must be one of: gt, lt, gte, lte, eq`);
    }
  }
  const result = await beaconService.dispatchAlertNotifications(rules);
  const triggered = result.evaluations.filter(e => e.triggered);
  res.json({
    evaluations: result.evaluations,
    notifications: result.notifications,
    summary: {
      totalRules: result.evaluations.length,
      triggered: triggered.length,
      notificationsSent: result.notifications.filter(n => n.status === "sent").length,
      notificationsFailed: result.notifications.filter(n => n.status === "failed").length,
    },
    timestamp: new Date().toISOString(),
  });
}));

router.get("/beacon/notifications", requireAuth, asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(String(req.query.limit)) : 50;
  const notifications = beaconService.listNotifications(limit);
  res.json(notifications);
}));

router.get("/beacon/export/metrics", requireAuth, asyncHandler(async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";
  const result = await beaconService.exportMetrics(format);
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.data);
}));

router.get("/beacon/export/projects", requireAuth, asyncHandler(async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";
  const result = await beaconService.exportProjects(format);
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.data);
}));

export default router;
