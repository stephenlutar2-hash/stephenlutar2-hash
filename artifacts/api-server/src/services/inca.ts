import { db } from "@szl-holdings/db";
import { incaProjectsTable, incaExperimentsTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";

export class IncaService {
  async listProjects() {
    const projects = await db.select().from(incaProjectsTable).orderBy(incaProjectsTable.createdAt);
    return projects.map(p => ({ ...p, accuracy: Number(p.accuracy) }));
  }

  async createProject(data: typeof incaProjectsTable.$inferInsert) {
    const [created] = await db.insert(incaProjectsTable).values(data).returning();
    return { ...created, accuracy: Number(created.accuracy) };
  }

  async updateProject(id: number, data: Partial<typeof incaProjectsTable.$inferInsert>) {
    const [updated] = await db.update(incaProjectsTable).set(data).where(eq(incaProjectsTable.id, id)).returning();
    if (!updated) return null;
    return { ...updated, accuracy: Number(updated.accuracy) };
  }

  async deleteProject(id: number) {
    await db.delete(incaProjectsTable).where(eq(incaProjectsTable.id, id));
  }

  async listExperiments() {
    const experiments = await db.select().from(incaExperimentsTable).orderBy(incaExperimentsTable.createdAt);
    return experiments.map(e => ({ ...e, accuracy: Number(e.accuracy) }));
  }

  async createExperiment(data: typeof incaExperimentsTable.$inferInsert) {
    const [created] = await db.insert(incaExperimentsTable).values(data).returning();
    return { ...created, accuracy: Number(created.accuracy) };
  }

  async updateExperiment(id: number, data: Partial<typeof incaExperimentsTable.$inferInsert>) {
    const [updated] = await db.update(incaExperimentsTable).set(data).where(eq(incaExperimentsTable.id, id)).returning();
    if (!updated) return null;
    return { ...updated, accuracy: Number(updated.accuracy) };
  }

  async deleteExperiment(id: number) {
    await db.delete(incaExperimentsTable).where(eq(incaExperimentsTable.id, id));
  }
}

export const incaService = new IncaService();
