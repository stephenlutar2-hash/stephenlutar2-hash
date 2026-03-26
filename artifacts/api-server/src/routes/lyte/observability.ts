import { db, isDatabaseAvailable } from "@szl-holdings/db";
import {
  lyteServicesTable,
  lyteSloTargetsTable,
  lyteCostItemsTable,
  lyteProbesTable,
  lyteAlertsTable,
} from "@szl-holdings/db/schema";
import type {
  ExecutiveScorecard,
  OperatorCommandCenterData,
  ServiceMapData,
  SloData,
  SyntheticProbeData,
  ReleaseIntelligenceData,
  CostEfficiencyData,
} from "./types.js";

async function getServicesFromDb() {
  if (!isDatabaseAvailable()) return null;
  try {
    const rows = await db.select().from(lyteServicesTable);
    return rows.length > 0 ? rows : null;
  } catch { return null; }
}

async function getSlosFromDb() {
  if (!isDatabaseAvailable()) return null;
  try {
    const rows = await db.select().from(lyteSloTargetsTable);
    return rows.length > 0 ? rows : null;
  } catch { return null; }
}

async function getCostItemsFromDb() {
  if (!isDatabaseAvailable()) return null;
  try {
    const rows = await db.select().from(lyteCostItemsTable);
    return rows.length > 0 ? rows : null;
  } catch { return null; }
}

async function getProbesFromDb() {
  if (!isDatabaseAvailable()) return null;
  try {
    const rows = await db.select().from(lyteProbesTable);
    return rows.length > 0 ? rows : null;
  } catch { return null; }
}

async function getAlertsFromDb() {
  if (!isDatabaseAvailable()) return null;
  try {
    const rows = await db.select().from(lyteAlertsTable);
    return rows.length > 0 ? rows : null;
  } catch { return null; }
}

