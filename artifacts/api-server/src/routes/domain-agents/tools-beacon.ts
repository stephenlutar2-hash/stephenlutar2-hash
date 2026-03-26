import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { beaconMetricsTable, beaconProjectsTable } from "@szl-holdings/db/schema";
import { desc } from "drizzle-orm";

export const beaconTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_metrics",
      description: "List KPI metrics tracked by Beacon",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_projects",
      description: "List projects tracked in Beacon",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function beaconExecuteTool(name: string, _args: Record<string, unknown>): Promise<string> {
  if (!isDatabaseAvailable()) return JSON.stringify({ error: "Database not available" });
  switch (name) {
    case "list_metrics": {
      const rows = await db.select().from(beaconMetricsTable).orderBy(desc(beaconMetricsTable.createdAt)).limit(20);
      return JSON.stringify({ metrics: rows, count: rows.length });
    }
    case "list_projects": {
      const rows = await db.select().from(beaconProjectsTable).orderBy(desc(beaconProjectsTable.createdAt)).limit(20);
      return JSON.stringify({ projects: rows, count: rows.length });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
