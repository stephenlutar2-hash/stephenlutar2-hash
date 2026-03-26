import { db } from "@szl-holdings/db";
import {
  beaconMetricsTable,
  beaconProjectsTable,
  incaProjectsTable,
  rosieThreatsTable,
  rosieIncidentsTable,
} from "@szl-holdings/db/schema";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

const APP_LINKS: Record<string, { name: string; path: string; description: string; category: string }> = {
  rosie: { name: "ROSIE", path: "/rosie/", description: "AI-powered cybersecurity threat detection and incident response", category: "security" },
  aegis: { name: "Aegis", path: "/aegis/", description: "Governance, compliance, and defensive security platform", category: "security" },
  firestorm: { name: "Firestorm", path: "/firestorm/", description: "Offensive security simulation and penetration testing", category: "security" },
  beacon: { name: "Beacon", path: "/beacon/", description: "Decision intelligence dashboard with KPI metrics and analytics", category: "analytics" },
  nimbus: { name: "Nimbus", path: "/nimbus/", description: "Predictive AI platform with forecasting and trend analysis", category: "analytics" },
  inca: { name: "INCA", path: "/inca/", description: "AI research and experimentation platform", category: "research" },
  zeus: { name: "Zeus", path: "/zeus/", description: "Modular core architecture and infrastructure orchestration", category: "infrastructure" },
  alloyscape: { name: "AlloyScape", path: "/alloyscape/", description: "Operations command center for the Alloy AI engine", category: "infrastructure" },
  dreamera: { name: "DreamEra", path: "/dreamera/", description: "AI storytelling and content creation platform", category: "creative" },
  dreamscape: { name: "Dreamscape", path: "/dreamscape/", description: "Premium world-building and creative systems platform", category: "creative" },
  vessels: { name: "Vessels", path: "/vessels/", description: "Maritime fleet intelligence and logistics platform", category: "maritime" },
  "carlota-jo": { name: "Carlota Jo Consulting", path: "/carlota-jo/", description: "Strategic technology consulting firm", category: "consulting" },
  lutar: { name: "Lutar", path: "/lutar/", description: "Personal command center and empire management", category: "executive" },
  lyte: { name: "Lyte", path: "/lyte/", description: "Executive observability command center", category: "executive" },
  "readiness-report": { name: "Readiness Report", path: "/readiness-report/", description: "Project readiness assessment and risk scoring", category: "public" },
  "szl-holdings": { name: "SZL Holdings", path: "/szl-holdings/", description: "Corporate portfolio hub and ecosystem overview", category: "public" },
  career: { name: "Career", path: "/career/", description: "Personal portfolio for Stephen Lutar, founder and CEO", category: "public" },
  "apps-showcase": { name: "Apps Showcase", path: "/apps-showcase/", description: "Interactive portfolio showcasing all SZL Holdings platforms", category: "public" },
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
            description: "The platform identifier. One of: rosie, aegis, firestorm, beacon, nimbus, inca, zeus, alloyscape, dreamera, dreamscape, vessels, carlota-jo, lutar, lyte, readiness-report, szl-holdings, career, apps-showcase",
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
      description: "List all available SZL Holdings platforms with their names, descriptions, categories, and links. Use this when the user asks what platforms are available or wants an overview.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "search_apps",
      description: "Search for SZL Holdings platforms by keyword or category (security, analytics, research, infrastructure, creative, maritime, consulting, executive, public)",
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
  {
    type: "function",
    function: {
      name: "get_portfolio_health",
      description: "Get a real-time portfolio health snapshot showing live metrics from security, analytics, research, and infrastructure platforms",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_ecosystem_stats",
      description: "Get ecosystem-wide statistics including total platforms, categories, and key operational metrics from live data sources",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function szlHoldingsExecuteTool(name: string, args: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "get_app_link": {
        const key = args.app_key as string;
        const app = APP_LINKS[key];
        if (!app) {
          return JSON.stringify({ error: `Unknown app: ${key}. Available: ${Object.keys(APP_LINKS).join(", ")}` });
        }
        return JSON.stringify({ name: app.name, path: app.path, description: app.description, category: app.category, link: app.path });
      }
      case "list_all_apps": {
        const apps = Object.entries(APP_LINKS).map(([key, app]) => ({
          key,
          name: app.name,
          path: app.path,
          description: app.description,
          category: app.category,
        }));
        const categories = [...new Set(Object.values(APP_LINKS).map(a => a.category))];
        return JSON.stringify({ platforms: apps, count: apps.length, categories });
      }
      case "search_apps": {
        const query = (args.query as string || "").toLowerCase();
        const matches = Object.entries(APP_LINKS)
          .filter(([key, app]) =>
            key.includes(query) ||
            app.name.toLowerCase().includes(query) ||
            app.description.toLowerCase().includes(query) ||
            app.category.includes(query)
          )
          .map(([key, app]) => ({
            key,
            name: app.name,
            path: app.path,
            description: app.description,
            category: app.category,
          }));
        return JSON.stringify({ results: matches, count: matches.length, query });
      }
      case "get_portfolio_health": {
        const [threats, incidents, metrics, projects, incaProjects] = await Promise.all([
          db.select().from(rosieThreatsTable),
          db.select().from(rosieIncidentsTable),
          db.select().from(beaconMetricsTable),
          db.select().from(beaconProjectsTable),
          db.select().from(incaProjectsTable),
        ]);
        const criticalThreats = threats.filter(t => t.severity === "critical" || t.severity === "high");
        const openIncidents = incidents.filter(i => !i.resolved);
        const improvingMetrics = metrics.filter(m => Number(m.change) > 0).length;
        const avgAccuracy = incaProjects.length > 0
          ? Math.round(incaProjects.reduce((s, p) => s + Number(p.accuracy), 0) / incaProjects.length * 100) / 100
          : 0;
        return JSON.stringify({
          security: { totalThreats: threats.length, critical: criticalThreats.length, openIncidents: openIncidents.length },
          analytics: { kpiCount: metrics.length, improving: improvingMetrics, projectCount: projects.length },
          research: { activeProjects: incaProjects.length, avgModelAccuracy: avgAccuracy },
          portfolioSize: Object.keys(APP_LINKS).length,
        });
      }
      case "get_ecosystem_stats": {
        const categories: Record<string, string[]> = {};
        for (const [key, app] of Object.entries(APP_LINKS)) {
          if (!categories[app.category]) categories[app.category] = [];
          categories[app.category].push(app.name);
        }
        const [metrics, projects] = await Promise.all([
          db.select().from(beaconMetricsTable),
          db.select().from(beaconProjectsTable),
        ]);
        return JSON.stringify({
          totalPlatforms: Object.keys(APP_LINKS).length,
          byCategory: Object.entries(categories).map(([cat, apps]) => ({ category: cat, count: apps.length, platforms: apps })),
          liveMetrics: { kpiTracked: metrics.length, projectsManaged: projects.length },
          aiEngine: "Alloy Nuro Engine (GPT-5.2)",
          capabilities: ["Security Monitoring", "Predictive Analytics", "Maritime Intelligence", "AI Research", "Creative Systems", "Infrastructure Operations", "Executive Observability"],
        });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