export async function getExecutiveScorecard(): Promise<ExecutiveScorecard> {
  const [slos, alerts] = await Promise.all([getSlosFromDb(), getAlertsFromDb()]);

  if (slos && slos.length > 0) {
    const healthyCount = slos.filter(s => s.status === "healthy").length;
    const totalSlos = slos.length;
    const breachedSlos = slos.filter(s => s.status === "breached");
    const warningSlos = slos.filter(s => s.status === "warning");
    const activeAlerts = alerts ? alerts.filter(a => a.status !== "resolved") : [];
    const overallConfidence = Math.round(100 - (breachedSlos.length * 8) - (warningSlos.length * 3) - (activeAlerts.length * 2));

    return {
      overallConfidence: Math.max(0, Math.min(100, overallConfidence)),
      revenueAtRisk: breachedSlos.length > 0 ? `$${breachedSlos.length * 16}K/quarter` : "$0",
      pipelineExposure: warningSlos.length > 0 ? `${warningSlos.length} connectors degraded` : "All healthy",
      deploymentRisk: activeAlerts.length > 0 ? `${activeAlerts.length} active incident(s)` : "No blockers",
      connectorHealth: `${healthyCount}/${totalSlos} healthy`,
      customerImpact: breachedSlos.length > 0 ? `${breachedSlos.length * 2100} sessions/day affected` : "Nominal",
      slaHealth: `${healthyCount}/${totalSlos} within target`,
      metrics: [
        { id: "es-001", label: "Revenue at Risk", value: breachedSlos.length > 0 ? `$${breachedSlos.length * 16}K/qtr` : "$0", trend: breachedSlos.length > 0 ? "up" : "stable", severity: breachedSlos.length > 0 ? "warning" : "healthy", detail: breachedSlos.length > 0 ? `${breachedSlos.map(s => s.service).join(" + ")} latency causing user drop-off.` : "No revenue at risk." },
        { id: "es-002", label: "Pipeline Exposure", value: warningSlos.length > 0 ? `${warningSlos.length} degraded` : "All healthy", trend: "stable", severity: warningSlos.length > 0 ? "warning" : "healthy", detail: warningSlos.length > 0 ? `${warningSlos.map(s => s.service).join(", ")} operating in degraded mode.` : "All pipelines nominal." },
        { id: "es-003", label: "Deployment Risk", value: activeAlerts.length > 0 ? `${activeAlerts.length} active` : "Low", trend: activeAlerts.length > 0 ? "up" : "down", severity: activeAlerts.length > 0 ? "warning" : "healthy", detail: activeAlerts.length > 0 ? `${activeAlerts.length} active incident(s). ${activeAlerts.map(a => a.title).join("; ")}` : "All services stable in production." },
        { id: "es-004", label: "Connector Health", value: `${Math.round((healthyCount / totalSlos) * 100)}%`, trend: "stable", severity: healthyCount / totalSlos >= 0.8 ? "healthy" : "warning", detail: `${healthyCount} of ${totalSlos} SLO targets within budget.` },
        { id: "es-005", label: "Customer Impact", value: breachedSlos.length > 0 ? `${breachedSlos.length * 2.1}K sessions` : "Nominal", trend: breachedSlos.length > 0 ? "up" : "stable", severity: breachedSlos.length > 0 ? "critical" : "healthy", detail: breachedSlos.length > 0 ? `Combined latency issues affecting ${breachedSlos.length * 2100} daily sessions.` : "No customer impact detected." },
        { id: "es-006", label: "SLA/SLO Health", value: `${Math.round((healthyCount / totalSlos) * 100)}%`, trend: "stable", severity: healthyCount / totalSlos >= 0.85 ? "healthy" : "warning", detail: `${healthyCount} of ${totalSlos} SLO targets within budget.` },
        { id: "es-007", label: "Operational Savings", value: "$42K/mo", trend: "up", severity: "healthy", detail: "Automation across AlloyScape and Zeus saves 520 engineering hours monthly." },
        { id: "es-008", label: "Security Posture", value: "94/100", trend: "up", severity: "healthy", detail: "Portfolio-wide security score strong. TLS certificate renewal for Lutar due in 34 days." },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  return {
    overallConfidence: 82,
    revenueAtRisk: "$32K/quarter",
    pipelineExposure: "2 connectors degraded",
    deploymentRisk: "1 staging blocker",
    connectorHealth: "5/6 healthy",
    customerImpact: "4,200 sessions/day affected",
    slaHealth: "14/16 within target",
    metrics: [
      { id: "es-001", label: "Revenue at Risk", value: "$32K/qtr", trend: "up", severity: "warning", detail: "Firestorm + Dreamscape latency causing user drop-off. Estimated revenue impact from degraded conversion rates." },
      { id: "es-002", label: "Pipeline Exposure", value: "2 degraded", trend: "stable", severity: "warning", detail: "Logistics Hub (AIS feed delays) and AI Insight Engine (no API key) are operating in degraded/demo mode." },
      { id: "es-003", label: "Deployment Risk", value: "Low", trend: "down", severity: "healthy", detail: "Firestorm in staging with 2 blockers. All other services stable in production. No recent failed deploys." },
      { id: "es-004", label: "Connector Health", value: "83%", trend: "stable", severity: "healthy", detail: "5 of 6 adapters connected and syncing. Logistics Hub experiencing intermittent AIS data delays." },
      { id: "es-005", label: "Customer Impact", value: "4.2K sessions", trend: "up", severity: "critical", detail: "Combined latency issues affecting 4,200 daily sessions. User drop-off increased 18% on generation flows." },
      { id: "es-006", label: "SLA/SLO Health", value: "87.5%", trend: "stable", severity: "warning", detail: "14 of 16 SLO targets within budget. Firestorm latency and Dreamscape generation time exceeding targets." },
      { id: "es-007", label: "Operational Savings", value: "$42K/mo", trend: "up", severity: "healthy", detail: "Automation across AlloyScape and Zeus saves 520 engineering hours monthly." },
      { id: "es-008", label: "Security Posture", value: "94/100", trend: "up", severity: "healthy", detail: "Portfolio-wide security score strong. TLS certificate renewal for Lutar due in 34 days." },
    ],
    timestamp: new Date().toISOString(),
  };
}

export async function getOperatorCommandCenter(): Promise<OperatorCommandCenterData> {
  const alerts = await getAlertsFromDb();

  const incidents = alerts && alerts.length > 0
    ? alerts.map(a => ({
        id: a.alertId,
        title: a.title,
        severity: a.severity as "critical" | "high" | "medium" | "low" | "info",
        status: a.status as "active" | "investigating" | "mitigated" | "resolved",
        startedAt: a.startedAt,
        duration: a.duration,
        affectedServices: a.affectedServices,
        assignee: a.assignee,
        updates: a.updates,
      }))
    : [
        { id: "inc-001", title: "Firestorm API latency exceeds SLA", severity: "high" as const, status: "investigating" as const, startedAt: "2026-03-25T14:00:00Z", duration: "2h 30m", affectedServices: ["Firestorm", "API Server"], assignee: "Backend Team", updates: ["14:00 — Latency spike detected", "14:15 — Investigating backend query performance", "14:45 — Root cause identified: unoptimized DB queries"] },
        { id: "inc-002", title: "AIS data feed intermittent delays", severity: "medium" as const, status: "active" as const, startedAt: "2026-03-25T11:00:00Z", duration: "5h 30m", affectedServices: ["Vessels", "Logistics Hub"], assignee: "Data Eng", updates: ["11:00 — 8% of AIS requests showing 15-30s delays", "11:30 — Upstream provider acknowledged issue", "13:00 — Implementing local caching buffer"] },
        { id: "inc-003", title: "Dreamscape GPU queue saturation", severity: "high" as const, status: "mitigated" as const, startedAt: "2026-03-25T13:00:00Z", duration: "3h 30m", affectedServices: ["Dreamscape", "DreamEra"], assignee: "ML Team", updates: ["13:00 — Generation pipeline >5s per request", "13:30 — GPU queue saturation confirmed", "14:00 — Batch processing optimization deployed", "15:30 — Latency reduced to 4.8s, monitoring"] },
      ];

  return {
    incidents,
    deployments: [
      { id: "dep-001", app: "ROSIE", version: "2.4.1", commitHash: "a1b2c3d", timestamp: "2026-03-25T12:00:00Z", status: "success", deployer: "Stephen L." },
      { id: "dep-002", app: "Zeus", version: "1.8.0", commitHash: "e4f5g6h", timestamp: "2026-03-25T10:00:00Z", status: "success", deployer: "Stephen L." },
      { id: "dep-003", app: "Beacon", version: "3.1.2", commitHash: "i7j8k9l", timestamp: "2026-03-25T08:00:00Z", status: "success", deployer: "Stephen L." },
      { id: "dep-004", app: "Firestorm", version: "0.9.3-rc1", commitHash: "m0n1o2p", timestamp: "2026-03-24T16:00:00Z", status: "in-progress", deployer: "Stephen L." },
    ],
    jobs: [
      { id: "job-001", name: "Security Scan — Full Portfolio", status: "running", lastRun: "2026-03-25T06:00:00Z", duration: "45m", nextRun: "2026-03-26T06:00:00Z" },
      { id: "job-002", name: "AIS Data Sync", status: "completed", lastRun: "2026-03-25T14:00:00Z", duration: "12m", nextRun: "2026-03-25T14:30:00Z" },
      { id: "job-003", name: "ML Model Health Check", status: "completed", lastRun: "2026-03-25T13:00:00Z", duration: "8m", nextRun: "2026-03-25T19:00:00Z" },
      { id: "job-004", name: "Telemetry Aggregation", status: "scheduled", lastRun: "2026-03-25T14:15:00Z", duration: "3m", nextRun: "2026-03-25T14:45:00Z" },
      { id: "job-005", name: "Certificate Expiry Monitor", status: "completed", lastRun: "2026-03-25T00:00:00Z", duration: "2m", nextRun: "2026-03-26T00:00:00Z" },
    ],
    connectorSyncs: [
      { id: "cs-001", name: "Telemetry Engine", status: "synced", lastSync: "2 min ago", recordsProcessed: 14200, errorCount: 0 },
      { id: "cs-002", name: "Security Feed", status: "synced", lastSync: "5 min ago", recordsProcessed: 892, errorCount: 0 },
      { id: "cs-003", name: "Logistics Hub", status: "stale", lastSync: "18 min ago", recordsProcessed: 3400, errorCount: 12 },
      { id: "cs-004", name: "Project Status", status: "synced", lastSync: "1 min ago", recordsProcessed: 54, errorCount: 0 },
      { id: "cs-005", name: "Internal API", status: "syncing", lastSync: "3 min ago", recordsProcessed: 1100, errorCount: 2 },
      { id: "cs-006", name: "Stripe Webhooks", status: "synced", lastSync: "8 min ago", recordsProcessed: 67, errorCount: 0 },
    ],
    blastRadius: [
      { service: "Firestorm", impact: "direct", status: "affected", downstream: ["API Server", "Dreamscape"] },
      { service: "API Server", impact: "indirect", status: "at-risk", downstream: ["All Frontend Apps"] },
      { service: "Logistics Hub", impact: "direct", status: "affected", downstream: ["Vessels", "INCA"] },
      { service: "Vessels", impact: "indirect", status: "at-risk", downstream: [] },
      { service: "Dreamscape", impact: "indirect", status: "at-risk", downstream: ["DreamEra"] },
    ],
    queueLag: 340,
    dataFreshness: {
      "Telemetry": "2m ago",
      "Security": "5m ago",
      "Logistics": "18m ago",
      "Project Status": "1m ago",
      "Internal API": "3m ago",
      "AI Engine": "—",
    },
    timestamp: new Date().toISOString(),
  };
}

export async function getServiceMap(): Promise<ServiceMapData> {
  const services = await getServicesFromDb();

  if (services && services.length > 0) {
    const nodes = services.map(s => ({
      id: s.serviceId,
      name: s.name,
      type: s.type as "app" | "api" | "database" | "storage" | "job" | "connector" | "external",
      status: s.status as "healthy" | "degraded" | "down" | "unknown",
      lastCheck: s.lastCheck,
      uptime: Number(s.uptime),
      latency: s.latency,
    }));

    const edges: ServiceMapData["edges"] = [];
    const appNodes = services.filter(s => s.type === "app");
    const apiNode = services.find(s => s.type === "api");
    const dbNode = services.find(s => s.type === "database");
    const storageNode = services.find(s => s.type === "storage");

    if (apiNode) {
      for (const app of appNodes) {
        edges.push({
          source: app.serviceId,
          target: apiNode.serviceId,
          status: app.status === "degraded" ? "degraded" : "healthy",
          latency: app.latency,
        });
      }
      if (dbNode) {
        edges.push({ source: apiNode.serviceId, target: dbNode.serviceId, status: "healthy", latency: dbNode.latency });
      }
      if (storageNode) {
        edges.push({ source: apiNode.serviceId, target: storageNode.serviceId, status: "healthy", latency: storageNode.latency });
      }
    }

    const externalNodes = services.filter(s => s.type === "external");
    for (const ext of externalNodes) {
      if (ext.serviceId === "ais-feed") {
        const vessels = services.find(s => s.serviceId === "vessels");
        if (vessels) edges.push({ source: vessels.serviceId, target: ext.serviceId, status: ext.status === "degraded" ? "degraded" : "healthy", latency: ext.latency });
      }
      if (ext.serviceId === "stripe-api") {
        const carlota = services.find(s => s.serviceId === "carlota-jo");
        if (carlota) edges.push({ source: carlota.serviceId, target: ext.serviceId, status: "healthy", latency: ext.latency });
      }
    }

    const jobNodes = services.filter(s => s.type === "job");
    for (const job of jobNodes) {
      if (apiNode) edges.push({ source: job.serviceId, target: apiNode.serviceId, status: "healthy", latency: 15 });
    }

    return { nodes, edges, timestamp: new Date().toISOString() };
  }

  return {
    nodes: [
      { id: "api-server", name: "API Server", type: "api", status: "healthy", lastCheck: "30s ago", uptime: 99.97, latency: 42 },
      { id: "postgres", name: "PostgreSQL", type: "database", status: "healthy", lastCheck: "15s ago", uptime: 99.99, latency: 8 },
      { id: "object-storage", name: "Object Storage", type: "storage", status: "healthy", lastCheck: "1m ago", uptime: 99.98, latency: 120 },
      { id: "rosie", name: "ROSIE", type: "app", status: "healthy", lastCheck: "2m ago", uptime: 99.97, latency: 85 },
      { id: "aegis", name: "Aegis", type: "app", status: "healthy", lastCheck: "2m ago", uptime: 99.95, latency: 92 },
      { id: "beacon", name: "Beacon", type: "app", status: "healthy", lastCheck: "1m ago", uptime: 99.98, latency: 68 },
      { id: "lutar", name: "Lutar", type: "app", status: "healthy", lastCheck: "3m ago", uptime: 99.91, latency: 78 },
      { id: "nimbus", name: "Nimbus", type: "app", status: "healthy", lastCheck: "2m ago", uptime: 99.96, latency: 110 },
      { id: "firestorm", name: "Firestorm", type: "app", status: "degraded", lastCheck: "1m ago", uptime: 99.82, latency: 245 },
      { id: "dreamscape", name: "Dreamscape", type: "app", status: "degraded", lastCheck: "2m ago", uptime: 99.80, latency: 6200 },
      { id: "dreamera", name: "DreamEra", type: "app", status: "healthy", lastCheck: "3m ago", uptime: 99.89, latency: 150 },
      { id: "zeus", name: "Zeus", type: "app", status: "healthy", lastCheck: "1m ago", uptime: 99.99, latency: 35 },
      { id: "alloyscape", name: "AlloyScape", type: "app", status: "healthy", lastCheck: "2m ago", uptime: 99.93, latency: 55 },
      { id: "vessels", name: "Vessels", type: "app", status: "healthy", lastCheck: "3m ago", uptime: 99.90, latency: 95 },
      { id: "carlota-jo", name: "Carlota Jo", type: "app", status: "healthy", lastCheck: "1m ago", uptime: 99.88, latency: 72 },
      { id: "inca", name: "INCA", type: "app", status: "healthy", lastCheck: "2m ago", uptime: 99.94, latency: 88 },
      { id: "lyte", name: "Lyte", type: "app", status: "healthy", lastCheck: "30s ago", uptime: 99.95, latency: 45 },
      { id: "ais-feed", name: "AIS Data Feed", type: "external", status: "degraded", lastCheck: "18m ago", uptime: 92.0, latency: 1500 },
      { id: "stripe-api", name: "Stripe API", type: "external", status: "healthy", lastCheck: "8m ago", uptime: 99.99, latency: 180 },
      { id: "security-scan", name: "Security Scan Job", type: "job", status: "healthy", lastCheck: "45m ago", uptime: 99.9, latency: 0 },
      { id: "telemetry-agg", name: "Telemetry Aggregation", type: "job", status: "healthy", lastCheck: "15m ago", uptime: 99.95, latency: 0 },
      { id: "ml-health", name: "ML Health Check", type: "job", status: "healthy", lastCheck: "1h ago", uptime: 99.8, latency: 0 },
    ],
    edges: [
      { source: "rosie", target: "api-server", status: "healthy", latency: 42 },
      { source: "aegis", target: "api-server", status: "healthy", latency: 45 },
      { source: "beacon", target: "api-server", status: "healthy", latency: 38 },
      { source: "lutar", target: "api-server", status: "healthy", latency: 40 },
      { source: "nimbus", target: "api-server", status: "healthy", latency: 55 },
      { source: "firestorm", target: "api-server", status: "degraded", latency: 245 },
      { source: "dreamscape", target: "api-server", status: "degraded", latency: 180 },
      { source: "dreamera", target: "api-server", status: "healthy", latency: 65 },
      { source: "zeus", target: "api-server", status: "healthy", latency: 28 },
      { source: "alloyscape", target: "api-server", status: "healthy", latency: 35 },
      { source: "vessels", target: "api-server", status: "healthy", latency: 48 },
      { source: "carlota-jo", target: "api-server", status: "healthy", latency: 52 },
      { source: "inca", target: "api-server", status: "healthy", latency: 44 },
      { source: "lyte", target: "api-server", status: "healthy", latency: 30 },
      { source: "api-server", target: "postgres", status: "healthy", latency: 8 },
      { source: "api-server", target: "object-storage", status: "healthy", latency: 120 },
      { source: "vessels", target: "ais-feed", status: "degraded", latency: 1500 },
      { source: "carlota-jo", target: "stripe-api", status: "healthy", latency: 180 },
      { source: "dreamscape", target: "dreamera", status: "healthy", latency: 95 },
      { source: "security-scan", target: "api-server", status: "healthy", latency: 15 },
      { source: "telemetry-agg", target: "postgres", status: "healthy", latency: 12 },
      { source: "ml-health", target: "nimbus", status: "healthy", latency: 20 },
      { source: "ml-health", target: "dreamscape", status: "degraded", latency: 350 },
    ],
    timestamp: new Date().toISOString(),
  };
}

export async function getSloData(): Promise<SloData> {
  const slos = await getSlosFromDb();

  if (slos && slos.length > 0) {
    return {
      targets: slos.map(s => ({
        id: s.sloId,
        service: s.service,
        metric: s.metric as "availability" | "latency" | "freshness" | "error-rate",
        target: Number(s.target),
        current: Number(s.current),
        unit: s.unit,
        window: s.window,
        burnRate: Number(s.burnRate),
        budgetRemaining: s.budgetRemaining,
        budgetTotal: s.budgetTotal,
        status: s.status as "healthy" | "warning" | "breached",
        impactIfBreached: s.impactIfBreached,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  return {
    targets: [
      { id: "slo-001", service: "API Server", metric: "availability", target: 99.95, current: 99.97, unit: "%", window: "30d", burnRate: 0.6, budgetRemaining: 85, budgetTotal: 100, status: "healthy", impactIfBreached: "All frontend apps lose backend connectivity" },
      { id: "slo-002", service: "API Server", metric: "latency", target: 100, current: 42, unit: "ms (p95)", window: "30d", burnRate: 0.3, budgetRemaining: 92, budgetTotal: 100, status: "healthy", impactIfBreached: "Degraded UX across all apps" },
      { id: "slo-003", service: "ROSIE", metric: "availability", target: 99.9, current: 99.97, unit: "%", window: "30d", burnRate: 0.3, budgetRemaining: 95, budgetTotal: 100, status: "healthy", impactIfBreached: "Security threat detection offline" },
      { id: "slo-004", service: "Firestorm", metric: "latency", target: 200, current: 245, unit: "ms (p95)", window: "30d", burnRate: 2.8, budgetRemaining: 12, budgetTotal: 100, status: "breached", impactIfBreached: "2,400 daily sessions degraded; user drop-off" },
      { id: "slo-005", service: "Dreamscape", metric: "latency", target: 5000, current: 6200, unit: "ms (gen)", window: "30d", burnRate: 3.2, budgetRemaining: 8, budgetTotal: 100, status: "breached", impactIfBreached: "18% user drop-off on generation flows" },
      { id: "slo-006", service: "Vessels", metric: "freshness", target: 60, current: 45, unit: "s (feed delay)", window: "7d", burnRate: 1.2, budgetRemaining: 42, budgetTotal: 100, status: "warning", impactIfBreached: "Fleet position accuracy degraded; compliance lag" },
      { id: "slo-007", service: "DreamEra", metric: "error-rate", target: 10, current: 15.8, unit: "% (accuracy miss)", window: "30d", burnRate: 1.8, budgetRemaining: 22, budgetTotal: 100, status: "warning", impactIfBreached: "User satisfaction decline; artifact quality drops" },
      { id: "slo-008", service: "PostgreSQL", metric: "availability", target: 99.99, current: 99.99, unit: "%", window: "30d", burnRate: 0.1, budgetRemaining: 98, budgetTotal: 100, status: "healthy", impactIfBreached: "All data-dependent services fail" },
      { id: "slo-009", service: "Aegis", metric: "availability", target: 99.9, current: 99.95, unit: "%", window: "30d", burnRate: 0.5, budgetRemaining: 78, budgetTotal: 100, status: "healthy", impactIfBreached: "Compliance scanning goes offline" },
      { id: "slo-010", service: "Beacon", metric: "latency", target: 150, current: 68, unit: "ms (p95)", window: "30d", burnRate: 0.2, budgetRemaining: 95, budgetTotal: 100, status: "healthy", impactIfBreached: "Analytics dashboard becomes sluggish" },
      { id: "slo-011", service: "Zeus", metric: "availability", target: 99.99, current: 99.99, unit: "%", window: "30d", burnRate: 0.05, budgetRemaining: 99, budgetTotal: 100, status: "healthy", impactIfBreached: "Infrastructure orchestration fails" },
      { id: "slo-012", service: "Carlota Jo", metric: "availability", target: 99.9, current: 99.88, unit: "%", window: "30d", burnRate: 1.2, budgetRemaining: 55, budgetTotal: 100, status: "warning", impactIfBreached: "Consultation bookings disrupted; revenue impact" },
      { id: "slo-013", service: "Nimbus", metric: "latency", target: 200, current: 110, unit: "ms (p95)", window: "30d", burnRate: 0.4, budgetRemaining: 88, budgetTotal: 100, status: "healthy", impactIfBreached: "AI prediction service degraded" },
      { id: "slo-014", service: "INCA", metric: "freshness", target: 30, current: 18, unit: "s (alert delay)", window: "7d", burnRate: 0.3, budgetRemaining: 90, budgetTotal: 100, status: "healthy", impactIfBreached: "Intelligence alerts delayed" },
      { id: "slo-015", service: "Object Storage", metric: "availability", target: 99.99, current: 99.98, unit: "%", window: "30d", burnRate: 0.8, budgetRemaining: 72, budgetTotal: 100, status: "healthy", impactIfBreached: "Asset uploads/downloads fail" },
      { id: "slo-016", service: "Stripe Integration", metric: "error-rate", target: 0.1, current: 0.0, unit: "% (webhook failures)", window: "7d", burnRate: 0.0, budgetRemaining: 100, budgetTotal: 100, status: "healthy", impactIfBreached: "Payment processing fails; revenue loss" },
    ],
    timestamp: new Date().toISOString(),
  };
}

export async function getSyntheticProbes(): Promise<SyntheticProbeData> {
  const probes = await getProbesFromDb();
  const now = new Date();

  function historyFor(baseStatus: "passing" | "failing" | "degraded", baseTime: number) {
    return Array.from({ length: 12 }, (_, i) => ({
      timestamp: new Date(now.getTime() - (11 - i) * 5 * 60 * 1000).toISOString(),
      status: (i >= 10 ? baseStatus : "passing") as "passing" | "failing" | "degraded",
      responseTime: baseTime + Math.floor(Math.random() * 40 - 20),
    }));
  }

  if (probes && probes.length > 0) {
    const probeData = probes.map(p => ({
      id: p.probeId,
      name: p.name,
      type: p.type as "http" | "flow" | "handshake" | "latency",
      target: p.target,
      status: p.status as "passing" | "failing" | "degraded" | "unknown",
      lastCheck: p.lastCheck,
      responseTime: p.responseTime,
      successRate: Number(p.successRate),
      history: historyFor(p.status as "passing" | "failing" | "degraded", p.responseTime),
    }));

    const passingCount = probes.filter(p => p.status === "passing").length;
    const overallHealth = Math.round((passingCount / probes.length) * 100);

    return { probes: probeData, overallHealth, timestamp: now.toISOString() };
  }

  return {
    probes: [
      { id: "probe-001", name: "Homepage Available", type: "http", target: "szlholdings.com", status: "passing", lastCheck: "30s ago", responseTime: 185, successRate: 100, history: historyFor("passing", 185) },
      { id: "probe-002", name: "API Health Endpoint", type: "http", target: "/api/lyte/health", status: "passing", lastCheck: "30s ago", responseTime: 42, successRate: 100, history: historyFor("passing", 42) },
      { id: "probe-003", name: "Dashboard Loads", type: "flow", target: "/lyte/", status: "passing", lastCheck: "1m ago", responseTime: 620, successRate: 99.8, history: historyFor("passing", 620) },
      { id: "probe-004", name: "Firestorm API Latency", type: "latency", target: "/firestorm/api", status: "failing", lastCheck: "1m ago", responseTime: 245, successRate: 82, history: historyFor("failing", 245) },
      { id: "probe-005", name: "Dreamscape Generation Flow", type: "flow", target: "/dreamscape/generate", status: "degraded", lastCheck: "2m ago", responseTime: 6200, successRate: 91, history: historyFor("degraded", 6200) },
      { id: "probe-006", name: "Stripe Webhook Handshake", type: "handshake", target: "Stripe → Carlota Jo", status: "passing", lastCheck: "8m ago", responseTime: 180, successRate: 100, history: historyFor("passing", 180) },
      { id: "probe-007", name: "AIS Feed Connectivity", type: "handshake", target: "AIS Provider → Vessels", status: "degraded", lastCheck: "18m ago", responseTime: 1500, successRate: 92, history: historyFor("degraded", 1500) },
      { id: "probe-008", name: "PostgreSQL Connection", type: "handshake", target: "API Server → PostgreSQL", status: "passing", lastCheck: "15s ago", responseTime: 8, successRate: 100, history: historyFor("passing", 8) },
      { id: "probe-009", name: "Object Storage Upload", type: "http", target: "Object Storage PUT", status: "passing", lastCheck: "5m ago", responseTime: 320, successRate: 99.9, history: historyFor("passing", 320) },
      { id: "probe-010", name: "Login Flow (SSO)", type: "flow", target: "/auth/login", status: "passing", lastCheck: "2m ago", responseTime: 890, successRate: 99.5, history: historyFor("passing", 890) },
    ],
    overallHealth: 80,
    timestamp: now.toISOString(),
  };
}

export function getReleaseIntelligence(): ReleaseIntelligenceData {
  return {
    releases: [
      { id: "rel-001", app: "ROSIE", version: "2.4.1", commitHash: "a1b2c3d", timestamp: "2026-03-25T12:00:00Z", deployer: "Stephen L.", status: "success", featureFlags: [{ name: "threat-ml-v2", enabled: true }, { name: "real-time-alerts", enabled: false }], firstSeenErrors: [], rollbackMarker: false, changelog: ["Upgraded threat detection ML model", "Fixed false positive rate in scan engine", "Added batch processing for large datasets"] },
      { id: "rel-002", app: "Zeus", version: "1.8.0", commitHash: "e4f5g6h", timestamp: "2026-03-25T10:00:00Z", deployer: "Stephen L.", status: "success", featureFlags: [{ name: "chaos-suite-v2", enabled: true }, { name: "auto-remediation", enabled: false }], firstSeenErrors: [], rollbackMarker: false, changelog: ["Expanded chaos engineering test suite", "Added network partition simulation", "Improved auto-scaling response time"] },
      { id: "rel-003", app: "Beacon", version: "3.1.2", commitHash: "i7j8k9l", timestamp: "2026-03-25T08:00:00Z", deployer: "Stephen L.", status: "success", featureFlags: [{ name: "pdf-export-v2", enabled: true }, { name: "real-time-charts", enabled: true }], firstSeenErrors: [], rollbackMarker: false, changelog: ["Finalized PDF export feature", "Added real-time chart streaming", "Performance improvements for large datasets"] },
      { id: "rel-004", app: "Firestorm", version: "0.9.3-rc1", commitHash: "m0n1o2p", timestamp: "2026-03-24T16:00:00Z", deployer: "Stephen L.", status: "success", featureFlags: [{ name: "simulation-v3", enabled: true }, { name: "gpu-offload", enabled: false }], firstSeenErrors: ["PERF-001: p95 latency exceeded 200ms threshold", "PERF-002: DB connection pool warnings under load"], rollbackMarker: false, changelog: ["Deployed simulation engine v3", "Added GPU offload capability (flagged off)", "Updated dependency versions"] },
      { id: "rel-005", app: "Dreamscape", version: "2.0.1", commitHash: "q3r4s5t", timestamp: "2026-03-24T14:00:00Z", deployer: "Stephen L.", status: "success", featureFlags: [{ name: "gen-pipeline-v2", enabled: true }, { name: "model-quantization", enabled: false }], firstSeenErrors: ["GEN-001: Pipeline latency >5s for complex prompts"], rollbackMarker: false, changelog: ["Generation pipeline v2 deployment", "New model architecture integration", "Batch processing optimization"] },
      { id: "rel-006", app: "Vessels", version: "1.5.4", commitHash: "u6v7w8x", timestamp: "2026-03-24T09:00:00Z", deployer: "Stephen L.", status: "success", featureFlags: [{ name: "ais-cache-buffer", enabled: true }, { name: "fleet-analytics-v2", enabled: true }], firstSeenErrors: [], rollbackMarker: false, changelog: ["Added AIS data caching buffer", "Fleet analytics v2 dashboard", "Improved map rendering performance"] },
      { id: "rel-007", app: "Carlota Jo", version: "1.2.0", commitHash: "y9z0a1b", timestamp: "2026-03-23T15:00:00Z", deployer: "Carlota B.", status: "success", featureFlags: [{ name: "stripe-checkout-v2", enabled: true }], firstSeenErrors: [], rollbackMarker: false, changelog: ["Stripe Checkout v2 integration", "New booking confirmation flow", "Email notification templates"] },
      { id: "rel-008", app: "Aegis", version: "2.3.0", commitHash: "c2d3e4f", timestamp: "2026-03-23T11:00:00Z", deployer: "Stephen L.", status: "rolled-back", featureFlags: [{ name: "compliance-batch-v2", enabled: false }], firstSeenErrors: ["RATE-001: External API rate limiting on bulk scans", "TIMEOUT-001: Scan batch timeout after 300s"], rollbackMarker: true, changelog: ["Attempted bulk compliance scan optimization", "New API rate limiting strategy (failed)", "Rolled back to v2.2.8"] },
    ],
    currentVersions: {
      "ROSIE": "2.4.1", "Aegis": "2.2.8", "Beacon": "3.1.2", "Lutar": "1.6.2",
      "Nimbus": "1.4.0", "Firestorm": "0.9.3-rc1", "DreamEra": "1.1.3",
      "Zeus": "1.8.0", "AlloyScape": "2.0.5", "Vessels": "1.5.4",
      "Carlota Jo": "1.2.0", "Dreamscape": "2.0.1", "INCA": "1.3.1", "Lyte": "1.0.0",
    },
    timestamp: new Date().toISOString(),
  };
}

export async function getCostEfficiency(): Promise<CostEfficiencyData> {
  const costItems = await getCostItemsFromDb();

  if (costItems && costItems.length > 0) {
    const items = costItems.map(c => ({
      id: c.costId,
      category: c.category as "compute" | "storage" | "jobs" | "connectors" | "events",
      name: c.name,
      estimatedCost: c.estimatedCost,
      usage: c.usage,
      trend: c.trend as "up" | "down" | "stable",
      efficiency: c.efficiency as "optimal" | "moderate" | "wasteful",
      suggestion: c.suggestion,
    }));

    const totalMonthly = costItems.reduce((sum, c) => {
      const match = c.estimatedCost.match(/\$([0-9,]+)/);
      return sum + (match ? parseInt(match[1].replace(",", "")) : 0);
    }, 0);

    return {
      items,
      totalEstimatedMonthly: `$${totalMonthly.toLocaleString()}`,
      topNoisySources: [
        { name: "Telemetry Events (info-level)", eventsPerHour: 4700, cost: "$38/mo" },
        { name: "Firestorm Perf Metrics", eventsPerHour: 2200, cost: "$22/mo" },
        { name: "AIS Position Updates", eventsPerHour: 1800, cost: "$18/mo" },
        { name: "Dreamscape Generation Logs", eventsPerHour: 950, cost: "$12/mo" },
        { name: "Security Scan Results", eventsPerHour: 380, cost: "$5/mo" },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  return {
    items: [
      { id: "cost-001", category: "compute", name: "Dreamscape GPU Instances", estimatedCost: "$1,200/mo", usage: "4x T4 GPU, 78% utilization", trend: "up", efficiency: "moderate", suggestion: "Enable model quantization to reduce GPU count to 3x" },
      { id: "cost-002", category: "compute", name: "Firestorm Simulation Engine", estimatedCost: "$480/mo", usage: "2x vCPU, sustained high load", trend: "up", efficiency: "wasteful", suggestion: "Optimize database queries to reduce compute load by ~40%" },
      { id: "cost-003", category: "compute", name: "API Server (Primary)", estimatedCost: "$320/mo", usage: "4x vCPU, 35% avg utilization", trend: "stable", efficiency: "optimal", suggestion: "Current sizing appropriate for traffic patterns" },
      { id: "cost-004", category: "storage", name: "Object Storage (Assets)", estimatedCost: "$85/mo", usage: "420 GB, 12K objects", trend: "up", efficiency: "moderate", suggestion: "Implement lifecycle policies for old generated assets" },
      { id: "cost-005", category: "storage", name: "PostgreSQL Database", estimatedCost: "$150/mo", usage: "50 GB data, 62% connection pool", trend: "stable", efficiency: "optimal", suggestion: "Monitor connection pool; alert at 85%" },
      { id: "cost-006", category: "jobs", name: "Security Scan — Full Portfolio", estimatedCost: "$45/mo", usage: "Daily, 45min avg runtime", trend: "stable", efficiency: "optimal", suggestion: "Consider incremental scanning for lower compute" },
      { id: "cost-007", category: "jobs", name: "ML Model Health Check", estimatedCost: "$30/mo", usage: "Every 6h, 8min runtime", trend: "stable", efficiency: "optimal", suggestion: "Frequency appropriate for model drift detection" },
      { id: "cost-008", category: "jobs", name: "Telemetry Aggregation", estimatedCost: "$60/mo", usage: "Every 30min, 3min runtime", trend: "up", efficiency: "moderate", suggestion: "Increase interval to 1h during off-peak; save ~50%" },
      { id: "cost-009", category: "connectors", name: "AIS Data Feed", estimatedCost: "$200/mo", usage: "~3,400 records/sync, every 30min", trend: "stable", efficiency: "moderate", suggestion: "Negotiate volume discount with AIS provider" },
      { id: "cost-010", category: "connectors", name: "Stripe API", estimatedCost: "$0 (2.9%+30¢/txn)", usage: "~67 transactions/week", trend: "stable", efficiency: "optimal", suggestion: "Transaction volume healthy; standard pricing" },
      { id: "cost-011", category: "events", name: "Telemetry Events Ingestion", estimatedCost: "$95/mo", usage: "14,200 events/sync", trend: "up", efficiency: "moderate", suggestion: "Filter low-value info-level events to reduce volume 30%" },
      { id: "cost-012", category: "events", name: "Security Alert Events", estimatedCost: "$25/mo", usage: "892 events/sync", trend: "stable", efficiency: "optimal", suggestion: "Event volume appropriate for security monitoring" },
    ],
    totalEstimatedMonthly: "$2,690",
    topNoisySources: [
      { name: "Telemetry Events (info-level)", eventsPerHour: 4700, cost: "$38/mo" },
      { name: "Firestorm Perf Metrics", eventsPerHour: 2200, cost: "$22/mo" },
      { name: "AIS Position Updates", eventsPerHour: 1800, cost: "$18/mo" },
      { name: "Dreamscape Generation Logs", eventsPerHour: 950, cost: "$12/mo" },
      { name: "Security Scan Results", eventsPerHour: 380, cost: "$5/mo" },
    ],
    timestamp: new Date().toISOString(),
  };
}
