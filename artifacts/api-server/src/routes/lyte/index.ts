import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { AdapterOrchestrator } from "./adapters.js";
import { validateAndSanitizeBody } from "../../middleware/validate";
import type { SignalFilters } from "./types.js";

const analyzeSchema = z.object({
  context: z.string().max(5000).optional(),
  signalIds: z.array(z.string()).optional(),
});

const router = Router();
const orchestrator = new AdapterOrchestrator();

interface ApiErrorResponse {
  error: string;
  code: string;
  timestamp: string;
}

function errorResponse(res: Response, err: unknown, code = "INTERNAL_ERROR", status = 500): void {
  const message = err instanceof Error ? err.message : "An unexpected error occurred";
  const body: ApiErrorResponse = { error: message, code, timestamp: new Date().toISOString() };
  res.status(status).json(body);
}

router.get("/lyte/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "Lyte Command Center",
    mode: process.env.LYTE_MODE === "live" ? "live" : "demo",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

router.get("/lyte/signals", async (req: Request, res: Response) => {
  try {
    const filters: SignalFilters = {};
    if (req.query.domain) filters.domain = String(req.query.domain);
    if (req.query.severity) filters.severity = String(req.query.severity);
    if (req.query.freshness) filters.freshness = String(req.query.freshness);
    if (req.query.status) filters.status = String(req.query.status);
    if (req.query.source) filters.source = String(req.query.source);
    if (req.query.owner) filters.owner = String(req.query.owner);

    const result = await orchestrator.getAllSignals(filters);
    res.json(result);
  } catch (err) {
    errorResponse(res, err, "SIGNALS_FETCH_ERROR");
  }
});

router.get("/lyte/dashboard/summary", async (_req: Request, res: Response) => {
  try {
    const summary = await orchestrator.getDashboardSummary();
    res.json(summary);
  } catch (err) {
    errorResponse(res, err, "DASHBOARD_FETCH_ERROR");
  }
});

router.get("/lyte/actions/recommendations", (_req: Request, res: Response) => {
  try {
    res.json(orchestrator.getRecommendations());
  } catch (err) {
    errorResponse(res, err, "RECOMMENDATIONS_FETCH_ERROR");
  }
});

router.get("/lyte/integrations/status", (_req: Request, res: Response) => {
  try {
    res.json(orchestrator.getIntegrations());
  } catch (err) {
    errorResponse(res, err, "INTEGRATIONS_FETCH_ERROR");
  }
});

router.get("/lyte/impact/summary", (_req: Request, res: Response) => {
  try {
    res.json(orchestrator.getImpactMetrics());
  } catch (err) {
    errorResponse(res, err, "IMPACT_FETCH_ERROR");
  }
});

router.post("/lyte/ai/analyze", validateAndSanitizeBody(analyzeSchema), async (req: Request, res: Response) => {
  try {
    const { context, signalIds } = req.body || {};
    const { signals } = await orchestrator.getAllSignals();
    const selectedSignals = signalIds && Array.isArray(signalIds)
      ? signals.filter(s => signalIds.includes(s.id))
      : signals;

    if (selectedSignals.length === 0) {
      res.status(400).json({ error: "No matching signals found for the provided IDs", code: "NO_SIGNALS", timestamp: new Date().toISOString() });
      return;
    }

    const analysis = await orchestrator.analyzeWithAi(selectedSignals, context);
    res.json(analysis);
  } catch (err) {
    errorResponse(res, err, "AI_ANALYSIS_ERROR");
  }
});

export default router;
