import { db } from "@szl-holdings/db";
import { zeusModulesTable, zeusLogsTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";

export class ZeusService {
  async listModules() {
    const modules = await db.select().from(zeusModulesTable).orderBy(zeusModulesTable.createdAt);
    return modules.map(m => ({ ...m, uptime: Number(m.uptime) }));
  }

  async createModule(data: typeof zeusModulesTable.$inferInsert) {
    const [created] = await db.insert(zeusModulesTable).values(data).returning();
    return { ...created, uptime: Number(created.uptime) };
  }

  async updateModule(id: number, data: Partial<typeof zeusModulesTable.$inferInsert>) {
    const [updated] = await db.update(zeusModulesTable).set(data).where(eq(zeusModulesTable.id, id)).returning();
    if (!updated) return null;
    return { ...updated, uptime: Number(updated.uptime) };
  }

  async deleteModule(id: number) {
    await db.delete(zeusModulesTable).where(eq(zeusModulesTable.id, id));
  }

  async listLogs() {
    return db.select().from(zeusLogsTable).orderBy(zeusLogsTable.createdAt);
  }

  async createLog(data: typeof zeusLogsTable.$inferInsert) {
    const [created] = await db.insert(zeusLogsTable).values(data).returning();
    return created;
  }
}

export const zeusService = new ZeusService();
