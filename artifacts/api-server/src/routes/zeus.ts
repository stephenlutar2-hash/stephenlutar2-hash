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

const topologyServices = [
  { name: "Zeus Core", type: "Infrastructure", status: "healthy", uptime: "99.97%", connections: ["Beacon", "Rosie", "INCA", "AlloyScape"], load: 34, instances: 4 },
  { name: "Beacon", type: "Observability", status: "healthy", uptime: "99.99%", connections: ["Zeus Core", "All Services"], load: 42, instances: 3 },
  { name: "Rosie", type: "Security", status: "healthy", uptime: "99.98%", connections: ["Zeus Core", "Aegis", "Firestorm"], load: 28, instances: 2 },
  { name: "Aegis", type: "Compliance", status: "healthy", uptime: "99.95%", connections: ["Rosie", "Zeus Core"], load: 18, instances: 2 },
  { name: "INCA", type: "Intelligence", status: "healthy", uptime: "99.94%", connections: ["Zeus Core", "AlloyScape"], load: 56, instances: 3 },
  { name: "Vessels", type: "Maritime", status: "warning", uptime: "99.92%", connections: ["Zeus Core", "Beacon", "Nimbus"], load: 71, instances: 4 },
  { name: "AlloyScape", type: "Orchestration", status: "healthy", uptime: "99.96%", connections: ["Zeus Core", "INCA", "All Agents"], load: 45, instances: 3 },
  { name: "Nimbus", type: "Predictions", status: "healthy", uptime: "99.93%", connections: ["Zeus Core", "Vessels", "INCA"], load: 62, instances: 2 },
  { name: "Firestorm", type: "Incident Response", status: "healthy", uptime: "99.97%", connections: ["Rosie", "Zeus Core"], load: 12, instances: 2 },
  { name: "DreamEra", type: "Creative AI", status: "healthy", uptime: "99.91%", connections: ["Zeus Core", "Dreamscape"], load: 38, instances: 2 },
  { name: "Shared PostgreSQL", type: "Database", status: "healthy", uptime: "99.99%", connections: ["All Services"], load: 68, instances: 3 },
  { name: "Redis Cluster", type: "Cache", status: "healthy", uptime: "99.99%", connections: ["All Services"], load: 41, instances: 6 },
];

const dependencyGraph = {
  modules: [
    { id: "core", name: "Core Engine", status: "online", load: 42, color: "#eab308" },
    { id: "data", name: "Data Nexus", status: "online", load: 58, color: "#3b82f6" },
    { id: "shield", name: "Shield Protocol", status: "online", load: 23, color: "#10b981" },
    { id: "mesh", name: "Neural Mesh", status: "degraded", load: 87, color: "#f59e0b" },
    { id: "config", name: "Config Matrix", status: "online", load: 12, color: "#8b5cf6" },
    { id: "events", name: "Event Bus", status: "online", load: 35, color: "#06b6d4" },
    { id: "storage", name: "Storage Engine", status: "online", load: 51, color: "#ec4899" },
    { id: "version", name: "Versioning", status: "maintenance", load: 0, color: "#6b7280" },
  ],
  dependencies: [
    { from: "core", to: "data", strength: 0.9, label: "data sync" },
    { from: "core", to: "shield", strength: 0.8, label: "auth" },
    { from: "core", to: "config", strength: 0.95, label: "config" },
    { from: "core", to: "events", strength: 0.7, label: "events" },
    { from: "data", to: "storage", strength: 0.85, label: "persistence" },
    { from: "data", to: "mesh", strength: 0.6, label: "routing" },
    { from: "shield", to: "config", strength: 0.5, label: "policies" },
    { from: "shield", to: "events", strength: 0.4, label: "audit" },
    { from: "events", to: "storage", strength: 0.7, label: "logs" },
    { from: "config", to: "version", strength: 0.3, label: "versioning" },
    { from: "mesh", to: "events", strength: 0.65, label: "metrics" },
    { from: "storage", to: "version", strength: 0.5, label: "snapshots" },
  ],
};

const selfHealingEvents = [
  { id: 1, time: "2026-03-25T14:32:00Z", service: "Vessels Fleet API", event: "Auto-scaled from 3 to 4 instances", trigger: "CPU > 75% for 5 minutes", result: "Load reduced to 52%", type: "scaling" },
  { id: 2, time: "2026-03-25T08:15:00Z", service: "INCA Experiment Runner", event: "Restarted unhealthy pod (inca-runner-7b8c9)", trigger: "Health check failed 3 consecutive times", result: "Service restored in 12 seconds", type: "restart" },
  { id: 3, time: "2026-03-24T22:45:00Z", service: "Redis Cluster", event: "Failover to replica node (redis-replica-02)", trigger: "Primary node memory > 95%", result: "Zero-downtime failover completed", type: "failover" },
  { id: 4, time: "2026-03-24T16:20:00Z", service: "AlloyScape Orchestrator", event: "Circuit breaker opened for INCA dependency", trigger: "INCA latency > 5s for 30 seconds", result: "Graceful degradation — cached responses served", type: "circuit-breaker" },
  { id: 5, time: "2026-03-24T11:05:00Z", service: "Beacon Telemetry", event: "Disk cleanup triggered on metrics partition", trigger: "Disk usage > 85% threshold", result: "12GB freed, usage back to 62%", type: "cleanup" },
  { id: 6, time: "2026-03-23T19:30:00Z", service: "Nimbus Prediction Engine", event: "Model rollback to stable version v2.3.1", trigger: "Prediction accuracy dropped below 80%", result: "Accuracy restored to 91%", type: "rollback" },
];

router.get("/zeus/topology", (_req, res) => {
  const healthy = topologyServices.filter(s => s.status === "healthy").length;
  const avgUptime = (topologyServices.reduce((s, sv) => s + parseFloat(sv.uptime), 0) / topologyServices.length).toFixed(2);
  res.json({
    services: topologyServices,
    stats: {
      total: topologyServices.length,
      healthy,
      selfHealingEvents24h: selfHealingEvents.length,
      avgUptime: `${avgUptime}%`,
    },
  });
});

router.get("/zeus/dependencies", (_req, res) => {
  res.json(dependencyGraph);
});

router.get("/zeus/self-healing-events", (_req, res) => {
  res.json({ events: selfHealingEvents });
});

export default router;
