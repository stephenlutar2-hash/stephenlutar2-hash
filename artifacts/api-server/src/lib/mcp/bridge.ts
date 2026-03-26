import type { ChatCompletionTool } from "openai/resources/chat/completions";
import type { McpToolDefinition, McpToolExecutionResult } from "./types.js";
import { getMcpClient } from "./client.js";

const toolNameMap = new Map<string, { serverId: string; toolName: string }>();

export function mcpToolToOpenAI(
  serverId: string,
  tool: McpToolDefinition,
): ChatCompletionTool {
  const prefixedName = `mcp_${serverId}_${tool.name}`;
  const safeName = prefixedName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);

  toolNameMap.set(safeName, { serverId, toolName: tool.name });

  return {
    type: "function",
    function: {
      name: safeName,
      description: `[${serverId}] ${tool.description || tool.name}`,
      parameters: tool.inputSchema || {
        type: "object",
        properties: {},
      },
    },
  };
}

export function mcpToolsToOpenAI(
  serverId: string,
  tools: McpToolDefinition[],
): ChatCompletionTool[] {
  return tools.map((tool) => mcpToolToOpenAI(serverId, tool));
}

export function parseMcpToolName(
  functionName: string,
): { serverId: string; toolName: string } | null {
  return toolNameMap.get(functionName) || null;
}

export function mcpResultToString(result: McpToolExecutionResult): string {
  if (!result.content || result.content.length === 0) {
    return result.isError
      ? JSON.stringify({ error: "Tool execution returned no content" })
      : JSON.stringify({ result: "Tool executed successfully with no output" });
  }

  const textParts = result.content
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text!);

  if (textParts.length > 0) {
    return textParts.join("\n");
  }

  return JSON.stringify(result.content);
}

export async function executeMcpTool(
  functionName: string,
  args: Record<string, unknown>,
): Promise<string | null> {
  const parsed = parseMcpToolName(functionName);
  if (!parsed) return null;

  const client = getMcpClient();
  const result = await client.executeTool(
    parsed.serverId,
    parsed.toolName,
    args,
  );
  return mcpResultToString(result);
}

export function isMcpTool(functionName: string): boolean {
  return toolNameMap.has(functionName);
}
