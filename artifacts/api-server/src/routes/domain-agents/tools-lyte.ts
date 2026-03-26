import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const lyteTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_dashboard_summary",
      description: "Get the Lyte dashboard summary with signals overview and health metrics",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_executive_scorecard",
      description: "Get the executive scorecard with KPIs across all platforms",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_slo_status",
      description: "Get SLO (Service Level Objective) status across all services",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function lyteExecuteTool(name: string, _args: Record<string, unknown>): Promise<string> {
  const base = process.env.API_BASE_URL || "http://localhost:3000";
  try {
    const endpoint = name === "get_dashboard_summary" ? "/api/lyte/dashboard/summary"
      : name === "get_executive_scorecard" ? "/api/lyte/executive/scorecard"
      : name === "get_slo_status" ? "/api/lyte/slo"
      : null;
    if (!endpoint) return JSON.stringify({ error: `Unknown tool: ${name}` });
    const res = await fetch(`${base}${endpoint}`);
    return await res.text();
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}
