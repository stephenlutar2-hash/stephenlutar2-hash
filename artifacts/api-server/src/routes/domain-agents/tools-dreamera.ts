import { db } from "@szl-holdings/db";
import { dreameraContentTable, dreameraCampaignsTable } from "@szl-holdings/db/schema";
import { eq, desc } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const dreameraTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_content",
      description: "List all content pieces with title, type, status, views, and engagement metrics for performance review",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_campaigns",
      description: "List all marketing campaigns with name, status, budget, reach, and date ranges for campaign management",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_content_by_type",
      description: "Get content filtered by type (e.g., 'article', 'video', 'social', 'blog') for type-specific analysis",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", description: "The content type to filter by" },
        },
        required: ["type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_content_performance",
      description: "Generate a content performance report showing top performers by views and engagement, content type distribution, and publishing status breakdown",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_campaign_analytics",
      description: "Generate campaign analytics showing budget allocation, reach metrics, active vs completed campaigns, and ROI indicators",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function dreameraExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "list_content": {
        const rows = await db.select().from(dreameraContentTable).orderBy(desc(dreameraContentTable.createdAt));
        return JSON.stringify(rows);
      }
      case "list_campaigns": {
        const rows = await db.select().from(dreameraCampaignsTable).orderBy(desc(dreameraCampaignsTable.createdAt));
        return JSON.stringify(rows.map(c => ({ ...c, budget: Number(c.budget) })));
      }
      case "get_content_by_type": {
        const rows = await db.select().from(dreameraContentTable)
          .where(eq(dreameraContentTable.type, args.type))
          .orderBy(desc(dreameraContentTable.createdAt));
        return JSON.stringify(rows);
      }
      case "get_content_performance": {
        const content = await db.select().from(dreameraContentTable);
        const byType: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        for (const c of content) {
          byType[c.type] = (byType[c.type] || 0) + 1;
          byStatus[c.status] = (byStatus[c.status] || 0) + 1;
        }
        const topByViews = [...content].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
        const topByEngagement = [...content].sort((a, b) => Number(b.engagement || 0) - Number(a.engagement || 0)).slice(0, 5);
        return JSON.stringify({
          totalContent: content.length,
          typeDistribution: byType,
          statusBreakdown: byStatus,
          topByViews: topByViews.map(c => ({ title: c.title, type: c.type, views: c.views })),
          topByEngagement: topByEngagement.map(c => ({ title: c.title, type: c.type, engagement: Number(c.engagement) })),
          totalViews: content.reduce((s, c) => s + (c.views || 0), 0),
          avgEngagement: content.length > 0 ? Math.round(content.reduce((s, c) => s + Number(c.engagement || 0), 0) / content.length * 100) / 100 : 0,
        });
      }
      case "get_campaign_analytics": {
        const campaigns = await db.select().from(dreameraCampaignsTable);
        const byStatus: Record<string, number> = {};
        let totalBudget = 0;
        let totalReach = 0;
        for (const c of campaigns) {
          byStatus[c.status] = (byStatus[c.status] || 0) + 1;
          totalBudget += Number(c.budget || 0);
          totalReach += c.reach || 0;
        }
        const activeCampaigns = campaigns.filter(c => c.status === "active");
        return JSON.stringify({
          totalCampaigns: campaigns.length,
          statusDistribution: byStatus,
          budgetAnalysis: {
            totalBudget,
            averageBudget: campaigns.length > 0 ? Math.round(totalBudget / campaigns.length) : 0,
          },
          reachAnalysis: {
            totalReach,
            averageReach: campaigns.length > 0 ? Math.round(totalReach / campaigns.length) : 0,
          },
          activeCampaigns: activeCampaigns.map(c => ({
            name: c.name,
            budget: Number(c.budget),
            reach: c.reach,
            startDate: c.startDate,
            endDate: c.endDate,
          })),
        });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
