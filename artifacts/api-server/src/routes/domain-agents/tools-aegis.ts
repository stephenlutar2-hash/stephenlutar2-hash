import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const aegisTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_posture_score",
      description: "Get the current security posture score from Aegis",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_vulnerability_summary",
      description: "Get vulnerability summary from Aegis scans",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_compliance_status",
      description: "Get compliance status across all frameworks monitored by Aegis",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function aegisExecuteTool(name: string, _args: Record<string, unknown>): Promise<string> {
  const base = process.env.API_BASE_URL || "http://localhost:3000";
  try {
    const endpoint = name === "get_posture_score" ? "/api/aegis/posture-score"
      : name === "get_vulnerability_summary" ? "/api/aegis/vulnerability-summary"
      : name === "get_compliance_status" ? "/api/aegis/compliance"
      : null;
    if (!endpoint) return JSON.stringify({ error: `Unknown tool: ${name}` });
    const res = await fetch(`${base}${endpoint}`);
    return await res.text();
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}
