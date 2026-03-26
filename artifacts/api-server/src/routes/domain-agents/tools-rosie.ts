import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { rosieThreatsTable, rosieIncidentsTable, rosieScansTable } from "@szl-holdings/db/schema";
import { desc } from "drizzle-orm";

export const rosieTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_threats",
      description: "List recent security threats detected by ROSIE",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_incidents",
      description: "List recent security incidents tracked by ROSIE",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_scans",
      description: "List recent security scans performed by ROSIE",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function rosieExecuteTool(name: string, _args: Record<string, unknown>): Promise<string> {
  if (!isDatabaseAvailable()) return JSON.stringify({ error: "Database not available" });
  switch (name) {
    case "list_threats": {
      const rows = await db.select().from(rosieThreatsTable).orderBy(desc(rosieThreatsTable.createdAt)).limit(20);
      return JSON.stringify({ threats: rows, count: rows.length });
    }
    case "list_incidents": {
      const rows = await db.select().from(rosieIncidentsTable).orderBy(desc(rosieIncidentsTable.createdAt)).limit(20);
      return JSON.stringify({ incidents: rows, count: rows.length });
    }
    case "list_scans": {
      const rows = await db.select().from(rosieScansTable).orderBy(desc(rosieScansTable.createdAt)).limit(20);
      return JSON.stringify({ scans: rows, count: rows.length });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
