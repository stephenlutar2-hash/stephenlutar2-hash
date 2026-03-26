import { db } from "@szl-holdings/db";
import { incaProjectsTable, incaExperimentsTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
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
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
