import { db } from "@szl-holdings/db";
import {
  alloyscapeModulesTable, alloyscapeWorkflowsTable, alloyscapeExecutionLogsTable,
  alloyscapeConnectorsTable, alloyscapeServicesTable
} from "@szl-holdings/db/schema";
import { eq, desc, like, and, count, sql } from "drizzle-orm";

export const alloyscapeService = {
  async listModules() {
    return db.select().from(alloyscapeModulesTable).orderBy(alloyscapeModulesTable.name);
  },
  async getModule(moduleId: string) {
    const [m] = await db.select().from(alloyscapeModulesTable).where(eq(alloyscapeModulesTable.moduleId, moduleId)).limit(1);
    return m;
  },
  async updateModuleStatus(moduleId: string, status: string) {
    const [updated] = await db.update(alloyscapeModulesTable).set({ status }).where(eq(alloyscapeModulesTable.moduleId, moduleId)).returning();
    return updated;
  },
  async restartModule(moduleId: string) {
    const [updated] = await db.update(alloyscapeModulesTable)
      .set({ status: "running", lastHealthCheck: "0s ago", cpu: Math.floor(Math.random() * 30 + 10), memory: Math.floor(Math.random() * 30 + 20) })
      .where(eq(alloyscapeModulesTable.moduleId, moduleId)).returning();
    return updated;
  },

  async listWorkflows() {
    return db.select().from(alloyscapeWorkflowsTable).orderBy(desc(alloyscapeWorkflowsTable.createdAt));
  },
  async getWorkflow(workflowId: string) {
    const [w] = await db.select().from(alloyscapeWorkflowsTable).where(eq(alloyscapeWorkflowsTable.workflowId, workflowId)).limit(1);
    return w;
  },
  async triggerWorkflow(workflowId: string) {
    const [updated] = await db.update(alloyscapeWorkflowsTable)
      .set({ status: "running", progress: 0, startedAt: new Date().toISOString(), duration: "0s", triggeredBy: "manual" })
      .where(eq(alloyscapeWorkflowsTable.workflowId, workflowId)).returning();
    return updated;
  },
  async updateWorkflowStatus(workflowId: string, status: string) {
    const [updated] = await db.update(alloyscapeWorkflowsTable).set({ status }).where(eq(alloyscapeWorkflowsTable.workflowId, workflowId)).returning();
    return updated;
  },

  async listLogs(opts?: { level?: string; service?: string; search?: string }) {
    const conditions = [];
    if (opts?.level) conditions.push(eq(alloyscapeExecutionLogsTable.level, opts.level));
    if (opts?.service) conditions.push(eq(alloyscapeExecutionLogsTable.service, opts.service));
    if (opts?.search) conditions.push(like(alloyscapeExecutionLogsTable.message, `%${opts.search}%`));

    let query = db.select().from(alloyscapeExecutionLogsTable).orderBy(desc(alloyscapeExecutionLogsTable.createdAt)).$dynamic();
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    return query.limit(100);
  },

  async listConnectors() {
    return db.select().from(alloyscapeConnectorsTable).orderBy(alloyscapeConnectorsTable.name);
  },
  async updateConnectorStatus(connectorId: string, status: string) {
    const [updated] = await db.update(alloyscapeConnectorsTable).set({ status }).where(eq(alloyscapeConnectorsTable.connectorId, connectorId)).returning();
    return updated;
  },

  async listServices() {
    return db.select().from(alloyscapeServicesTable).orderBy(alloyscapeServicesTable.name);
  },

  async getDashboardStats() {
    const mods = await db.select().from(alloyscapeModulesTable);
    const wfs = await db.select().from(alloyscapeWorkflowsTable);
    const svcs = await db.select().from(alloyscapeServicesTable);
    const conns = await db.select().from(alloyscapeConnectorsTable);

    return {
      totalModules: mods.length,
      activeModules: mods.filter(m => m.status === "running").length,
      totalWorkflows: wfs.length,
      activeWorkflows: wfs.filter(w => w.status === "running").length,
      queuedWorkflows: wfs.filter(w => w.status === "queued").length,
      failedWorkflows: wfs.filter(w => w.status === "failed").length,
      healthyServices: svcs.filter(s => s.status === "healthy").length,
      totalServices: svcs.length,
      activeConnectors: conns.filter(c => c.status === "active").length,
      totalConnectors: conns.length,
      avgResponseTime: Math.round(svcs.filter(s => s.responseTime > 0).reduce((sum, s) => sum + s.responseTime, 0) / (svcs.filter(s => s.responseTime > 0).length || 1)),
      eventsProcessed: conns.reduce((sum, c) => sum + c.eventsProcessed, 0),
      platformUptime: 99.94,
    };
  },
};
