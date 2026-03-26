import { db } from "@szl-holdings/db";
import { beaconMetricsTable, beaconProjectsTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";

export class BeaconService {
  async listMetrics() {
    const metrics = await db.select().from(beaconMetricsTable).orderBy(beaconMetricsTable.createdAt);
    return metrics.map(m => ({ ...m, value: Number(m.value), change: Number(m.change) }));
  }

  async createMetric(data: typeof beaconMetricsTable.$inferInsert) {
    const [created] = await db.insert(beaconMetricsTable).values(data).returning();
    return { ...created, value: Number(created.value), change: Number(created.change) };
  }

  async updateMetric(id: number, data: Partial<typeof beaconMetricsTable.$inferInsert>) {
    const [updated] = await db.update(beaconMetricsTable).set(data).where(eq(beaconMetricsTable.id, id)).returning();
    if (!updated) return null;
    return { ...updated, value: Number(updated.value), change: Number(updated.change) };
  }

  async deleteMetric(id: number) {
    await db.delete(beaconMetricsTable).where(eq(beaconMetricsTable.id, id));
  }

  async listProjects() {
    return db.select().from(beaconProjectsTable).orderBy(beaconProjectsTable.createdAt);
  }

  async createProject(data: typeof beaconProjectsTable.$inferInsert) {
    const [created] = await db.insert(beaconProjectsTable).values(data).returning();
    return created;
  }

  async updateProject(id: number, data: Partial<typeof beaconProjectsTable.$inferInsert>) {
    const [updated] = await db.update(beaconProjectsTable).set(data).where(eq(beaconProjectsTable.id, id)).returning();
    return updated || null;
  }

  async deleteProject(id: number) {
    await db.delete(beaconProjectsTable).where(eq(beaconProjectsTable.id, id));
  }
}

export const beaconService = new BeaconService();
