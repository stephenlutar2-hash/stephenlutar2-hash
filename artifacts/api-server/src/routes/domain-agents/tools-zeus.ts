import { db } from "@szl-holdings/db";
import { zeusModulesTable, zeusLogsTable } from "@szl-holdings/db/schema";
import { eq, desc } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const zeusTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_modules",
      description: "List all system modules with name, description, version, status, category, and uptime percentage",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_system_logs",
      description: "List system logs with level, message, module source, and timestamp for diagnosing issues",
      parameters: {
        type: "object",
        properties: {
          module: { type: "string", description: "Filter logs by module name (optional)" },
          level: { type: "string", description: "Filter by log level: 'error', 'warn', 'info', 'debug' (optional)" },
          limit: { type: "integer", description: "Number of recent entries (default 50)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_module_details",
      description: "Get detailed information about a specific module by ID, including its recent logs",
      parameters: {
        type: "object",
        properties: {
          moduleId: { type: "integer", description: "The module ID to look up" },
        },
        required: ["moduleId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_architecture_overview",
      description: "Generate a system architecture overview showing module distribution by category, dependency patterns, health status, and uptime statistics",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_module_health_report",
      description: "Generate a health report for all modules showing status distribution, modules with low uptime, error log concentration by module, and recommended actions",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function zeusExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "list_modules": {
        const rows = await db.select().from(zeusModulesTable).orderBy(zeusModulesTable.name);
        return JSON.stringify(rows);
      }
      case "list_system_logs": {
        const limit = args.limit || 50;
        let rows;
        if (args.module && args.level) {
          rows = await db.select().from(zeusLogsTable)
            .where(eq(zeusLogsTable.module, args.module))
            .orderBy(desc(zeusLogsTable.createdAt)).limit(limit);
          rows = rows.filter(l => l.level === args.level);
        } else if (args.module) {
          rows = await db.select().from(zeusLogsTable)
            .where(eq(zeusLogsTable.module, args.module))
            .orderBy(desc(zeusLogsTable.createdAt)).limit(limit);
        } else if (args.level) {
          rows = await db.select().from(zeusLogsTable)
            .where(eq(zeusLogsTable.level, args.level))
            .orderBy(desc(zeusLogsTable.createdAt)).limit(limit);
        } else {
          rows = await db.select().from(zeusLogsTable)
            .orderBy(desc(zeusLogsTable.createdAt)).limit(limit);
        }
        return JSON.stringify(rows);
      }
      case "get_module_details": {
        const [mod] = await db.select().from(zeusModulesTable)
          .where(eq(zeusModulesTable.id, args.moduleId)).limit(1);
        if (!mod) return JSON.stringify({ error: "Module not found" });
        const logs = await db.select().from(zeusLogsTable)
          .where(eq(zeusLogsTable.module, mod.name))
          .orderBy(desc(zeusLogsTable.createdAt)).limit(20);
        return JSON.stringify({ module: mod, recentLogs: logs });
      }
      case "get_architecture_overview": {
        const modules = await db.select().from(zeusModulesTable);
        const byCategory: Record<string, Array<{ name: string; status: string; version: string }>> = {};
        for (const m of modules) {
          if (!byCategory[m.category]) byCategory[m.category] = [];
          byCategory[m.category].push({ name: m.name, status: m.status, version: m.version });
        }
        const avgUptime = modules.length > 0
          ? Math.round(modules.reduce((s, m) => s + Number(m.uptime || 0), 0) / modules.length * 100) / 100
          : 0;
        return JSON.stringify({
          totalModules: modules.length,
          categories: Object.entries(byCategory).map(([cat, mods]) => ({
            category: cat,
            count: mods.length,
            modules: mods,
          })),
          healthSummary: {
            active: modules.filter(m => m.status === "active" || m.status === "online").length,
            degraded: modules.filter(m => m.status === "degraded" || m.status === "warning").length,
            offline: modules.filter(m => m.status === "offline" || m.status === "error").length,
          },
          averageUptime: avgUptime,
        });
      }
      case "get_module_health_report": {
        const [modules, logs] = await Promise.all([
          db.select().from(zeusModulesTable),
          db.select().from(zeusLogsTable),
        ]);
        const statusDist: Record<string, number> = {};
        const lowUptime: typeof modules = [];
        for (const m of modules) {
          statusDist[m.status] = (statusDist[m.status] || 0) + 1;
          if (Number(m.uptime || 0) < 95) lowUptime.push(m);
        }
        const errorsByModule: Record<string, number> = {};
        for (const l of logs) {
          if (l.level === "error") {
            errorsByModule[l.module] = (errorsByModule[l.module] || 0) + 1;
          }
        }
        return JSON.stringify({
          statusDistribution: statusDist,
          lowUptimeModules: lowUptime.map(m => ({ name: m.name, uptime: m.uptime, status: m.status })),
          errorConcentration: Object.entries(errorsByModule)
            .sort((a, b) => b[1] - a[1])
            .map(([mod, count]) => ({ module: mod, errorCount: count })),
          recommendations: [
            ...(lowUptime.length > 0 ? [`${lowUptime.length} modules have uptime below 95% — investigate root causes`] : []),
            ...(Object.keys(errorsByModule).length > 0 ? [`${Object.keys(errorsByModule).length} modules are generating errors`] : []),
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
