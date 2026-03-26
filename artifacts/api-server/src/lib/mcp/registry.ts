import type { McpServerConfig, McpRegistryEntry, AppDomain } from "./types.js";

export const MCP_SERVER_CONFIGS: McpServerConfig[] = [
  {
    id: "firecrawl",
    name: "Firecrawl",
    description: "Web data extraction and scraping — converts web pages into clean, structured data",
    transport: "stdio",
    command: "npx",
    args: ["-y", "firecrawl-mcp"],
    requiredEnvVars: ["FIRECRAWL_API_KEY"],
    env: { FIRECRAWL_API_KEY: "${FIRECRAWL_API_KEY}" },
    enabled: true,
  },
  {
    id: "tavily",
    name: "Tavily",
    description: "Advanced AI-powered web search for real-time information retrieval and research",
    transport: "stdio",
    command: "npx",
    args: ["-y", "tavily-mcp@latest"],
    requiredEnvVars: ["TAVILY_API_KEY"],
    env: { TAVILY_API_KEY: "${TAVILY_API_KEY}" },
    enabled: true,
  },
  {
    id: "brightdata",
    name: "Brightdata",
    description: "Deep web data extraction for comprehensive research and data collection",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@anthropic/mcp-server-brightdata"],
    requiredEnvVars: ["BRIGHTDATA_API_KEY"],
    env: { BRIGHTDATA_API_KEY: "${BRIGHTDATA_API_KEY}" },
    enabled: true,
  },
  {
    id: "markitdown",
    name: "Markitdown",
    description: "Convert PDFs, documents, and spreadsheets into analyzable markdown",
    transport: "stdio",
    command: "npx",
    args: ["-y", "markitdown-mcp"],
    requiredEnvVars: [],
    enabled: true,
  },
  {
    id: "chroma",
    name: "Chroma",
    description: "Vector database for similarity search, content discovery, and semantic matching",
    transport: "stdio",
    command: "npx",
    args: ["-y", "chroma-mcp"],
    requiredEnvVars: ["CHROMA_HOST"],
    env: { CHROMA_HOST: "${CHROMA_HOST}" },
    enabled: true,
  },
  {
    id: "apify",
    name: "Apify",
    description: "Scrape structured data from any website for research datasets",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@anthropic/mcp-server-apify"],
    requiredEnvVars: ["APIFY_API_KEY"],
    env: { APIFY_API_KEY: "${APIFY_API_KEY}" },
    enabled: true,
  },
  {
    id: "elasticsearch",
    name: "Elasticsearch",
    description: "Distributed search and analytics engine for log search, metrics, and threat correlation",
    transport: "stdio",
    command: "npx",
    args: ["-y", "elasticsearch-mcp-server"],
    requiredEnvVars: ["ELASTICSEARCH_URL"],
    env: {
      ELASTICSEARCH_URL: "${ELASTICSEARCH_URL}",
      ELASTICSEARCH_API_KEY: "${ELASTICSEARCH_API_KEY}",
    },
    enabled: true,
  },
  {
    id: "sentry",
    name: "Sentry",
    description: "Application error monitoring, performance tracking, and incident correlation",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@sentry/mcp-server"],
    requiredEnvVars: ["SENTRY_AUTH_TOKEN"],
    env: { SENTRY_AUTH_TOKEN: "${SENTRY_AUTH_TOKEN}" },
    enabled: true,
  },
  {
    id: "playwright",
    name: "Playwright",
    description: "Browser automation for testing, web scraping, and interaction simulation",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@anthropic/mcp-server-playwright"],
    requiredEnvVars: [],
    enabled: true,
  },
  {
    id: "dbhub",
    name: "DBHub",
    description: "Direct database querying and schema exploration for analytics and reporting",
    transport: "stdio",
    command: "npx",
    args: ["-y", "dbhub-mcp"],
    requiredEnvVars: ["DBHUB_DATABASE_URL"],
    env: { DBHUB_DATABASE_URL: "${DBHUB_DATABASE_URL}" },
    enabled: true,
  },
  {
    id: "netdata",
    name: "Netdata",
    description: "Real-time infrastructure metrics, ML-based anomaly detection, and system monitoring",
    transport: "stdio",
    command: "npx",
    args: ["-y", "netdata-mcp"],
    requiredEnvVars: ["NETDATA_URL"],
    env: { NETDATA_URL: "${NETDATA_URL}" },
    enabled: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Access Notion workspaces — read/write pages, databases, and knowledge bases",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@anthropic/mcp-server-notion"],
    requiredEnvVars: ["NOTION_API_KEY"],
    env: { NOTION_API_KEY: "${NOTION_API_KEY}" },
    enabled: true,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Repository management, PR activity, code search, and issue tracking",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    requiredEnvVars: ["GITHUB_PERSONAL_ACCESS_TOKEN"],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PERSONAL_ACCESS_TOKEN}" },
    enabled: true,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing, subscription management, and financial data",
    transport: "stdio",
    command: "npx",
    args: ["-y", "@stripe/mcp"],
    requiredEnvVars: ["STRIPE_SECRET_KEY"],
    env: { STRIPE_SECRET_KEY: "${STRIPE_SECRET_KEY}" },
    enabled: true,
  },
];

