import { randomUUID } from "crypto";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const rng = seededRandom(42);

export interface ThreatHuntingRule {
  id: string;
  name: string;
  description: string;
  mitreAttackId: string;
  mitreAttackName: string;
  mitreTactic: string;
  severity: "low" | "medium" | "high" | "critical";
  query: string;
  enabled: boolean;
  matchCount: number;
  lastMatch?: string;
  createdAt: string;
}

export interface SecurityPostureScore {
  overall: number;
  categories: Array<{ name: string; score: number; trend: "up" | "down" | "stable"; weight: number }>;
  benchmarks: { industry: number; peers: number };
  history: Array<{ date: string; score: number }>;
}

export interface IncidentPlaybook {
  id: string;
  name: string;
  incidentType: string;
  steps: Array<{ order: number; title: string; description: string; status: "pending" | "in-progress" | "completed" | "skipped"; completedAt?: string }>;
  estimatedMinutes: number;
  autoProgressEnabled: boolean;
}

export interface ComplianceChecklist {
  id: string;
  framework: string;
  version: string;
  controls: Array<{ id: string; name: string; description: string; status: "compliant" | "non-compliant" | "partial" | "not-assessed"; evidence?: string; lastAssessed?: string }>;
  overallScore: number;
  lastUpdated: string;
}

export interface ZeroTrustPolicy {
  id: string;
  name: string;
  description: string;
  resourceType: string;
  conditions: Array<{ attribute: string; operator: string; value: string }>;
  action: "allow" | "deny" | "mfa-required" | "review";
  impactedUsers: number;
  enabled: boolean;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  attackStages: Array<{ stage: string; technique: string; mitreId: string }>;
  estimatedMinutes: number;
  category: string;
  completionCount: number;
}

export interface TeamScore {
  id: string;
  teamName: string;
  teamType: "red" | "blue";
  exerciseId: string;
  exerciseName: string;
  score: number;
  detectionRate: number;
  responseTimeAvgMs: number;
  date: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  source: string;
  relevanceScore: number;
  keywords: string[];
  publishedDate: string;
  url: string;
}

export interface ExperimentComparison {
  id: string;
  experiments: Array<{ id: number; name: string; accuracy: number; loss: number; epochs: number; duration: string; model: string }>;
  deltas: Record<string, number>;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  baselineInputs: Record<string, number>;
  adjustedInputs: Record<string, number>;
  baselinePrediction: number;
  adjustedPrediction: number;
  confidenceChange: number;
  drivers: Array<{ variable: string; impact: number; direction: "positive" | "negative" }>;
}

export interface ForecastAccuracyRecord {
  id: string;
  predictionId: string;
  predictionTitle: string;
  predictedValue: number;
  actualValue: number;
  accuracy: number;
  confidenceInterval: [number, number];
  date: string;
}

export interface CustomKPI {
  id: string;
  name: string;
  formula: string;
  currentValue: number;
  threshold: number;
  operator: "gt" | "lt" | "gte" | "lte";
  status: "healthy" | "warning" | "critical";
  unit: string;
  history: Array<{ date: string; value: number }>;
}

export interface GoalTracker {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  milestones: Array<{ title: string; targetValue: number; achieved: boolean; achievedDate?: string }>;
  owner: string;
  deadline: string;
  status: "on-track" | "at-risk" | "behind" | "completed";
}

export interface WeatherOverlay {
  id: string;
  region: string;
  forecast: Array<{ day: number; date: string; windSpeed: number; waveHeight: number; visibility: string; condition: string; riskLevel: "low" | "medium" | "high" }>;
  routeRiskScore: number;
}

export interface FuelOptimization {
  id: string;
  voyageId: string;
  currentRoute: { distance: number; fuelCost: number; duration: string; co2Tons: number };
  alternatives: Array<{ name: string; distance: number; fuelCost: number; duration: string; co2Tons: number; savings: number }>;
}

export interface RegulatoryDeadline {
  id: string;
  regulation: string;
  requirement: string;
  deadline: string;
  status: "compliant" | "action-required" | "overdue" | "upcoming";
  vesselCodes: string[];
  daysRemaining: number;
}

export interface VoyagePnL {
  id: string;
  voyageCode: string;
  revenue: number;
  bunkerCost: number;
  portCharges: number;
  demurrage: number;
  insurance: number;
  crewing: number;
  otherCosts: number;
  netProfit: number;
  margin: number;
}

export interface ModuleDependency {
  id: string;
  moduleId: string;
  moduleName: string;
  dependsOn: Array<{ moduleId: string; moduleName: string; type: "hard" | "soft" }>;
  dependedBy: Array<{ moduleId: string; moduleName: string; type: "hard" | "soft" }>;
  impactScore: number;
}

export interface AutoScalingRule {
  id: string;
  moduleName: string;
  metric: string;
  threshold: number;
  scaleAction: "scale-up" | "scale-down";
  cooldownSeconds: number;
  minInstances: number;
  maxInstances: number;
  currentInstances: number;
  enabled: boolean;
  lastTriggered?: string;
}

export interface LogPattern {
  id: string;
  pattern: string;
  category: "error" | "warning" | "anomaly" | "normal";
  frequency: number;
  firstSeen: string;
  lastSeen: string;
  sampleMessages: string[];
  isNovel: boolean;
}

export interface SLADefinition {
  id: string;
  serviceName: string;
  metric: string;
  target: number;
  unit: string;
  currentValue: number;
  compliance: number;
  breaches: number;
  status: "compliant" | "warning" | "breached";
}

export interface CostAttribution {
  id: string;
  resource: string;
  platform: string;
  monthlyCost: number;
  trend: "up" | "down" | "stable";
  percentage: number;
  breakdown: Array<{ item: string; cost: number }>;
}

export interface BrandKit {
  id: string;
  name: string;
  colors: { primary: string; secondary: string; accent: string; background: string };
  fonts: { heading: string; body: string };
  toneOfVoice: string;
  logoUrl?: string;
}

export interface CampaignCalendarEntry {
  id: string;
  title: string;
  contentType: string;
  channel: string;
  scheduledDate: string;
  status: "draft" | "scheduled" | "published" | "archived";
  assignee: string;
}

export interface ContentExport {
  id: string;
  sourceContentId: string;
  format: "blog" | "social" | "newsletter" | "press-release";
  content: string;
  generatedAt: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  previewUrl?: string;
  usageCount: number;
  rating: number;
}

export interface AssetItem {
  id: string;
  name: string;
  type: string;
  tags: string[];
  size: string;
  url?: string;
  uploadedAt: string;
}

export interface PromptLabResult {
  id: string;
  prompt: string;
  scenarios: Array<{ name: string; output: string; score: number; latencyMs: number }>;
  bestScenario: string;
  averageScore: number;
}

export interface ConversationAnalytics {
  totalSessions: number;
  avgSatisfaction: number;
  resolutionRate: number;
  avgResponseTimeMs: number;
  totalCost: number;
  byAgent: Array<{ agentName: string; sessions: number; satisfaction: number; resolutionRate: number; avgCost: number }>;
}

export interface InvestorDashboard {
  portfolioValue: number;
  portfolioGrowth: number;
  platforms: Array<{ name: string; valuation: number; growth: number; status: string; mrr: number }>;
  milestones: Array<{ title: string; date: string; status: "completed" | "in-progress" | "planned" }>;
}

export interface PortfolioHeatMapEntry {
  platform: string;
  health: number;
  performance: number;
  growth: number;
  color: string;
}

export interface ClientPipelineEntry {
  id: string;
  clientName: string;
  company: string;
  stage: "lead" | "qualification" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
  value: number;
  service: string;
  lastContact: string;
  nextAction: string;
}

export interface ROICalculation {
  id: string;
  clientProfile: string;
  serviceTier: string;
  investmentAmount: number;
  projectedReturn: number;
  roiPercentage: number;
  paybackMonths: number;
  assumptions: string[];
}

export interface PersonalKPI {
  id: string;
  name: string;
  category: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
}

export interface DailyBriefing {
  id: string;
  date: string;
  criticalItems: Array<{ title: string; source: string; priority: "critical" | "high" | "medium" }>;
  metrics: Array<{ name: string; value: string; change: string }>;
  priorities: string[];
  generatedAt: string;
}

export interface DecisionJournal {
  id: string;
  title: string;
  context: string;
  rationale: string;
  outcome?: string;
  status: "pending" | "successful" | "mixed" | "unsuccessful";
  date: string;
  tags: string[];
}

