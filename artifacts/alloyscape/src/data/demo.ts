export interface SystemModule {
  id: string;
  name: string;
  description: string;
  version: string;
  status: "running" | "degraded" | "offline" | "maintenance";
  uptime: string;
  lastHealthCheck: string;
  cpu: number;
  memory: number;
  instances: number;
}

export interface Workflow {
  id: string;
  name: string;
  status: "running" | "queued" | "completed" | "failed" | "paused";
  pipeline: string;
  startedAt: string;
  duration: string;
  progress: number;
  triggeredBy: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: number;
  lastUsed: string;
  usageCount: number;
  tags: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  message: string;
  traceId?: string;
}

export interface ServiceHealth {
  id: string;
  name: string;
  type: string;
  status: "healthy" | "warning" | "critical" | "unknown";
  responseTime: number;
  uptime: number;
  lastIncident: string;
  endpoint: string;
}

export interface Connector {
  id: string;
  name: string;
  type: string;
  source: string;
  target: string;
  status: "active" | "inactive" | "error";
  lastSync: string;
  eventsProcessed: number;
}

export interface UserRole {
  id: string;
  username: string;
  email: string;
  role: "admin" | "operator" | "viewer" | "developer";
  lastActive: string;
  status: "active" | "suspended" | "invited";
  permissions: string[];
}

export const modules: SystemModule[] = [
  { id: "mod-001", name: "ROSIE", description: "Security Intelligence & Threat Analysis Engine", version: "4.2.1", status: "running", uptime: "99.97%", lastHealthCheck: "12s ago", cpu: 34, memory: 62, instances: 3 },
  { id: "mod-002", name: "Beacon", description: "Strategic KPI & Project Management Platform", version: "3.8.0", status: "running", uptime: "99.95%", lastHealthCheck: "8s ago", cpu: 22, memory: 48, instances: 2 },
  { id: "mod-003", name: "Nimbus", description: "AI Predictive Analytics & Forecasting", version: "2.5.3", status: "running", uptime: "99.92%", lastHealthCheck: "15s ago", cpu: 67, memory: 78, instances: 4 },
  { id: "mod-004", name: "Aegis", description: "Identity & Access Management Gateway", version: "5.1.0", status: "running", uptime: "99.99%", lastHealthCheck: "3s ago", cpu: 18, memory: 35, instances: 2 },
  { id: "mod-005", name: "Firestorm", description: "Competitive Intelligence & Market Analysis", version: "1.9.7", status: "degraded", uptime: "98.45%", lastHealthCheck: "45s ago", cpu: 89, memory: 91, instances: 2 },
  { id: "mod-006", name: "DreamEra", description: "AI Content Generation & Storytelling", version: "2.1.4", status: "running", uptime: "99.88%", lastHealthCheck: "20s ago", cpu: 45, memory: 56, instances: 2 },
  { id: "mod-007", name: "Lutar", description: "Financial Operations & Payment Processing", version: "3.3.2", status: "running", uptime: "99.99%", lastHealthCheck: "5s ago", cpu: 28, memory: 42, instances: 3 },
  { id: "mod-008", name: "Zeus", description: "Infrastructure Monitoring & Observability", version: "2.0.8", status: "maintenance", uptime: "97.20%", lastHealthCheck: "2m ago", cpu: 0, memory: 0, instances: 0 },
  { id: "mod-009", name: "Alloy Core", description: "Neural AI Engine & Orchestration Runtime", version: "1.4.0", status: "running", uptime: "99.94%", lastHealthCheck: "7s ago", cpu: 52, memory: 68, instances: 5 },
];

