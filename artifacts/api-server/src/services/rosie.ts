import { db } from "@szl-holdings/db";
import { rosieThreatsTable, rosieIncidentsTable, rosieScansTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";

export class RosieService {
  async listThreats() {
    return db.select().from(rosieThreatsTable).orderBy(rosieThreatsTable.createdAt);
  }

  async createThreat(data: typeof rosieThreatsTable.$inferInsert) {
    const [created] = await db.insert(rosieThreatsTable).values(data).returning();
    return created;
  }

  async deleteThreat(id: number) {
    await db.delete(rosieThreatsTable).where(eq(rosieThreatsTable.id, id));
  }

  async listIncidents() {
    return db.select().from(rosieIncidentsTable).orderBy(rosieIncidentsTable.createdAt);
  }

  async createIncident(data: typeof rosieIncidentsTable.$inferInsert) {
    const [created] = await db.insert(rosieIncidentsTable).values(data).returning();
    return created;
  }

  async updateIncident(id: number, data: Partial<typeof rosieIncidentsTable.$inferInsert>) {
    const [updated] = await db.update(rosieIncidentsTable).set(data).where(eq(rosieIncidentsTable.id, id)).returning();
    return updated || null;
  }

  async deleteIncident(id: number) {
    await db.delete(rosieIncidentsTable).where(eq(rosieIncidentsTable.id, id));
  }

  async listScans() {
    return db.select().from(rosieScansTable).orderBy(rosieScansTable.createdAt);
  }

  async createScan(data: typeof rosieScansTable.$inferInsert) {
    const [created] = await db.insert(rosieScansTable).values(data).returning();
    return created;
  }
}

export const rosieService = new RosieService();
