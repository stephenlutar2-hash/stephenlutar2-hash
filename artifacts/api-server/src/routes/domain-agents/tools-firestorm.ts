import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const firestormTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_scenarios",
      description: "List available security simulation scenarios in Firestorm",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_detection_coverage",
      description: "Get detection coverage matrix from Firestorm simulations",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function firestormExecuteTool(name: string, _args: Record<string, unknown>): Promise<string> {
  const base = process.env.API_BASE_URL || "http://localhost:3000";
  try {
    const endpoint = name === "list_scenarios" ? "/api/firestorm/scenarios"
      : name === "get_detection_coverage" ? "/api/firestorm/detections/coverage"
      : null;
    if (!endpoint) return JSON.stringify({ error: `Unknown tool: ${name}` });
    const res = await fetch(`${base}${endpoint}`, {
      headers: { Authorization: `Bearer internal-agent` },
    });
    return await res.text();
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}
