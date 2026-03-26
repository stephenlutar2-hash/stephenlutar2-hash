import { db } from "@szl-holdings/db";
import { dreameraContentTable, dreameraCampaignsTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";

export class DreameraService {
  async listContent() {
    const content = await db.select().from(dreameraContentTable).orderBy(dreameraContentTable.createdAt);
    return content.map(c => ({ ...c, engagement: Number(c.engagement) }));
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
}

export const dreameraService = new DreameraService();
