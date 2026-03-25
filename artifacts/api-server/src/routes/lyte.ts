import { Router, type Request, type Response } from "express";

const router = Router();

type Severity = "critical" | "high" | "medium" | "low" | "info";
type SignalDomain = "operations" | "logistics" | "security" | "performance" | "deployment" | "integration";
type SignalStatus = "active" | "acknowledged" | "resolved" | "muted";

interface Signal {
  id: string;
  title: string;
  description: string;
  domain: SignalDomain;
  source: string;
  severity: Severity;
  status: SignalStatus;
  confidence: number;
  freshness: "live" | "recent" | "stale";
  businessImpact: string;
  recommendedAction: string;
  owner: string;
  timestamp: string;
}

interface Recommendation {
  id: string;
  title: string;
  reasoning: string;
  projectedImpact: string;
  priority: number;
  actionType: "automate" | "escalate" | "investigate" | "schedule" | "deploy";
  suggestedActions: string[];
  relatedSignals: string[];
  owner: string;
}

interface IntegrationStatus {
  id: string;
  name: string;
  adapter: string;
  status: "connected" | "degraded" | "disconnected";
  mode: "live" | "demo";
  lastSync: string;
  freshness: "fresh" | "stale" | "expired";
  details: string;
}

interface ImpactMetric {
  id: string;
  title: string;
  category: "cost" | "risk" | "efficiency" | "revenue";
  value: string;
  trend: "up" | "down" | "stable";
  narrative: string;
  relatedProjects: string[];
}

