import { db } from "@szl-holdings/db";
import { dreameraContentTable, dreameraCampaignsTable } from "@szl-holdings/db/schema";
import { eq, desc, asc, like, count, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
  type?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  label?: string;
}

function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export class DreameraService {
  async listContent() {
    const content = await db.select().from(dreameraContentTable).orderBy(dreameraContentTable.createdAt);
    return content.map(c => ({ ...c, engagement: Number(c.engagement) }));
  }

  async listContentPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (params.status) conditions.push(eq(dreameraContentTable.status, params.status));
    if (params.type) conditions.push(eq(dreameraContentTable.type, params.type));
    if (params.search) conditions.push(like(dreameraContentTable.title, `%${params.search}%`));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortCol = params.sortBy === "title" ? dreameraContentTable.title
      : params.sortBy === "status" ? dreameraContentTable.status
      : params.sortBy === "views" ? dreameraContentTable.views
      : params.sortBy === "engagement" ? dreameraContentTable.engagement
      : params.sortBy === "type" ? dreameraContentTable.type
      : dreameraContentTable.createdAt;
    const orderFn = params.sortOrder === "desc" ? desc : asc;

    const [totalResult] = await db.select({ total: count() }).from(dreameraContentTable).where(where);
    const total = totalResult?.total || 0;

    const content = await db.select().from(dreameraContentTable)
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    return {
      data: content.map(c => ({ ...c, engagement: Number(c.engagement) })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listCampaignsPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (params.status) conditions.push(eq(dreameraCampaignsTable.status, params.status));
    if (params.search) conditions.push(like(dreameraCampaignsTable.name, `%${params.search}%`));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortCol = params.sortBy === "name" ? dreameraCampaignsTable.name
      : params.sortBy === "status" ? dreameraCampaignsTable.status
      : params.sortBy === "budget" ? dreameraCampaignsTable.budget
      : params.sortBy === "reach" ? dreameraCampaignsTable.reach
      : dreameraCampaignsTable.createdAt;
    const orderFn = params.sortOrder === "desc" ? desc : asc;

    const [totalResult] = await db.select({ total: count() }).from(dreameraCampaignsTable).where(where);
    const total = totalResult?.total || 0;

    const campaigns = await db.select().from(dreameraCampaignsTable)
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    return {
      data: campaigns.map(c => ({ ...c, budget: Number(c.budget) })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createContent(data: typeof dreameraContentTable.$inferInsert) {
    const [created] = await db.insert(dreameraContentTable).values(data).returning();
    return { ...created, engagement: Number(created.engagement) };
  }

  async updateContent(id: number, data: Partial<typeof dreameraContentTable.$inferInsert>) {
    const [updated] = await db.update(dreameraContentTable).set(data).where(eq(dreameraContentTable.id, id)).returning();
    if (!updated) return null;
    return { ...updated, engagement: Number(updated.engagement) };
  }

  async deleteContent(id: number) {
    await db.delete(dreameraContentTable).where(eq(dreameraContentTable.id, id));
  }

  async listCampaigns() {
    const campaigns = await db.select().from(dreameraCampaignsTable).orderBy(dreameraCampaignsTable.createdAt);
    return campaigns.map(c => ({ ...c, budget: Number(c.budget) }));
  }

  async createCampaign(data: typeof dreameraCampaignsTable.$inferInsert) {
    const [created] = await db.insert(dreameraCampaignsTable).values(data).returning();
    return { ...created, budget: Number(created.budget) };
  }

  async deleteCampaign(id: number) {
    await db.delete(dreameraCampaignsTable).where(eq(dreameraCampaignsTable.id, id));
  }

  async getContentPerformance(): Promise<any> {
    const content = await this.listContent();
    const totalViews = content.reduce((s, c) => s + c.views, 0);
    const avgEngagement = content.length > 0
      ? Math.round((content.reduce((s, c) => s + c.engagement, 0) / content.length) * 100) / 100
      : 0;

    const byType: Record<string, { count: number; totalViews: number; avgEngagement: number }> = {};
    for (const c of content) {
      if (!byType[c.type]) byType[c.type] = { count: 0, totalViews: 0, avgEngagement: 0 };
      byType[c.type].count++;
      byType[c.type].totalViews += c.views;
    }
    for (const type in byType) {
      const typeContent = content.filter(c => c.type === type);
      byType[type].avgEngagement = Math.round(
        (typeContent.reduce((s, c) => s + c.engagement, 0) / typeContent.length) * 100
      ) / 100;
    }

    const topPerformers = [...content]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(c => ({ id: c.id, title: c.title, views: c.views, engagement: c.engagement, type: c.type }));

    const now = Date.now();
    const viewsTrend: TimeSeriesPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const ts = new Date(now - i * 86400000);
      const dayContent = content.filter(c => new Date(c.createdAt).getTime() <= ts.getTime());
      viewsTrend.push({
        timestamp: ts.toISOString(),
        value: dayContent.reduce((s, c) => s + c.views, 0),
      });
    }

    return {
      totalContent: content.length,
      totalViews,
      averageEngagement: avgEngagement,
      byType,
      topPerformers,
      viewsTrend,
      timestamp: new Date().toISOString(),
    };
  }

  async getCampaignROI(): Promise<any> {
    const campaigns = await this.listCampaigns();
    const content = await this.listContent();

    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
    const costPerReach = totalReach > 0 ? Math.round((totalBudget / totalReach) * 10000) / 10000 : 0;

    const campaignDetails = campaigns.map(c => {
      const roi = c.budget > 0 ? Math.round(((c.reach * 0.05 - c.budget) / c.budget) * 10000) / 100 : 0;
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        budget: c.budget,
        reach: c.reach,
        costPerReach: c.reach > 0 ? Math.round((c.budget / c.reach) * 10000) / 10000 : 0,
        estimatedROI: roi,
        startDate: c.startDate,
        endDate: c.endDate,
      };
    });

    const byStatus: Record<string, { count: number; totalBudget: number; totalReach: number }> = {};
    for (const c of campaigns) {
      if (!byStatus[c.status]) byStatus[c.status] = { count: 0, totalBudget: 0, totalReach: 0 };
      byStatus[c.status].count++;
      byStatus[c.status].totalBudget += c.budget;
      byStatus[c.status].totalReach += c.reach;
    }

    return {
      totalCampaigns: campaigns.length,
      totalBudget,
      totalReach,
      costPerReach,
      overallROI: totalBudget > 0 ? Math.round(((totalReach * 0.05 - totalBudget) / totalBudget) * 10000) / 100 : 0,
      byStatus,
      campaigns: campaignDetails,
      contentCount: content.length,
      timestamp: new Date().toISOString(),
    };
  }

  async getPipelineStatus(): Promise<any> {
    const content = await this.listContent();
    const campaigns = await this.listCampaigns();

    const contentByStatus: Record<string, number> = {};
    for (const c of content) {
      contentByStatus[c.status] = (contentByStatus[c.status] || 0) + 1;
    }

    const campaignsByStatus: Record<string, number> = {};
    for (const c of campaigns) {
      campaignsByStatus[c.status] = (campaignsByStatus[c.status] || 0) + 1;
    }

    const pipelineStages = [
      { stage: "draft", contentCount: contentByStatus["draft"] || 0 },
      { stage: "review", contentCount: contentByStatus["review"] || 0 },
      { stage: "approved", contentCount: contentByStatus["approved"] || 0 },
      { stage: "published", contentCount: contentByStatus["published"] || 0 },
      { stage: "archived", contentCount: contentByStatus["archived"] || 0 },
    ];

    const recentContent = [...content]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(c => ({ id: c.id, title: c.title, status: c.status, type: c.type, createdAt: c.createdAt }));

    return {
      contentPipeline: pipelineStages,
      contentByStatus,
      campaignsByStatus,
      totalContent: content.length,
      totalCampaigns: campaigns.length,
      recentContent,
      timestamp: new Date().toISOString(),
    };
  }

  async exportContent(format: "json" | "csv"): Promise<{ data: string; contentType: string; filename: string }> {
    const content = await this.listContent();

    if (format === "csv") {
      const headers = "id,title,body,type,status,views,engagement,createdAt";
      const rows = content.map(c =>
        [c.id, csvEscape(c.title), csvEscape(c.body), csvEscape(c.type), csvEscape(c.status), c.views, c.engagement, c.createdAt].join(",")
      );
      return {
        data: [headers, ...rows].join("\n"),
        contentType: "text/csv",
        filename: "dreamera_content.csv",
      };
    }

    return {
      data: JSON.stringify(content, null, 2),
      contentType: "application/json",
      filename: "dreamera_content.json",
    };
  }

  async exportCampaigns(format: "json" | "csv"): Promise<{ data: string; contentType: string; filename: string }> {
    const campaigns = await this.listCampaigns();

    if (format === "csv") {
      const headers = "id,name,description,status,budget,reach,startDate,endDate,createdAt";
      const rows = campaigns.map(c =>
        [c.id, csvEscape(c.name), csvEscape(c.description), csvEscape(c.status), c.budget, c.reach, csvEscape(c.startDate), csvEscape(c.endDate), c.createdAt].join(",")
      );
      return {
        data: [headers, ...rows].join("\n"),
        contentType: "text/csv",
        filename: "dreamera_campaigns.csv",
      };
    }

    return {
      data: JSON.stringify(campaigns, null, 2),
      contentType: "application/json",
      filename: "dreamera_campaigns.json",
    };
  }
}

export const dreameraService = new DreameraService();
