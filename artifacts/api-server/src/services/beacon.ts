import { db } from "@szl-holdings/db";
import { beaconMetricsTable, beaconProjectsTable } from "@szl-holdings/db/schema";
import { eq, sql, desc, asc, like, count } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  category?: string;
  status?: string;
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

interface AlertRule {
  metricName: string;
  operator: "gt" | "lt" | "gte" | "lte" | "eq";
  threshold: number;
}

interface AlertEvaluation {
  metricName: string;
  currentValue: number;
  threshold: number;
  operator: string;
  triggered: boolean;
  severity: "critical" | "warning" | "info";
  message: string;
  evaluatedAt: string;
}

export interface WebhookTarget {
  id: string;
  url: string;
  name: string;
  events: string[];
  active: boolean;
  secret?: string;
  createdAt: string;
  lastTriggeredAt?: string;
  failureCount: number;
}

export interface WebhookCreateInput {
  url: string;
  name: string;
  events: string[];
  secret?: string;
}

interface NotificationRecord {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  status: "pending" | "sent" | "failed";
  attempts: number;
  createdAt: string;
  sentAt?: string;
  error?: string;
}

let webhookIdCounter = 0;
const webhookStore = new Map<string, WebhookTarget>();
const notificationStore: NotificationRecord[] = [];

function generateWebhookId(): string {
  webhookIdCounter++;
  return `wh-${Date.now()}-${webhookIdCounter}`;
}

