import type { ChatCompletionTool } from "openai/resources/chat/completions";

const APP_LINKS: Record<string, { name: string; path: string; description: string }> = {
  rosie: { name: "ROSIE", path: "/rosie/", description: "AI-powered cybersecurity threat detection and incident response" },
  aegis: { name: "Aegis", path: "/aegis/", description: "Defensive security platform with zero-trust architecture" },
  firestorm: { name: "Firestorm", path: "/firestorm/", description: "Offensive security and penetration testing platform" },
  beacon: { name: "Beacon", path: "/beacon/", description: "Decision intelligence dashboard with KPI metrics and analytics" },
  nimbus: { name: "Nimbus", path: "/nimbus/", description: "Predictive AI platform with forecasting and trend analysis" },
  inca: { name: "INCA", path: "/inca/", description: "AI research and experimentation platform" },
  zeus: { name: "Zeus", path: "/zeus/", description: "Modular core architecture and infrastructure orchestration" },
  alloyscape: { name: "Alloyscape", path: "/alloyscape/", description: "Infrastructure operations for the Alloy AI engine" },
  dreamera: { name: "DreamEra", path: "/dreamera/", description: "AI storytelling and content creation platform" },
  vessels: { name: "Vessels", path: "/vessels/", description: "Maritime fleet intelligence platform" },
  "carlota-jo": { name: "Carlota Jo Consulting", path: "/carlota-jo/", description: "Strategic consulting firm" },
  lutar: { name: "Lutar", path: "/lutar/", description: "Personal command center for financial KPIs and strategic planning" },
  lyte: { name: "Lyte", path: "/lyte/", description: "Executive observability command center" },
  dreamscape: { name: "Dreamscape", path: "/dreamscape/", description: "Creative systems platform for ideation and content pipelines" },
  "readiness-report": { name: "Readiness Report", path: "/readiness-report/", description: "Project readiness assessment and risk scoring" },
  "szl-holdings": { name: "SZL Holdings", path: "/szl-holdings/", description: "Corporate portfolio hub and ecosystem overview" },
  career: { name: "Career", path: "/career/", description: "Personal portfolio for Stephen Lutar, founder and CEO" },
  "apps-showcase": { name: "Apps Showcase", path: "/apps-showcase/", description: "Interactive portfolio showcasing all SZL Holdings platforms" },
};

export const szlHoldingsTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_app_link",
      description: "Get the direct link to a specific SZL Holdings platform or app. Use this when the user wants to visit, explore, or access a specific platform.",
      parameters: {
        type: "object",
        properties: {
          app_key: {
            type: "string",
            description: "The platform identifier. One of: rosie, aegis, firestorm, beacon, nimbus, inca, zeus, alloyscape, dreamera, vessels, carlota-jo, lutar, lyte, dreamscape, readiness-report, szl-holdings, career, apps-showcase",
            enum: Object.keys(APP_LINKS),
          },
        },
        required: ["app_key"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_all_apps",
      description: "List all available SZL Holdings platforms with their names, descriptions, and links. Use this when the user asks what platforms are available or wants an overview.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_apps",
      description: "Search for SZL Holdings platforms by keyword or category. Use when a user describes a need and you want to find matching platforms.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query — a keyword, category, or need description (e.g., 'security', 'AI', 'maritime', 'analytics')",
          },
        },
        required: ["query"],
      },
    },
  },
];

export async function szlHoldingsExecuteTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case "get_app_link": {
      const key = args.app_key as string;
      const app = APP_LINKS[key];
      if (!app) {
        return JSON.stringify({ error: `Unknown app: ${key}. Available: ${Object.keys(APP_LINKS).join(", ")}` });
      }
      return JSON.stringify({ name: app.name, path: app.path, description: app.description, link: app.path });
    }
    case "list_all_apps": {
      const apps = Object.entries(APP_LINKS).map(([key, app]) => ({
        key,
        name: app.name,
        path: app.path,
        description: app.description,
      }));
      return JSON.stringify({ platforms: apps, count: apps.length });
    }
    case "search_apps": {
      const query = (args.query as string || "").toLowerCase();
      const matches = Object.entries(APP_LINKS)
        .filter(([key, app]) =>
          key.includes(query) ||
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query)
        )
        .map(([key, app]) => ({
          key,
          name: app.name,
          path: app.path,
          description: app.description,
        }));
      return JSON.stringify({ results: matches, count: matches.length, query });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
