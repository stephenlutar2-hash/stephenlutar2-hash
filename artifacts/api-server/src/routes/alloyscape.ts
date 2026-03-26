import { Router } from "express";
import { requireAuth } from "./auth";
import { asyncHandler } from "../middleware/errorHandler";
import { alloyscapeService } from "../services/alloyscape";

const router = Router();

router.get("/alloyscape/health", (_req, res) => {
  res.json({ ok: true, group: "alloyscape", timestamp: new Date().toISOString() });
});

router.get("/alloyscape/dashboard", requireAuth, asyncHandler(async (_req, res) => {
  const stats = await alloyscapeService.getDashboardStats();
  res.json(stats);
}));

router.get("/alloyscape/modules", requireAuth, asyncHandler(async (_req, res) => {
  const modules = await alloyscapeService.listModules();
  res.json(modules);
}));

router.get("/alloyscape/modules/:moduleId", requireAuth, asyncHandler(async (req, res) => {
  const mod = await alloyscapeService.getModule(req.params.moduleId);
  if (!mod) return res.status(404).json({ error: "Module not found" });
  res.json(mod);
}));

router.post("/alloyscape/modules/:moduleId/restart", requireAuth, asyncHandler(async (req, res) => {
  const mod = await alloyscapeService.restartModule(req.params.moduleId);
  if (!mod) return res.status(404).json({ error: "Module not found" });
  res.json({ success: true, module: mod, message: `Module ${mod.name} restarted successfully` });
}));

router.patch("/alloyscape/modules/:moduleId/status", requireAuth, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const mod = await alloyscapeService.updateModuleStatus(req.params.moduleId, status);
  if (!mod) return res.status(404).json({ error: "Module not found" });
  res.json(mod);
}));

router.get("/alloyscape/workflows", requireAuth, asyncHandler(async (_req, res) => {
  const workflows = await alloyscapeService.listWorkflows();
  res.json(workflows);
}));

router.get("/alloyscape/workflows/:workflowId", requireAuth, asyncHandler(async (req, res) => {
  const wf = await alloyscapeService.getWorkflow(req.params.workflowId);
  if (!wf) return res.status(404).json({ error: "Workflow not found" });
  res.json(wf);
}));

router.post("/alloyscape/workflows/:workflowId/trigger", requireAuth, asyncHandler(async (req, res) => {
  const wf = await alloyscapeService.triggerWorkflow(req.params.workflowId);
  if (!wf) return res.status(404).json({ error: "Workflow not found" });
  res.json({ success: true, workflow: wf, message: `Workflow ${wf.name} triggered successfully` });
}));

router.patch("/alloyscape/workflows/:workflowId/status", requireAuth, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const wf = await alloyscapeService.updateWorkflowStatus(req.params.workflowId, status);
  if (!wf) return res.status(404).json({ error: "Workflow not found" });
  res.json(wf);
}));

router.get("/alloyscape/logs", requireAuth, asyncHandler(async (req, res) => {
  const { level, service, search } = req.query;
  const logs = await alloyscapeService.listLogs({
    level: level ? String(level) : undefined,
    service: service ? String(service) : undefined,
    search: search ? String(search) : undefined,
  });
  res.json(logs);
}));

router.get("/alloyscape/connectors", requireAuth, asyncHandler(async (_req, res) => {
  const connectors = await alloyscapeService.listConnectors();
  res.json(connectors);
}));

router.patch("/alloyscape/connectors/:connectorId/status", requireAuth, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const conn = await alloyscapeService.updateConnectorStatus(req.params.connectorId, status);
  if (!conn) return res.status(404).json({ error: "Connector not found" });
  res.json(conn);
}));

router.get("/alloyscape/services", requireAuth, asyncHandler(async (_req, res) => {
  const services = await alloyscapeService.listServices();
  res.json(services);
}));

export default router;