export const workflows: Workflow[] = [
  { id: "wf-001", name: "Daily Threat Assessment", status: "running", pipeline: "Security Pipeline", startedAt: "2026-03-25T08:00:00Z", duration: "12m 34s", progress: 78, triggeredBy: "scheduler" },
  { id: "wf-002", name: "KPI Data Aggregation", status: "completed", pipeline: "Analytics Pipeline", startedAt: "2026-03-25T07:30:00Z", duration: "8m 12s", progress: 100, triggeredBy: "scheduler" },
  { id: "wf-003", name: "Model Retraining — Nimbus v3", status: "running", pipeline: "ML Pipeline", startedAt: "2026-03-25T06:00:00Z", duration: "2h 15m", progress: 45, triggeredBy: "admin" },
  { id: "wf-004", name: "Market Data Sync", status: "queued", pipeline: "Data Pipeline", startedAt: "", duration: "—", progress: 0, triggeredBy: "api" },
  { id: "wf-005", name: "User Session Cleanup", status: "completed", pipeline: "Maintenance Pipeline", startedAt: "2026-03-25T05:00:00Z", duration: "3m 48s", progress: 100, triggeredBy: "scheduler" },
  { id: "wf-006", name: "Content Generation Batch", status: "failed", pipeline: "Content Pipeline", startedAt: "2026-03-25T07:45:00Z", duration: "5m 22s", progress: 62, triggeredBy: "api" },
  { id: "wf-007", name: "Financial Reconciliation", status: "running", pipeline: "Finance Pipeline", startedAt: "2026-03-25T08:15:00Z", duration: "4m 10s", progress: 33, triggeredBy: "scheduler" },
  { id: "wf-008", name: "Infrastructure Health Scan", status: "paused", pipeline: "DevOps Pipeline", startedAt: "2026-03-25T07:00:00Z", duration: "15m 00s", progress: 50, triggeredBy: "system" },
];

export const workflowTemplates: WorkflowTemplate[] = [
  { id: "tmpl-001", name: "Security Threat Analysis", description: "End-to-end pipeline for collecting, analyzing, and reporting security threats across all platforms", category: "Security", steps: 8, lastUsed: "2 hours ago", usageCount: 342, tags: ["security", "automated", "critical"] },
  { id: "tmpl-002", name: "Data ETL Pipeline", description: "Extract, transform, and load data from external sources into the unified data lake", category: "Data", steps: 5, lastUsed: "4 hours ago", usageCount: 1205, tags: ["data", "etl", "scheduled"] },
  { id: "tmpl-003", name: "ML Model Deployment", description: "Train, validate, and deploy machine learning models with automated A/B testing", category: "Machine Learning", steps: 12, lastUsed: "1 day ago", usageCount: 89, tags: ["ml", "deployment", "testing"] },
  { id: "tmpl-004", name: "Incident Response", description: "Automated incident triage, notification, and escalation workflow", category: "Operations", steps: 6, lastUsed: "3 days ago", usageCount: 56, tags: ["incident", "operations", "critical"] },
  { id: "tmpl-005", name: "Content Publication", description: "Multi-platform content generation, review, and publication workflow", category: "Content", steps: 7, lastUsed: "6 hours ago", usageCount: 178, tags: ["content", "publication", "multi-platform"] },
  { id: "tmpl-006", name: "Financial Report Generation", description: "Automated financial data aggregation, analysis, and report generation", category: "Finance", steps: 9, lastUsed: "12 hours ago", usageCount: 234, tags: ["finance", "reports", "automated"] },
  { id: "tmpl-007", name: "Service Health Monitor", description: "Continuous health monitoring with automated recovery and alerting", category: "Infrastructure", steps: 4, lastUsed: "30 minutes ago", usageCount: 4521, tags: ["monitoring", "health", "automated"] },
  { id: "tmpl-008", name: "User Onboarding", description: "Automated user provisioning, role assignment, and welcome notification flow", category: "Operations", steps: 5, lastUsed: "2 days ago", usageCount: 112, tags: ["users", "onboarding", "automated"] },
];

