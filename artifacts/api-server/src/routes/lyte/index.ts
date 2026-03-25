import { Router, type Request, type Response } from "express";
import { AdapterOrchestrator } from "./adapters.js";
import type { SignalFilters } from "./types.js";

const router = Router();
const orchestrator = new AdapterOrchestrator();

router.get("/lyte/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "Lyte Command Center",
    mode: process.env.LYTE_MODE === "live" ? "live" : "demo",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

router.get("/lyte/signals", (req: Request, res: Response) => {
  const filters: SignalFilters = {};
  if (req.query.domain) filters.domain = String(req.query.domain);
  if (req.query.severity) filters.severity = String(req.query.severity);
  if (req.query.freshness) filters.freshness = String(req.query.freshness);
  if (req.query.status) filters.status = String(req.query.status);
  if (req.query.source) filters.source = String(req.query.source);
  if (req.query.owner) filters.owner = String(req.query.owner);

  const result = orchestrator.getAllSignals(filters);
  res.json(result);
});

router.get("/lyte/dashboard/summary", (_req: Request, res: Response) => {
  res.json(orchestrator.getDashboardSummary());
});

router.get("/lyte/actions/recommendations", (_req: Request, res: Response) => {
  res.json(orchestrator.getRecommendations());
});

router.get("/lyte/integrations/status", (_req: Request, res: Response) => {
  res.json(orchestrator.getIntegrations());
});

router.get("/lyte/impact/summary", (_req: Request, res: Response) => {
  res.json(orchestrator.getImpactMetrics());
});

router.post("/lyte/ai/analyze", (req: Request, res: Response) => {
  const { context } = req.body || {};
  res.json(orchestrator.analyzeWithAi(context));
});

export default router;