const signals: Signal[] = [
  { id: "sig-001", title: "Firestorm response time exceeds 200ms SLA threshold", description: "Average response time has been above 200ms for 3 consecutive intervals. Backend API latency is the primary contributor.", domain: "performance", source: "Telemetry Adapter", severity: "high", status: "active", confidence: 94, freshness: "live", businessImpact: "Degraded user experience affecting ~2,400 daily active sessions", recommendedAction: "Investigate backend query optimization; consider caching layer", owner: "Backend Team", timestamp: "2026-03-25T14:23:00Z" },
  { id: "sig-002", title: "PSEM project has no assigned development team", description: "PSEM remains in not-started status with critical blockers: no team assigned, requirements incomplete.", domain: "operations", source: "Project Status Adapter", severity: "critical", status: "active", confidence: 100, freshness: "live", businessImpact: "Portfolio gap in security posture; $180K projected revenue at risk if Q3 deadline missed", recommendedAction: "Escalate to leadership; assign team and complete requirements spec", owner: "Management", timestamp: "2026-03-25T08:00:00Z" },
  { id: "sig-003", title: "Lutar TLS certificate expiring in 34 days", description: "TLS certificate for szlholdings.com/lutar expires on 2026-04-28. Auto-renewal is not configured.", domain: "security", source: "Security Feed Adapter", severity: "medium", status: "active", confidence: 100, freshness: "live", businessImpact: "Service interruption risk for Lutar command platform", recommendedAction: "Schedule TLS certificate renewal; configure auto-renewal", owner: "Infrastructure", timestamp: "2026-03-25T06:00:00Z" },
  { id: "sig-004", title: "DreamEra neural synthesis model accuracy below 90% target", description: "Current model accuracy at 84.2%, below the 90% production threshold. Affecting artifact generation quality.", domain: "operations", source: "Internal API Adapter", severity: "high", status: "active", confidence: 88, freshness: "recent", businessImpact: "User satisfaction scores down 12% on generated artifacts", recommendedAction: "Retrain model with expanded dataset; A/B test improved pipeline", owner: "ML Team", timestamp: "2026-03-25T10:15:00Z" },
  { id: "sig-005", title: "AIS data feed intermittent delays for Vessels platform", description: "AIS maritime data feed experiencing 15-30 second delays in 8% of requests. Upstream provider acknowledges issue.", domain: "logistics", source: "Logistics Adapter", severity: "medium", status: "acknowledged", confidence: 82, freshness: "recent", businessImpact: "Fleet position accuracy degraded; compliance reporting may lag", recommendedAction: "Implement local caching buffer; open support ticket with AIS provider", owner: "Data Eng", timestamp: "2026-03-25T11:30:00Z" },
  { id: "sig-006", title: "Dreamscape AI generation pipeline latency >5s", description: "Generation pipeline averaging 6.2s per request, exceeding the 5s target. GPU queue saturation suspected.", domain: "performance", source: "Telemetry Adapter", severity: "high", status: "active", confidence: 91, freshness: "live", businessImpact: "User drop-off rate increased 18% on generation flows", recommendedAction: "Scale GPU allocation; optimize batch processing pipeline", owner: "ML Team", timestamp: "2026-03-25T13:45:00Z" },
  { id: "sig-007", title: "Zeus chaos engineering tests 78% complete", description: "Chaos engineering test suite coverage at 78%. Remaining tests: network partition, cascade failure, and data corruption scenarios.", domain: "deployment", source: "Project Status Adapter", severity: "low", status: "active", confidence: 95, freshness: "recent", businessImpact: "Resilience validation incomplete; risk gap for infrastructure layer", recommendedAction: "Complete remaining 3 chaos scenarios by end of sprint", owner: "Stephen L.", timestamp: "2026-03-25T09:00:00Z" },
  { id: "sig-008", title: "Stripe integration webhook verification passing", description: "All Stripe webhook signature verifications passing. Payment flow health nominal across Carlota Jo consultation bookings.", domain: "integration", source: "Integration Adapter", severity: "info", status: "resolved", confidence: 100, freshness: "live", businessImpact: "Revenue pipeline healthy — $12.4K processed this week", recommendedAction: "No action required; continue monitoring", owner: "Stephen L.", timestamp: "2026-03-25T14:00:00Z" },
  { id: "sig-009", title: "Aegis compliance module API rate limiting detected", description: "Compliance module hitting external API rate limits during bulk scans. 3 of 12 scan batches throttled in last cycle.", domain: "security", source: "Security Feed Adapter", severity: "medium", status: "active", confidence: 87, freshness: "recent", businessImpact: "Compliance scan coverage reduced to 75% of targets", recommendedAction: "Implement request queuing with exponential backoff", owner: "DevOps", timestamp: "2026-03-25T12:20:00Z" },
  { id: "sig-010", title: "ROSIE load testing in progress — 96% readiness", description: "Load testing underway for ROSIE. Current results show stable performance up to 10K concurrent connections.", domain: "deployment", source: "Telemetry Adapter", severity: "info", status: "active", confidence: 96, freshness: "live", businessImpact: "Production readiness validation on track", recommendedAction: "Continue testing; target 15K concurrent for final sign-off", owner: "Stephen L.", timestamp: "2026-03-25T14:10:00Z" },
  { id: "sig-011", title: "AlloyScape workflow templates 60% complete", description: "Workflow template library at 12 of 20 planned templates. Remaining templates: CI/CD, data pipeline, ML ops categories.", domain: "operations", source: "Project Status Adapter", severity: "low", status: "active", confidence: 90, freshness: "recent", businessImpact: "Reduced automation coverage; manual workflows costing ~8 hrs/week", recommendedAction: "Prioritize CI/CD and data pipeline templates", owner: "Stephen L.", timestamp: "2026-03-25T08:30:00Z" },
  { id: "sig-012", title: "Database connection pool utilization at 62%", description: "PostgreSQL connection pool at 62% utilization. Normal operating range. No action needed.", domain: "performance", source: "Telemetry Adapter", severity: "info", status: "resolved", confidence: 98, freshness: "live", businessImpact: "System operating within normal parameters", recommendedAction: "Continue monitoring; alert threshold set at 85%", owner: "Infrastructure", timestamp: "2026-03-25T14:25:00Z" },
];