export const logEntries: LogEntry[] = [
  { id: "log-001", timestamp: "2026-03-25T08:32:15.234Z", level: "info", service: "alloy-core", message: "Orchestration cycle completed — 8 workflows processed, 0 failures", traceId: "abc-123" },
  { id: "log-002", timestamp: "2026-03-25T08:31:58.102Z", level: "warn", service: "firestorm", message: "High CPU utilization detected (89%) — scaling up instances", traceId: "def-456" },
  { id: "log-003", timestamp: "2026-03-25T08:31:45.891Z", level: "error", service: "dreamera", message: "Content generation failed: Rate limit exceeded for GPT-4 endpoint", traceId: "ghi-789" },
  { id: "log-004", timestamp: "2026-03-25T08:31:30.445Z", level: "info", service: "rosie", message: "Threat scan completed — 0 critical, 2 medium, 5 low severity findings", traceId: "jkl-012" },
  { id: "log-005", timestamp: "2026-03-25T08:31:12.667Z", level: "debug", service: "beacon", message: "KPI cache refreshed — 24 metrics updated across 6 projects" },
  { id: "log-006", timestamp: "2026-03-25T08:30:58.123Z", level: "info", service: "aegis", message: "Authentication token rotated for service account [nimbus-ml-worker]", traceId: "mno-345" },
  { id: "log-007", timestamp: "2026-03-25T08:30:45.890Z", level: "warn", service: "zeus", message: "Maintenance window active — health check endpoints returning 503" },
  { id: "log-008", timestamp: "2026-03-25T08:30:30.112Z", level: "info", service: "nimbus", message: "Prediction batch v3.2 completed — 1,247 forecasts generated (avg confidence: 87.3%)", traceId: "pqr-678" },
  { id: "log-009", timestamp: "2026-03-25T08:30:15.334Z", level: "error", service: "alloy-core", message: "Workflow [wf-006] failed at step 4/7: Content generation service unavailable", traceId: "stu-901" },
  { id: "log-010", timestamp: "2026-03-25T08:30:00.556Z", level: "info", service: "lutar", message: "Daily reconciliation completed — 342 transactions verified, $1.2M processed" },
  { id: "log-011", timestamp: "2026-03-25T08:29:45.778Z", level: "debug", service: "alloy-core", message: "Queue depth: security=2, analytics=5, ml=1, data=3, content=0" },
  { id: "log-012", timestamp: "2026-03-25T08:29:30.991Z", level: "info", service: "rosie", message: "Anomaly detection model updated — new baseline established from 72h window" },
  { id: "log-013", timestamp: "2026-03-25T08:29:15.213Z", level: "warn", service: "nimbus", message: "Model training epoch 45/100 — validation loss plateauing, consider early stopping", traceId: "vwx-234" },
  { id: "log-014", timestamp: "2026-03-25T08:29:00.435Z", level: "info", service: "beacon", message: "Project milestone achieved: Q1 revenue target exceeded by 12%" },
  { id: "log-015", timestamp: "2026-03-25T08:28:45.657Z", level: "error", service: "firestorm", message: "External API timeout: Competitor data feed unresponsive (30s timeout exceeded)", traceId: "yza-567" },
  { id: "log-016", timestamp: "2026-03-25T08:28:30.879Z", level: "info", service: "aegis", message: "Access policy updated — 3 new IP ranges whitelisted for VPN gateway" },
  { id: "log-017", timestamp: "2026-03-25T08:28:15.101Z", level: "debug", service: "lutar", message: "Payment gateway health check — Stripe: OK, PayPal: OK, Wire: OK" },
  { id: "log-018", timestamp: "2026-03-25T08:28:00.323Z", level: "info", service: "alloy-core", message: "Auto-scaling triggered for nimbus — instances: 4 → 5 (CPU threshold)" },
];

export const serviceHealthData: ServiceHealth[] = [
  { id: "svc-001", name: "ROSIE API", type: "REST API", status: "healthy", responseTime: 45, uptime: 99.97, lastIncident: "14 days ago", endpoint: "/api/rosie" },
  { id: "svc-002", name: "Beacon Dashboard", type: "Web App", status: "healthy", responseTime: 120, uptime: 99.95, lastIncident: "7 days ago", endpoint: "/beacon" },
  { id: "svc-003", name: "Nimbus ML Engine", type: "gRPC Service", status: "warning", responseTime: 890, uptime: 99.92, lastIncident: "2 hours ago", endpoint: "grpc://nimbus:50051" },
  { id: "svc-004", name: "Aegis Auth Gateway", type: "Auth Service", status: "healthy", responseTime: 12, uptime: 99.99, lastIncident: "30 days ago", endpoint: "/api/auth" },
  { id: "svc-005", name: "Firestorm Intel", type: "REST API", status: "critical", responseTime: 2400, uptime: 98.45, lastIncident: "45 minutes ago", endpoint: "/api/firestorm" },
  { id: "svc-006", name: "DreamEra Engine", type: "REST API", status: "healthy", responseTime: 340, uptime: 99.88, lastIncident: "3 days ago", endpoint: "/api/dreamera" },
  { id: "svc-007", name: "Lutar Payments", type: "REST API", status: "healthy", responseTime: 28, uptime: 99.99, lastIncident: "60 days ago", endpoint: "/api/lutar" },
  { id: "svc-008", name: "Zeus Monitor", type: "Agent", status: "critical", responseTime: 0, uptime: 97.20, lastIncident: "Active", endpoint: "/api/zeus" },
  { id: "svc-009", name: "PostgreSQL Primary", type: "Database", status: "healthy", responseTime: 5, uptime: 99.99, lastIncident: "90 days ago", endpoint: "pg://primary:5432" },
  { id: "svc-010", name: "Redis Cache", type: "Cache", status: "healthy", responseTime: 2, uptime: 99.98, lastIncident: "21 days ago", endpoint: "redis://cache:6379" },
  { id: "svc-011", name: "Alloy Orchestrator", type: "Core Engine", status: "healthy", responseTime: 18, uptime: 99.94, lastIncident: "5 days ago", endpoint: "/api/alloy" },
  { id: "svc-012", name: "Blob Storage", type: "Object Store", status: "healthy", responseTime: 65, uptime: 99.96, lastIncident: "45 days ago", endpoint: "https://storage.szl.io" },
];

