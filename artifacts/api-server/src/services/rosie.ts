import { db } from "@szl-holdings/db";
import {
  rosieThreatsTable,
  rosieIncidentsTable,
  rosieScansTable,
  type RosieThreat,
  type RosieIncident,
  type RosieScan,
} from "@szl-holdings/db/schema";
import { eq, and, gte, lte, desc, asc, sql, inArray, type SQL } from "drizzle-orm";

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  severity?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface QueryParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  severity?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}

function parsePaginationFromQuery(query: QueryParams): PaginationParams {
  return {
    page: Math.max(1, parseInt(query.page || "1") || 1),
    limit: Math.min(100, Math.max(1, parseInt(query.limit || "20") || 20)),
    sortBy: query.sortBy || "createdAt",
    sortOrder: query.sortOrder === "asc" ? "asc" : "desc",
  };
}

function isValidDateString(val: string): boolean {
  const d = new Date(val);
  return !isNaN(d.getTime());
}

function parseFiltersFromQuery(query: QueryParams): FilterParams {
  return {
    severity: typeof query.severity === "string" ? query.severity : undefined,
    status: typeof query.status === "string" ? query.status : undefined,
    type: typeof query.type === "string" ? query.type : undefined,
    dateFrom: typeof query.dateFrom === "string" && isValidDateString(query.dateFrom) ? query.dateFrom : undefined,
    dateTo: typeof query.dateTo === "string" && isValidDateString(query.dateTo) ? query.dateTo : undefined,
  };
}

interface ThreatTrendRow {
  date: string;
  severity: string;
  count: number;
}

interface SeverityCount {
  severity: string;
  count: number;
}

interface IncidentResolutionBySeverity {
  severity: string;
  total: number;
  resolved: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface PlatformScanSummary {
  platform: string;
  scanCount: number;
  threatsFound: number;
  threatsBlocked: number;
}

interface ScanTypeCount {
  scanType: string;
  count: number;
}

interface TimelineEntry {
  id: number;
  type: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  timestamp: Date;
}

interface CrossSecuritySummary {
  threats: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    blocked: number;
    active: number;
  };
  incidents: {
    total: number;
    open: number;
    resolved: number;
  };
  scans: {
    total: number;
    threatsFound: number;
    threatsBlocked: number;
  };
}

export class RosieService {
  parsePagination = parsePaginationFromQuery;
  parseFilters = parseFiltersFromQuery;