const recommendations: Recommendation[] = [
  { id: "rec-001", title: "Assign development team to PSEM immediately", reasoning: "PSEM is the only portfolio project with no assigned team. Critical blockers are accumulating. Q3 launch deadline at risk with $180K projected revenue impact.", projectedImpact: "Unblocks $180K revenue opportunity; closes portfolio security gap", priority: 1, actionType: "escalate", suggestedActions: ["Assign 2-person team from available pool", "Complete requirements specification within 2 weeks", "Configure DNS and TLS infrastructure"], relatedSignals: ["sig-002"], owner: "Management" },
  { id: "rec-002", title: "Optimize Firestorm API response times", reasoning: "Response times consistently above 200ms SLA. Root cause analysis points to unoptimized database queries in the simulation engine. Caching layer would reduce p95 latency by estimated 40%.", projectedImpact: "Restore SLA compliance; improve user experience for 2,400 daily sessions", priority: 2, actionType: "investigate", suggestedActions: ["Profile top 5 slowest API endpoints", "Implement Redis caching for simulation state", "Add query optimization for scenario builder"], relatedSignals: ["sig-001"], owner: "Backend Team" },
  { id: "rec-003", title: "Scale Dreamscape GPU allocation", reasoning: "AI generation pipeline latency at 6.2s vs 5s target. User drop-off increased 18%. GPU queue saturation is the bottleneck — not model efficiency.", projectedImpact: "Reduce generation time to <4s; recover 18% user drop-off", priority: 3, actionType: "deploy", suggestedActions: ["Request GPU quota increase from cloud provider", "Implement request batching for parallel generation", "Deploy model quantization for faster inference"], relatedSignals: ["sig-006"], owner: "ML Team" },
  { id: "rec-004", title: "Renew Lutar TLS certificate and enable auto-renewal", reasoning: "Certificate expires in 34 days. Manual renewal is a known operational risk. Auto-renewal would eliminate this class of incident permanently.", projectedImpact: "Eliminate recurring TLS expiration risk across portfolio", priority: 4, actionType: "schedule", suggestedActions: ["Renew Lutar TLS certificate", "Configure cert-manager for auto-renewal", "Audit all portfolio certificates for auto-renewal status"], relatedSignals: ["sig-003"], owner: "Infrastructure" },
  { id: "rec-005", title: "Retrain DreamEra neural synthesis model", reasoning: "Model accuracy at 84.2% vs 90% target. User satisfaction correlated. Expanded training dataset available from recent artifact curation efforts.", projectedImpact: "Achieve >90% accuracy; recover 12% user satisfaction decline", priority: 5, actionType: "automate", suggestedActions: ["Prepare expanded training dataset (est. 2x current)", "Run A/B test with improved model", "Set up automated retraining pipeline for monthly refresh"], relatedSignals: ["sig-004"], owner: "ML Team" },
];

const integrations: IntegrationStatus[] = [
  { id: "int-001", name: "Telemetry Engine", adapter: "TelemetryAdapter", status: "connected", mode: "demo", lastSync: "2 min ago", freshness: "fresh", details: "Aggregating performance metrics across 16 services" },
  { id: "int-002", name: "Security Feed", adapter: "SecurityFeedAdapter", status: "connected", mode: "demo", lastSync: "5 min ago", freshness: "fresh", details: "Monitoring TLS, DNS, vulnerability scans, compliance status" },
  { id: "int-003", name: "Logistics Hub", adapter: "LogisticsAdapter", status: "degraded", mode: "demo", lastSync: "18 min ago", freshness: "stale", details: "AIS data feed experiencing intermittent delays" },
  { id: "int-004", name: "Project Status", adapter: "ProjectStatusAdapter", status: "connected", mode: "demo", lastSync: "1 min ago", freshness: "fresh", details: "Tracking readiness, milestones, blockers for 16 projects" },
  { id: "int-005", name: "Internal API", adapter: "InternalApiAdapter", status: "connected", mode: "demo", lastSync: "3 min ago", freshness: "fresh", details: "Health checks and metrics from api-server endpoints" },
  { id: "int-006", name: "AI Insight Engine", adapter: "AiInsightAdapter", status: "disconnected", mode: "demo", lastSync: "—", freshness: "expired", details: "No AI provider configured — using deterministic demo responses" },
];

