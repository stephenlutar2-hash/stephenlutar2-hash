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

export type LyteViewMode = "executive" | "operator";

export interface ExecutiveScorecardMetric {
  id: string;
  label: string;
  value: string;
  trend: "up" | "down" | "stable";
  severity: "healthy" | "warning" | "critical";
  detail: string;
}

export interface ExecutiveScorecard {
  overallConfidence: number;
  revenueAtRisk: string;
  pipelineExposure: string;
  deploymentRisk: string;
  connectorHealth: string;
  customerImpact: string;
  slaHealth: string;
  metrics: ExecutiveScorecardMetric[];
  timestamp: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: "active" | "investigating" | "mitigated" | "resolved";
  startedAt: string;
  duration: string;
  affectedServices: string[];
  assignee: string;
  updates: string[];
}

export interface DeploymentMarker {
  id: string;
  app: string;
  version: string;
  commitHash: string;
  timestamp: string;
  status: "success" | "failed" | "rolling-back" | "in-progress";
  deployer: string;
}

export interface JobRun {
  id: string;
  name: string;
  status: "running" | "completed" | "failed" | "scheduled";
  lastRun: string;
  duration: string;
  nextRun: string;
}

export interface ConnectorSync {
  id: string;
  name: string;
  status: "synced" | "syncing" | "failed" | "stale";
  lastSync: string;
  recordsProcessed: number;
  errorCount: number;
}

export interface BlastRadiusItem {
  service: string;
  impact: "direct" | "indirect";
  status: "affected" | "at-risk" | "healthy";
  downstream: string[];
}

export interface OperatorCommandCenterData {
  incidents: Incident[];
  deployments: DeploymentMarker[];
  jobs: JobRun[];
  connectorSyncs: ConnectorSync[];
  blastRadius: BlastRadiusItem[];
  queueLag: number;
  dataFreshness: Record<string, string>;
  timestamp: string;
}

export interface ServiceNode {
  id: string;
  name: string;
  type: "app" | "api" | "database" | "storage" | "job" | "connector" | "external";
  status: "healthy" | "degraded" | "down" | "unknown";
  lastCheck: string;
  uptime: number;
  latency: number;
}

export interface ServiceEdge {
  source: string;
  target: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
}

export interface ServiceMapData {
  nodes: ServiceNode[];
  edges: ServiceEdge[];
  timestamp: string;
}

export interface SloTarget {
  id: string;
  service: string;
  metric: "availability" | "latency" | "freshness" | "error-rate";
  target: number;
  current: number;
  unit: string;
  window: string;
  burnRate: number;
  budgetRemaining: number;
  budgetTotal: number;
  status: "healthy" | "warning" | "breached";
  impactIfBreached: string;
}

export interface SloData {
  targets: SloTarget[];
  timestamp: string;
}

export interface SyntheticProbe {
  id: string;
  name: string;
  type: "http" | "flow" | "handshake" | "latency";
  target: string;
  status: "passing" | "failing" | "degraded" | "unknown";
  lastCheck: string;
  responseTime: number;
  successRate: number;
  history: { timestamp: string; status: "passing" | "failing" | "degraded"; responseTime: number }[];
}

export interface SyntheticProbeData {
  probes: SyntheticProbe[];
  overallHealth: number;
  timestamp: string;
}

export interface ReleaseEvent {
  id: string;
  app: string;
  version: string;
  commitHash: string;
  timestamp: string;
  deployer: string;
  status: "success" | "failed" | "rolled-back";
  featureFlags: { name: string; enabled: boolean }[];
  firstSeenErrors: string[];
  rollbackMarker: boolean;
  changelog: string[];
}

export interface ReleaseIntelligenceData {
  releases: ReleaseEvent[];
  currentVersions: Record<string, string>;
  timestamp: string;
}

export interface CostItem {
  id: string;
  category: "compute" | "storage" | "jobs" | "connectors" | "events";
  name: string;
  estimatedCost: string;
  usage: string;
  trend: "up" | "down" | "stable";
  efficiency: "optimal" | "moderate" | "wasteful";
  suggestion: string;
}

export interface CostEfficiencyData {
  items: CostItem[];
  totalEstimatedMonthly: string;
  topNoisySources: { name: string; eventsPerHour: number; cost: string }[];
  timestamp: string;
}
