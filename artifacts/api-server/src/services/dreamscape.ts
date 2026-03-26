import { db } from "@szl-holdings/db";
import {
  dreamscapeWorldsTable, dreamscapeProjectsTable, dreamscapeArtifactsTable,
  dreamscapeGenerationHistoryTable, dreamscapePipelineItemsTable
} from "@szl-holdings/db/schema";
import { eq, desc } from "drizzle-orm";

export const dreamscapeService = {
  async listWorlds() {
    const rows = await db.select().from(dreamscapeWorldsTable).orderBy(dreamscapeWorldsTable.name);
    return rows.map(r => ({ ...r, tags: JSON.parse(r.tags || "[]") }));
  },
  async getWorld(worldId: string) {
    const [w] = await db.select().from(dreamscapeWorldsTable).where(eq(dreamscapeWorldsTable.worldId, worldId)).limit(1);
    return w ? { ...w, tags: JSON.parse(w.tags || "[]") } : null;
  },

  async listProjects(worldId?: string) {
    if (worldId) {
      return db.select().from(dreamscapeProjectsTable).where(eq(dreamscapeProjectsTable.worldId, worldId)).orderBy(desc(dreamscapeProjectsTable.createdAt));
    }
    return db.select().from(dreamscapeProjectsTable).orderBy(desc(dreamscapeProjectsTable.createdAt));
  },

  async listArtifacts(opts?: { worldId?: string; projectId?: string }) {
    let query = db.select().from(dreamscapeArtifactsTable).orderBy(desc(dreamscapeArtifactsTable.createdAt)).$dynamic();
    if (opts?.worldId) query = query.where(eq(dreamscapeArtifactsTable.worldId, opts.worldId));
    if (opts?.projectId) query = query.where(eq(dreamscapeArtifactsTable.projectId, opts.projectId));
    const rows = await query;
    return rows.map(r => ({ ...r, tags: JSON.parse(r.tags || "[]") }));
  },
  async getArtifact(artifactId: string) {
    const [a] = await db.select().from(dreamscapeArtifactsTable).where(eq(dreamscapeArtifactsTable.artifactId, artifactId)).limit(1);
    return a ? { ...a, tags: JSON.parse(a.tags || "[]") } : null;
  },
  async createArtifact(data: any) {
    const [created] = await db.insert(dreamscapeArtifactsTable).values({
      ...data,
      tags: JSON.stringify(data.tags || []),
    }).returning();
    return { ...created, tags: JSON.parse(created.tags || "[]") };
  },

  async listGenerationHistory() {
    return db.select().from(dreamscapeGenerationHistoryTable).orderBy(desc(dreamscapeGenerationHistoryTable.createdAt));
  },
  async createGeneration(data: any) {
    const [created] = await db.insert(dreamscapeGenerationHistoryTable).values(data).returning();
    return created;
  },
  async updateGeneration(genId: string, data: any) {
    const [updated] = await db.update(dreamscapeGenerationHistoryTable).set(data).where(eq(dreamscapeGenerationHistoryTable.genId, genId)).returning();
    return updated;
  },

  async listPipelineItems() {
    const rows = await db.select().from(dreamscapePipelineItemsTable).orderBy(dreamscapePipelineItemsTable.createdAt);
    return rows.map(r => ({ ...r, tags: JSON.parse(r.tags || "[]") }));
  },
  async updatePipelineItem(id: number, data: any) {
    if (data.tags) data.tags = JSON.stringify(data.tags);
    const [updated] = await db.update(dreamscapePipelineItemsTable).set(data).where(eq(dreamscapePipelineItemsTable.id, id)).returning();
    return updated ? { ...updated, tags: JSON.parse(updated.tags || "[]") } : null;
  },
};
