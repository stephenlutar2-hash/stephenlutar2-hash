export type McpTransport = "stdio" | "sse";

export type McpServerStatus = "connected" | "disconnected" | "error" | "connecting";

export interface McpServerConfig {
  id: string;
  name: string;
  description: string;
  transport: McpTransport;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  requiredEnvVars?: string[];
  enabled: boolean;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface McpServerInstance {
  config: McpServerConfig;
  status: McpServerStatus;
  tools: McpToolDefinition[];
  lastHealthCheck: string | null;
  error: string | null;
  connectedAt: string | null;
}

export interface McpToolExecutionResult {
  content: Array<{
    type: string;
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface McpRegistryEntry {
  serverId: string;
  apps: string[];
}

export type AppDomain =
  | "inca"
  | "vessels"
  | "szl-holdings"
  | "carlota-jo"
  | "aegis"
  | "rosie"
  | "firestorm"
  | "beacon"
  | "nimbus"
  | "zeus"
  | "lyte"
  | "dreamera"
  | "dreamscape"
  | "alloy";