  async listThreats(pagination?: PaginationParams, filters?: FilterParams): Promise<PaginatedResult<RosieThreat>> {
    const conditions: SQL[] = [];
    if (filters?.severity) conditions.push(eq(rosieThreatsTable.severity, filters.severity));
    if (filters?.status) conditions.push(eq(rosieThreatsTable.status, filters.status));
    if (filters?.type) conditions.push(eq(rosieThreatsTable.type, filters.type));
    if (filters?.dateFrom) conditions.push(gte(rosieThreatsTable.createdAt, new Date(filters.dateFrom)));
    if (filters?.dateTo) conditions.push(lte(rosieThreatsTable.createdAt, new Date(filters.dateTo)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rosieThreatsTable)
      .where(where);

    const total = countResult?.count ?? 0;
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;

    const sortCol = pagination?.sortBy === "severity" ? rosieThreatsTable.severity
      : pagination?.sortBy === "status" ? rosieThreatsTable.status
      : pagination?.sortBy === "type" ? rosieThreatsTable.type
      : rosieThreatsTable.createdAt;
    const orderFn = pagination?.sortOrder === "asc" ? asc : desc;

    const data = await db
      .select()
      .from(rosieThreatsTable)
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createThreat(data: typeof rosieThreatsTable.$inferInsert) {
    const [created] = await db.insert(rosieThreatsTable).values(data).returning();
    return created;
  }

  async deleteThreat(id: number) {
    await db.delete(rosieThreatsTable).where(eq(rosieThreatsTable.id, id));
  }

  async listIncidents(pagination?: PaginationParams, filters?: FilterParams): Promise<PaginatedResult<RosieIncident>> {
    const conditions: SQL[] = [];
    if (filters?.severity) conditions.push(eq(rosieIncidentsTable.severity, filters.severity));
    if (filters?.status) conditions.push(eq(rosieIncidentsTable.status, filters.status));
    if (filters?.type) conditions.push(eq(rosieIncidentsTable.platform, filters.type));
    if (filters?.dateFrom) conditions.push(gte(rosieIncidentsTable.createdAt, new Date(filters.dateFrom)));
    if (filters?.dateTo) conditions.push(lte(rosieIncidentsTable.createdAt, new Date(filters.dateTo)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rosieIncidentsTable)
      .where(where);

    const total = countResult?.count ?? 0;
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;

    const sortCol = pagination?.sortBy === "severity" ? rosieIncidentsTable.severity
      : pagination?.sortBy === "status" ? rosieIncidentsTable.status
      : pagination?.sortBy === "assignee" ? rosieIncidentsTable.assignee
      : rosieIncidentsTable.createdAt;
    const orderFn = pagination?.sortOrder === "asc" ? asc : desc;

    const data = await db
      .select()
      .from(rosieIncidentsTable)
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
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

  async listScans(pagination?: PaginationParams, filters?: FilterParams): Promise<PaginatedResult<RosieScan>> {
    const conditions: SQL[] = [];
    if (filters?.severity) {
      const severityThreshold = filters.severity === "critical" ? 10
        : filters.severity === "high" ? 5
        : filters.severity === "medium" ? 1
        : 0;
      conditions.push(gte(rosieScansTable.threatsFound, severityThreshold));
    }
    if (filters?.status) conditions.push(eq(rosieScansTable.status, filters.status));
    if (filters?.type) conditions.push(eq(rosieScansTable.scanType, filters.type));
    if (filters?.dateFrom) conditions.push(gte(rosieScansTable.createdAt, new Date(filters.dateFrom)));
    if (filters?.dateTo) conditions.push(lte(rosieScansTable.createdAt, new Date(filters.dateTo)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rosieScansTable)
      .where(where);

    const total = countResult?.count ?? 0;
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;

    const sortCol = pagination?.sortBy === "status" ? rosieScansTable.status
      : pagination?.sortBy === "platform" ? rosieScansTable.platform
      : pagination?.sortBy === "threatsFound" ? rosieScansTable.threatsFound
      : rosieScansTable.createdAt;
    const orderFn = pagination?.sortOrder === "asc" ? asc : desc;

    const data = await db
      .select()
      .from(rosieScansTable)
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createScan(data: typeof rosieScansTable.$inferInsert) {
    const [created] = await db.insert(rosieScansTable).values(data).returning();
    return created;
  }

  async getThreatTrends(): Promise<ThreatTrendRow[]> {
    const rows = await db
      .select({
        date: sql<string>`date_trunc('day', ${rosieThreatsTable.createdAt})::date::text`,
        severity: rosieThreatsTable.severity,
        count: sql<number>`count(*)::int`,
      })
      .from(rosieThreatsTable)
      .groupBy(sql`date_trunc('day', ${rosieThreatsTable.createdAt})::date`, rosieThreatsTable.severity)
      .orderBy(sql`date_trunc('day', ${rosieThreatsTable.createdAt})::date`);

    return rows;
  }

  async getIncidentResolutionMetrics() {
    const [totals] = await db
      .select({
        total: sql<number>`count(*)::int`,
        resolved: sql<number>`count(*) filter (where ${rosieIncidentsTable.resolved} = true)::int`,
        open: sql<number>`count(*) filter (where ${rosieIncidentsTable.resolved} = false)::int`,
      })
      .from(rosieIncidentsTable);

    const bySeverity: IncidentResolutionBySeverity[] = await db
      .select({
        severity: rosieIncidentsTable.severity,
        total: sql<number>`count(*)::int`,
        resolved: sql<number>`count(*) filter (where ${rosieIncidentsTable.resolved} = true)::int`,
      })
      .from(rosieIncidentsTable)
      .groupBy(rosieIncidentsTable.severity);

    const byStatus: StatusCount[] = await db
      .select({
        status: rosieIncidentsTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(rosieIncidentsTable)
      .groupBy(rosieIncidentsTable.status);

    return {
      totals: totals ?? { total: 0, resolved: 0, open: 0 },
      resolutionRate: totals && totals.total > 0 ? Math.round((totals.resolved / totals.total) * 100) : 0,
      bySeverity,
      byStatus,
    };
  }

  async getScanCoverageSummary() {
    const [totals] = await db
      .select({
        totalScans: sql<number>`count(*)::int`,
        totalThreatsFound: sql<number>`coalesce(sum(${rosieScansTable.threatsFound}), 0)::int`,
        totalThreatsBlocked: sql<number>`coalesce(sum(${rosieScansTable.threatsBlocked}), 0)::int`,
        avgDuration: sql<number>`coalesce(avg(${rosieScansTable.duration}), 0)::int`,
      })
      .from(rosieScansTable);

    const byPlatform: PlatformScanSummary[] = await db
      .select({
        platform: rosieScansTable.platform,
        scanCount: sql<number>`count(*)::int`,
        threatsFound: sql<number>`coalesce(sum(${rosieScansTable.threatsFound}), 0)::int`,
        threatsBlocked: sql<number>`coalesce(sum(${rosieScansTable.threatsBlocked}), 0)::int`,
      })
      .from(rosieScansTable)
      .groupBy(rosieScansTable.platform);

    const byScanType: ScanTypeCount[] = await db
      .select({
        scanType: rosieScansTable.scanType,
        count: sql<number>`count(*)::int`,
      })
      .from(rosieScansTable)
      .groupBy(rosieScansTable.scanType);

    return {
      totals: totals ?? { totalScans: 0, totalThreatsFound: 0, totalThreatsBlocked: 0, avgDuration: 0 },
      blockRate: totals && totals.totalThreatsFound > 0
        ? Math.round((totals.totalThreatsBlocked / totals.totalThreatsFound) * 100)
        : 100,
      byPlatform,
      byScanType,
    };
  }

  async getSeverityDistribution(): Promise<{ threats: SeverityCount[]; incidents: SeverityCount[] }> {
    const threats: SeverityCount[] = await db
      .select({
        severity: rosieThreatsTable.severity,
        count: sql<number>`count(*)::int`,
      })
      .from(rosieThreatsTable)
      .groupBy(rosieThreatsTable.severity);

    const incidents: SeverityCount[] = await db
      .select({
        severity: rosieIncidentsTable.severity,
        count: sql<number>`count(*)::int`,
      })
      .from(rosieIncidentsTable)
      .groupBy(rosieIncidentsTable.severity);

    return { threats, incidents };
  }

  async getIncidentTimeline(limit: number = 50): Promise<TimelineEntry[]> {
    const threats = await db
      .select({
        id: rosieThreatsTable.id,
        type: sql<string>`'threat'`,
        title: rosieThreatsTable.type,
        description: rosieThreatsTable.description,
        severity: rosieThreatsTable.severity,
        status: rosieThreatsTable.status,
        timestamp: rosieThreatsTable.createdAt,
      })
      .from(rosieThreatsTable)
      .orderBy(desc(rosieThreatsTable.createdAt))
      .limit(limit);

    const incidents = await db
      .select({
        id: rosieIncidentsTable.id,
        type: sql<string>`'incident'`,
        title: rosieIncidentsTable.title,
        description: rosieIncidentsTable.description,
        severity: rosieIncidentsTable.severity,
        status: rosieIncidentsTable.status,
        timestamp: rosieIncidentsTable.createdAt,
      })
      .from(rosieIncidentsTable)
      .orderBy(desc(rosieIncidentsTable.createdAt))
      .limit(limit);

    const scans = await db
      .select({
        id: rosieScansTable.id,
        type: sql<string>`'scan'`,
        title: rosieScansTable.scanType,
        description: sql<string>`'Scan on ' || ${rosieScansTable.platform} || ' — found ' || ${rosieScansTable.threatsFound} || ' threats'`,
        severity: sql<string>`case when ${rosieScansTable.threatsFound} > 5 then 'high' when ${rosieScansTable.threatsFound} > 0 then 'medium' else 'low' end`,
        status: rosieScansTable.status,
        timestamp: rosieScansTable.createdAt,
      })
      .from(rosieScansTable)
      .orderBy(desc(rosieScansTable.createdAt))
      .limit(limit);

    const combined: TimelineEntry[] = [...threats, ...incidents, ...scans]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return combined;
  }

  async bulkUpdateIncidents(ids: number[], updates: { status?: string; assignee?: string; resolved?: boolean }) {
    if (ids.length === 0) return { updated: 0 };
    const result = await db
      .update(rosieIncidentsTable)
      .set(updates)
      .where(inArray(rosieIncidentsTable.id, ids))
      .returning();
    return { updated: result.length, incidents: result };
  }

  async getCrossSecuritySummary(): Promise<CrossSecuritySummary> {
    const [threatCounts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        critical: sql<number>`count(*) filter (where ${rosieThreatsTable.severity} = 'critical')::int`,
        high: sql<number>`count(*) filter (where ${rosieThreatsTable.severity} = 'high')::int`,
        medium: sql<number>`count(*) filter (where ${rosieThreatsTable.severity} = 'medium')::int`,
        low: sql<number>`count(*) filter (where ${rosieThreatsTable.severity} = 'low')::int`,
        blocked: sql<number>`count(*) filter (where ${rosieThreatsTable.status} = 'blocked')::int`,
        active: sql<number>`count(*) filter (where ${rosieThreatsTable.status} != 'blocked')::int`,
      })
      .from(rosieThreatsTable);

    const [incidentCounts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        open: sql<number>`count(*) filter (where ${rosieIncidentsTable.resolved} = false)::int`,
        resolved: sql<number>`count(*) filter (where ${rosieIncidentsTable.resolved} = true)::int`,
      })
      .from(rosieIncidentsTable);

    const [scanCounts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        threatsFound: sql<number>`coalesce(sum(${rosieScansTable.threatsFound}), 0)::int`,
        threatsBlocked: sql<number>`coalesce(sum(${rosieScansTable.threatsBlocked}), 0)::int`,
      })
      .from(rosieScansTable);

    return {
      threats: threatCounts ?? { total: 0, critical: 0, high: 0, medium: 0, low: 0, blocked: 0, active: 0 },
      incidents: incidentCounts ?? { total: 0, open: 0, resolved: 0 },
      scans: scanCounts ?? { total: 0, threatsFound: 0, threatsBlocked: 0 },
    };
  }
}

export const rosieService = new RosieService();
