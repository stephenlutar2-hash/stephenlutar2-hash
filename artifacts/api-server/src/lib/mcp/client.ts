import { spawn, type ChildProcess } from "child_process";
import type {
  McpServerConfig,
  McpServerInstance,
  McpServerStatus,
  McpToolDefinition,
  McpToolExecutionResult,
} from "./types.js";
import { resolveEnvVars, isServerConfigured } from "./registry.js";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcNotification {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

class McpStdioConnection {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    {
      resolve: (value: JsonRpcResponse) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private buffer = Buffer.alloc(0);
  private connected = false;

  constructor(private config: McpServerConfig) {}

  async connect(): Promise<void> {
    if (!this.config.command) {
      throw new Error(`No command specified for MCP server ${this.config.id}`);
    }

    const resolvedEnv = resolveEnvVars(this.config.env);
    const env = { ...process.env, ...resolvedEnv };

    this.process = spawn(this.config.command, this.config.args || [], {
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.process.stdout?.on("data", (data: Buffer) => {
      this.buffer = Buffer.concat([this.buffer, data]);
      this.processBuffer();
    });

    this.process.stderr?.on("data", (data: Buffer) => {
      console.warn(
        `[MCP:${this.config.id}] stderr: ${data.toString().trim()}`,
      );
    });

    this.process.on("exit", (code) => {
      console.log(`[MCP:${this.config.id}] process exited with code ${code}`);
      this.connected = false;
      this.rejectAllPending(
        new Error(`MCP server process exited with code ${code}`),
      );
    });

    this.process.on("error", (err) => {
      console.error(`[MCP:${this.config.id}] process error:`, err.message);
      this.connected = false;
    });

    await this.initialize();
    this.connected = true;
  }

  private processBuffer(): void {
    while (true) {
      const headerStr = this.buffer.toString("utf-8");
      const headerEnd = headerStr.indexOf("\r\n\r\n");
      if (headerEnd === -1) break;

      const headers = headerStr.slice(0, headerEnd);
      const contentLengthMatch = headers.match(/Content-Length:\s*(\d+)/i);
      if (!contentLengthMatch) {
        this.buffer = this.buffer.subarray(headerEnd + 4);
        continue;
      }

      const contentLength = parseInt(contentLengthMatch[1], 10);
      const bodyStart = headerEnd + 4;
      const totalNeeded = bodyStart + contentLength;

      if (this.buffer.length < totalNeeded) break;

      const bodyBytes = this.buffer.subarray(bodyStart, totalNeeded);
      this.buffer = this.buffer.subarray(totalNeeded);

      const body = bodyBytes.toString("utf-8");
      try {
        const msg = JSON.parse(body) as JsonRpcResponse;
        if (msg.id !== undefined && this.pendingRequests.has(msg.id)) {
          const pending = this.pendingRequests.get(msg.id)!;
          clearTimeout(pending.timer);
          this.pendingRequests.delete(msg.id);
          pending.resolve(msg);
        }
      } catch {
        console.warn(`[MCP:${this.config.id}] Failed to parse JSON-RPC message`);
      }
    }
  }

  private rejectAllPending(error: Error): void {
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(error);
      this.pendingRequests.delete(id);
    }
  }

  private writeMessage(message: JsonRpcRequest | JsonRpcNotification): void {
    if (!this.process?.stdin?.writable) {
      throw new Error(`MCP server ${this.config.id} stdin is not writable`);
    }

    const body = JSON.stringify(message);
    const bodyBytes = Buffer.from(body, "utf-8");
    const header = `Content-Length: ${bodyBytes.length}\r\n\r\n`;
    this.process.stdin.write(header);
    this.process.stdin.write(bodyBytes);
  }

  private sendNotification(
    method: string,
    params?: Record<string, unknown>,
  ): void {
    const notification: JsonRpcNotification = {
      jsonrpc: "2.0",
      method,
      ...(params && { params }),
    };
    this.writeMessage(notification);
  }

  private async sendRequest(
    method: string,
    params?: Record<string, unknown>,
    timeoutMs = 30000,
  ): Promise<JsonRpcResponse> {
    if (!this.process?.stdin?.writable) {
      throw new Error(`MCP server ${this.config.id} is not connected`);
    }

    const id = ++this.requestId;
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id,
      method,
      ...(params && { params }),
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(
          new Error(
            `MCP request to ${this.config.id} timed out after ${timeoutMs}ms`,
          ),
        );
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });
      this.writeMessage(request);
    });
  }

  private async initialize(): Promise<void> {
    const response = await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "szl-mcp-client", version: "1.0.0" },
    });

    if (response.error) {
      throw new Error(
        `MCP initialization failed for ${this.config.id}: ${response.error.message}`,
      );
    }

    this.sendNotification("notifications/initialized");
  }

  async listTools(): Promise<McpToolDefinition[]> {
    const response = await this.sendRequest("tools/list");
    if (response.error) {
      throw new Error(
        `Failed to list tools for ${this.config.id}: ${response.error.message}`,
      );
    }

    const result = response.result as { tools: McpToolDefinition[] };
    return result.tools || [];
  }

  async executeTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<McpToolExecutionResult> {
    const response = await this.sendRequest("tools/call", {
      name,
      arguments: args,
    });

    if (response.error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${response.error.message}`,
          },
        ],
        isError: true,
      };
    }

    return response.result as McpToolExecutionResult;
  }

  isConnected(): boolean {
    return this.connected && !!this.process && !this.process.killed;
  }

  disconnect(): void {
    this.connected = false;
    this.rejectAllPending(new Error("Connection closed"));
    if (this.process && !this.process.killed) {
      this.process.kill("SIGTERM");
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.process.kill("SIGKILL");
        }
      }, 5000);
    }
    this.process = null;
  }
}

class McpSseConnection {
  private tools: McpToolDefinition[] = [];
  private connected = false;

  constructor(private config: McpServerConfig) {}

  async connect(): Promise<void> {
    if (!this.config.url) {
      throw new Error(`No URL specified for SSE MCP server ${this.config.id}`);
    }

    const resolvedHeaders = resolveEnvVars(this.config.headers);
    const response = await fetch(this.config.url, {
      headers: {
        Accept: "text/event-stream",
        ...resolvedHeaders,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(
        `SSE connection to ${this.config.id} failed: ${response.status}`,
      );
    }

    this.connected = true;
  }

  async listTools(): Promise<McpToolDefinition[]> {
    if (!this.config.url) {
      throw new Error(`No URL for SSE server ${this.config.id}`);
    }

    const resolvedHeaders = resolveEnvVars(this.config.headers);
    const response = await fetch(`${this.config.url}/tools`, {
      headers: {
        "Content-Type": "application/json",
        ...resolvedHeaders,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to list tools from ${this.config.id}: ${response.status}`,
      );
    }

    const data = (await response.json()) as { tools: McpToolDefinition[] };
    this.tools = data.tools || [];
    return this.tools;
  }

  async executeTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<McpToolExecutionResult> {
    if (!this.config.url) {
      throw new Error(`No URL for SSE server ${this.config.id}`);
    }

    const resolvedHeaders = resolveEnvVars(this.config.headers);
    const response = await fetch(`${this.config.url}/tools/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...resolvedHeaders,
      },
      body: JSON.stringify({ name, arguments: args }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing tool ${name}: HTTP ${response.status}`,
          },
        ],
        isError: true,
      };
    }

    return (await response.json()) as McpToolExecutionResult;
  }

  isConnected(): boolean {
    return this.connected;
  }

  disconnect(): void {
    this.connected = false;
  }
}