export interface VisitorAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  topPages: Array<{ page: string; views: number; avgTime: number }>;
  sources: Array<{ source: string; visitors: number; percentage: number }>;
  daily: Array<{ date: string; views: number; visitors: number }>;
}

export interface ContactPipeline {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "new" | "responded" | "meeting-scheduled" | "follow-up" | "closed";
  source: string;
  receivedAt: string;
  lastAction?: string;
}

export interface FeatureComparison {
  platforms: Array<{
    name: string;
    category: string;
    features: Record<string, boolean | string>;
    pricing: { starter: number; professional: number; enterprise: string };
    useCase: string;
  }>;
}

export interface DeploymentTrigger {
  id: string;
  platform: string;
  environment: "staging" | "production";
  preflightChecks: Array<{ name: string; status: "passed" | "failed" | "pending"; details: string }>;
  lastDeployment?: string;
  status: "ready" | "blocked" | "deploying";
}

export interface HealthTrend {
  platform: string;
  dataPoints: Array<{ date: string; healthScore: number; uptime: number; errorRate: number }>;
  trend: "improving" | "stable" | "degrading";
  prediction: number;
}

export interface SLACompliance {
  id: string;
  platform: string;
  slaTarget: number;
  currentCompliance: number;
  breachCount: number;
  history: Array<{ month: string; compliance: number }>;
}

export interface StatusPage {
  id: string;
  platform: string;
  status: "operational" | "degraded" | "partial-outage" | "major-outage";
  uptime: number;
  lastIncident?: string;
  components: Array<{ name: string; status: "operational" | "degraded" | "down" }>;
}

