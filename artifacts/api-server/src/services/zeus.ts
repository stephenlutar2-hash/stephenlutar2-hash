import { db } from "@szl-holdings/db";
import { zeusModulesTable, zeusLogsTable } from "@szl-holdings/db/schema";
import { eq, desc, asc, like, count, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  category?: string;
  status?: string;
  level?: string;
  module?: string;
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

export class ZeusService {
  async listModules() {
    const modules = await db.select().from(zeusModulesTable).orderBy(zeusModulesTable.createdAt);
    return modules.map(m => ({ ...m, uptime: Number(m.uptime) }));
  }

  async listModulesPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (params.status) conditions.push(eq(zeusModulesTable.status, params.status));
    if (params.category) conditions.push(eq(zeusModulesTable.category, params.category));
    if (params.search) conditions.push(like(zeusModulesTable.name, `%${params.search}%`));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortCol = params.sortBy === "name" ? zeusModulesTable.name
      : params.sortBy === "status" ? zeusModulesTable.status
      : params.sortBy === "uptime" ? zeusModulesTable.uptime
      : params.sortBy === "category" ? zeusModulesTable.category
      : zeusModulesTable.createdAt;
    const orderFn = params.sortOrder === "desc" ? desc : asc;

    const [totalResult] = await db.select({ total: count() }).from(zeusModulesTable).where(where);
    const total = totalResult?.total || 0;

    const modules = await db.select().from(zeusModulesTable)
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    return {
      data: modules.map(m => ({ ...m, uptime: Number(m.uptime) })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listLogsPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 50));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (params.level) conditions.push(eq(zeusLogsTable.level, params.level));
    if (params.module) conditions.push(eq(zeusLogsTable.module, params.module));
    if (params.search) conditions.push(like(zeusLogsTable.message, `%${params.search}%`));

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortCol = params.sortBy === "level" ? zeusLogsTable.level
      : params.sortBy === "module" ? zeusLogsTable.module
      : zeusLogsTable.createdAt;
    const orderFn = params.sortOrder === "desc" ? desc : asc;

    const [totalResult] = await db.select({ total: count() }).from(zeusLogsTable).where(where);
    const total = totalResult?.total || 0;

    const logs = await db.select().from(zeusLogsTable)
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    return {
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
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

  async getModuleUptimeTracking(): Promise<any> {
    const modules = await this.listModules();
    const uptimeData = modules.map(m => ({
      moduleId: m.id,
      moduleName: m.name,
      category: m.category,
      status: m.status,
      currentUptime: m.uptime,
      uptimeClass: m.uptime >= 99.9 ? "excellent" : m.uptime >= 99.0 ? "good" : m.uptime >= 95.0 ? "fair" : "poor",
    }));

    const avgUptime = modules.length > 0
      ? Math.round((modules.reduce((s, m) => s + m.uptime, 0) / modules.length) * 100) / 100
      : 0;

    const now = Date.now();
    const dayMs = 86400000;
    const uptimeSeries: TimeSeriesPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const bucketEnd = new Date(now - i * dayMs);
      const activeModules = modules.filter(m =>
        new Date(m.createdAt).getTime() <= bucketEnd.getTime() && m.status === "active"
      );
      const bucketAvg = activeModules.length > 0
        ? Math.round((activeModules.reduce((s, m) => s + m.uptime, 0) / activeModules.length) * 100) / 100
        : 0;
      uptimeSeries.push({
        timestamp: bucketEnd.toISOString(),
        value: bucketAvg,
      });
    }

    return {
      modules: uptimeData,
      averageUptime: avgUptime,
      trend: uptimeSeries,
      timestamp: new Date().toISOString(),
    };
  }

  async getLogVolumeByLevel(): Promise<any> {
    const logs = await this.listLogs();
    const byLevel: Record<string, number> = {};
    const byModule: Record<string, Record<string, number>> = {};

    for (const log of logs) {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      if (!byModule[log.module]) byModule[log.module] = {};
      byModule[log.module][log.level] = (byModule[log.module][log.level] || 0) + 1;
    }

    const levels = [...new Set(logs.map(l => l.level))];
    const now = Date.now();
    const hourMs = 3600000;

    const volumeTrendByLevel: Record<string, TimeSeriesPoint[]> = {};
    for (const level of levels) {
      volumeTrendByLevel[level] = [];
    }
    const overallVolumeTrend: TimeSeriesPoint[] = [];

    for (let i = 23; i >= 0; i--) {
      const bucketStart = now - (i + 1) * hourMs;
      const bucketEnd = now - i * hourMs;
      const ts = new Date(bucketEnd).toISOString();

      const hourLogs = logs.filter(l => {
        const logTime = new Date(l.createdAt).getTime();
        return logTime >= bucketStart && logTime < bucketEnd;
      });

      overallVolumeTrend.push({ timestamp: ts, value: hourLogs.length });

      for (const level of levels) {
        const levelCount = hourLogs.filter(l => l.level === level).length;
        volumeTrendByLevel[level].push({ timestamp: ts, value: levelCount });
      }
    }

    return {
      byLevel,
      byModule,
      total: logs.length,
      volumeTrend: overallVolumeTrend,
      volumeTrendByLevel,
      timestamp: new Date().toISOString(),
    };
  }

  async getErrorRates(): Promise<any> {
    const logs = await this.listLogs();
    const total = logs.length;
    const errorLogs = logs.filter(l => l.level === "error" || l.level === "fatal");
    const warnLogs = logs.filter(l => l.level === "warn" || l.level === "warning");
    const errorRate = total > 0 ? Math.round((errorLogs.length / total) * 10000) / 100 : 0;
    const warnRate = total > 0 ? Math.round((warnLogs.length / total) * 10000) / 100 : 0;

    const byModule: Record<string, { total: number; errors: number; rate: number }> = {};
    for (const log of logs) {
      if (!byModule[log.module]) byModule[log.module] = { total: 0, errors: 0, rate: 0 };
      byModule[log.module].total++;
      if (log.level === "error" || log.level === "fatal") byModule[log.module].errors++;
    }
    for (const mod in byModule) {
      byModule[mod].rate = byModule[mod].total > 0
        ? Math.round((byModule[mod].errors / byModule[mod].total) * 10000) / 100
        : 0;
    }

    const now = Date.now();
    const errorTrend: TimeSeriesPoint[] = [];
    for (let i = 23; i >= 0; i--) {
      const ts = new Date(now - i * 3600000);
      const hourErrors = errorLogs.filter(l => {
        const logTime = new Date(l.createdAt).getTime();
        return logTime >= ts.getTime() - 3600000 && logTime < ts.getTime();
      });
      const hourTotal = logs.filter(l => {
        const logTime = new Date(l.createdAt).getTime();
        return logTime >= ts.getTime() - 3600000 && logTime < ts.getTime();
      });
      errorTrend.push({
        timestamp: ts.toISOString(),
        value: hourTotal.length > 0
          ? Math.round((hourErrors.length / hourTotal.length) * 10000) / 100
          : 0,
      });
    }

    return {
      overallErrorRate: errorRate,
      overallWarnRate: warnRate,
      totalLogs: total,
      totalErrors: errorLogs.length,
      totalWarnings: warnLogs.length,
      byModule,
      errorTrend,
      timestamp: new Date().toISOString(),
    };
  }

  async getSystemHealthScore(): Promise<any> {
    const modules = await this.listModules();
    const logs = await this.listLogs();

    const activeModules = modules.filter(m => m.status === "active").length;
    const totalModules = modules.length;
    const moduleHealthPct = totalModules > 0 ? (activeModules / totalModules) * 100 : 100;

    const avgUptime = modules.length > 0
      ? modules.reduce((s, m) => s + m.uptime, 0) / modules.length
      : 100;

    const totalLogs = logs.length;
    const errorLogs = logs.filter(l => l.level === "error" || l.level === "fatal").length;
    const errorPenalty = totalLogs > 0 ? Math.min(30, (errorLogs / totalLogs) * 100) : 0;

    const score = Math.round(
      Math.max(0, Math.min(100,
        (moduleHealthPct * 0.3) + (avgUptime * 0.5) + ((100 - errorPenalty) * 0.2)
      ))
    );

    const components = {
      moduleHealth: { score: Math.round(moduleHealthPct), weight: 0.3, detail: `${activeModules}/${totalModules} active` },
      uptime: { score: Math.round(avgUptime * 100) / 100, weight: 0.5, detail: `${avgUptime.toFixed(2)}% avg` },
      errorRate: { score: Math.round(100 - errorPenalty), weight: 0.2, detail: `${errorLogs} errors out of ${totalLogs} logs` },
    };

    return {
      score,
      status: score >= 90 ? "healthy" : score >= 70 ? "degraded" : "critical",
      components,
      timestamp: new Date().toISOString(),
    };
  }

  async exportLogs(format: "json" | "csv"): Promise<{ data: string; contentType: string; filename: string }> {
    const logs = await this.listLogs();

    if (format === "csv") {
      const headers = "id,level,message,module,createdAt";
      const rows = logs.map(l =>
        [l.id, csvEscape(l.level), csvEscape(l.message), csvEscape(l.module), l.createdAt].join(",")
      );
      return {
        data: [headers, ...rows].join("\n"),
        contentType: "text/csv",
        filename: "zeus_logs.csv",
      };
    }

    return {
      data: JSON.stringify(logs, null, 2),
      contentType: "application/json",
      filename: "zeus_logs.json",
    };
  }

  async exportModules(format: "json" | "csv"): Promise<{ data: string; contentType: string; filename: string }> {
    const modules = await this.listModules();

    if (format === "csv") {
      const headers = "id,name,description,version,status,category,uptime,createdAt";
      const rows = modules.map(m =>
        [m.id, csvEscape(m.name), csvEscape(m.description), csvEscape(m.version), csvEscape(m.status), csvEscape(m.category), m.uptime, m.createdAt].join(",")
      );
      return {
        data: [headers, ...rows].join("\n"),
        contentType: "text/csv",
        filename: "zeus_modules.csv",
      };
    }

    return {
      data: JSON.stringify(modules, null, 2),
      contentType: "application/json",
      filename: "zeus_modules.json",
    };
  }
}

export const zeusService = new ZeusService();
