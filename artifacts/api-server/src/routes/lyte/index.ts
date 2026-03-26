import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { AdapterOrchestrator } from "./adapters.js";
import { validateAndSanitizeBody } from "../../middleware/validate";
import { requireAuth } from "../auth";
import type { SignalFilters } from "./types.js";
import {
  getExecutiveScorecard,
  getOperatorCommandCenter,
  getServiceMap,
  getSloData,
  getSyntheticProbes,
  getReleaseIntelligence,
  getCostEfficiency,
} from "./observability.js";
import {
  getMcpClient,
  MCP_SERVER_CONFIGS,
  MCP_APP_MAPPINGS,
  getAppsForServer,
  isServerConfigured,
} from "../../lib/mcp/index.js";
import { requireRole } from "../../lib/rbac.js";

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
    version: "2.0.0",
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

router.get("/lyte/executive/scorecard", async (_req: Request, res: Response) => {
  try {
    res.json(await getExecutiveScorecard());
  } catch (err) {
    errorResponse(res, err, "EXECUTIVE_SCORECARD_ERROR");
  }
});

router.get("/lyte/operator/command-center", async (_req: Request, res: Response) => {
  try {
    res.json(await getOperatorCommandCenter());
  } catch (err) {
    errorResponse(res, err, "OPERATOR_CC_ERROR");
  }
});

router.get("/lyte/service-map", async (_req: Request, res: Response) => {
  try {
    res.json(await getServiceMap());
  } catch (err) {
    errorResponse(res, err, "SERVICE_MAP_ERROR");
  }
});

router.get("/lyte/slo", async (_req: Request, res: Response) => {
  try {
    res.json(await getSloData());
  } catch (err) {
    errorResponse(res, err, "SLO_ERROR");
  }
});

router.get("/lyte/probes", async (_req: Request, res: Response) => {
  try {
    res.json(await getSyntheticProbes());
  } catch (err) {
    errorResponse(res, err, "PROBES_ERROR");
  }
});

router.get("/lyte/releases", (_req: Request, res: Response) => {
  try {
    res.json(getReleaseIntelligence());
  } catch (err) {
    errorResponse(res, err, "RELEASES_ERROR");
  }
});

router.get("/lyte/cost-efficiency", async (_req: Request, res: Response) => {
  try {
    res.json(await getCostEfficiency());
  } catch (err) {
    errorResponse(res, err, "COST_EFFICIENCY_ERROR");
  }
});

