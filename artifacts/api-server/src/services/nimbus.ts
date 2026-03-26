import { db } from "@szl-holdings/db";
import { nimbusPredictionsTable, nimbusAlertsTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";

export class NimbusService {
  async listPredictions() {
    const predictions = await db.select().from(nimbusPredictionsTable).orderBy(nimbusPredictionsTable.createdAt);
    return predictions.map(p => ({ ...p, confidence: Number(p.confidence) }));
  }

  async createPrediction(data: typeof nimbusPredictionsTable.$inferInsert) {
    const [created] = await db.insert(nimbusPredictionsTable).values(data).returning();
    return { ...created, confidence: Number(created.confidence) };
  }

  async deletePrediction(id: number) {
    await db.delete(nimbusPredictionsTable).where(eq(nimbusPredictionsTable.id, id));
  }

  async listAlerts() {
    return db.select().from(nimbusAlertsTable).orderBy(nimbusAlertsTable.createdAt);
  }

  async createAlert(data: typeof nimbusAlertsTable.$inferInsert) {
    const [created] = await db.insert(nimbusAlertsTable).values(data).returning();
    return created;
  }

  async deleteAlert(id: number) {
    await db.delete(nimbusAlertsTable).where(eq(nimbusAlertsTable.id, id));
  }
}

export const nimbusService = new NimbusService();
