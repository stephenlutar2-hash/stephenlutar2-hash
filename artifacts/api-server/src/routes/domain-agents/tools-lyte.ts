import { db } from "@szl-holdings/db";
import { zeusModulesTable, zeusLogsTable, beaconMetricsTable, beaconProjectsTable, rosieIncidentsTable } from "@szl-holdings/db/schema";
import { desc, eq } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const lyteTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_system_health",
      description: "Get overall system health across all infrastructure modules including status, uptime, and version information",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_recent_logs",
      description: "Get recent system logs across all modules, filterable by severity level, for diagnosing issues and monitoring health",
      parameters: {
        type: "object",
        properties: {
          level: { type: "string", description: "Filter by log level: 'error', 'warn', 'info', 'debug' (optional)" },
          limit: { type: "integer", description: "Number of recent log entries (default 50)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_infrastructure_status",
      description: "Generate an infrastructure status briefing showing module health distribution, error rates from logs, and operational KPIs from across the platform",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_alert_triage",
      description: "Triage current alerts and issues by pulling error/warning logs, degraded modules, and open security incidents to prioritize response actions",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_platform_kpis",
      description: "Get key performance indicators from the Beacon metrics system to correlate business metrics with infrastructure health",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function lyteExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "get_system_health": {
        const modules = await db.select().from(zeusModulesTable).orderBy(zeusModulesTable.name);
        return JSON.stringify({
          modules: modules.map(m => ({
            name: m.name,
            status: m.status,
            version: m.version,
            category: m.category,
            uptime: m.uptime,
          })),
          totalModules: modules.length,
          healthy: modules.filter(m => m.status === "active" || m.status === "online").length,
          degraded: modules.filter(m => m.status === "degraded" || m.status === "warning").length,
          offline: modules.filter(m => m.status === "offline" || m.status === "error").length,
        });
      }
      case "get_recent_logs": {
        const limit = args.limit || 50;
        const rows = args.level
          ? await db.select().from(zeusLogsTable).where(eq(zeusLogsTable.level, args.level)).orderBy(desc(zeusLogsTable.createdAt)).limit(limit)
          : await db.select().from(zeusLogsTable).orderBy(desc(zeusLogsTable.createdAt)).limit(limit);
        return JSON.stringify(rows);
      }
      case "get_infrastructure_status": {
        const [modules, logs, metrics] = await Promise.all([
          db.select().from(zeusModulesTable),
          db.select().from(zeusLogsTable),
          db.select().from(beaconMetricsTable),
        ]);
        const statusDist: Record<string, number> = {};
        for (const m of modules) {
          statusDist[m.status] = (statusDist[m.status] || 0) + 1;
        }
        const logLevels: Record<string, number> = {};
        for (const l of logs) {
          logLevels[l.level] = (logLevels[l.level] || 0) + 1;
        }
        const avgUptime = modules.length > 0
          ? Math.round(modules.reduce((s, m) => s + Number(m.uptime || 0), 0) / modules.length * 100) / 100
          : 0;
        return JSON.stringify({
          moduleHealth: { total: modules.length, statusDistribution: statusDist, averageUptime: avgUptime },
          logAnalysis: { totalLogs: logs.length, byLevel: logLevels },
          operationalKPIs: metrics.slice(0, 10).map(m => ({ name: m.name, value: Number(m.value), unit: m.unit, change: Number(m.change) })),
        });
      }
      case "get_alert_triage": {
        const [errorLogs, modules, incidents] = await Promise.all([
          db.select().from(zeusLogsTable).where(eq(zeusLogsTable.level, "error")).orderBy(desc(zeusLogsTable.createdAt)).limit(20),
          db.select().from(zeusModulesTable),
          db.select().from(rosieIncidentsTable),
        ]);
        const degradedModules = modules.filter(m => m.status !== "active" && m.status !== "online");
        const openIncidents = incidents.filter(i => !i.resolved);
        return JSON.stringify({
          criticalErrors: errorLogs.map(l => ({ module: l.module, message: l.message, createdAt: l.createdAt })),
          degradedModules: degradedModules.map(m => ({ name: m.name, status: m.status, category: m.category })),
          openSecurityIncidents: openIncidents.map(i => ({ title: i.title, severity: i.severity, status: i.status, platform: i.platform })),
          priorityActions: [
            ...(errorLogs.length > 0 ? [`${errorLogs.length} error logs require investigation`] : []),
            ...(degradedModules.length > 0 ? [`${degradedModules.length} modules are degraded or offline`] : []),
            ...(openIncidents.length > 0 ? [`${openIncidents.length} security incidents are unresolved`] : []),
          ],
        });
      }
      case "get_platform_kpis": {
        const metrics = await db.select().from(beaconMetricsTable).orderBy(beaconMetricsTable.category);
        return JSON.stringify(metrics.map(m => ({ name: m.name, value: Number(m.value), unit: m.unit, change: Number(m.change), category: m.category })));
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