export const appExtensionsService = {
  getRosieThreatHuntingRules(): ThreatHuntingRule[] {
    return [
      { id: "thr-001", name: "Credential Stuffing Detection", description: "Detect multiple failed login attempts from distributed sources", mitreAttackId: "T1110.004", mitreAttackName: "Credential Stuffing", mitreTactic: "Credential Access", severity: "high", query: "event.category:authentication AND event.outcome:failure AND source.ip:* | stats count by source.ip | where count > 10", enabled: true, matchCount: 47, lastMatch: "2026-03-25T14:30:00Z", createdAt: "2026-01-15T00:00:00Z" },
      { id: "thr-002", name: "Lateral Movement via RDP", description: "Detect unusual RDP connections between internal hosts", mitreAttackId: "T1021.001", mitreAttackName: "Remote Desktop Protocol", mitreTactic: "Lateral Movement", severity: "critical", query: "event.category:network AND destination.port:3389 AND NOT source.ip IN (allowed_rdp_sources)", enabled: true, matchCount: 12, lastMatch: "2026-03-24T08:15:00Z", createdAt: "2026-02-01T00:00:00Z" },
      { id: "thr-003", name: "Data Exfiltration via DNS", description: "Detect abnormally large DNS queries indicating data exfiltration", mitreAttackId: "T1048.001", mitreAttackName: "Exfiltration Over Alternative Protocol", mitreTactic: "Exfiltration", severity: "critical", query: "event.category:dns AND dns.question.name:* AND length(dns.question.name) > 100", enabled: true, matchCount: 3, lastMatch: "2026-03-20T11:45:00Z", createdAt: "2026-01-20T00:00:00Z" },
      { id: "thr-004", name: "Suspicious PowerShell Execution", description: "Detect encoded or obfuscated PowerShell commands", mitreAttackId: "T1059.001", mitreAttackName: "PowerShell", mitreTactic: "Execution", severity: "high", query: "process.name:powershell.exe AND (process.args:*-enc* OR process.args:*-encodedcommand*)", enabled: true, matchCount: 28, lastMatch: "2026-03-25T09:22:00Z", createdAt: "2026-01-10T00:00:00Z" },
      { id: "thr-005", name: "Persistence via Scheduled Tasks", description: "Detect creation of scheduled tasks for persistence", mitreAttackId: "T1053.005", mitreAttackName: "Scheduled Task", mitreTactic: "Persistence", severity: "medium", query: "event.action:scheduled-task-created AND NOT user.name IN (service_accounts)", enabled: true, matchCount: 8, lastMatch: "2026-03-23T16:30:00Z", createdAt: "2026-02-10T00:00:00Z" },
    ];
  },

  getRosieSecurityPostureScore(): SecurityPostureScore {
    return {
      overall: 87,
      categories: [
        { name: "Threat Detection", score: 92, trend: "up", weight: 25 },
        { name: "Incident Response", score: 85, trend: "stable", weight: 20 },
        { name: "Vulnerability Management", score: 78, trend: "up", weight: 20 },
        { name: "Access Control", score: 94, trend: "stable", weight: 15 },
        { name: "Data Protection", score: 88, trend: "up", weight: 10 },
        { name: "Network Security", score: 82, trend: "down", weight: 10 },
      ],
      benchmarks: { industry: 72, peers: 79 },
      history: Array.from({ length: 12 }, (_, i) => ({
        date: new Date(Date.now() - (11 - i) * 30 * 86400000).toISOString().split("T")[0],
        score: 75 + Math.floor(rng() * 15),
      })),
    };
  },

  getRosieIncidentPlaybooks(): IncidentPlaybook[] {
    return [
      { id: "pb-001", name: "Ransomware Response", incidentType: "ransomware", steps: [
        { order: 1, title: "Isolate affected systems", description: "Disconnect compromised hosts from network", status: "completed", completedAt: "2026-03-25T10:00:00Z" },
        { order: 2, title: "Assess scope of encryption", description: "Determine which files and systems are affected", status: "completed", completedAt: "2026-03-25T10:30:00Z" },
        { order: 3, title: "Preserve evidence", description: "Create forensic images of affected systems", status: "in-progress" },
        { order: 4, title: "Notify stakeholders", description: "Alert leadership, legal, and communications teams", status: "pending" },
        { order: 5, title: "Begin recovery", description: "Restore from verified clean backups", status: "pending" },
      ], estimatedMinutes: 240, autoProgressEnabled: true },
      { id: "pb-002", name: "Phishing Response", incidentType: "phishing", steps: [
        { order: 1, title: "Quarantine email", description: "Remove phishing email from all inboxes", status: "completed", completedAt: "2026-03-25T09:00:00Z" },
        { order: 2, title: "Identify affected users", description: "Determine who clicked/interacted with the email", status: "completed", completedAt: "2026-03-25T09:15:00Z" },
        { order: 3, title: "Reset credentials", description: "Force password reset for affected accounts", status: "completed", completedAt: "2026-03-25T09:30:00Z" },
        { order: 4, title: "Block indicators", description: "Add sender, URLs, and attachments to blocklists", status: "completed", completedAt: "2026-03-25T09:45:00Z" },
        { order: 5, title: "User notification", description: "Send security awareness reminder to all users", status: "completed", completedAt: "2026-03-25T10:00:00Z" },
      ], estimatedMinutes: 60, autoProgressEnabled: true },
      { id: "pb-003", name: "Data Breach Response", incidentType: "data-breach", steps: [
        { order: 1, title: "Confirm breach scope", description: "Identify what data was accessed/exfiltrated", status: "pending" },
        { order: 2, title: "Contain the breach", description: "Close the access vector and revoke compromised credentials", status: "pending" },
        { order: 3, title: "Legal notification assessment", description: "Determine regulatory notification requirements", status: "pending" },
        { order: 4, title: "Forensic investigation", description: "Full forensic analysis of the breach timeline", status: "pending" },
        { order: 5, title: "Remediation plan", description: "Develop and implement fixes to prevent recurrence", status: "pending" },
      ], estimatedMinutes: 480, autoProgressEnabled: false },
    ];
  },

  getAegisComplianceChecklists(): ComplianceChecklist[] {
    const frameworks = [
      { framework: "SOC 2 Type II", version: "2024", controls: [
        { id: "CC1.1", name: "Control Environment", description: "Demonstrates commitment to integrity and ethical values", status: "compliant" as const },
        { id: "CC2.1", name: "Information & Communication", description: "Obtains or generates relevant quality information", status: "compliant" as const },
        { id: "CC3.1", name: "Risk Assessment", description: "Specifies objectives with sufficient clarity", status: "partial" as const },
        { id: "CC4.1", name: "Monitoring Activities", description: "Selects, develops, and performs ongoing evaluations", status: "compliant" as const },
        { id: "CC5.1", name: "Control Activities", description: "Selects and develops general control activities", status: "compliant" as const },
        { id: "CC6.1", name: "Logical & Physical Access", description: "Implements logical access security over information", status: "partial" as const },
        { id: "CC7.1", name: "System Operations", description: "Detects and monitors system changes", status: "compliant" as const },
        { id: "CC8.1", name: "Change Management", description: "Authorizes, designs, develops, configures changes", status: "non-compliant" as const },
      ]},
      { framework: "ISO 27001", version: "2022", controls: [
        { id: "A.5", name: "Information Security Policies", description: "Management direction for information security", status: "compliant" as const },
        { id: "A.6", name: "Organization of Information Security", description: "Internal organization and mobile devices", status: "compliant" as const },
        { id: "A.7", name: "Human Resource Security", description: "Prior, during, and termination of employment", status: "partial" as const },
        { id: "A.8", name: "Asset Management", description: "Responsibility for assets and information classification", status: "compliant" as const },
        { id: "A.9", name: "Access Control", description: "Business requirements and user access management", status: "compliant" as const },
        { id: "A.10", name: "Cryptography", description: "Cryptographic controls policy and key management", status: "compliant" as const },
      ]},
      { framework: "NIST CSF", version: "2.0", controls: [
        { id: "ID.AM", name: "Asset Management", description: "Data, personnel, devices identified and managed", status: "compliant" as const },
        { id: "PR.AC", name: "Access Control", description: "Access to assets limited to authorized users", status: "compliant" as const },
        { id: "DE.CM", name: "Continuous Monitoring", description: "Information system and assets monitored", status: "partial" as const },
        { id: "RS.RP", name: "Response Planning", description: "Response processes and procedures executed", status: "compliant" as const },
        { id: "RC.RP", name: "Recovery Planning", description: "Recovery processes and procedures executed", status: "partial" as const },
      ]},
    ];

    return frameworks.map(f => {
      const controls = f.controls.map(c => ({
        ...c,
        evidence: c.status === "compliant" ? "Verified via automated assessment" : undefined,
        lastAssessed: new Date(Date.now() - Math.floor(rng() * 30) * 86400000).toISOString(),
      }));
      const compliant = controls.filter(c => c.status === "compliant").length;
      return {
        id: randomUUID(),
        framework: f.framework,
        version: f.version,
        controls,
        overallScore: Math.round((compliant / controls.length) * 100),
        lastUpdated: new Date().toISOString(),
      };
    });
  },

  getAegisZeroTrustPolicies(): ZeroTrustPolicy[] {
    return [
      { id: "ztp-001", name: "Admin Access Policy", description: "Require MFA for all admin-level access", resourceType: "admin-panel", conditions: [{ attribute: "role", operator: "equals", value: "admin" }], action: "mfa-required", impactedUsers: 12, enabled: true },
      { id: "ztp-002", name: "External Network Block", description: "Block access from untrusted networks", resourceType: "internal-api", conditions: [{ attribute: "network.trusted", operator: "equals", value: "false" }], action: "deny", impactedUsers: 0, enabled: true },
      { id: "ztp-003", name: "Data Export Review", description: "Require review for bulk data exports", resourceType: "data-export", conditions: [{ attribute: "record_count", operator: "greater_than", value: "1000" }], action: "review", impactedUsers: 45, enabled: true },
      { id: "ztp-004", name: "Off-Hours Access Alert", description: "Flag access outside business hours", resourceType: "all-systems", conditions: [{ attribute: "time.business_hours", operator: "equals", value: "false" }], action: "mfa-required", impactedUsers: 120, enabled: true },
    ];
  },

  getFirestormScenarios(): SimulationScenario[] {
    return [
      { id: "sim-001", name: "Operation Thunder", description: "Multi-stage APT simulation targeting cloud infrastructure", difficulty: "expert", attackStages: [{ stage: "Initial Access", technique: "Spear Phishing", mitreId: "T1566.001" }, { stage: "Execution", technique: "PowerShell", mitreId: "T1059.001" }, { stage: "Persistence", technique: "Scheduled Task", mitreId: "T1053.005" }, { stage: "Exfiltration", technique: "DNS Tunneling", mitreId: "T1048.001" }], estimatedMinutes: 180, category: "APT Simulation", completionCount: 3 },
      { id: "sim-002", name: "Ransomware Blitz", description: "Ransomware deployment and lateral movement simulation", difficulty: "advanced", attackStages: [{ stage: "Initial Access", technique: "Drive-by Compromise", mitreId: "T1189" }, { stage: "Privilege Escalation", technique: "Token Manipulation", mitreId: "T1134" }, { stage: "Lateral Movement", technique: "Remote Services", mitreId: "T1021" }, { stage: "Impact", technique: "Data Encrypted", mitreId: "T1486" }], estimatedMinutes: 120, category: "Ransomware", completionCount: 7 },
      { id: "sim-003", name: "Insider Threat", description: "Simulated malicious insider data exfiltration", difficulty: "intermediate", attackStages: [{ stage: "Collection", technique: "Data from Local System", mitreId: "T1005" }, { stage: "Exfiltration", technique: "Exfiltration Over Web Service", mitreId: "T1567" }], estimatedMinutes: 90, category: "Insider Threat", completionCount: 12 },
      { id: "sim-004", name: "Supply Chain Attack", description: "Third-party compromise leading to internal access", difficulty: "expert", attackStages: [{ stage: "Initial Access", technique: "Supply Chain Compromise", mitreId: "T1195" }, { stage: "Execution", technique: "Signed Binary Proxy", mitreId: "T1218" }, { stage: "Defense Evasion", technique: "Masquerading", mitreId: "T1036" }], estimatedMinutes: 150, category: "Supply Chain", completionCount: 2 },
      { id: "sim-005", name: "Cloud Misconfiguration", description: "Exploiting common cloud security misconfigurations", difficulty: "beginner", attackStages: [{ stage: "Discovery", technique: "Cloud Service Discovery", mitreId: "T1580" }, { stage: "Collection", technique: "Data from Cloud Storage", mitreId: "T1530" }], estimatedMinutes: 60, category: "Cloud Security", completionCount: 18 },
    ];
  },

  getFirestormTeamScores(): TeamScore[] {
    return [
      { id: "ts-001", teamName: "Alpha Strike", teamType: "red", exerciseId: "sim-001", exerciseName: "Operation Thunder", score: 87, detectionRate: 0, responseTimeAvgMs: 0, date: "2026-03-20" },
      { id: "ts-002", teamName: "Shield Wall", teamType: "blue", exerciseId: "sim-001", exerciseName: "Operation Thunder", score: 78, detectionRate: 78, responseTimeAvgMs: 4200, date: "2026-03-20" },
      { id: "ts-003", teamName: "Phantom", teamType: "red", exerciseId: "sim-002", exerciseName: "Ransomware Blitz", score: 92, detectionRate: 0, responseTimeAvgMs: 0, date: "2026-03-18" },
      { id: "ts-004", teamName: "Fortress", teamType: "blue", exerciseId: "sim-002", exerciseName: "Ransomware Blitz", score: 71, detectionRate: 65, responseTimeAvgMs: 6800, date: "2026-03-18" },
      { id: "ts-005", teamName: "Alpha Strike", teamType: "red", exerciseId: "sim-003", exerciseName: "Insider Threat", score: 95, detectionRate: 0, responseTimeAvgMs: 0, date: "2026-03-15" },
      { id: "ts-006", teamName: "Shield Wall", teamType: "blue", exerciseId: "sim-003", exerciseName: "Insider Threat", score: 84, detectionRate: 82, responseTimeAvgMs: 3500, date: "2026-03-15" },
    ];
  },

  getIncaResearchPapers(): ResearchPaper[] {
    return [
      { id: "paper-001", title: "Scaling Laws for Neural Language Models", authors: ["J. Kaplan", "S. McCandlish", "T. Henighan"], abstract: "We study empirical scaling laws for language model performance on the cross-entropy loss.", source: "arXiv", relevanceScore: 95, keywords: ["scaling laws", "language models", "neural networks"], publishedDate: "2026-01-15", url: "https://arxiv.org/abs/2001.08361" },
      { id: "paper-002", title: "Constitutional AI: Harmlessness from AI Feedback", authors: ["Y. Bai", "S. Kadavath", "S. Kundu"], abstract: "Methods for training harmless AI systems using AI feedback rather than human labels.", source: "arXiv", relevanceScore: 88, keywords: ["constitutional AI", "alignment", "safety"], publishedDate: "2026-02-20", url: "https://arxiv.org/abs/2212.08073" },
      { id: "paper-003", title: "Efficient Transformers: A Survey", authors: ["Y. Tay", "M. Dehghani", "D. Bahri"], abstract: "A comprehensive survey of efficient transformer architectures for long sequences.", source: "Semantic Scholar", relevanceScore: 82, keywords: ["transformers", "efficiency", "attention"], publishedDate: "2026-03-01", url: "https://arxiv.org/abs/2009.06732" },
      { id: "paper-004", title: "Chain-of-Thought Prompting Elicits Reasoning", authors: ["J. Wei", "X. Wang", "D. Schuurmans"], abstract: "Generating a chain of thought dramatically improves the ability of LLMs to perform complex reasoning.", source: "arXiv", relevanceScore: 91, keywords: ["chain-of-thought", "reasoning", "prompting"], publishedDate: "2026-01-28", url: "https://arxiv.org/abs/2201.11903" },
    ];
  },

  getIncaExperimentComparison(): ExperimentComparison {
    return {
      id: "comp-001",
      experiments: [
        { id: 1, name: "GPT-4o Fine-tune v1", accuracy: 94.2, loss: 0.18, epochs: 10, duration: "4h 32m", model: "GPT-4o" },
        { id: 2, name: "GPT-4o Fine-tune v2", accuracy: 96.1, loss: 0.12, epochs: 15, duration: "6h 48m", model: "GPT-4o" },
        { id: 3, name: "Claude-3.5 Fine-tune", accuracy: 93.8, loss: 0.21, epochs: 12, duration: "5h 15m", model: "Claude-3.5" },
        { id: 4, name: "Llama-3 70B LoRA", accuracy: 91.5, loss: 0.28, epochs: 8, duration: "3h 20m", model: "Llama-3 70B" },
      ],
      deltas: { "v1→v2": 1.9, "v1→Claude": -0.4, "v1→Llama": -2.7 },
    };
  },

  getNimbusWhatIfScenarios(): WhatIfScenario[] {
    return [
      { id: "wis-001", name: "Revenue Impact: 20% Traffic Increase", baselineInputs: { dailyTraffic: 10000, conversionRate: 3.2, avgOrderValue: 85 }, adjustedInputs: { dailyTraffic: 12000, conversionRate: 3.2, avgOrderValue: 85 }, baselinePrediction: 27200, adjustedPrediction: 32640, confidenceChange: -2, drivers: [{ variable: "dailyTraffic", impact: 5440, direction: "positive" }] },
      { id: "wis-002", name: "Churn Reduction Scenario", baselineInputs: { monthlyChurn: 5.2, customerBase: 8500, ltv: 420 }, adjustedInputs: { monthlyChurn: 3.5, customerBase: 8500, ltv: 420 }, baselinePrediction: 185640, adjustedPrediction: 125580, confidenceChange: 3, drivers: [{ variable: "monthlyChurn", impact: -60060, direction: "positive" }] },
      { id: "wis-003", name: "Price Elasticity Test", baselineInputs: { price: 49, demand: 2000, costPerUnit: 12 }, adjustedInputs: { price: 59, demand: 1700, costPerUnit: 12 }, baselinePrediction: 74000, adjustedPrediction: 79900, confidenceChange: -5, drivers: [{ variable: "price", impact: 20000, direction: "positive" }, { variable: "demand", impact: -14100, direction: "negative" }] },
    ];
  },

  getNimbusForecastAccuracy(): ForecastAccuracyRecord[] {
    return Array.from({ length: 12 }, (_, i) => ({
      id: `fa-${i + 1}`,
      predictionId: `pred-${i + 1}`,
      predictionTitle: `Forecast ${new Date(Date.now() - (11 - i) * 30 * 86400000).toISOString().slice(0, 7)}`,
      predictedValue: 80 + Math.floor(rng() * 20),
      actualValue: 75 + Math.floor(rng() * 25),
      accuracy: 85 + Math.floor(rng() * 12),
      confidenceInterval: [70 + Math.floor(rng() * 10), 90 + Math.floor(rng() * 10)] as [number, number],
      date: new Date(Date.now() - (11 - i) * 30 * 86400000).toISOString().split("T")[0],
    }));
  },

  getBeaconCustomKPIs(): CustomKPI[] {
    return [
      { id: "kpi-001", name: "Customer Acquisition Cost", formula: "total_marketing_spend / new_customers", currentValue: 142, threshold: 200, operator: "lt", status: "healthy", unit: "$", history: Array.from({ length: 12 }, (_, i) => ({ date: new Date(Date.now() - (11 - i) * 30 * 86400000).toISOString().split("T")[0], value: 120 + Math.floor(rng() * 60) })) },
      { id: "kpi-002", name: "Net Promoter Score", formula: "promoters_pct - detractors_pct", currentValue: 72, threshold: 50, operator: "gt", status: "healthy", unit: "", history: Array.from({ length: 12 }, (_, i) => ({ date: new Date(Date.now() - (11 - i) * 30 * 86400000).toISOString().split("T")[0], value: 60 + Math.floor(rng() * 20) })) },
      { id: "kpi-003", name: "Platform Error Rate", formula: "errors / total_requests * 100", currentValue: 2.8, threshold: 2, operator: "lt", status: "warning", unit: "%", history: Array.from({ length: 12 }, (_, i) => ({ date: new Date(Date.now() - (11 - i) * 30 * 86400000).toISOString().split("T")[0], value: 1.5 + rng() * 3 })) },
      { id: "kpi-004", name: "Monthly Recurring Revenue", formula: "sum(active_subscriptions * price)", currentValue: 2400000, threshold: 2000000, operator: "gt", status: "healthy", unit: "$", history: Array.from({ length: 12 }, (_, i) => ({ date: new Date(Date.now() - (11 - i) * 30 * 86400000).toISOString().split("T")[0], value: 1800000 + Math.floor(rng() * 800000) })) },
    ];
  },

  getBeaconGoalTracker(): GoalTracker[] {
    return [
      { id: "goal-001", title: "Achieve $3M ARR", description: "Reach $3M annual recurring revenue across all platforms", targetValue: 3000000, currentValue: 2400000, unit: "$", milestones: [{ title: "$1M ARR", targetValue: 1000000, achieved: true, achievedDate: "2025-06-15" }, { title: "$2M ARR", targetValue: 2000000, achieved: true, achievedDate: "2025-11-20" }, { title: "$2.5M ARR", targetValue: 2500000, achieved: false }, { title: "$3M ARR", targetValue: 3000000, achieved: false }], owner: "Stephen L.", deadline: "2026-12-31", status: "on-track" },
      { id: "goal-002", title: "99.9% Platform Uptime", description: "Maintain 99.9% uptime across all production platforms", targetValue: 99.9, currentValue: 99.7, unit: "%", milestones: [{ title: "99% baseline", targetValue: 99, achieved: true, achievedDate: "2025-03-01" }, { title: "99.5%", targetValue: 99.5, achieved: true, achievedDate: "2025-08-01" }, { title: "99.9%", targetValue: 99.9, achieved: false }], owner: "Engineering", deadline: "2026-06-30", status: "at-risk" },
      { id: "goal-003", title: "Launch 18 Platforms", description: "Deploy all 18 SZL Holdings platforms to production", targetValue: 18, currentValue: 14, unit: "platforms", milestones: [{ title: "5 platforms", targetValue: 5, achieved: true }, { title: "10 platforms", targetValue: 10, achieved: true }, { title: "15 platforms", targetValue: 15, achieved: false }, { title: "18 platforms", targetValue: 18, achieved: false }], owner: "Stephen L.", deadline: "2026-09-30", status: "on-track" },
    ];
  },

  getVesselsWeatherOverlay(): WeatherOverlay[] {
    return [
      { id: "wx-001", region: "Arabian Gulf → Japan", forecast: [
        { day: 1, date: "2026-03-26", windSpeed: 12, waveHeight: 1.2, visibility: "good", condition: "Clear", riskLevel: "low" },
        { day: 2, date: "2026-03-27", windSpeed: 18, waveHeight: 2.1, visibility: "moderate", condition: "Partly Cloudy", riskLevel: "low" },
        { day: 3, date: "2026-03-28", windSpeed: 25, waveHeight: 3.5, visibility: "poor", condition: "Squalls", riskLevel: "medium" },
        { day: 4, date: "2026-03-29", windSpeed: 30, waveHeight: 4.2, visibility: "poor", condition: "Storm", riskLevel: "high" },
        { day: 5, date: "2026-03-30", windSpeed: 15, waveHeight: 1.8, visibility: "good", condition: "Clearing", riskLevel: "low" },
      ], routeRiskScore: 42 },
      { id: "wx-002", region: "USG → Europe", forecast: [
        { day: 1, date: "2026-03-26", windSpeed: 22, waveHeight: 2.8, visibility: "moderate", condition: "Overcast", riskLevel: "medium" },
        { day: 2, date: "2026-03-27", windSpeed: 35, waveHeight: 5.1, visibility: "poor", condition: "North Atlantic Storm", riskLevel: "high" },
        { day: 3, date: "2026-03-28", windSpeed: 28, waveHeight: 4.0, visibility: "poor", condition: "Heavy Rain", riskLevel: "high" },
        { day: 4, date: "2026-03-29", windSpeed: 20, waveHeight: 2.5, visibility: "moderate", condition: "Clearing", riskLevel: "medium" },
        { day: 5, date: "2026-03-30", windSpeed: 10, waveHeight: 1.0, visibility: "good", condition: "Clear", riskLevel: "low" },
      ], routeRiskScore: 68 },
    ];
  },

  getVesselsFuelOptimization(): FuelOptimization[] {
    return [
      { id: "fuel-001", voyageId: "V-2026-031", currentRoute: { distance: 6500, fuelCost: 485000, duration: "16 days", co2Tons: 1240 }, alternatives: [{ name: "Southern Route via Malacca", distance: 6800, fuelCost: 462000, duration: "17 days", co2Tons: 1180, savings: 23000 }, { name: "Northern Route via Suez", distance: 7200, fuelCost: 520000, duration: "18 days", co2Tons: 1320, savings: -35000 }] },
      { id: "fuel-002", voyageId: "V-2026-032", currentRoute: { distance: 5200, fuelCost: 398000, duration: "14 days", co2Tons: 980 }, alternatives: [{ name: "Great Circle Route", distance: 4900, fuelCost: 375000, duration: "13 days", co2Tons: 920, savings: 23000 }, { name: "Southern Routing (weather avoidance)", distance: 5600, fuelCost: 410000, duration: "15 days", co2Tons: 1020, savings: -12000 }] },
    ];
  },

  getVesselsRegulatoryDeadlines(): RegulatoryDeadline[] {
    return [
      { id: "reg-001", regulation: "MARPOL Annex VI", requirement: "Annual CII rating submission", deadline: "2026-03-31", status: "action-required", vesselCodes: ["VLGC-009", "VLGC-003"], daysRemaining: 5 },
      { id: "reg-002", regulation: "EU MRV", requirement: "Q1 emissions report submission", deadline: "2026-04-30", status: "upcoming", vesselCodes: ["VLGC-006", "VLGC-007"], daysRemaining: 35 },
      { id: "reg-003", regulation: "SOLAS", requirement: "Safety equipment survey", deadline: "2026-05-15", status: "upcoming", vesselCodes: ["VLGC-001", "VLGC-002", "VLGC-004"], daysRemaining: 50 },
      { id: "reg-004", regulation: "EU ETS", requirement: "Emissions Trading Scheme allowances", deadline: "2026-09-30", status: "compliant", vesselCodes: ["VLGC-006", "VLGC-007"], daysRemaining: 188 },
    ];
  },

  getVesselsVoyagePnL(): VoyagePnL[] {
    return [
      { id: "pnl-001", voyageCode: "V-2026-031", revenue: 2812000, bunkerCost: 485000, portCharges: 125000, demurrage: 0, insurance: 42000, crewing: 68000, otherCosts: 35000, netProfit: 2057000, margin: 73.1 },
      { id: "pnl-002", voyageCode: "V-2026-032", revenue: 3150000, bunkerCost: 398000, portCharges: 180000, demurrage: 0, insurance: 42000, crewing: 68000, otherCosts: 45000, netProfit: 2417000, margin: 76.7 },
      { id: "pnl-003", voyageCode: "V-2026-033", revenue: 2650000, bunkerCost: 420000, portCharges: 95000, demurrage: 0, insurance: 42000, crewing: 68000, otherCosts: 30000, netProfit: 1995000, margin: 75.3 },
      { id: "pnl-004", voyageCode: "V-2026-036", revenue: 2480000, bunkerCost: 380000, portCharges: 140000, demurrage: 45000, insurance: 42000, crewing: 68000, otherCosts: 28000, netProfit: 1777000, margin: 71.7 },
    ];
  },

  getZeusModuleDependencies(): ModuleDependency[] {
    return [
      { id: "dep-001", moduleId: "auth", moduleName: "Authentication", dependsOn: [{ moduleId: "db", moduleName: "Database", type: "hard" }, { moduleId: "cache", moduleName: "Cache", type: "soft" }], dependedBy: [{ moduleId: "api", moduleName: "API Gateway", type: "hard" }, { moduleId: "dashboard", moduleName: "Dashboard", type: "hard" }], impactScore: 95 },
      { id: "dep-002", moduleId: "api", moduleName: "API Gateway", dependsOn: [{ moduleId: "auth", moduleName: "Authentication", type: "hard" }, { moduleId: "rate-limiter", moduleName: "Rate Limiter", type: "soft" }], dependedBy: [{ moduleId: "dashboard", moduleName: "Dashboard", type: "hard" }, { moduleId: "webhook", moduleName: "Webhook Engine", type: "soft" }], impactScore: 98 },
      { id: "dep-003", moduleId: "db", moduleName: "Database", dependsOn: [], dependedBy: [{ moduleId: "auth", moduleName: "Authentication", type: "hard" }, { moduleId: "api", moduleName: "API Gateway", type: "hard" }], impactScore: 100 },
      { id: "dep-004", moduleId: "cache", moduleName: "Cache", dependsOn: [], dependedBy: [{ moduleId: "auth", moduleName: "Authentication", type: "soft" }, { moduleId: "api", moduleName: "API Gateway", type: "soft" }], impactScore: 60 },
    ];
  },

  getZeusAutoScalingRules(): AutoScalingRule[] {
    return [
      { id: "asr-001", moduleName: "API Gateway", metric: "cpu_utilization", threshold: 80, scaleAction: "scale-up", cooldownSeconds: 300, minInstances: 2, maxInstances: 10, currentInstances: 3, enabled: true, lastTriggered: "2026-03-25T10:30:00Z" },
      { id: "asr-002", moduleName: "API Gateway", metric: "cpu_utilization", threshold: 30, scaleAction: "scale-down", cooldownSeconds: 600, minInstances: 2, maxInstances: 10, currentInstances: 3, enabled: true },
      { id: "asr-003", moduleName: "Authentication", metric: "request_rate", threshold: 500, scaleAction: "scale-up", cooldownSeconds: 180, minInstances: 2, maxInstances: 6, currentInstances: 2, enabled: true },
      { id: "asr-004", moduleName: "Worker Queue", metric: "queue_depth", threshold: 1000, scaleAction: "scale-up", cooldownSeconds: 120, minInstances: 1, maxInstances: 8, currentInstances: 2, enabled: true, lastTriggered: "2026-03-24T16:45:00Z" },
    ];
  },

  getLyteLogPatterns(): LogPattern[] {
    return [
      { id: "lp-001", pattern: "Connection timeout to database", category: "error", frequency: 42, firstSeen: "2026-03-20T00:00:00Z", lastSeen: "2026-03-25T14:30:00Z", sampleMessages: ["Connection timeout to database after 30000ms", "Database connection pool exhausted"], isNovel: false },
      { id: "lp-002", pattern: "Rate limit exceeded for IP range", category: "warning", frequency: 128, firstSeen: "2026-03-22T00:00:00Z", lastSeen: "2026-03-25T15:00:00Z", sampleMessages: ["Rate limit exceeded for 192.168.1.0/24", "Throttling requests from suspicious IP range"], isNovel: false },
      { id: "lp-003", pattern: "Unexpected token in JSON payload", category: "anomaly", frequency: 7, firstSeen: "2026-03-25T10:00:00Z", lastSeen: "2026-03-25T14:45:00Z", sampleMessages: ["SyntaxError: Unexpected token < in JSON at position 0", "Invalid JSON payload from webhook callback"], isNovel: true },
      { id: "lp-004", pattern: "Certificate rotation completed", category: "normal", frequency: 3, firstSeen: "2026-03-01T00:00:00Z", lastSeen: "2026-03-25T06:00:00Z", sampleMessages: ["TLS certificate rotated successfully for *.szlholdings.com"], isNovel: false },
    ];
  },

  getLyteSLADefinitions(): SLADefinition[] {
    return [
      { id: "sla-001", serviceName: "API Gateway", metric: "p99 Response Time", target: 200, unit: "ms", currentValue: 185, compliance: 97.2, breaches: 3, status: "compliant" },
      { id: "sla-002", serviceName: "Authentication", metric: "Availability", target: 99.99, unit: "%", currentValue: 99.97, compliance: 99.97, breaches: 1, status: "warning" },
      { id: "sla-003", serviceName: "Firestorm Simulation", metric: "p95 Response Time", target: 500, unit: "ms", currentValue: 520, compliance: 94.8, breaches: 8, status: "breached" },
      { id: "sla-004", serviceName: "Database", metric: "Availability", target: 99.99, unit: "%", currentValue: 99.99, compliance: 100, breaches: 0, status: "compliant" },
      { id: "sla-005", serviceName: "Dreamscape Pipeline", metric: "Processing Time", target: 5000, unit: "ms", currentValue: 6200, compliance: 88.5, breaches: 12, status: "breached" },
    ];
  },

  getLyteCostAttribution(): CostAttribution[] {
    return [
      { id: "cost-001", resource: "Compute (VMs)", platform: "All", monthlyCost: 12400, trend: "up", percentage: 35, breakdown: [{ item: "API Servers", cost: 4200 }, { item: "Worker Nodes", cost: 3800 }, { item: "ML Inference", cost: 4400 }] },
      { id: "cost-002", resource: "Database", platform: "All", monthlyCost: 8200, trend: "stable", percentage: 23, breakdown: [{ item: "PostgreSQL Primary", cost: 4500 }, { item: "Read Replicas", cost: 2200 }, { item: "Redis Cache", cost: 1500 }] },
      { id: "cost-003", resource: "AI/ML APIs", platform: "AlloyScape", monthlyCost: 6800, trend: "up", percentage: 19, breakdown: [{ item: "OpenAI GPT-4o", cost: 3200 }, { item: "Anthropic Claude", cost: 2400 }, { item: "Embedding Models", cost: 1200 }] },
      { id: "cost-004", resource: "Storage", platform: "All", monthlyCost: 3400, trend: "up", percentage: 10, breakdown: [{ item: "Blob Storage", cost: 1800 }, { item: "Backups", cost: 1200 }, { item: "Logs", cost: 400 }] },
      { id: "cost-005", resource: "Networking", platform: "All", monthlyCost: 4600, trend: "stable", percentage: 13, breakdown: [{ item: "CDN", cost: 2000 }, { item: "Load Balancers", cost: 1600 }, { item: "DNS", cost: 200 }, { item: "Bandwidth", cost: 800 }] },
    ];
  },

  getDreameraBrandKit(): BrandKit {
    return { id: "bk-001", name: "SZL Holdings Brand", colors: { primary: "#6366f1", secondary: "#8b5cf6", accent: "#06b6d4", background: "#0f0f23" }, fonts: { heading: "Inter", body: "Inter" }, toneOfVoice: "Professional, innovative, and confident. Use active voice. Avoid jargon when possible." };
  },

  getDreameraCampaignCalendar(): CampaignCalendarEntry[] {
    return [
      { id: "cal-001", title: "Q1 Product Launch Blog", contentType: "blog", channel: "website", scheduledDate: "2026-03-28", status: "scheduled", assignee: "Content Team" },
      { id: "cal-002", title: "Security Platform Showcase", contentType: "video", channel: "youtube", scheduledDate: "2026-04-05", status: "draft", assignee: "Creative Team" },
      { id: "cal-003", title: "AI Innovation Newsletter", contentType: "newsletter", channel: "email", scheduledDate: "2026-03-30", status: "scheduled", assignee: "Marketing" },
      { id: "cal-004", title: "Vessels Platform Case Study", contentType: "case-study", channel: "website", scheduledDate: "2026-04-10", status: "draft", assignee: "Content Team" },
      { id: "cal-005", title: "Social Media Series: Behind the Code", contentType: "social", channel: "linkedin", scheduledDate: "2026-03-27", status: "published", assignee: "Social Media" },
    ];
  },

  getDreamscapeTemplates(): TemplateItem[] {
    return [
      { id: "tmpl-001", name: "Fantasy World Builder", description: "Complete template for building fantasy worlds with maps, lore, and character systems", category: "World Building", usageCount: 234, rating: 4.8 },
      { id: "tmpl-002", name: "Sci-Fi Universe", description: "Space-faring civilization template with tech trees and faction systems", category: "World Building", usageCount: 189, rating: 4.7 },
      { id: "tmpl-003", name: "Brand Story Arc", description: "Narrative framework for building compelling brand stories", category: "Brand Storytelling", usageCount: 312, rating: 4.9 },
      { id: "tmpl-004", name: "Product Launch Campaign", description: "Multi-channel launch campaign template with timeline and assets", category: "Marketing", usageCount: 456, rating: 4.6 },
      { id: "tmpl-005", name: "Interactive Documentary", description: "Template for creating branching documentary narratives", category: "Documentary", usageCount: 87, rating: 4.5 },
    ];
  },

  getDreamscapeAssetLibrary(): AssetItem[] {
    return [
      { id: "asset-001", name: "Hero Banner Collection", type: "image", tags: ["hero", "banner", "marketing", "web"], size: "24.5 MB", uploadedAt: "2026-03-20T00:00:00Z" },
      { id: "asset-002", name: "Product Screenshots", type: "image", tags: ["product", "screenshot", "UI", "dashboard"], size: "18.2 MB", uploadedAt: "2026-03-18T00:00:00Z" },
      { id: "asset-003", name: "Brand Logo Pack", type: "vector", tags: ["logo", "brand", "identity", "SVG"], size: "2.1 MB", uploadedAt: "2026-03-15T00:00:00Z" },
      { id: "asset-004", name: "Explainer Video Footage", type: "video", tags: ["video", "explainer", "animation"], size: "156 MB", uploadedAt: "2026-03-22T00:00:00Z" },
      { id: "asset-005", name: "Icon Library", type: "vector", tags: ["icons", "UI", "interface", "design"], size: "4.8 MB", uploadedAt: "2026-03-10T00:00:00Z" },
    ];
  },

  getAlloyscapePromptLab(): PromptLabResult[] {
    return [
      { id: "pl-001", prompt: "Analyze this security log and identify potential threats", scenarios: [{ name: "GPT-4o", output: "Identified 3 potential threats: credential stuffing attempt, unusual API access pattern, suspicious outbound DNS queries.", score: 92, latencyMs: 1200 }, { name: "Claude-3.5", output: "Detected 3 security concerns: 1) Brute force pattern on auth endpoint, 2) Anomalous data access from service account, 3) DNS exfiltration indicators.", score: 95, latencyMs: 980 }, { name: "Llama-3 70B", output: "Found suspicious activity: multiple failed logins and unusual network traffic patterns.", score: 78, latencyMs: 2400 }], bestScenario: "Claude-3.5", averageScore: 88.3 },
      { id: "pl-002", prompt: "Generate a quarterly business report summary", scenarios: [{ name: "GPT-4o", output: "Q1 2026 showed strong growth across all segments with 18% YoY revenue increase...", score: 90, latencyMs: 1500 }, { name: "Claude-3.5", output: "Executive Summary: Q1 2026 demonstrates robust performance with key metrics exceeding targets...", score: 88, latencyMs: 1100 }], bestScenario: "GPT-4o", averageScore: 89 },
    ];
  },

  getAlloyscapeConversationAnalytics(): ConversationAnalytics {
    return {
      totalSessions: 4280,
      avgSatisfaction: 4.2,
      resolutionRate: 87,
      avgResponseTimeMs: 1850,
      totalCost: 3240,
      byAgent: [
        { agentName: "ROSIE Security Agent", sessions: 820, satisfaction: 4.4, resolutionRate: 92, avgCost: 0.85 },
        { agentName: "Vessels Maritime Agent", sessions: 650, satisfaction: 4.3, resolutionRate: 89, avgCost: 0.92 },
        { agentName: "INCA Research Agent", sessions: 580, satisfaction: 4.1, resolutionRate: 85, avgCost: 0.78 },
        { agentName: "Beacon Analytics Agent", sessions: 520, satisfaction: 4.0, resolutionRate: 88, avgCost: 0.72 },
        { agentName: "SZL Holdings Concierge", sessions: 480, satisfaction: 4.5, resolutionRate: 94, avgCost: 0.65 },
        { agentName: "Nimbus Predictive Agent", sessions: 420, satisfaction: 3.9, resolutionRate: 82, avgCost: 0.88 },
        { agentName: "Zeus Architecture Agent", sessions: 380, satisfaction: 4.2, resolutionRate: 86, avgCost: 0.70 },
        { agentName: "Other Agents", sessions: 430, satisfaction: 4.0, resolutionRate: 84, avgCost: 0.75 },
      ],
    };
  },

  getSzlInvestorDashboard(): InvestorDashboard {
    return {
      portfolioValue: 48500000,
      portfolioGrowth: 24.5,
      platforms: [
        { name: "ROSIE", valuation: 8200000, growth: 32, status: "scaling", mrr: 185000 },
        { name: "Vessels", valuation: 6800000, growth: 28, status: "scaling", mrr: 142000 },
        { name: "Beacon", valuation: 5400000, growth: 22, status: "growth", mrr: 118000 },
        { name: "INCA", valuation: 4200000, growth: 45, status: "growth", mrr: 95000 },
        { name: "Nimbus", valuation: 3800000, growth: 35, status: "growth", mrr: 82000 },
        { name: "Aegis", valuation: 3500000, growth: 20, status: "stable", mrr: 78000 },
        { name: "Firestorm", valuation: 3200000, growth: 18, status: "stable", mrr: 72000 },
        { name: "Zeus", valuation: 2800000, growth: 15, status: "stable", mrr: 65000 },
        { name: "Lyte", valuation: 2400000, growth: 40, status: "growth", mrr: 52000 },
        { name: "AlloyScape", valuation: 2200000, growth: 55, status: "scaling", mrr: 48000 },
        { name: "DreamEra", valuation: 1800000, growth: 30, status: "growth", mrr: 38000 },
        { name: "Dreamscape", valuation: 1500000, growth: 25, status: "growth", mrr: 32000 },
        { name: "Carlota Jo", valuation: 1200000, growth: 18, status: "stable", mrr: 28000 },
      ],
      milestones: [
        { title: "Series A Funding", date: "2025-06-15", status: "completed" },
        { title: "10 Platforms Launched", date: "2025-09-30", status: "completed" },
        { title: "$2M ARR Milestone", date: "2025-11-20", status: "completed" },
        { title: "SOC 2 Certification", date: "2026-03-15", status: "completed" },
        { title: "18 Platforms Live", date: "2026-06-30", status: "in-progress" },
        { title: "$5M ARR Target", date: "2026-12-31", status: "planned" },
      ],
    };
  },

  getPortfolioHeatMap(): PortfolioHeatMapEntry[] {
    return [
      { platform: "ROSIE", health: 94, performance: 92, growth: 32, color: "#22c55e" },
      { platform: "Vessels", health: 88, performance: 90, growth: 28, color: "#22c55e" },
      { platform: "Beacon", health: 91, performance: 85, growth: 22, color: "#22c55e" },
      { platform: "INCA", health: 86, performance: 88, growth: 45, color: "#22c55e" },
      { platform: "Nimbus", health: 82, performance: 84, growth: 35, color: "#eab308" },
      { platform: "Aegis", health: 90, performance: 87, growth: 20, color: "#22c55e" },
      { platform: "Firestorm", health: 75, performance: 78, growth: 18, color: "#eab308" },
      { platform: "Zeus", health: 95, performance: 92, growth: 15, color: "#22c55e" },
      { platform: "Lyte", health: 88, performance: 82, growth: 40, color: "#22c55e" },
      { platform: "AlloyScape", health: 80, performance: 76, growth: 55, color: "#eab308" },
      { platform: "DreamEra", health: 72, performance: 70, growth: 30, color: "#f97316" },
      { platform: "Dreamscape", health: 68, performance: 65, growth: 25, color: "#f97316" },
      { platform: "Carlota Jo", health: 92, performance: 88, growth: 18, color: "#22c55e" },
      { platform: "Lutar", health: 85, performance: 80, growth: 12, color: "#22c55e" },
      { platform: "Career", health: 96, performance: 94, growth: 8, color: "#22c55e" },
      { platform: "Apps Showcase", health: 93, performance: 90, growth: 10, color: "#22c55e" },
      { platform: "Readiness Report", health: 89, performance: 86, growth: 15, color: "#22c55e" },
      { platform: "SZL Holdings", health: 97, performance: 95, growth: 20, color: "#22c55e" },
    ];
  },

  getCarlotaJoClientPipeline(): ClientPipelineEntry[] {
    return [
      { id: "pipe-001", clientName: "Acme Corp", company: "Acme Corporation", stage: "proposal", value: 125000, service: "Digital Transformation", lastContact: "2026-03-24", nextAction: "Send proposal draft" },
      { id: "pipe-002", clientName: "TechFlow Inc", company: "TechFlow", stage: "negotiation", value: 85000, service: "AI & Automation Strategy", lastContact: "2026-03-22", nextAction: "Schedule decision-maker meeting" },
      { id: "pipe-003", clientName: "SecureBank", company: "SecureBank Holdings", stage: "qualification", value: 200000, service: "Cybersecurity Advisory", lastContact: "2026-03-25", nextAction: "Conduct needs assessment" },
      { id: "pipe-004", clientName: "DataFirst Analytics", company: "DataFirst", stage: "closed-won", value: 95000, service: "Data Intelligence", lastContact: "2026-03-20", nextAction: "Kick-off meeting scheduled" },
      { id: "pipe-005", clientName: "GreenShip Logistics", company: "GreenShip", stage: "lead", value: 150000, service: "Custom Technology Solutions", lastContact: "2026-03-25", nextAction: "Initial outreach call" },
    ];
  },

  getCarlotaJoROICalculator(): ROICalculation[] {
    return [
      { id: "roi-001", clientProfile: "Mid-Market Enterprise", serviceTier: "Full Engagement", investmentAmount: 150000, projectedReturn: 525000, roiPercentage: 250, paybackMonths: 8, assumptions: ["20% operational efficiency gain", "15% revenue increase from AI automation", "Reduced security incident costs by 40%"] },
      { id: "roi-002", clientProfile: "Startup", serviceTier: "Strategic Assessment", investmentAmount: 25000, projectedReturn: 87500, roiPercentage: 250, paybackMonths: 4, assumptions: ["Clear technology roadmap saves 3 months development time", "Right-sized infrastructure reduces cloud costs 30%"] },
      { id: "roi-003", clientProfile: "Enterprise", serviceTier: "Full Engagement", investmentAmount: 350000, projectedReturn: 1400000, roiPercentage: 300, paybackMonths: 6, assumptions: ["Digital transformation reduces manual processes by 60%", "New revenue streams from data monetization", "Compliance automation reduces audit costs by 50%"] },
    ];
  },

  getLutarPersonalKPIs(): PersonalKPI[] {
    return [
      { id: "pk-001", name: "Portfolio Revenue", category: "financial", value: 2400000, target: 3000000, unit: "$", trend: "up" },
      { id: "pk-002", name: "Platform Health Score", category: "operations", value: 87, target: 95, unit: "%", trend: "up" },
      { id: "pk-003", name: "Active Clients", category: "business", value: 42, target: 50, unit: "", trend: "up" },
      { id: "pk-004", name: "Team Size", category: "people", value: 28, target: 35, unit: "", trend: "stable" },
      { id: "pk-005", name: "Deployment Frequency", category: "engineering", value: 12, target: 15, unit: "/week", trend: "up" },
      { id: "pk-006", name: "Customer Satisfaction", category: "quality", value: 4.3, target: 4.5, unit: "/5", trend: "stable" },
    ];
  },

  getLutarDailyBriefing(): DailyBriefing {
    return {
      id: "brief-001",
      date: new Date().toISOString().split("T")[0],
      criticalItems: [
        { title: "VLGC-009 CII Rating D — Operational restrictions imminent", source: "Vessels", priority: "critical" },
        { title: "Firestorm API latency exceeding SLA", source: "Lyte", priority: "high" },
        { title: "3 vessel certificates expiring within 30 days", source: "Vessels", priority: "high" },
      ],
      metrics: [
        { name: "Portfolio Revenue", value: "$2.4M ARR", change: "+8% MoM" },
        { name: "Platform Health", value: "87/100", change: "+2 pts" },
        { name: "Active Threats", value: "3", change: "-1 from yesterday" },
        { name: "Uptime", value: "99.7%", change: "-0.1%" },
      ],
      priorities: [
        "Review Firestorm API optimization plan",
        "Sign off on SOC 2 audit findings",
        "Review Carlota Jo Q1 pipeline report",
        "Approve Vessels compliance submission",
      ],
      generatedAt: new Date().toISOString(),
    };
  },

  getLutarDecisionJournal(): DecisionJournal[] {
    return [
      { id: "dj-001", title: "Invest in GPU infrastructure for AI pipeline", context: "Dreamscape AI generation pipeline latency at 6.2s, above 5s target", rationale: "User drop-off increased 18% on generation flows. GPU scaling provides direct latency improvement.", outcome: "Latency reduced to 3.8s. User engagement recovered within 2 weeks.", status: "successful", date: "2026-02-15", tags: ["infrastructure", "AI", "performance"] },
      { id: "dj-002", title: "Adopt zero-trust architecture for Aegis", context: "Moving from perimeter-based to zero-trust security model", rationale: "Industry best practice. Enables granular access control and reduces attack surface.", status: "pending", date: "2026-03-20", tags: ["security", "architecture"] },
      { id: "dj-003", title: "Launch Carlota Jo consulting platform", context: "Monetize consulting expertise through a dedicated platform", rationale: "High demand for AI and security consulting. Low marginal cost to productize.", outcome: "$84K in Q1 bookings. Strong pipeline.", status: "successful", date: "2025-09-01", tags: ["business", "revenue"] },
    ];
  },

  getCareerVisitorAnalytics(): VisitorAnalytics {
    return {
      totalViews: 12480,
      uniqueVisitors: 8920,
      avgTimeOnPage: 185,
      topPages: [
        { page: "/", views: 5200, avgTime: 120 },
        { page: "/projects", views: 3400, avgTime: 240 },
        { page: "/experience", views: 2100, avgTime: 180 },
        { page: "/contact", views: 1780, avgTime: 90 },
      ],
      sources: [
        { source: "LinkedIn", visitors: 3568, percentage: 40 },
        { source: "Google", visitors: 2676, percentage: 30 },
        { source: "Direct", visitors: 1338, percentage: 15 },
        { source: "GitHub", visitors: 892, percentage: 10 },
        { source: "Other", visitors: 446, percentage: 5 },
      ],
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
        views: 300 + Math.floor(rng() * 200),
        visitors: 200 + Math.floor(rng() * 150),
      })),
    };
  },

  getCareerContactPipeline(): ContactPipeline[] {
    return [
      { id: "cp-001", name: "Sarah Chen", email: "sarah@techcorp.com", company: "TechCorp", status: "meeting-scheduled", source: "LinkedIn", receivedAt: "2026-03-22T00:00:00Z", lastAction: "Confirmed meeting for March 28" },
      { id: "cp-002", name: "James Walker", email: "james@innovate.io", company: "Innovate.io", status: "responded", source: "Portfolio Site", receivedAt: "2026-03-24T00:00:00Z", lastAction: "Sent availability" },
      { id: "cp-003", name: "Maria Rodriguez", email: "maria@enterprise.com", company: "Enterprise Solutions", status: "new", source: "Referral", receivedAt: "2026-03-25T00:00:00Z" },
    ];
  },

  getAppsShowcaseFeatureComparison(): FeatureComparison {
    return {
      platforms: [
        { name: "ROSIE", category: "Security", features: { "Threat Detection": true, "Incident Response": true, "AI Agent": true, "Compliance": false, "Simulation": false }, pricing: { starter: 999, professional: 2499, enterprise: "Custom" }, useCase: "Security Operations Centers" },
        { name: "Aegis", category: "Security", features: { "Threat Detection": false, "Incident Response": false, "AI Agent": true, "Compliance": true, "Simulation": false }, pricing: { starter: 799, professional: 1999, enterprise: "Custom" }, useCase: "Compliance & Governance" },
        { name: "Firestorm", category: "Security", features: { "Threat Detection": false, "Incident Response": false, "AI Agent": true, "Compliance": false, "Simulation": true }, pricing: { starter: 1299, professional: 3499, enterprise: "Custom" }, useCase: "Red/Blue Team Exercises" },
        { name: "Beacon", category: "Analytics", features: { "KPI Dashboard": true, "Custom Metrics": true, "AI Agent": true, "Alerts": true, "Reports": true }, pricing: { starter: 499, professional: 1299, enterprise: "Custom" }, useCase: "Business Intelligence" },
        { name: "Nimbus", category: "AI/ML", features: { "Predictions": true, "Anomaly Detection": true, "AI Agent": true, "Forecasting": true, "What-If Analysis": true }, pricing: { starter: 899, professional: 2299, enterprise: "Custom" }, useCase: "Predictive Analytics" },
        { name: "Vessels", category: "Maritime", features: { "Fleet Tracking": true, "Emissions Monitoring": true, "AI Agent": true, "Compliance": true, "Voyage P&L": true }, pricing: { starter: 1499, professional: 3999, enterprise: "Custom" }, useCase: "Maritime Fleet Management" },
      ],
    };
  },

  getReadinessDeploymentTriggers(): DeploymentTrigger[] {
    return [
      { id: "dt-001", platform: "ROSIE", environment: "production", preflightChecks: [{ name: "Unit Tests", status: "passed", details: "412/412 passed" }, { name: "Integration Tests", status: "passed", details: "86/86 passed" }, { name: "Security Scan", status: "passed", details: "0 critical, 0 high" }, { name: "Performance Test", status: "passed", details: "p95 < 200ms" }], lastDeployment: "2026-03-24T10:30:00Z", status: "ready" },
      { id: "dt-002", platform: "Firestorm", environment: "production", preflightChecks: [{ name: "Unit Tests", status: "passed", details: "328/328 passed" }, { name: "Integration Tests", status: "passed", details: "64/64 passed" }, { name: "Security Scan", status: "passed", details: "0 critical, 1 high (accepted risk)" }, { name: "Performance Test", status: "failed", details: "p95 = 520ms, target < 500ms" }], lastDeployment: "2026-03-20T14:15:00Z", status: "blocked" },
      { id: "dt-003", platform: "Vessels", environment: "staging", preflightChecks: [{ name: "Unit Tests", status: "passed", details: "520/520 passed" }, { name: "Integration Tests", status: "pending", details: "Running..." }, { name: "Security Scan", status: "passed", details: "0 critical, 0 high" }, { name: "Performance Test", status: "pending", details: "Queued" }], status: "deploying" },
    ];
  },

  getReadinessHealthTrends(): HealthTrend[] {
    return [
      { platform: "ROSIE", dataPoints: Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0], healthScore: 88 + Math.floor(rng() * 8), uptime: 99.5 + rng() * 0.5, errorRate: 0.5 + rng() * 1.5 })), trend: "improving", prediction: 96 },
      { platform: "Firestorm", dataPoints: Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0], healthScore: 70 + Math.floor(rng() * 12), uptime: 98.5 + rng() * 1, errorRate: 1.5 + rng() * 3 })), trend: "degrading", prediction: 72 },
      { platform: "Vessels", dataPoints: Array.from({ length: 30 }, (_, i) => ({ date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0], healthScore: 85 + Math.floor(rng() * 6), uptime: 99.2 + rng() * 0.6, errorRate: 0.8 + rng() * 1.2 })), trend: "stable", prediction: 89 },
    ];
  },

  getReadinessStatusPages(): StatusPage[] {
    return [
      { id: "sp-001", platform: "ROSIE", status: "operational", uptime: 99.94, components: [{ name: "API", status: "operational" }, { name: "Dashboard", status: "operational" }, { name: "Threat Engine", status: "operational" }] },
      { id: "sp-002", platform: "Firestorm", status: "degraded", uptime: 99.12, lastIncident: "2026-03-25T10:00:00Z", components: [{ name: "API", status: "degraded" }, { name: "Simulation Engine", status: "degraded" }, { name: "Dashboard", status: "operational" }] },
      { id: "sp-003", platform: "Vessels", status: "operational", uptime: 99.87, components: [{ name: "API", status: "operational" }, { name: "Fleet Map", status: "operational" }, { name: "AIS Feed", status: "degraded" }] },
      { id: "sp-004", platform: "Beacon", status: "operational", uptime: 99.98, components: [{ name: "API", status: "operational" }, { name: "Dashboard", status: "operational" }, { name: "Webhook Engine", status: "operational" }] },
      { id: "sp-005", platform: "Zeus", status: "operational", uptime: 99.99, components: [{ name: "API", status: "operational" }, { name: "Module Manager", status: "operational" }, { name: "Log Pipeline", status: "operational" }] },
    ];
  },
};