export const connectors: Connector[] = [
  { id: "conn-001", name: "ROSIE → Alloy Events", type: "Event Stream", source: "ROSIE", target: "Alloy Core", status: "active", lastSync: "12s ago", eventsProcessed: 48291 },
  { id: "conn-002", name: "Beacon → Data Lake", type: "ETL", source: "Beacon", target: "PostgreSQL", status: "active", lastSync: "5m ago", eventsProcessed: 12045 },
  { id: "conn-003", name: "Nimbus Model Registry", type: "API Bridge", source: "Nimbus", target: "Alloy Core", status: "active", lastSync: "2m ago", eventsProcessed: 8934 },
  { id: "conn-004", name: "Aegis SSO Federation", type: "SAML/OIDC", source: "Aegis", target: "All Services", status: "active", lastSync: "30s ago", eventsProcessed: 156782 },
  { id: "conn-005", name: "Firestorm Market Feed", type: "WebSocket", source: "External APIs", target: "Firestorm", status: "error", lastSync: "45m ago", eventsProcessed: 2341 },
  { id: "conn-006", name: "DreamEra Content Bus", type: "Message Queue", source: "DreamEra", target: "Alloy Core", status: "active", lastSync: "1m ago", eventsProcessed: 5621 },
  { id: "conn-007", name: "Lutar Payment Webhook", type: "Webhook", source: "Stripe", target: "Lutar", status: "active", lastSync: "3m ago", eventsProcessed: 89234 },
  { id: "conn-008", name: "Zeus Telemetry", type: "Metrics Stream", source: "All Services", target: "Zeus", status: "inactive", lastSync: "2h ago", eventsProcessed: 234891 },
];

export const users: UserRole[] = [
  { id: "usr-001", username: "s.zhang", email: "s.zhang@szl.holdings", role: "admin", lastActive: "2 minutes ago", status: "active", permissions: ["all"] },
  { id: "usr-002", username: "ops.monitor", email: "ops@szl.holdings", role: "operator", lastActive: "5 minutes ago", status: "active", permissions: ["view_all", "manage_workflows", "view_logs", "manage_connectors"] },
  { id: "usr-003", username: "dev.team", email: "devteam@szl.holdings", role: "developer", lastActive: "1 hour ago", status: "active", permissions: ["view_all", "manage_workflows", "view_logs", "deploy_modules"] },
  { id: "usr-004", username: "analyst.one", email: "analyst1@szl.holdings", role: "viewer", lastActive: "3 hours ago", status: "active", permissions: ["view_dashboard", "view_logs"] },
  { id: "usr-005", username: "security.lead", email: "security@szl.holdings", role: "operator", lastActive: "30 minutes ago", status: "active", permissions: ["view_all", "manage_security", "view_logs"] },
  { id: "usr-006", username: "finance.ops", email: "finops@szl.holdings", role: "operator", lastActive: "2 days ago", status: "suspended", permissions: ["view_dashboard", "view_finance"] },
  { id: "usr-007", username: "new.hire", email: "newhire@szl.holdings", role: "viewer", lastActive: "Never", status: "invited", permissions: ["view_dashboard"] },
];

export const dashboardStats = {
  totalModules: modules.length,
  activeModules: modules.filter(m => m.status === "running").length,
  totalWorkflows: workflows.length,
  activeWorkflows: workflows.filter(w => w.status === "running").length,
  queuedWorkflows: workflows.filter(w => w.status === "queued").length,
  failedWorkflows: workflows.filter(w => w.status === "failed").length,
  healthyServices: serviceHealthData.filter(s => s.status === "healthy").length,
  totalServices: serviceHealthData.length,
  activeConnectors: connectors.filter(c => c.status === "active").length,
  totalConnectors: connectors.length,
  totalUsers: users.length,
  avgResponseTime: Math.round(serviceHealthData.filter(s => s.responseTime > 0).reduce((sum, s) => sum + s.responseTime, 0) / serviceHealthData.filter(s => s.responseTime > 0).length),
  eventsProcessed: connectors.reduce((sum, c) => sum + c.eventsProcessed, 0),
  platformUptime: 99.94,
};
