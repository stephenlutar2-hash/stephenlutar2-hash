import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const staticInfoTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_platform_info",
      description: "Get information about this platform",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

const platformInfo: Record<string, object> = {
  "readiness-report": {
    platform: "Readiness Report",
    description: "Project readiness assessment platform",
    features: [
      "Comprehensive readiness scoring with weighted criteria",
      "Risk matrices and heatmaps",
      "Go/no-go decision support frameworks",
      "Launch checklist management",
      "Stakeholder readiness tracking",
    ],
  },
  career: {
    platform: "Career",
    description: "Professional portfolio and career showcase for SZL Holdings leadership",
    features: [
      "Professional profile and achievements",
      "Technology vision and leadership philosophy",
      "Career timeline and milestones",
      "Skills and expertise showcase",
    ],
  },
  "apps-showcase": {
    platform: "Apps Showcase",
    description: "Centralized catalog of all SZL Holdings platforms",
    features: [
      "Full catalog of 18 platforms with filtering",
      "Category-based navigation (Security, Analytics, Operations, AI/ML, Platform, Business)",
      "Maturity and status tracking",
      "Direct links to all platforms",
      "Pricing tier comparison",
    ],
  },
};

export function createStaticExecuteTool(appKey: string) {
  return async function staticExecuteTool(name: string, _args: Record<string, unknown>): Promise<string> {
    if (name === "get_platform_info") {
      return JSON.stringify(platformInfo[appKey] || { error: "Platform info not configured" });
    }
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  };
}