router.get("/lyte/analytics/signal-aggregation", requireAuth, async (req: Request, res: Response) => {
  try {
    const { signals } = await orchestrator.getAllSignals();
    const byDomain: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const s of signals) {
      byDomain[s.domain] = (byDomain[s.domain] || 0) + 1;
      bySeverity[s.severity] = (bySeverity[s.severity] || 0) + 1;
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
      if (s.source) bySource[s.source] = (bySource[s.source] || 0) + 1;
    }

    const groupBy = req.query.groupBy ? String(req.query.groupBy) : undefined;
    let primaryGrouping = byDomain;
    if (groupBy === "severity") primaryGrouping = bySeverity;
    else if (groupBy === "status") primaryGrouping = byStatus;
    else if (groupBy === "source") primaryGrouping = bySource;

    res.json({
      total: signals.length,
      byDomain,
      bySeverity,
      byStatus,
      bySource,
      primaryGrouping,
      groupedBy: groupBy || "domain",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    errorResponse(res, err, "SIGNAL_AGGREGATION_ERROR");
  }
});

router.get("/lyte/analytics/health-score", requireAuth, async (_req: Request, res: Response) => {
  try {
    const { signals } = await orchestrator.getAllSignals();
    const summary = await orchestrator.getDashboardSummary();

    const total = signals.length;
    const criticalCount = signals.filter(s => s.severity === "critical").length;
    const highCount = signals.filter(s => s.severity === "high").length;
    const resolvedCount = signals.filter(s => s.status === "resolved").length;

    const criticalPenalty = criticalCount * 15;
    const highPenalty = highCount * 8;
    const resolutionBonus = total > 0 ? (resolvedCount / total) * 20 : 20;

    const score = Math.round(Math.max(0, Math.min(100, 100 - criticalPenalty - highPenalty + resolutionBonus)));

    const components = {
      signalHealth: {
        score: Math.round(Math.max(0, 100 - criticalPenalty - highPenalty)),
        detail: `${criticalCount} critical, ${highCount} high severity signals`,
      },
      resolutionRate: {
        score: total > 0 ? Math.round((resolvedCount / total) * 100) : 100,
        detail: `${resolvedCount}/${total} signals resolved`,
      },
      overallConfidence: {
        score: summary?.healthScore ?? 0,
        detail: "Dashboard confidence score",
      },
    };

    res.json({
      score,
      status: score >= 80 ? "healthy" : score >= 60 ? "degraded" : "critical",
      components,
      signalBreakdown: { total, critical: criticalCount, high: highCount, resolved: resolvedCount },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    errorResponse(res, err, "HEALTH_SCORE_ERROR");
  }
});

router.get("/lyte/analytics/trend-comparison", requireAuth, async (req: Request, res: Response) => {
  try {
    const { signals } = await orchestrator.getAllSignals();

    const now = Date.now();
    const windowHoursRaw = req.query.windowHours ? parseInt(String(req.query.windowHours)) : 24;
    const windowHours = Math.min(Math.max(1, Number.isFinite(windowHoursRaw) ? windowHoursRaw : 24), 168);
    const intervalMs = 3600000;

    const severityTrend: Array<{ timestamp: string; critical: number; high: number; medium: number; low: number }> = [];
    const domainTrend: Record<string, Array<{ timestamp: string; count: number }>> = {};

    const domains = [...new Set(signals.map(s => s.domain))];
    for (const domain of domains) {
      domainTrend[domain] = [];
    }

    for (let i = windowHours - 1; i >= 0; i--) {
      const bucketStart = now - (i + 1) * intervalMs;
      const bucketEnd = now - i * intervalMs;
      const ts = new Date(bucketEnd).toISOString();

      const bucketSignals = signals.filter(s => {
        const signalTime = new Date(s.timestamp).getTime();
        return signalTime >= bucketStart && signalTime < bucketEnd;
      });

      severityTrend.push({
        timestamp: ts,
        critical: bucketSignals.filter(s => s.severity === "critical").length,
        high: bucketSignals.filter(s => s.severity === "high").length,
        medium: bucketSignals.filter(s => s.severity === "medium").length,
        low: bucketSignals.filter(s => s.severity === "low").length,
      });

      for (const domain of domains) {
        domainTrend[domain].push({
          timestamp: ts,
          count: bucketSignals.filter(s => s.domain === domain).length,
        });
      }
    }

    res.json({
      windowHours,
      severityTrend,
      domainTrend,
      currentSnapshot: {
        total: signals.length,
        bySeverity: {
          critical: signals.filter(s => s.severity === "critical").length,
          high: signals.filter(s => s.severity === "high").length,
          medium: signals.filter(s => s.severity === "medium").length,
          low: signals.filter(s => s.severity === "low").length,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    errorResponse(res, err, "TREND_COMPARISON_ERROR");
  }
});

router.get("/lyte/export/signals", requireAuth, async (req: Request, res: Response) => {
  try {
    const { signals } = await orchestrator.getAllSignals();
    const format = req.query.format === "csv" ? "csv" : "json";

    if (format === "csv") {
      const headers = "id,title,domain,severity,status,source,timestamp";
      const rows = signals.map(s =>
        `"${s.id}","${(s.title || '').replace(/"/g, '""')}","${s.domain}","${s.severity}","${s.status}","${s.source || ''}","${s.timestamp || ''}"`
      );
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="lyte_signals.csv"');
      res.send([headers, ...rows].join("\n"));
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", 'attachment; filename="lyte_signals.json"');
      res.send(JSON.stringify(signals, null, 2));
    }
  } catch (err) {
    errorResponse(res, err, "EXPORT_ERROR");
  }
});

router.get("/lyte/mcp/dashboard", requireAuth, requireRole("operator"), (_req: Request, res: Response) => {
  try {
    const client = getMcpClient();

    const servers = MCP_SERVER_CONFIGS.map((config) => {
      const instance = client.getServerInstance(config.id);
      const configured = isServerConfigured(config);
      const apps = getAppsForServer(config.id);

      return {
        id: config.id,
        name: config.name,
        description: config.description,
        transport: config.transport,
        enabled: config.enabled,
        configured,
        missingEnvVars: configured
          ? []
          : (config.requiredEnvVars || []).filter((v) => !process.env[v]),
        status: instance?.status || (configured ? "disconnected" : "unconfigured"),
        toolCount: instance?.tools.length || 0,
        tools: (instance?.tools || []).map((t) => ({
          name: t.name,
          description: t.description,
        })),
        connectedAt: instance?.connectedAt || null,
        lastHealthCheck: instance?.lastHealthCheck || null,
        error: instance?.error || null,
        apps,
      };
    });

    const summary = {
      totalServers: servers.length,
      connected: servers.filter((s) => s.status === "connected").length,
      configured: servers.filter((s) => s.configured).length,
      unconfigured: servers.filter((s) => !s.configured).length,
      errors: servers.filter((s) => s.status === "error").length,
      totalTools: servers.reduce((sum, s) => sum + s.toolCount, 0),
    };

    const appMappings = MCP_APP_MAPPINGS.map((m) => {
      const serverConfig = MCP_SERVER_CONFIGS.find((s) => s.id === m.serverId);
      const instance = client.getServerInstance(m.serverId);
      return {
        serverId: m.serverId,
        serverName: serverConfig?.name || m.serverId,
        apps: m.apps,
        status: instance?.status || "disconnected",
        toolCount: instance?.tools.length || 0,
      };
    });

    res.json({
      servers,
      summary,
      appMappings,
      timestamp: new Date().toISOString(),
      mode: process.env.LYTE_MODE === "live" ? "live" : "demo",
    });
  } catch (err) {
    errorResponse(res, err, "MCP_DASHBOARD_ERROR")
  }
});

export default router;