export class McpClient {
  private instances = new Map<string, McpServerInstance>();
  private stdioConnections = new Map<string, McpStdioConnection>();
  private sseConnections = new Map<string, McpSseConnection>();

  async connectServer(config: McpServerConfig): Promise<McpServerInstance> {
    const existing = this.instances.get(config.id);
    if (existing && existing.status === "connected") {
      return existing;
    }

    const instance: McpServerInstance = {
      config,
      status: "connecting",
      tools: [],
      lastHealthCheck: null,
      error: null,
      connectedAt: null,
    };

    this.instances.set(config.id, instance);

    if (!isServerConfigured(config)) {
      instance.status = "disconnected";
      instance.error = `Missing required environment variables: ${config.requiredEnvVars?.filter((v) => !process.env[v]).join(", ")}`;
      return instance;
    }

    try {
      if (config.transport === "stdio") {
        const connection = new McpStdioConnection(config);
        await connection.connect();
        const tools = await connection.listTools();
        this.stdioConnections.set(config.id, connection);
        instance.status = "connected";
        instance.tools = tools;
        instance.connectedAt = new Date().toISOString();
        instance.lastHealthCheck = new Date().toISOString();
      } else if (config.transport === "sse") {
        const connection = new McpSseConnection(config);
        await connection.connect();
        const tools = await connection.listTools();
        this.sseConnections.set(config.id, connection);
        instance.status = "connected";
        instance.tools = tools;
        instance.connectedAt = new Date().toISOString();
        instance.lastHealthCheck = new Date().toISOString();
      }
    } catch (err) {
      instance.status = "error";
      instance.error = err instanceof Error ? err.message : "Connection failed";
      console.error(
        `[MCP] Failed to connect to ${config.id}:`,
        instance.error,
      );
    }

    return instance;
  }

