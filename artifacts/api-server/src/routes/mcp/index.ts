import { Router, type Request, type Response } from "express";
import {
  getMcpClient,
  MCP_SERVER_CONFIGS,
  MCP_APP_MAPPINGS,
  getServerConfig,
  getServersForApp,
  getAppsForServer,
  isServerConfigured,
  mcpToolsToOpenAI,
  type AppDomain,
} from "../../lib/mcp/index.js";
import { requireRole } from "../../lib/rbac.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.use("/mcp", requireAuth);

router.get("/mcp/registry", requireRole("operator"), (_req: Request, res: Response) => {
  try {
    const client = getMcpClient();
    const servers = MCP_SERVER_CONFIGS.map((config) => {
      const instance = client.getServerInstance(config.id);
      const configured = isServerConfigured(config);
      const apps = getAppsForServer(config.id);

      return {
        id: config.id,
        name: config.name,
        description: config.description,
        transport: config.transport,
        enabled: config.enabled,
        configured,
        missingEnvVars: configured
          ? []
          : (config.requiredEnvVars || []).filter((v) => !process.env[v]),
        status: instance?.status || (configured ? "disconnected" : "unconfigured"),
        toolCount: instance?.tools.length || 0,
        connectedAt: instance?.connectedAt || null,
        lastHealthCheck: instance?.lastHealthCheck || null,
        error: instance?.error || null,
        apps,
      };
    });

    const summary = {
      total: servers.length,
      connected: servers.filter((s) => s.status === "connected").length,
      configured: servers.filter((s) => s.configured).length,
      unconfigured: servers.filter((s) => !s.configured).length,
      errors: servers.filter((s) => s.status === "error").length,
    };

    res.json({
      servers,
      summary,
      mappings: MCP_APP_MAPPINGS,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message, code: "REGISTRY_ERROR" });
  }
});

router.get("/mcp/servers/:id/tools", requireRole("operator"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = getServerConfig(id);

    if (!config) {
      res.status(404).json({ error: `MCP server '${id}' not found`, code: "SERVER_NOT_FOUND" });
      return;
    }

    const client = getMcpClient();
    const instance = client.getServerInstance(id);

    if (!instance || instance.status !== "connected") {
      res.json({
        serverId: id,
        serverName: config.name,
        status: instance?.status || "disconnected",
        tools: [],
        openaiFormat: [],
        message: `Server is ${instance?.status || "not connected"}. Tools will be available once connected.`,
      });
      return;
    }

    const openaiTools = mcpToolsToOpenAI(id, instance.tools);

    res.json({
      serverId: id,
      serverName: config.name,
      status: "connected",
      tools: instance.tools,
      openaiFormat: openaiTools,
      toolCount: instance.tools.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message, code: "TOOLS_FETCH_ERROR" });
  }
});

router.post("/mcp/servers/:id/execute", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tool, arguments: args } = req.body || {};

    if (!tool) {
      res.status(400).json({ error: "Missing 'tool' in request body", code: "INVALID_REQUEST" });
      return;
    }

    const config = getServerConfig(id);
    if (!config) {
      res.status(404).json({ error: `MCP server '${id}' not found`, code: "SERVER_NOT_FOUND" });
      return;
    }

    const client = getMcpClient();
    const instance = client.getServerInstance(id);

    if (!instance || instance.status !== "connected") {
      res.status(503).json({
        error: `MCP server '${id}' is not connected`,
        status: instance?.status || "disconnected",
        code: "SERVER_NOT_CONNECTED",
      });
      return;
    }

    const knownTools = instance.tools.map((t) => t.name);
    if (!knownTools.includes(tool)) {
      res.status(400).json({
        error: `Tool '${tool}' not found on server '${id}'. Available: ${knownTools.join(", ")}`,
        code: "TOOL_NOT_FOUND",
      });
      return;
    }

    const result = await client.executeTool(id, tool, args || {});
    res.json({
      serverId: id,
      tool,
      result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message, code: "EXECUTION_ERROR" });
  }
});

router.post("/mcp/servers/:id/connect", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = getServerConfig(id);

    if (!config) {
      res.status(404).json({ error: `MCP server '${id}' not found`, code: "SERVER_NOT_FOUND" });
      return;
    }

    if (!isServerConfigured(config)) {
      const missing = (config.requiredEnvVars || []).filter((v) => !process.env[v]);
      res.status(400).json({
        error: `Missing required environment variables: ${missing.join(", ")}`,
        code: "MISSING_ENV_VARS",
        missingEnvVars: missing,
      });
      return;
    }

    const client = getMcpClient();
    const instance = await client.connectServer(config);

    res.json({
      serverId: id,
      status: instance.status,
      toolCount: instance.tools.length,
      tools: instance.tools.map((t) => ({ name: t.name, description: t.description })),
      connectedAt: instance.connectedAt,
      error: instance.error,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message, code: "CONNECTION_ERROR" });
  }
});

router.post("/mcp/servers/:id/disconnect", requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = getServerConfig(id);

    if (!config) {
      res.status(404).json({ error: `MCP server '${id}' not found`, code: "SERVER_NOT_FOUND" });
      return;
    }

    const client = getMcpClient();
    await client.disconnectServer(id);

    res.json({ serverId: id, status: "disconnected" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message, code: "DISCONNECT_ERROR" });
  }
});

router.get("/mcp/servers/:id/health", requireRole("operator"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = getServerConfig(id);

    if (!config) {
      res.status(404).json({ error: `MCP server '${id}' not found`, code: "SERVER_NOT_FOUND" });
      return;
    }

    const client = getMcpClient();
    const healthy = await client.healthCheck(id);
    const instance = client.getServerInstance(id);

    res.json({
      serverId: id,
      healthy,
      status: instance?.status || "disconnected",
      lastHealthCheck: instance?.lastHealthCheck,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message, code: "HEALTH_CHECK_ERROR" });
  }
});

router.get("/mcp/apps/:app/tools", requireRole("operator"), (req: Request, res: Response) => {
  try {
    const app = req.params.app as AppDomain;
    const serverConfigs = getServersForApp(app);
    const client = getMcpClient();

    const allTools: Array<{
      serverId: string;
      serverName: string;
      tool: { name: string; description: string };
      openaiName: string;
    }> = [];

    for (const config of serverConfigs) {
      const instance = client.getServerInstance(config.id);
      if (instance && instance.status === "connected") {
        const openaiTools = mcpToolsToOpenAI(config.id, instance.tools);
        instance.tools.forEach((tool, idx) => {
          allTools.push({
            serverId: config.id,
            serverName: config.name,
            tool: { name: tool.name, description: tool.description },
            openaiName: openaiTools[idx]?.function?.name || tool.name,
          });
        });
      }
    }

    res.json({
      app,
      servers: serverConfigs.map((c) => ({
        id: c.id,
        name: c.name,
        status: client.getServerInstance(c.id)?.status || "disconnected",
        configured: isServerConfigured(c),
      })),
      tools: allTools,
      toolCount: allTools.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message, code: "APP_TOOLS_ERROR" });
  }
});

export default router;
