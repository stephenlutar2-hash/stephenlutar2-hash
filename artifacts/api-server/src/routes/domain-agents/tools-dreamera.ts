import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { dreameraContentTable, dreameraCampaignsTable } from "@szl-holdings/db/schema";
import { desc } from "drizzle-orm";

export const dreameraTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_content",
      description: "List content items created in DreamEra",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_campaigns",
      description: "List campaigns managed by DreamEra",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function dreameraExecuteTool(name: string, _args: Record<string, unknown>): Promise<string> {
  if (!isDatabaseAvailable()) return JSON.stringify({ error: "Database not available" });
  switch (name) {
    case "list_content": {
      const rows = await db.select().from(dreameraContentTable).orderBy(desc(dreameraContentTable.createdAt)).limit(20);
      return JSON.stringify({ content: rows, count: rows.length });
    }
    case "list_campaigns": {
      const rows = await db.select().from(dreameraCampaignsTable).orderBy(desc(dreameraCampaignsTable.createdAt)).limit(20);
      return JSON.stringify({ campaigns: rows, count: rows.length });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
