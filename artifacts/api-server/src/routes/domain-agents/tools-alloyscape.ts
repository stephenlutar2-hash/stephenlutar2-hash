import { db } from "@szl-holdings/db";
import {
  zeusModulesTable, zeusLogsTable,
  beaconMetricsTable, beaconProjectsTable,
  nimbusPredictionsTable, nimbusAlertsTable,
  rosieThreatsTable, rosieIncidentsTable,
  incaProjectsTable, incaExperimentsTable,
} from "@szl-holdings/db/schema";
import { desc } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const alloyscapeTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_platform_overview",
      description: "Get a comprehensive cross-platform overview showing the health and status of all major SZL Holdings systems — infrastructure, security, analytics, AI research, and predictions",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_security_status",
      description: "Get the current security status across the platform including active threats, open incidents, and recent scan coverage",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_infrastructure_health",
      description: "Get infrastructure module health showing active, degraded, and offline modules with uptime statistics from Zeus",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_analytics_summary",
      description: "Get analytics summary combining Beacon KPIs, project health, Nimbus predictions, and alert status for executive briefing",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_operations_briefing",
      description: "Generate a comprehensive operations briefing suitable for executive review — combining system health, security posture, business KPIs, predictive intelligence, and AI research status into a single actionable report",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function alloyscapeExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "get_platform_overview": {
        const [modules, metrics, predictions, alerts, threats, incidents, projects] = await Promise.all([
          db.select().from(zeusModulesTable),
          db.select().from(beaconMetricsTable),
          db.select().from(nimbusPredictionsTable),
          db.select().from(nimbusAlertsTable),
          db.select().from(rosieThreatsTable),
          db.select().from(rosieIncidentsTable),
          db.select().from(incaProjectsTable),
        ]);
        return JSON.stringify({
          infrastructure: {
            totalModules: modules.length,
            active: modules.filter(m => m.status === "active" || m.status === "online").length,
            degraded: modules.filter(m => m.status === "degraded" || m.status === "warning").length,
            offline: modules.filter(m => m.status === "offline" || m.status === "error").length,
          },
          security: {
            activeThreats: threats.length,
            openIncidents: incidents.filter(i => !i.resolved).length,
            resolvedIncidents: incidents.filter(i => i.resolved).length,
          },
          analytics: {
            kpiCount: metrics.length,
            improvingKPIs: metrics.filter(m => Number(m.change) > 0).length,
            decliningKPIs: metrics.filter(m => Number(m.change) < 0).length,
          },
          predictions: {
            total: predictions.length,
            highConfidence: predictions.filter(p => Number(p.confidence) >= 80).length,
            unreadAlerts: alerts.filter(a => !a.isRead).length,
          },
          aiResearch: {
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === "active" || p.status === "in-progress").length,
          },
        });
      }
      case "get_security_status": {
        const [threats, incidents] = await Promise.all([
          db.select().from(rosieThreatsTable),
          db.select().from(rosieIncidentsTable),
        ]);
        const threatsBySeverity: Record<string, number> = {};
        for (const t of threats) {
          threatsBySeverity[t.severity] = (threatsBySeverity[t.severity] || 0) + 1;
        }
        const openIncidents = incidents.filter(i => !i.resolved);
        return JSON.stringify({
          threats: { total: threats.length, bySeverity: threatsBySeverity },
          incidents: {
            total: incidents.length,
            open: openIncidents.length,
            openDetails: openIncidents.map(i => ({ title: i.title, severity: i.severity, platform: i.platform, status: i.status })),
          },
        });
      }
      case "get_infrastructure_health": {
        const modules = await db.select().from(zeusModulesTable);
        const statusDist: Record<string, number> = {};
        for (const m of modules) {
          statusDist[m.status] = (statusDist[m.status] || 0) + 1;
        }
        const avgUptime = modules.length > 0
          ? Math.round(modules.reduce((s, m) => s + Number(m.uptime || 0), 0) / modules.length * 100) / 100
          : 0;
        return JSON.stringify({
          totalModules: modules.length,
          statusDistribution: statusDist,
          averageUptime: avgUptime,
          modules: modules.map(m => ({ name: m.name, status: m.status, category: m.category, uptime: m.uptime })),
        });
      }
      case "get_analytics_summary": {
        const [metrics, projects, predictions, alerts] = await Promise.all([
          db.select().from(beaconMetricsTable),
          db.select().from(beaconProjectsTable),
          db.select().from(nimbusPredictionsTable),
          db.select().from(nimbusAlertsTable),
        ]);
        return JSON.stringify({
          kpis: metrics.map(m => ({ name: m.name, value: Number(m.value), unit: m.unit, change: Number(m.change), category: m.category })),
          projectHealth: {
            total: projects.length,
            byStatus: projects.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {} as Record<string, number>),
          },
          predictiveIntelligence: {
            totalPredictions: predictions.length,
            avgConfidence: predictions.length > 0
              ? Math.round(predictions.reduce((s, p) => s + Number(p.confidence), 0) / predictions.length)
              : 0,
          },
          alerts: {
            total: alerts.length,
            unread: alerts.filter(a => !a.isRead).length,
          },
        });
      }
      case "get_operations_briefing": {
        const [modules, logs, metrics, projects, predictions, alerts, threats, incidents, incaProjects, experiments] = await Promise.all([
          db.select().from(zeusModulesTable),
          db.select().from(zeusLogsTable).orderBy(desc(zeusLogsTable.createdAt)).limit(50),
          db.select().from(beaconMetricsTable),
          db.select().from(beaconProjectsTable),
          db.select().from(nimbusPredictionsTable),
          db.select().from(nimbusAlertsTable),
          db.select().from(rosieThreatsTable),
          db.select().from(rosieIncidentsTable),
          db.select().from(incaProjectsTable),
          db.select().from(incaExperimentsTable),
        ]);
        const errorLogs = logs.filter(l => l.level === "error");
        const degradedModules = modules.filter(m => m.status !== "active" && m.status !== "online");
        const openIncidents = incidents.filter(i => !i.resolved);
        const criticalThreats = threats.filter(t => t.severity === "critical");
        const unreadAlerts = alerts.filter(a => !a.isRead);
        const decliningKPIs = metrics.filter(m => Number(m.change) < 0);
        return JSON.stringify({
          systemHealth: {
            modulesActive: modules.length - degradedModules.length,
            modulesDegraded: degradedModules.length,
            recentErrors: errorLogs.length,
            avgUptime: modules.length > 0 ? Math.round(modules.reduce((s, m) => s + Number(m.uptime || 0), 0) / modules.length * 100) / 100 : 0,
          },
          securityPosture: {
            criticalThreats: criticalThreats.length,
            totalThreats: threats.length,
            openIncidents: openIncidents.length,
          },
          businessMetrics: {
            totalKPIs: metrics.length,
            declining: decliningKPIs.map(m => ({ name: m.name, change: Number(m.change) })),
            projectsInProgress: projects.filter(p => p.status === "active" || p.status === "in-progress").length,
          },
          predictiveInsights: {
            activePredictions: predictions.length,
            highConfidence: predictions.filter(p => Number(p.confidence) >= 80).length,
            unreadAlerts: unreadAlerts.length,
          },
          aiResearch: {
            projects: incaProjects.length,
            experiments: experiments.length,
            activeExperiments: experiments.filter(e => e.status === "running" || e.status === "active").length,
          },
          priorityActions: [
            ...(criticalThreats.length > 0 ? ["CRITICAL: ${criticalThreats.length} critical threats detected"] : []),
            ...(openIncidents.length > 0 ? ["${openIncidents.length} security incidents require resolution"] : []),
            ...(degradedModules.length > 0 ? ["${degradedModules.length} infrastructure modules need attention"] : []),
            ...(unreadAlerts.length > 0 ? ["${unreadAlerts.length} predictive alerts unread"] : []),
            ...(decliningKPIs.length > 0 ? ["${decliningKPIs.length} KPIs trending downward"] : []),
          ],
        });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