  async executeTool(
    serverId: string,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<McpToolExecutionResult> {
    const instance = this.instances.get(serverId);
    if (!instance || instance.status !== "connected") {
      return {
        content: [
          {
            type: "text",
            text: `MCP server ${serverId} is not connected`,
          },
        ],
        isError: true,
      };
    }

    if (instance.config.transport === "stdio") {
      const conn = this.stdioConnections.get(serverId);
      if (!conn) {
        return {
          content: [{ type: "text", text: `No stdio connection for ${serverId}` }],
          isError: true,
        };
      }
      return conn.executeTool(toolName, args);
    } else {
      const conn = this.sseConnections.get(serverId);
      if (!conn) {
        return {
          content: [{ type: "text", text: `No SSE connection for ${serverId}` }],
          isError: true,
        };
      }
      return conn.executeTool(toolName, args);
    }
  }

  getServerInstance(serverId: string): McpServerInstance | undefined {
    return this.instances.get(serverId);
  }

  getAllInstances(): McpServerInstance[] {
    return Array.from(this.instances.values());
  }

  async healthCheck(serverId: string): Promise<boolean> {
    const instance = this.instances.get(serverId);
    if (!instance) return false;

    try {
      if (instance.config.transport === "stdio") {
        const conn = this.stdioConnections.get(serverId);
        if (!conn || !conn.isConnected()) {
          instance.status = "disconnected";
          return false;
        }
      } else {
        const conn = this.sseConnections.get(serverId);
        if (!conn || !conn.isConnected()) {
          instance.status = "disconnected";
          return false;
        }
      }
      instance.lastHealthCheck = new Date().toISOString();
      return true;
    } catch {
      instance.status = "error";
      return false;
    }
  }

  async disconnectServer(serverId: string): Promise<void> {
    const stdioConn = this.stdioConnections.get(serverId);
    if (stdioConn) {
      stdioConn.disconnect();
      this.stdioConnections.delete(serverId);
    }

    const sseConn = this.sseConnections.get(serverId);
    if (sseConn) {
      sseConn.disconnect();
      this.sseConnections.delete(serverId);
    }

    const instance = this.instances.get(serverId);
    if (instance) {
      instance.status = "disconnected";
    }
  }

  async disconnectAll(): Promise<void> {
    const ids = Array.from(this.instances.keys());
    await Promise.all(ids.map((id) => this.disconnectServer(id)));
  }
}

let globalClient: McpClient | null = null;

export function getMcpClient(): McpClient {
  if (!globalClient) {
    globalClient = new McpClient();
  }
  return globalClient;
}
