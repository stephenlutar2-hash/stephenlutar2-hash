import { db } from "@szl-holdings/db";
import { incaProjectsTable, incaExperimentsTable } from "@szl-holdings/db/schema";
import { eq, desc } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const incaTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_inca_projects",
      description: "List all INCA AI research projects with their name, description, status, AI model, and accuracy percentage",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_inca_experiments",
      description: "List all INCA experiments with their name, hypothesis, result, status, accuracy, and linked project ID",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_project_experiments",
      description: "Get all experiments for a specific INCA project by project ID",
      parameters: {
        type: "object",
        properties: {
          projectId: { type: "integer", description: "The project ID to filter experiments by" },
        },
        required: ["projectId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_model_accuracy",
      description: "Compare accuracy across all projects and experiments, grouping by AI model to identify top-performing and underperforming models",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_pipeline_status",
      description: "Get experiment pipeline status summary showing counts by status (running, completed, failed, queued) and flagging stuck or anomalous runs",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_research_summary",
      description: "Generate a comprehensive research summary combining project health, experiment outcomes, model leaderboard, and recommended next steps",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function incaExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "list_inca_projects": {
        const rows = await db.select().from(incaProjectsTable).orderBy(incaProjectsTable.createdAt);
        return JSON.stringify(rows.map(p => ({ ...p, accuracy: Number(p.accuracy) })));
      }
      case "list_inca_experiments": {
        const rows = await db.select().from(incaExperimentsTable).orderBy(incaExperimentsTable.createdAt);
        return JSON.stringify(rows.map(e => ({ ...e, accuracy: Number(e.accuracy) })));
      }
      case "get_project_experiments": {
        const rows = await db.select().from(incaExperimentsTable)
          .where(eq(incaExperimentsTable.projectId, args.projectId))
          .orderBy(incaExperimentsTable.createdAt);
        return JSON.stringify(rows.map(e => ({ ...e, accuracy: Number(e.accuracy) })));
      }
      case "compare_model_accuracy": {
        const [projects, experiments] = await Promise.all([
          db.select().from(incaProjectsTable),
          db.select().from(incaExperimentsTable),
        ]);
        const modelStats: Record<string, { count: number; totalAccuracy: number; accuracies: number[] }> = {};
        for (const p of projects) {
          const model = p.aiModel || "unknown";
          if (!modelStats[model]) modelStats[model] = { count: 0, totalAccuracy: 0, accuracies: [] };
          modelStats[model].count++;
          const acc = Number(p.accuracy);
          modelStats[model].totalAccuracy += acc;
          modelStats[model].accuracies.push(acc);
        }
        const leaderboard = Object.entries(modelStats)
          .map(([model, stats]) => ({
            model,
            projectCount: stats.count,
            avgAccuracy: Math.round(stats.totalAccuracy / stats.count * 100) / 100,
            minAccuracy: Math.min(...stats.accuracies),
            maxAccuracy: Math.max(...stats.accuracies),
          }))
          .sort((a, b) => b.avgAccuracy - a.avgAccuracy);
        return JSON.stringify({
          leaderboard,
          totalProjects: projects.length,
          totalExperiments: experiments.length,
        });
      }
      case "get_pipeline_status": {
        const experiments = await db.select().from(incaExperimentsTable);
        const byStatus: Record<string, number> = {};
        for (const e of experiments) {
          byStatus[e.status] = (byStatus[e.status] || 0) + 1;
        }
        const running = experiments.filter(e => e.status === "running");
        const failed = experiments.filter(e => e.status === "failed");
        return JSON.stringify({
          totalExperiments: experiments.length,
          statusDistribution: byStatus,
          activelyRunning: running.map(e => ({ name: e.name, projectId: e.projectId, accuracy: Number(e.accuracy) })),
          recentFailures: failed.map(e => ({ name: e.name, projectId: e.projectId, result: e.result })),
        });
      }
      case "get_research_summary": {
        const [projects, experiments] = await Promise.all([
          db.select().from(incaProjectsTable),
          db.select().from(incaExperimentsTable),
        ]);
        const projectsByStatus: Record<string, number> = {};
        for (const p of projects) {
          projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1;
        }
        const avgProjectAccuracy = projects.length > 0
          ? Math.round(projects.reduce((s, p) => s + Number(p.accuracy), 0) / projects.length * 100) / 100
          : 0;
        const avgExperimentAccuracy = experiments.length > 0
          ? Math.round(experiments.reduce((s, e) => s + Number(e.accuracy), 0) / experiments.length * 100) / 100
          : 0;
        const topProjects = [...projects].sort((a, b) => Number(b.accuracy) - Number(a.accuracy)).slice(0, 3);
        const lowProjects = [...projects].sort((a, b) => Number(a.accuracy) - Number(b.accuracy)).slice(0, 3);
        return JSON.stringify({
          projectHealth: { total: projects.length, byStatus: projectsByStatus, avgAccuracy: avgProjectAccuracy },
          experimentHealth: { total: experiments.length, avgAccuracy: avgExperimentAccuracy },
          topPerformers: topProjects.map(p => ({ name: p.name, model: p.aiModel, accuracy: Number(p.accuracy) })),
          underperformers: lowProjects.map(p => ({ name: p.name, model: p.aiModel, accuracy: Number(p.accuracy) })),
        });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