const impactMetrics: ImpactMetric[] = [
  { id: "imp-001", title: "Portfolio Operational Savings", category: "efficiency", value: "$42K/mo", trend: "up", narrative: "Automation across AlloyScape workflows and Zeus orchestration saves an estimated 520 engineering hours monthly, translating to $42K in operational efficiency.", relatedProjects: ["AlloyScape", "Zeus"] },
  { id: "imp-002", title: "Revenue at Risk — PSEM Delay", category: "risk", value: "$180K", trend: "stable", narrative: "PSEM project delay threatens $180K in projected Q3 security consulting revenue. No team assigned; requirements incomplete.", relatedProjects: ["PSEM"] },
  { id: "imp-003", title: "Infrastructure Cost Optimization", category: "cost", value: "-15%", trend: "down", narrative: "Zeus auto-scaling and Nimbus predictive resource allocation reduced infrastructure costs by 15% this quarter compared to fixed provisioning.", relatedProjects: ["Zeus", "Nimbus"] },
  { id: "imp-004", title: "Consulting Pipeline Revenue", category: "revenue", value: "$84K", trend: "up", narrative: "Carlota Jo consulting platform generated $84K in bookings this quarter. Stripe integration processing $12.4K/week with 100% webhook verification.", relatedProjects: ["Carlota Jo"] },
  { id: "imp-005", title: "User Experience Impact — Latency", category: "risk", value: "18% drop-off", trend: "up", narrative: "Dreamscape and Firestorm latency issues causing measurable user drop-off. Combined impact estimated at 4,200 affected sessions daily.", relatedProjects: ["Dreamscape", "Firestorm"] },
  { id: "imp-006", title: "Security Posture Score", category: "efficiency", value: "91/100", trend: "stable", narrative: "Portfolio-wide security score at 91/100. ROSIE threat engine, Aegis vulnerability scanning, and Firestorm simulation all contributing. Gap: PSEM not yet started.", relatedProjects: ["ROSIE", "Aegis", "Firestorm"] },
];

router.get("/lyte/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: "Lyte Command Center",
    mode: "demo",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

router.get("/lyte/signals", (req: Request, res: Response) => {
  let filtered = [...signals];
  const { domain, severity, freshness, status } = req.query;
  if (domain) filtered = filtered.filter(s => s.domain === domain);
  if (severity) filtered = filtered.filter(s => s.severity === severity);
  if (freshness) filtered = filtered.filter(s => s.freshness === freshness);
  if (status) filtered = filtered.filter(s => s.status === status);
  res.json({ signals: filtered, total: filtered.length, mode: "demo" });
});

router.get("/lyte/dashboard/summary", (_req: Request, res: Response) => {
  const activeSignals = signals.filter(s => s.status === "active");
  const criticalCount = activeSignals.filter(s => s.severity === "critical").length;
  const highCount = activeSignals.filter(s => s.severity === "high").length;
  res.json({
    healthScore: 87,
    totalProjects: 16,
    deployedProjects: 14,
    avgReadiness: 83,
    criticalSignals: criticalCount,
    highSignals: highCount,
    activeSignals: activeSignals.length,
    deploymentCoverage: 88,
    dnsTlsCompletion: 94,
    attentionQueue: activeSignals
      .filter(s => s.severity === "critical" || s.severity === "high")
      .sort((a, b) => {
        const sev = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        return sev[a.severity] - sev[b.severity];
      }),
    mode: "demo",
    timestamp: new Date().toISOString(),
  });
});

router.get("/lyte/actions/recommendations", (_req: Request, res: Response) => {
  res.json({ recommendations, total: recommendations.length, mode: "demo" });
});

router.get("/lyte/integrations/status", (_req: Request, res: Response) => {
  res.json({ integrations, total: integrations.length, mode: "demo" });
});

router.get("/lyte/impact/summary", (_req: Request, res: Response) => {
  res.json({ metrics: impactMetrics, total: impactMetrics.length, mode: "demo" });
});

router.post("/lyte/ai/analyze", (req: Request, res: Response) => {
  const { context } = req.body || {};
  res.json({
    mode: "demo",
    analysis: "Based on the current portfolio state, the highest-priority actions are: (1) Assign a development team to PSEM to unblock $180K in Q3 revenue, (2) Optimize Firestorm backend APIs to restore SLA compliance, and (3) Scale Dreamscape GPU allocation to reduce user drop-off. The portfolio health score of 87/100 is strong but trending slightly down due to accumulated blockers in 3 projects.",
    suggestedActions: [
      "Escalate PSEM staffing to leadership meeting",
      "Deploy Redis caching layer for Firestorm simulation engine",
      "Submit GPU quota increase request for Dreamscape",
    ],
    confidence: 85,
    timestamp: new Date().toISOString(),
  });
});

export default router;
