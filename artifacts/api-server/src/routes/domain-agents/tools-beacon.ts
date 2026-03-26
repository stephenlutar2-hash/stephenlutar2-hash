import { db } from "@szl-holdings/db";
import { beaconMetricsTable, beaconProjectsTable } from "@szl-holdings/db/schema";
import { eq, desc } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const beaconTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_kpi_metrics",
      description: "List all KPI metrics with current values, units, change percentages, and categories for performance analysis",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_projects",
      description: "List all tracked projects with name, description, status, progress percentage, and platform association",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_metrics_by_category",
      description: "Get KPI metrics filtered by category to focus on a specific business area",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "The metric category to filter by (e.g., 'revenue', 'operations', 'security')" },
        },
        required: ["category"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project_health",
      description: "Generate a project health summary showing status distribution, average progress, and flagging at-risk projects (low progress or blocked status)",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_performance_dashboard",
      description: "Generate a comprehensive performance dashboard combining KPI trends, project status, and key anomalies that need attention",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function beaconExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "list_kpi_metrics": {
        const rows = await db.select().from(beaconMetricsTable).orderBy(beaconMetricsTable.category);
        return JSON.stringify(rows.map(m => ({ ...m, value: Number(m.value), change: Number(m.change) })));
      }
      case "list_projects": {
        const rows = await db.select().from(beaconProjectsTable).orderBy(beaconProjectsTable.createdAt);
        return JSON.stringify(rows);
      }
      case "get_metrics_by_category": {
        const rows = await db.select().from(beaconMetricsTable)
          .where(eq(beaconMetricsTable.category, args.category));
        return JSON.stringify(rows.map(m => ({ ...m, value: Number(m.value), change: Number(m.change) })));
      }
      case "get_project_health": {
        const projects = await db.select().from(beaconProjectsTable);
        const statusDist: Record<string, number> = {};
        let totalProgress = 0;
        const atRisk: typeof projects = [];
        for (const p of projects) {
          statusDist[p.status] = (statusDist[p.status] || 0) + 1;
          totalProgress += p.progress || 0;
          if ((p.progress || 0) < 30 || p.status === "blocked" || p.status === "at-risk") {
            atRisk.push(p);
          }
        }
        return JSON.stringify({
          totalProjects: projects.length,
          statusDistribution: statusDist,
          averageProgress: projects.length > 0 ? Math.round(totalProgress / projects.length) : 0,
          atRiskProjects: atRisk.map(p => ({ name: p.name, status: p.status, progress: p.progress, platform: p.platform })),
        });
      }
      case "get_performance_dashboard": {
        const [metrics, projects] = await Promise.all([
          db.select().from(beaconMetricsTable),
          db.select().from(beaconProjectsTable),
        ]);
        const improvingMetrics = metrics.filter(m => Number(m.change) > 0);
        const decliningMetrics = metrics.filter(m => Number(m.change) < 0);
        const categories = [...new Set(metrics.map(m => m.category))];
        const activeProjects = projects.filter(p => p.status === "active" || p.status === "in-progress");
        const completedProjects = projects.filter(p => p.status === "completed");
        return JSON.stringify({
          kpiSummary: {
            totalMetrics: metrics.length,
            improving: improvingMetrics.map(m => ({ name: m.name, change: Number(m.change), value: Number(m.value), unit: m.unit })),
            declining: decliningMetrics.map(m => ({ name: m.name, change: Number(m.change), value: Number(m.value), unit: m.unit })),
            categories,
          },
          projectSummary: {
            total: projects.length,
            active: activeProjects.length,
            completed: completedProjects.length,
          },
        });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