function generateNotificationId(): string {
  return `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isPrivateOrReservedIP(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower === "127.0.0.1" || lower === "::1" || lower === "[::1]") return true;
  if (lower === "0.0.0.0" || lower === "[::]") return true;
  if (lower.endsWith(".local") || lower.endsWith(".internal") || lower.endsWith(".localhost")) return true;

  const parts = hostname.split(".");
  if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
    const octets = parts.map(Number);
    if (octets[0] === 10) return true;
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    if (octets[0] === 192 && octets[1] === 168) return true;
    if (octets[0] === 127) return true;
    if (octets[0] === 169 && octets[1] === 254) return true;
    if (octets[0] === 0) return true;
  }

  return false;
}

function validateWebhookUrl(urlStr: string): void {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error("Invalid webhook URL");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Webhook URL must use https or http protocol");
  }

  if (isPrivateOrReservedIP(parsed.hostname)) {
    throw new Error("Webhook URL must not target private, loopback, or reserved network addresses");
  }

  if (parsed.port && !["80", "443", "8080", "8443"].includes(parsed.port)) {
    throw new Error("Webhook URL uses a non-standard port");
  }
}

function redactSecret(webhook: WebhookTarget): Omit<WebhookTarget, "secret"> & { hasSecret: boolean } {
  const { secret, ...rest } = webhook;
  return { ...rest, hasSecret: !!secret };
}

function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export class BeaconService {
  async listMetrics() {
    const metrics = await db.select().from(beaconMetricsTable).orderBy(beaconMetricsTable.createdAt);
    return metrics.map(m => ({ ...m, value: Number(m.value), change: Number(m.change) }));
  }

  async listMetricsPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (params.category) {
      conditions.push(eq(beaconMetricsTable.category, params.category));
    }
    if (params.search) {
      conditions.push(like(beaconMetricsTable.name, `%${params.search}%`));
    }

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortCol = params.sortBy === "name" ? beaconMetricsTable.name
      : params.sortBy === "value" ? beaconMetricsTable.value
      : params.sortBy === "category" ? beaconMetricsTable.category
      : beaconMetricsTable.createdAt;
    const orderFn = params.sortOrder === "desc" ? desc : asc;

    const [totalResult] = await db.select({ total: count() }).from(beaconMetricsTable).where(where);
    const total = totalResult?.total || 0;

    const metrics = await db.select().from(beaconMetricsTable)
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    return {
      data: metrics.map(m => ({ ...m, value: Number(m.value), change: Number(m.change) })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async listProjectsPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (params.status) {
      conditions.push(eq(beaconProjectsTable.status, params.status));
    }
    if (params.search) {
      conditions.push(like(beaconProjectsTable.name, `%${params.search}%`));
    }

    const where = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortCol = params.sortBy === "name" ? beaconProjectsTable.name
      : params.sortBy === "status" ? beaconProjectsTable.status
      : params.sortBy === "progress" ? beaconProjectsTable.progress
      : beaconProjectsTable.createdAt;
    const orderFn = params.sortOrder === "desc" ? desc : asc;

    const [totalResult] = await db.select({ total: count() }).from(beaconProjectsTable).where(where);
    const total = totalResult?.total || 0;

    const projects = await db.select().from(beaconProjectsTable)
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    return {
      data: projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
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

  async getMetricTrends(window: "hourly" | "daily" | "weekly" = "daily", metricName?: string): Promise<{ window: string; series: TimeSeriesPoint[]; summary: any }> {
    const metrics = await this.listMetrics();
    const filtered = metricName ? metrics.filter(m => m.name === metricName) : metrics;

    const intervalMs = window === "hourly" ? 3600000 : window === "daily" ? 86400000 : 604800000;
    const pointCount = window === "hourly" ? 24 : window === "daily" ? 30 : 12;
    const now = Date.now();

    const series: TimeSeriesPoint[] = [];
    for (let i = pointCount - 1; i >= 0; i--) {
      const ts = new Date(now - i * intervalMs);
      const relevantMetrics = filtered.filter(m => new Date(m.createdAt).getTime() <= ts.getTime());
      const avgValue = relevantMetrics.length > 0
        ? relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length
        : 0;
      series.push({
        timestamp: ts.toISOString(),
        value: Math.round(avgValue * 100) / 100,
        label: window === "hourly" ? ts.toLocaleTimeString() : ts.toLocaleDateString(),
      });
    }

    const values = filtered.map(m => m.value);
    const summary = {
      min: values.length > 0 ? Math.min(...values) : 0,
      max: values.length > 0 ? Math.max(...values) : 0,
      avg: values.length > 0 ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : 0,
      count: filtered.length,
    };

    return { window, series, summary };
  }

  async getProjectProgressSummary(): Promise<any> {
    const projects = await this.listProjects();
    const total = projects.length;
    const byStatus: Record<string, number> = {};
    let totalProgress = 0;

    for (const p of projects) {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      totalProgress += p.progress;
    }

    const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

    const velocitySeries: TimeSeriesPoint[] = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const ts = new Date(now - i * 86400000);
      const completedByDate = projects.filter(p =>
        p.status === "completed" && new Date(p.createdAt).getTime() <= ts.getTime()
      ).length;
      velocitySeries.push({ timestamp: ts.toISOString(), value: completedByDate });
    }

    return {
      total,
      byStatus,
      averageProgress: avgProgress,
      velocity: velocitySeries,
      timestamp: new Date().toISOString(),
    };
  }

  async evaluateAlerts(rules: AlertRule[]): Promise<AlertEvaluation[]> {
    const metrics = await this.listMetrics();
    const evaluations: AlertEvaluation[] = [];

    for (const rule of rules) {
      const matchingMetrics = metrics.filter(m => m.name === rule.metricName);
      if (matchingMetrics.length === 0) {
        evaluations.push({
          metricName: rule.metricName,
          currentValue: 0,
          threshold: rule.threshold,
          operator: rule.operator,
          triggered: false,
          severity: "info",
          message: `No data found for metric "${rule.metricName}"`,
          evaluatedAt: new Date().toISOString(),
        });
        continue;
      }

      const latest = matchingMetrics.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      const val = latest.value;
      let triggered = false;
      switch (rule.operator) {
        case "gt": triggered = val > rule.threshold; break;
        case "lt": triggered = val < rule.threshold; break;
        case "gte": triggered = val >= rule.threshold; break;
        case "lte": triggered = val <= rule.threshold; break;
        case "eq": triggered = val === rule.threshold; break;
      }

      const deviation = Math.abs(val - rule.threshold);
      const severity = triggered && deviation > rule.threshold * 0.5 ? "critical"
        : triggered ? "warning" : "info";

      evaluations.push({
        metricName: rule.metricName,
        currentValue: val,
        threshold: rule.threshold,
        operator: rule.operator,
        triggered,
        severity,
        message: triggered
          ? `Alert: "${rule.metricName}" is ${val} (${rule.operator} ${rule.threshold})`
          : `OK: "${rule.metricName}" is ${val} (within threshold)`,
        evaluatedAt: new Date().toISOString(),
      });
    }

    return evaluations;
  }

  async getKpiSummary(): Promise<any> {
    const metrics = await this.listMetrics();
    const byCategory: Record<string, { metrics: any[]; avg: number; trend: string }> = {};

    for (const m of metrics) {
      if (!byCategory[m.category]) {
        byCategory[m.category] = { metrics: [], avg: 0, trend: "stable" };
      }
      byCategory[m.category].metrics.push(m);
    }

    for (const cat in byCategory) {
      const catMetrics = byCategory[cat].metrics;
      byCategory[cat].avg = Math.round(
        (catMetrics.reduce((s, m) => s + m.value, 0) / catMetrics.length) * 100
      ) / 100;
      const avgChange = catMetrics.reduce((s, m) => s + m.change, 0) / catMetrics.length;
      byCategory[cat].trend = avgChange > 0 ? "up" : avgChange < 0 ? "down" : "stable";
    }

    return {
      categories: byCategory,
      totalMetrics: metrics.length,
      timestamp: new Date().toISOString(),
    };
  }

  async exportMetrics(format: "json" | "csv"): Promise<{ data: string; contentType: string; filename: string }> {
    const metrics = await this.listMetrics();

    if (format === "csv") {
      const headers = "id,name,value,unit,change,category,createdAt";
      const rows = metrics.map(m =>
        [m.id, csvEscape(m.name), m.value, csvEscape(m.unit), m.change, csvEscape(m.category), m.createdAt].join(",")
      );
      return {
        data: [headers, ...rows].join("\n"),
        contentType: "text/csv",
        filename: "beacon_metrics.csv",
      };
    }

    return {
      data: JSON.stringify(metrics, null, 2),
      contentType: "application/json",
      filename: "beacon_metrics.json",
    };
  }

  async exportProjects(format: "json" | "csv"): Promise<{ data: string; contentType: string; filename: string }> {
    const projects = await this.listProjects();

    if (format === "csv") {
      const headers = "id,name,description,status,progress,platform,createdAt";
      const rows = projects.map(p =>
        [p.id, csvEscape(p.name), csvEscape(p.description), csvEscape(p.status), p.progress, csvEscape(p.platform), p.createdAt].join(",")
      );
      return {
        data: [headers, ...rows].join("\n"),
        contentType: "text/csv",
        filename: "beacon_projects.csv",
      };
    }

    return {
      data: JSON.stringify(projects, null, 2),
      contentType: "application/json",
      filename: "beacon_projects.json",
    };
  }

  createWebhook(input: WebhookCreateInput): Omit<WebhookTarget, "secret"> & { hasSecret: boolean } {
    validateWebhookUrl(input.url);
    const id = generateWebhookId();
    const webhook: WebhookTarget = {
      id,
      url: input.url,
      name: input.name,
      events: input.events,
      active: true,
      secret: input.secret,
      createdAt: new Date().toISOString(),
      failureCount: 0,
    };
    webhookStore.set(id, webhook);
    return redactSecret(webhook);
  }

  listWebhooks(): Array<Omit<WebhookTarget, "secret"> & { hasSecret: boolean }> {
    return Array.from(webhookStore.values()).map(redactSecret);
  }

  getWebhook(id: string): (Omit<WebhookTarget, "secret"> & { hasSecret: boolean }) | undefined {
    const webhook = webhookStore.get(id);
    if (!webhook) return undefined;
    return redactSecret(webhook);
  }

  updateWebhook(id: string, updates: Partial<Pick<WebhookTarget, "url" | "name" | "events" | "active" | "secret">>): (Omit<WebhookTarget, "secret"> & { hasSecret: boolean }) | null {
    const webhook = webhookStore.get(id);
    if (!webhook) return null;
    if (updates.url !== undefined) {
      validateWebhookUrl(updates.url);
      webhook.url = updates.url;
    }
    if (updates.name !== undefined) webhook.name = updates.name;
    if (updates.events !== undefined) webhook.events = updates.events;
    if (updates.active !== undefined) webhook.active = updates.active;
    if (updates.secret !== undefined) webhook.secret = updates.secret;
    webhookStore.set(id, webhook);
    return redactSecret(webhook);
  }

  deleteWebhook(id: string): boolean {
    return webhookStore.delete(id);
  }

  async dispatchAlertNotifications(rules: AlertRule[]): Promise<{ evaluations: AlertEvaluation[]; notifications: NotificationRecord[] }> {
    const evaluations = await this.evaluateAlerts(rules);
    const triggered = evaluations.filter(e => e.triggered);
    const notifications: NotificationRecord[] = [];

    const activeWebhooks = Array.from(webhookStore.values()).filter(w => w.active);

    for (const evaluation of triggered) {
      for (const webhook of activeWebhooks) {
        if (!webhook.events.includes("alert.triggered") && !webhook.events.includes("*")) {
          continue;
        }

        const notification: NotificationRecord = {
          id: generateNotificationId(),
          webhookId: webhook.id,
          event: "alert.triggered",
          payload: {
            metricName: evaluation.metricName,
            currentValue: evaluation.currentValue,
            threshold: evaluation.threshold,
            operator: evaluation.operator,
            severity: evaluation.severity,
            message: evaluation.message,
            evaluatedAt: evaluation.evaluatedAt,
          },
          status: "pending",
          attempts: 0,
          createdAt: new Date().toISOString(),
        };

        try {
          const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(webhook.secret ? { "X-Beacon-Secret": webhook.secret } : {}),
            },
            body: JSON.stringify({
              event: "alert.triggered",
              webhookId: webhook.id,
              timestamp: new Date().toISOString(),
              data: notification.payload,
            }),
            signal: AbortSignal.timeout(10000),
          });

          notification.attempts = 1;
          if (response.ok) {
            notification.status = "sent";
            notification.sentAt = new Date().toISOString();
            webhook.lastTriggeredAt = notification.sentAt;
            webhook.failureCount = 0;
          } else {
            notification.status = "failed";
            notification.error = `HTTP ${response.status}: ${response.statusText}`;
            webhook.failureCount++;
          }
        } catch (err) {
          notification.attempts = 1;
          notification.status = "failed";
          notification.error = err instanceof Error ? err.message : "Unknown delivery error";
          webhook.failureCount++;
        }

        notificationStore.push(notification);
        notifications.push(notification);
      }
    }

    return { evaluations, notifications };
  }

  listNotifications(limit = 50): NotificationRecord[] {
    return notificationStore.slice(-limit).reverse();
  }

  async testWebhook(id: string): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    const webhook = webhookStore.get(id);
    if (!webhook) return { success: false, error: "Webhook not found" };

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(webhook.secret ? { "X-Beacon-Secret": webhook.secret } : {}),
        },
        body: JSON.stringify({
          event: "webhook.test",
          webhookId: webhook.id,
          timestamp: new Date().toISOString(),
          data: { message: "Test notification from Beacon" },
        }),
        signal: AbortSignal.timeout(10000),
      });

      return { success: response.ok, statusCode: response.status };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Connection failed" };
    }
  }
}

export const beaconService = new BeaconService();
