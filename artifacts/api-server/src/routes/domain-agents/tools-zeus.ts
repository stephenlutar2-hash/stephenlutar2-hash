import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { zeusModulesTable, zeusLogsTable } from "@szl-holdings/db/schema";
import { desc } from "drizzle-orm";

export const zeusTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_modules",
      description: "List all Zeus system modules and their status",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_logs",
      description: "List recent Zeus system logs",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function zeusExecuteTool(name: string, _args: Record<string, unknown>): Promise<string> {
  if (!isDatabaseAvailable()) return JSON.stringify({ error: "Database not available" });
  switch (name) {
    case "list_modules": {
      const rows = await db.select().from(zeusModulesTable).orderBy(desc(zeusModulesTable.createdAt)).limit(20);
      return JSON.stringify({ modules: rows, count: rows.length });
    }
    case "list_logs": {
      const rows = await db.select().from(zeusLogsTable).orderBy(desc(zeusLogsTable.createdAt)).limit(20);
      return JSON.stringify({ logs: rows, count: rows.length });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
