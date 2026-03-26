import { randomUUID } from "crypto";

export interface AutomationRule {
  id: string;
  appDomain: string;
  name: string;
  description: string;
  trigger: { type: string; config: Record<string, any> };
  conditions: Array<{ field: string; operator: string; value: any }>;
  actions: Array<{ type: string; config: Record<string, any> }>;
  schedule?: string;
  enabled: boolean;
  lastRun?: string;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookRegistration {
  id: string;
  appDomain: string;
  url: string;
  name: string;
  events: string[];
  secret?: string;
  active: boolean;
  deliveryLogs: WebhookDeliveryLog[];
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  responseStatus: number | null;
  responseBody: string | null;
  success: boolean;
  deliveredAt: string;
  retryCount: number;
}

export interface Notification {
  id: string;
  appDomain: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  source: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface ReportConfig {
  id: string;
  appDomain: string;
  name: string;
  type: "pdf" | "excel";
  sections: string[];
  schedule?: string;
  lastGenerated?: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  permissions: string[];
  rateLimitTier: "free" | "standard" | "enterprise";
  usageCount: number;
  lastUsed?: string;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
}

export interface ApiUsageRecord {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  timestamp: string;
}

const automationRules: Map<string, AutomationRule> = new Map();
const webhooks: Map<string, WebhookRegistration> = new Map();
const notifications: Notification[] = [];
const reportConfigs: Map<string, ReportConfig> = new Map();
const apiKeys: Map<string, ApiKey> = new Map();
const apiUsageRecords: ApiUsageRecord[] = [];

function seedDemoData() {
  const domains = [
    "rosie", "aegis", "firestorm", "inca", "nimbus", "beacon",
    "vessels", "zeus", "lyte", "dreamera", "dreamscape", "alloyscape",
    "szl-holdings", "carlota-jo", "lutar", "career", "apps-showcase", "readiness-report",
  ];

  const ruleTemplates: Array<{ domain: string; name: string; trigger: any; actions: any[] }> = [
    { domain: "rosie", name: "Critical Threat Auto-Escalation", trigger: { type: "threat.detected", config: { severity: "critical" } }, actions: [{ type: "notify", config: { channel: "slack", target: "#security-ops" } }, { type: "create_incident", config: { priority: "P1" } }] },
    { domain: "rosie", name: "Daily Scan Schedule", trigger: { type: "cron", config: { expression: "0 2 * * *" } }, actions: [{ type: "run_scan", config: { scanType: "full", platforms: ["all"] } }] },
    { domain: "aegis", name: "Compliance Drift Alert", trigger: { type: "compliance.score_changed", config: { threshold: -5 } }, actions: [{ type: "notify", config: { channel: "email", target: "security-team@szl.com" } }] },
    { domain: "vessels", name: "CII Rating Degradation Alert", trigger: { type: "vessel.cii_changed", config: { rating: "D" } }, actions: [{ type: "notify", config: { channel: "slack", target: "#fleet-ops" } }, { type: "create_task", config: { title: "Review vessel efficiency" } }] },
    { domain: "beacon", name: "KPI Threshold Breach", trigger: { type: "metric.threshold", config: { operator: "gt", value: 100 } }, actions: [{ type: "notify", config: { channel: "in-app" } }, { type: "webhook", config: { url: "https://hooks.slack.com/..." } }] },
    { domain: "nimbus", name: "Low Confidence Prediction Alert", trigger: { type: "prediction.created", config: { confidenceBelow: 60 } }, actions: [{ type: "notify", config: { channel: "in-app" } }] },
    { domain: "inca", name: "Experiment Failure Notification", trigger: { type: "experiment.status_changed", config: { status: "failed" } }, actions: [{ type: "notify", config: { channel: "email", target: "research@szl.com" } }] },
    { domain: "zeus", name: "Module Health Degradation", trigger: { type: "module.uptime_below", config: { threshold: 95 } }, actions: [{ type: "notify", config: { channel: "pagerduty" } }, { type: "auto_scale", config: { factor: 1.5 } }] },
    { domain: "lyte", name: "SLA Breach Warning", trigger: { type: "sla.breach_imminent", config: { minutesBefore: 30 } }, actions: [{ type: "notify", config: { channel: "slack", target: "#engineering" } }] },
    { domain: "dreamera", name: "Content Performance Alert", trigger: { type: "content.engagement_drop", config: { threshold: -20 } }, actions: [{ type: "notify", config: { channel: "in-app" } }] },
  ];

  for (const tmpl of ruleTemplates) {
    const id = randomUUID();
    automationRules.set(id, {
      id,
      appDomain: tmpl.domain,
      name: tmpl.name,
      description: `Automated rule for ${tmpl.name.toLowerCase()}`,
      trigger: tmpl.trigger,
      conditions: [],
      actions: tmpl.actions,
      schedule: tmpl.trigger.type === "cron" ? tmpl.trigger.config.expression : undefined,
      enabled: true,
      lastRun: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      runCount: Math.floor(Math.random() * 150) + 10,
      createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const webhookTemplates = [
    { domain: "rosie", name: "Security Events Webhook", events: ["threat.created", "incident.created", "scan.completed"] },
    { domain: "beacon", name: "KPI Alert Webhook", events: ["metric.threshold_breached", "alert.triggered"] },
    { domain: "vessels", name: "Fleet Status Webhook", events: ["vessel.status_changed", "voyage.completed", "alert.created"] },
    { domain: "nimbus", name: "Prediction Webhook", events: ["prediction.created", "alert.triggered"] },
    { domain: "inca", name: "Research Events", events: ["experiment.completed", "project.updated"] },
  ];

  for (const tmpl of webhookTemplates) {
    const id = randomUUID();
    const logs: WebhookDeliveryLog[] = [];
    for (let i = 0; i < 5; i++) {
      logs.push({
        id: randomUUID(),
        webhookId: id,
        event: tmpl.events[Math.floor(Math.random() * tmpl.events.length)],
        payload: { type: "demo", timestamp: new Date().toISOString() },
        responseStatus: Math.random() > 0.1 ? 200 : 500,
        responseBody: Math.random() > 0.1 ? '{"ok":true}' : '{"error":"timeout"}',
        success: Math.random() > 0.1,
        deliveredAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        retryCount: 0,
      });
    }
    webhooks.set(id, {
      id,
      appDomain: tmpl.domain,
      url: `https://hooks.example.com/${tmpl.domain}`,
      name: tmpl.name,
      events: tmpl.events,
      secret: `whsec_${randomUUID().replace(/-/g, "").slice(0, 24)}`,
      active: true,
      deliveryLogs: logs,
      createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const notifTemplates = [
    { domain: "rosie", title: "Critical Threat Detected", message: "APT-29 phishing campaign targeting executive accounts. Auto-escalated to P1.", type: "error" as const, source: "Threat Detection Engine" },
    { domain: "rosie", title: "Scan Completed", message: "Full network scan completed. 3 new vulnerabilities found, 2 critical.", type: "warning" as const, source: "Automated Scanner" },
    { domain: "aegis", title: "SOC 2 Compliance Score Updated", message: "Compliance score improved to 94%. 3 controls pending review.", type: "success" as const, source: "Compliance Engine" },
    { domain: "vessels", title: "Vessel CII Rating Change", message: "VLGC-009 Clermont CII rating degraded to D. Operational restrictions imminent.", type: "error" as const, source: "Emissions Monitor" },
    { domain: "beacon", title: "Revenue KPI Threshold Breached", message: "Monthly recurring revenue exceeded $2.4M target by 12%.", type: "success" as const, source: "KPI Engine" },
    { domain: "nimbus", title: "Prediction Accuracy Drop", message: "Market trend prediction accuracy dropped below 75% threshold.", type: "warning" as const, source: "Model Monitor" },
    { domain: "inca", title: "Experiment Completed", message: "GPT-4o fine-tuning experiment completed with 94.2% accuracy.", type: "success" as const, source: "Experiment Pipeline" },
    { domain: "zeus", title: "Module Auto-Scaled", message: "Auth module scaled from 2 to 4 instances due to traffic spike.", type: "info" as const, source: "Auto-Scaler" },
    { domain: "lyte", title: "SLA Warning", message: "Firestorm API approaching 200ms SLA threshold. Current p95: 185ms.", type: "warning" as const, source: "SLA Monitor" },
    { domain: "dreamera", title: "Campaign Published", message: "Q1 Product Launch campaign published across 4 channels.", type: "success" as const, source: "Campaign Engine" },
    { domain: "carlota-jo", title: "New Inquiry Received", message: "Enterprise client inquiry from Acme Corp for AI Strategy consulting.", type: "info" as const, source: "Lead Pipeline" },
    { domain: "lutar", title: "Daily Briefing Ready", message: "Your morning briefing is ready with 3 critical items requiring attention.", type: "info" as const, source: "Briefing Generator" },
    { domain: "firestorm", title: "Simulation Completed", message: "Red team exercise 'Operation Thunder' completed. 78% detection rate.", type: "info" as const, source: "Simulation Engine" },
    { domain: "dreamscape", title: "Asset Library Updated", message: "42 new assets auto-tagged and added to the creative library.", type: "info" as const, source: "Asset Manager" },
    { domain: "alloyscape", title: "Cost Alert", message: "AI API spend approaching 80% of monthly budget ($3,200/$4,000).", type: "warning" as const, source: "Cost Monitor" },
  ];

  for (const tmpl of notifTemplates) {
    notifications.push({
      id: randomUUID(),
      appDomain: tmpl.domain,
      title: tmpl.title,
      message: tmpl.message,
      type: tmpl.type,
      source: tmpl.source,
      read: Math.random() > 0.6,
      createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    });
  }

  const demoKey: ApiKey = {
    id: randomUUID(),
    name: "Production API Key",
    keyPrefix: "szl_live_",
    keyHash: "hashed_demo_key",
    permissions: ["read:all", "write:all"],
    rateLimitTier: "enterprise",
    usageCount: 12847,
    lastUsed: new Date().toISOString(),
    active: true,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  };
  apiKeys.set(demoKey.id, demoKey);

  const devKey: ApiKey = {
    id: randomUUID(),
    name: "Development API Key",
    keyPrefix: "szl_test_",
    keyHash: "hashed_dev_key",
    permissions: ["read:all"],
    rateLimitTier: "standard",
    usageCount: 3421,
    lastUsed: new Date(Date.now() - 3600000).toISOString(),
    active: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  };
  apiKeys.set(devKey.id, devKey);
}

seedDemoData();

export const extensionsService = {
  listAutomationRules(appDomain?: string): AutomationRule[] {
    const rules = Array.from(automationRules.values());
    return appDomain ? rules.filter(r => r.appDomain === appDomain) : rules;
  },

  getAutomationRule(id: string): AutomationRule | undefined {
    return automationRules.get(id);
  },

  createAutomationRule(data: Omit<AutomationRule, "id" | "createdAt" | "updatedAt" | "runCount" | "lastRun">): AutomationRule {
    const rule: AutomationRule = {
      ...data,
      id: randomUUID(),
      runCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    automationRules.set(rule.id, rule);
    return rule;
  },

  updateAutomationRule(id: string, data: Partial<AutomationRule>): AutomationRule | null {
    const existing = automationRules.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id: existing.id, updatedAt: new Date().toISOString() };
    automationRules.set(id, updated);
    return updated;
  },

  deleteAutomationRule(id: string): boolean {
    return automationRules.delete(id);
  },

  executeAutomationRule(id: string): { success: boolean; message: string; executionId: string } {
    const rule = automationRules.get(id);
    if (!rule) return { success: false, message: "Rule not found", executionId: "" };
    rule.lastRun = new Date().toISOString();
    rule.runCount++;
    rule.updatedAt = new Date().toISOString();
    const executionId = randomUUID();
    for (const action of rule.actions) {
      if (action.type === "notify") {
        notifications.push({
          id: randomUUID(),
          appDomain: rule.appDomain,
          title: `Automation: ${rule.name}`,
          message: `Rule "${rule.name}" executed successfully. Action: ${action.type}`,
          type: "info",
          source: "Automation Engine",
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
    return { success: true, message: `Rule "${rule.name}" executed successfully`, executionId };
  },

  listWebhooks(appDomain?: string): WebhookRegistration[] {
    const wh = Array.from(webhooks.values());
    return appDomain ? wh.filter(w => w.appDomain === appDomain) : wh;
  },

  getWebhook(id: string): WebhookRegistration | undefined {
    return webhooks.get(id);
  },

  createWebhook(data: Omit<WebhookRegistration, "id" | "createdAt" | "updatedAt" | "deliveryLogs">): WebhookRegistration {
    const wh: WebhookRegistration = {
      ...data,
      id: randomUUID(),
      deliveryLogs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    webhooks.set(wh.id, wh);
    return wh;
  },

  updateWebhook(id: string, data: Partial<WebhookRegistration>): WebhookRegistration | null {
    const existing = webhooks.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id: existing.id, updatedAt: new Date().toISOString() };
    webhooks.set(id, updated);
    return updated;
  },

  deleteWebhook(id: string): boolean {
    return webhooks.delete(id);
  },

  testWebhook(id: string): { success: boolean; statusCode: number; responseTime: number } {
    const wh = webhooks.get(id);
    if (!wh) return { success: false, statusCode: 0, responseTime: 0 };
    const log: WebhookDeliveryLog = {
      id: randomUUID(),
      webhookId: id,
      event: "test.ping",
      payload: { type: "test", timestamp: new Date().toISOString() },
      responseStatus: 200,
      responseBody: '{"ok":true}',
      success: true,
      deliveredAt: new Date().toISOString(),
      retryCount: 0,
    };
    wh.deliveryLogs.unshift(log);
    return { success: true, statusCode: 200, responseTime: Math.floor(Math.random() * 200) + 50 };
  },

  listNotifications(appDomain?: string, unreadOnly = false): Notification[] {
    let notifs = appDomain ? notifications.filter(n => n.appDomain === appDomain) : [...notifications];
    if (unreadOnly) notifs = notifs.filter(n => !n.read);
    return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markNotificationRead(id: string): boolean {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.read = true;
    return true;
  },

  markAllNotificationsRead(appDomain: string): number {
    let count = 0;
    for (const n of notifications) {
      if (n.appDomain === appDomain && !n.read) {
        n.read = true;
        count++;
      }
    }
    return count;
  },

  createNotification(data: Omit<Notification, "id" | "createdAt" | "read">): Notification {
    const notif: Notification = {
      ...data,
      id: randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(notif);
    return notif;
  },

  getNotificationStats(appDomain?: string): { total: number; unread: number; byType: Record<string, number> } {
    const notifs = appDomain ? notifications.filter(n => n.appDomain === appDomain) : notifications;
    const byType: Record<string, number> = {};
    for (const n of notifs) {
      byType[n.type] = (byType[n.type] || 0) + 1;
    }
    return {
      total: notifs.length,
      unread: notifs.filter(n => !n.read).length,
      byType,
    };
  },

  listReportConfigs(appDomain?: string): ReportConfig[] {
    const configs = Array.from(reportConfigs.values());
    return appDomain ? configs.filter(r => r.appDomain === appDomain) : configs;
  },

  createReportConfig(data: Omit<ReportConfig, "id" | "createdAt">): ReportConfig {
    const config: ReportConfig = {
      ...data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    reportConfigs.set(config.id, config);
    return config;
  },

  generateReport(id: string): { success: boolean; reportId: string; format: string; generatedAt: string } {
    const config = reportConfigs.get(id);
    if (!config) return { success: false, reportId: "", format: "", generatedAt: "" };
    config.lastGenerated = new Date().toISOString();
    return {
      success: true,
      reportId: randomUUID(),
      format: config.type,
      generatedAt: config.lastGenerated,
    };
  },

  listApiKeys(): ApiKey[] {
    return Array.from(apiKeys.values()).map(k => ({ ...k, keyHash: "***" }));
  },

  createApiKey(data: { name: string; permissions: string[]; rateLimitTier: ApiKey["rateLimitTier"] }): { key: ApiKey; rawKey: string } {
    const rawKey = `szl_${data.rateLimitTier === "enterprise" ? "live" : "test"}_${randomUUID().replace(/-/g, "")}`;
    const key: ApiKey = {
      id: randomUUID(),
      name: data.name,
      keyPrefix: rawKey.slice(0, 12),
      keyHash: "***",
      permissions: data.permissions,
      rateLimitTier: data.rateLimitTier,
      usageCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
    };
    apiKeys.set(key.id, key);
    return { key, rawKey };
  },

  revokeApiKey(id: string): boolean {
    const key = apiKeys.get(id);
    if (!key) return false;
    key.active = false;
    return true;
  },

  getApiUsageStats(): { totalRequests: number; avgResponseTime: number; byEndpoint: Record<string, number>; byDay: Array<{ date: string; count: number }> } {
    const byEndpoint: Record<string, number> = {
      "GET /api/rosie/threats": 3240,
      "GET /api/beacon/metrics": 2890,
      "GET /api/vessels/fleet": 2150,
      "POST /api/nimbus/predictions": 1820,
      "GET /api/inca/experiments": 1650,
      "GET /api/zeus/modules": 1340,
      "GET /api/lyte/signals": 980,
      "GET /api/dreamera/content": 870,
    };

    const byDay: Array<{ date: string; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      byDay.push({ date, count: Math.floor(Math.random() * 500) + 200 });
    }

    return {
      totalRequests: Object.values(byEndpoint).reduce((s, v) => s + v, 0),
      avgResponseTime: 142,
      byEndpoint,
      byDay,
    };
  },

  getRateLimitTiers(): Array<{ tier: string; requestsPerMinute: number; requestsPerDay: number; burstLimit: number }> {
    return [
      { tier: "free", requestsPerMinute: 10, requestsPerDay: 1000, burstLimit: 20 },
      { tier: "standard", requestsPerMinute: 60, requestsPerDay: 10000, burstLimit: 100 },
      { tier: "enterprise", requestsPerMinute: 300, requestsPerDay: 100000, burstLimit: 500 },
    ];
  },
};