export const MCP_APP_MAPPINGS: McpRegistryEntry[] = [
  {
    serverId: "firecrawl",
    apps: ["inca", "vessels", "firestorm", "alloy"],
  },
  {
    serverId: "tavily",
    apps: ["inca", "vessels", "carlota-jo", "alloy"],
  },
  {
    serverId: "brightdata",
    apps: ["inca", "alloy"],
  },
  {
    serverId: "markitdown",
    apps: ["inca", "vessels", "carlota-jo", "dreamera", "dreamscape", "alloy"],
  },
  {
    serverId: "chroma",
    apps: ["inca", "dreamera", "dreamscape", "alloy"],
  },
  {
    serverId: "apify",
    apps: ["inca", "vessels", "alloy"],
  },
  {
    serverId: "elasticsearch",
    apps: ["aegis", "rosie", "beacon", "nimbus", "zeus", "lyte", "alloy"],
  },
  {
    serverId: "sentry",
    apps: ["aegis", "rosie", "beacon", "nimbus", "zeus", "lyte", "alloy"],
  },
  {
    serverId: "playwright",
    apps: ["aegis", "rosie", "firestorm", "alloy"],
  },
  {
    serverId: "dbhub",
    apps: ["beacon", "nimbus", "zeus", "lyte", "alloy"],
  },
  {
    serverId: "netdata",
    apps: ["lyte", "alloy"],
  },
  {
    serverId: "notion",
    apps: ["szl-holdings", "carlota-jo", "alloy"],
  },
  {
    serverId: "github",
    apps: ["szl-holdings", "alloy"],
  },
  {
    serverId: "stripe",
    apps: ["szl-holdings", "alloy"],
  },
];

export function getServerConfig(serverId: string): McpServerConfig | undefined {
  return MCP_SERVER_CONFIGS.find((s) => s.id === serverId);
}

export function getServersForApp(app: AppDomain): McpServerConfig[] {
  const serverIds = MCP_APP_MAPPINGS
    .filter((m) => m.apps.includes(app))
    .map((m) => m.serverId);

  return MCP_SERVER_CONFIGS.filter((s) => serverIds.includes(s.id));
}

export function getAppsForServer(serverId: string): string[] {
  const entry = MCP_APP_MAPPINGS.find((m) => m.serverId === serverId);
  return entry?.apps ?? [];
}

export function isServerConfigured(config: McpServerConfig): boolean {
  if (!config.requiredEnvVars || config.requiredEnvVars.length === 0) {
    return true;
  }
  return config.requiredEnvVars.every((envVar) => !!process.env[envVar]);
}

export function resolveEnvVars(
  envMap: Record<string, string> | undefined,
): Record<string, string> {
  if (!envMap) return {};
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(envMap)) {
    const match = value.match(/^\$\{(\w+)\}$/);
    if (match) {
      resolved[key] = process.env[match[1]] || "";
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}
