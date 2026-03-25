export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type SignalDomain = "operations" | "logistics" | "security" | "performance" | "deployment" | "integration";
export type SignalStatus = "active" | "acknowledged" | "resolved" | "muted";
export type ProjectStatus = "deployed" | "staging" | "development" | "not-started";

export interface Signal {
  id: string;
  title: string;
  description: string;
  domain: SignalDomain;
  source: string;
  severity: Severity;
  status: SignalStatus;
  confidence: number;
  freshness: "live" | "recent" | "stale";
  businessImpact: string;
  recommendedAction: string;
  owner: string;
  timestamp: string;
}

export interface Recommendation {
  id: string;
  title: string;
  reasoning: string;
  projectedImpact: string;
  priority: number;
  actionType: "automate" | "escalate" | "investigate" | "schedule" | "deploy";
  suggestedActions: string[];
  relatedSignals: string[];
  owner: string;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  adapter: string;
  status: "connected" | "degraded" | "disconnected";
  mode: "live" | "demo";
  lastSync: string;
  freshness: "fresh" | "stale" | "expired";
  details: string;
}

export interface ImpactMetric {
  id: string;
  title: string;
  category: "cost" | "risk" | "efficiency" | "revenue";
  value: string;
  trend: "up" | "down" | "stable";
  narrative: string;
  relatedProjects: string[];
}

export interface DashboardSummary {
  healthScore: number;
  totalProjects: number;
  deployedProjects: number;
  avgReadiness: number;
  criticalSignals: number;
  highSignals: number;
  activeSignals: number;
  deploymentCoverage: number;
  dnsTlsCompletion: number;
  attentionQueue: Signal[];
  mode: string;
  timestamp: string;
}

export interface AiAnalysis {
  mode: string;
  analysis: string;
  suggestedActions: string[];
  confidence: number;
  timestamp: string;
}

export interface SignalFilters {
  domain?: string;
  severity?: string;
  freshness?: string;
  status?: string;
  source?: string;
  owner?: string;
}

export interface PortfolioProject {
  name: string;
  route: string;
  readiness: number;
  status: ProjectStatus;
  category: string;
  owner: string;
  blockers: number;
  nextAction: string;
  attentionLevel: "none" | "watch" | "action" | "critical";
  dns: boolean;
  tls: boolean;
  environment: "production" | "staging" | "development";
  uptime: number;
  lastDeploy: string;
}

export interface SignalFilter {
  severity: string;
  domain: string;
  status: string;
  freshness: string;
  source: string;
  owner: string;
}

export interface PortfolioSort {
  field: string;
  dir: "asc" | "desc";
}
