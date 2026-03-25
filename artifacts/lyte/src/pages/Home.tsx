import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, ArrowUpRight, BarChart3, Bell, CheckCircle,
  ChevronDown, ChevronRight, Clock, Cloud, Cpu, Database, DollarSign,
  Eye, Filter, Globe, Layers, Link2, Lock, Mail, Monitor, Radio,
  RefreshCw, Search, Server, Settings, Shield, Signal, SortAsc,
  SortDesc, Target, TrendingDown, TrendingUp, Users, Wifi, X, Zap,
  AlertCircle, ChevronUp, FileWarning, Gauge, Boxes, Sparkles,
  Milestone, Play, SquareArrowOutUpRight, Minus, ArrowRight
} from "lucide-react";

type Severity = "critical" | "high" | "medium" | "low" | "info";
type SignalDomain = "operations" | "logistics" | "security" | "performance" | "deployment" | "integration";
type SignalStatus = "active" | "acknowledged" | "resolved" | "muted";
type ProjectStatus = "deployed" | "staging" | "development" | "not-started";

interface SignalItem {
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

interface Recommendation {
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

interface IntegrationStatus {
  id: string;
  name: string;
  adapter: string;
  status: "connected" | "degraded" | "disconnected";
  mode: "live" | "demo";
  lastSync: string;
  freshness: "fresh" | "stale" | "expired";
  details: string;
}

interface ImpactMetric {
  id: string;
  title: string;
  category: "cost" | "risk" | "efficiency" | "revenue";
  value: string;
  trend: "up" | "down" | "stable";
  narrative: string;
  relatedProjects: string[];
}

interface PortfolioProject {
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

const portfolioProjects: PortfolioProject[] = [
  { name: "ROSIE", route: "/", readiness: 96, status: "deployed", category: "Security", owner: "Stephen L.", blockers: 0, nextAction: "Complete load testing", attentionLevel: "none", dns: true, tls: true, environment: "production", uptime: 99.97, lastDeploy: "2 hours ago" },
  { name: "Aegis", route: "/aegis/", readiness: 88, status: "deployed", category: "Security", owner: "Stephen L.", blockers: 1, nextAction: "Fix API rate limiting", attentionLevel: "watch", dns: true, tls: true, environment: "production", uptime: 99.95, lastDeploy: "1 day ago" },
  { name: "Beacon", route: "/beacon/", readiness: 92, status: "deployed", category: "Analytics", owner: "Stephen L.", blockers: 0, nextAction: "Finalize PDF export", attentionLevel: "none", dns: true, tls: true, environment: "production", uptime: 99.98, lastDeploy: "6 hours ago" },
  { name: "Lutar", route: "/lutar/", readiness: 85, status: "deployed", category: "Command", owner: "Stephen L.", blockers: 1, nextAction: "Renew TLS certificate", attentionLevel: "watch", dns: true, tls: true, environment: "production", uptime: 99.91, lastDeploy: "3 days ago" },
  { name: "Nimbus", route: "/nimbus/", readiness: 91, status: "deployed", category: "AI", owner: "Stephen L.", blockers: 0, nextAction: "Complete model retraining", attentionLevel: "none", dns: true, tls: true, environment: "production", uptime: 99.96, lastDeploy: "12 hours ago" },
  { name: "Firestorm", route: "/firestorm/", readiness: 78, status: "staging", category: "Security", owner: "Stephen L.", blockers: 2, nextAction: "Optimize response times", attentionLevel: "action", dns: true, tls: true, environment: "staging", uptime: 99.82, lastDeploy: "5 days ago" },
  { name: "DreamEra", route: "/dreamera/", readiness: 82, status: "deployed", category: "AI", owner: "Stephen L.", blockers: 1, nextAction: "Improve model accuracy", attentionLevel: "watch", dns: true, tls: true, environment: "production", uptime: 99.89, lastDeploy: "1 day ago" },
  { name: "Zeus", route: "/zeus/", readiness: 94, status: "deployed", category: "Infrastructure", owner: "Stephen L.", blockers: 0, nextAction: "Complete chaos tests", attentionLevel: "none", dns: true, tls: true, environment: "production", uptime: 99.99, lastDeploy: "4 hours ago" },
  { name: "AlloyScape", route: "/alloyscape/", readiness: 89, status: "deployed", category: "Infrastructure", owner: "Stephen L.", blockers: 0, nextAction: "Complete workflow templates", attentionLevel: "none", dns: true, tls: true, environment: "production", uptime: 99.93, lastDeploy: "8 hours ago" },
  { name: "Apps Showcase", route: "/apps-showcase/", readiness: 90, status: "deployed", category: "Marketing", owner: "Stephen L.", blockers: 0, nextAction: "Add demo videos", attentionLevel: "none", dns: true, tls: true, environment: "production", uptime: 99.94, lastDeploy: "8 hours ago" },
  { name: "Vessels", route: "/vessels/", readiness: 86, status: "deployed", category: "Logistics", owner: "Stephen L.", blockers: 1, nextAction: "Stabilize AIS feed", attentionLevel: "watch", dns: true, tls: true, environment: "production", uptime: 99.90, lastDeploy: "3 hours ago" },
  { name: "Carlota Jo", route: "/carlota-jo/", readiness: 84, status: "deployed", category: "Consulting", owner: "Carlota B.", blockers: 0, nextAction: "Complete Stripe integration", attentionLevel: "none", dns: true, tls: true, environment: "production", uptime: 99.88, lastDeploy: "1 hour ago" },
  { name: "Dreamscape", route: "/dreamscape/", readiness: 80, status: "deployed", category: "Creative", owner: "Stephen L.", blockers: 1, nextAction: "Optimize AI pipeline", attentionLevel: "action", dns: true, tls: true, environment: "production", uptime: 99.80, lastDeploy: "30 min ago" },
  { name: "PSEM", route: "#", readiness: 25, status: "not-started", category: "Security", owner: "Unassigned", blockers: 2, nextAction: "Assign team & requirements", attentionLevel: "critical", dns: false, tls: false, environment: "development", uptime: 0, lastDeploy: "—" },
  { name: "Readiness Report", route: "/readiness-report/", readiness: 87, status: "deployed", category: "Operations", owner: "Stephen L.", blockers: 0, nextAction: "—", attentionLevel: "none", dns: true, tls: true, environment: "production", uptime: 99.90, lastDeploy: "Just now" },
  { name: "Career", route: "/career/", readiness: 83, status: "deployed", category: "Branding", owner: "Stephen L.", blockers: 0, nextAction: "—", attentionLevel: "none", dns: true, tls: true, environment: "production", uptime: 99.85, lastDeploy: "1 hour ago" },
  { name: "Lyte", route: "/lyte/", readiness: 90, status: "deployed", category: "Observability", owner: "Stephen L.", blockers: 0, nextAction: "—", attentionLevel: "none", dns: true, tls: true, environment: "production", uptime: 99.95, lastDeploy: "Just now" },
];

const demoSignals: SignalItem[] = [
  { id: "sig-001", title: "Firestorm response time exceeds 200ms SLA threshold", description: "Average response time has been above 200ms for 3 consecutive intervals.", domain: "performance", source: "Telemetry Adapter", severity: "high", status: "active", confidence: 94, freshness: "live", businessImpact: "Degraded UX affecting ~2,400 daily active sessions", recommendedAction: "Investigate backend query optimization; consider caching layer", owner: "Backend Team", timestamp: "2026-03-25T14:23:00Z" },
  { id: "sig-002", title: "PSEM project has no assigned development team", description: "PSEM remains in not-started status with critical blockers.", domain: "operations", source: "Project Status Adapter", severity: "critical", status: "active", confidence: 100, freshness: "live", businessImpact: "$180K projected revenue at risk if Q3 deadline missed", recommendedAction: "Escalate to leadership; assign team", owner: "Management", timestamp: "2026-03-25T08:00:00Z" },
  { id: "sig-003", title: "Lutar TLS certificate expiring in 34 days", description: "Auto-renewal is not configured for szlholdings.com/lutar.", domain: "security", source: "Security Feed Adapter", severity: "medium", status: "active", confidence: 100, freshness: "live", businessImpact: "Service interruption risk", recommendedAction: "Schedule TLS renewal; configure auto-renewal", owner: "Infrastructure", timestamp: "2026-03-25T06:00:00Z" },
  { id: "sig-004", title: "DreamEra neural synthesis accuracy below target", description: "Current accuracy at 84.2%, below the 90% threshold.", domain: "operations", source: "Internal API Adapter", severity: "high", status: "active", confidence: 88, freshness: "recent", businessImpact: "User satisfaction down 12%", recommendedAction: "Retrain model with expanded dataset", owner: "ML Team", timestamp: "2026-03-25T10:15:00Z" },
  { id: "sig-005", title: "AIS data feed intermittent delays — Vessels", description: "15-30s delays in 8% of requests from upstream provider.", domain: "logistics", source: "Logistics Adapter", severity: "medium", status: "acknowledged", confidence: 82, freshness: "recent", businessImpact: "Fleet position accuracy degraded", recommendedAction: "Implement local caching buffer", owner: "Data Eng", timestamp: "2026-03-25T11:30:00Z" },
  { id: "sig-006", title: "Dreamscape AI generation pipeline >5s latency", description: "Averaging 6.2s per request. GPU queue saturation suspected.", domain: "performance", source: "Telemetry Adapter", severity: "high", status: "active", confidence: 91, freshness: "live", businessImpact: "User drop-off rate +18% on generation flows", recommendedAction: "Scale GPU allocation", owner: "ML Team", timestamp: "2026-03-25T13:45:00Z" },
  { id: "sig-007", title: "Zeus chaos engineering tests 78% complete", description: "Remaining: network partition, cascade failure, data corruption.", domain: "deployment", source: "Project Status Adapter", severity: "low", status: "active", confidence: 95, freshness: "recent", businessImpact: "Resilience validation incomplete", recommendedAction: "Complete remaining 3 chaos scenarios", owner: "Stephen L.", timestamp: "2026-03-25T09:00:00Z" },
  { id: "sig-008", title: "Stripe webhook verification healthy", description: "All payment flow webhooks passing. Nominal across Carlota Jo.", domain: "integration", source: "Integration Adapter", severity: "info", status: "resolved", confidence: 100, freshness: "live", businessImpact: "Revenue pipeline healthy — $12.4K/week", recommendedAction: "No action required", owner: "Stephen L.", timestamp: "2026-03-25T14:00:00Z" },
  { id: "sig-009", title: "Aegis compliance module rate limited", description: "3 of 12 scan batches throttled in last cycle.", domain: "security", source: "Security Feed Adapter", severity: "medium", status: "active", confidence: 87, freshness: "recent", businessImpact: "Compliance scan coverage at 75%", recommendedAction: "Implement exponential backoff", owner: "DevOps", timestamp: "2026-03-25T12:20:00Z" },
  { id: "sig-010", title: "ROSIE load testing in progress", description: "Stable performance up to 10K concurrent. Targeting 15K.", domain: "deployment", source: "Telemetry Adapter", severity: "info", status: "active", confidence: 96, freshness: "live", businessImpact: "Production readiness on track", recommendedAction: "Continue to 15K target", owner: "Stephen L.", timestamp: "2026-03-25T14:10:00Z" },
  { id: "sig-011", title: "Database connection pool at 62%", description: "Normal operating range. Alert threshold at 85%.", domain: "performance", source: "Telemetry Adapter", severity: "info", status: "resolved", confidence: 98, freshness: "live", businessImpact: "Operating within normal parameters", recommendedAction: "Continue monitoring", owner: "Infrastructure", timestamp: "2026-03-25T14:25:00Z" },
  { id: "sig-012", title: "AlloyScape workflow templates 60% complete", description: "12 of 20 planned templates completed.", domain: "operations", source: "Project Status Adapter", severity: "low", status: "active", confidence: 90, freshness: "recent", businessImpact: "Manual workflows costing ~8 hrs/week", recommendedAction: "Prioritize CI/CD templates", owner: "Stephen L.", timestamp: "2026-03-25T08:30:00Z" },
];

const demoRecommendations: Recommendation[] = [
  { id: "rec-001", title: "Assign development team to PSEM", reasoning: "Only portfolio project with no team. $180K Q3 revenue at risk.", projectedImpact: "Unblock $180K revenue; close security gap", priority: 1, actionType: "escalate", suggestedActions: ["Assign 2-person team", "Complete requirements in 2 weeks", "Configure DNS & TLS"], relatedSignals: ["sig-002"], owner: "Management" },
  { id: "rec-002", title: "Optimize Firestorm API response times", reasoning: "Response times above 200ms SLA. Unoptimized queries + no caching.", projectedImpact: "Restore SLA; improve 2,400 daily sessions", priority: 2, actionType: "investigate", suggestedActions: ["Profile top 5 slowest endpoints", "Implement Redis caching", "Optimize scenario builder queries"], relatedSignals: ["sig-001"], owner: "Backend Team" },
  { id: "rec-003", title: "Scale Dreamscape GPU allocation", reasoning: "AI pipeline at 6.2s vs 5s target. GPU queue saturated.", projectedImpact: "Reduce to <4s; recover 18% drop-off", priority: 3, actionType: "deploy", suggestedActions: ["Request GPU quota increase", "Implement request batching", "Deploy model quantization"], relatedSignals: ["sig-006"], owner: "ML Team" },
  { id: "rec-004", title: "Renew Lutar TLS & enable auto-renewal", reasoning: "Certificate expires in 34 days. Manual renewal is operational risk.", projectedImpact: "Eliminate recurring TLS risk", priority: 4, actionType: "schedule", suggestedActions: ["Renew certificate", "Configure cert-manager", "Audit all portfolio certs"], relatedSignals: ["sig-003"], owner: "Infrastructure" },
  { id: "rec-005", title: "Retrain DreamEra synthesis model", reasoning: "84.2% accuracy vs 90% target. Expanded dataset available.", projectedImpact: "Achieve >90% accuracy; recover satisfaction", priority: 5, actionType: "automate", suggestedActions: ["Prepare 2x training dataset", "A/B test improved model", "Set up monthly retraining"], relatedSignals: ["sig-004"], owner: "ML Team" },
];

const demoIntegrations: IntegrationStatus[] = [
  { id: "int-001", name: "Telemetry Engine", adapter: "TelemetryAdapter", status: "connected", mode: "demo", lastSync: "2 min ago", freshness: "fresh", details: "Performance metrics across 16 services" },
  { id: "int-002", name: "Security Feed", adapter: "SecurityFeedAdapter", status: "connected", mode: "demo", lastSync: "5 min ago", freshness: "fresh", details: "TLS, DNS, vuln scans, compliance" },
  { id: "int-003", name: "Logistics Hub", adapter: "LogisticsAdapter", status: "degraded", mode: "demo", lastSync: "18 min ago", freshness: "stale", details: "AIS feed intermittent delays" },
  { id: "int-004", name: "Project Status", adapter: "ProjectStatusAdapter", status: "connected", mode: "demo", lastSync: "1 min ago", freshness: "fresh", details: "Readiness & milestones for 16 projects" },
  { id: "int-005", name: "Internal API", adapter: "InternalApiAdapter", status: "connected", mode: "demo", lastSync: "3 min ago", freshness: "fresh", details: "Health checks from api-server" },
  { id: "int-006", name: "AI Insight Engine", adapter: "AiInsightAdapter", status: "disconnected", mode: "demo", lastSync: "—", freshness: "expired", details: "No AI provider — deterministic responses" },
];

const demoImpact: ImpactMetric[] = [
  { id: "imp-001", title: "Portfolio Operational Savings", category: "efficiency", value: "$42K/mo", trend: "up", narrative: "Automation across AlloyScape and Zeus saves 520 engineering hours monthly.", relatedProjects: ["AlloyScape", "Zeus"] },
  { id: "imp-002", title: "Revenue at Risk — PSEM", category: "risk", value: "$180K", trend: "stable", narrative: "PSEM delay threatens $180K Q3 security consulting revenue.", relatedProjects: ["PSEM"] },
  { id: "imp-003", title: "Infrastructure Cost Reduction", category: "cost", value: "-15%", trend: "down", narrative: "Auto-scaling and predictive allocation reduced costs 15% QoQ.", relatedProjects: ["Zeus", "Nimbus"] },
  { id: "imp-004", title: "Consulting Pipeline", category: "revenue", value: "$84K", trend: "up", narrative: "Carlota Jo generated $84K in bookings this quarter.", relatedProjects: ["Carlota Jo"] },
  { id: "imp-005", title: "Latency Impact", category: "risk", value: "18% drop-off", trend: "up", narrative: "Dreamscape + Firestorm latency affecting 4,200 sessions/day.", relatedProjects: ["Dreamscape", "Firestorm"] },
  { id: "imp-006", title: "Security Posture", category: "efficiency", value: "91/100", trend: "stable", narrative: "Portfolio security score 91/100. Gap: PSEM not started.", relatedProjects: ["ROSIE", "Aegis", "Firestorm"] },
];

const severityConfig: Record<Severity, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  low: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  info: { color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" },
};

const domainConfig: Record<SignalDomain, { label: string; icon: typeof Activity; color: string }> = {
  operations: { label: "Operations", icon: Boxes, color: "text-blue-400" },
  logistics: { label: "Logistics", icon: Globe, color: "text-cyan-400" },
  security: { label: "Security", icon: Shield, color: "text-emerald-400" },
  performance: { label: "Performance", icon: Gauge, color: "text-amber-400" },
  deployment: { label: "Deployment", icon: Server, color: "text-purple-400" },
  integration: { label: "Integration", icon: Link2, color: "text-pink-400" },
};

const actionTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  automate: { label: "Automate", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  escalate: { label: "Escalate", color: "text-red-400", bg: "bg-red-500/10" },
  investigate: { label: "Investigate", color: "text-amber-400", bg: "bg-amber-500/10" },
  schedule: { label: "Schedule", color: "text-blue-400", bg: "bg-blue-500/10" },
  deploy: { label: "Deploy", color: "text-purple-400", bg: "bg-purple-500/10" },
};

function getReadinessColor(score: number) {
  if (score >= 90) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  if (score >= 50) return "text-orange-400";
  return "text-red-400";
}

function getReadinessRingColor(score: number) {
  if (score >= 90) return "#34d399";
  if (score >= 70) return "#fbbf24";
  if (score >= 50) return "#fb923c";
  return "#f87171";
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function ProgressRing({ score, size = 48 }: { score: number; size?: number }) {
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getReadinessRingColor(score);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(225 20% 12%)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1, ease: "easeOut" }} strokeDasharray={circumference} />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono ${getReadinessColor(score)}`}>{score}</span>
    </div>
  );
}

function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45, delay }} className={className}>
      {children}
    </motion.div>
  );
}

type ActiveTab = "dashboard" | "signals" | "recommendations" | "impact" | "portfolio" | "integrations" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [signalFilter, setSignalFilter] = useState<{ severity: string; domain: string; status: string }>({ severity: "all", domain: "all", status: "all" });
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerSignal, setDrawerSignal] = useState<SignalItem | null>(null);
  const [drawerProject, setDrawerProject] = useState<PortfolioProject | null>(null);
  const [portfolioSort, setPortfolioSort] = useState<{ field: string; dir: "asc" | "desc" }>({ field: "readiness", dir: "desc" });
  const [portfolioFilter, setPortfolioFilter] = useState<string>("all");
  const [actionStates, setActionStates] = useState<Record<string, string>>({});

  const healthScore = 87;
  const avgReadiness = Math.round(portfolioProjects.reduce((s, p) => s + p.readiness, 0) / portfolioProjects.length);
  const deployed = portfolioProjects.filter(p => p.status === "deployed").length;
  const criticals = demoSignals.filter(s => s.severity === "critical" && s.status === "active").length;
  const attentionNeeded = portfolioProjects.filter(p => p.attentionLevel === "action" || p.attentionLevel === "critical").length;
  const activeSignals = demoSignals.filter(s => s.status === "active").length;

  const filteredSignals = demoSignals.filter(s => {
    if (signalFilter.severity !== "all" && s.severity !== signalFilter.severity) return false;
    if (signalFilter.domain !== "all" && s.domain !== signalFilter.domain) return false;
    if (signalFilter.status !== "all" && s.status !== signalFilter.status) return false;
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  let sortedProjects = [...portfolioProjects];
  if (portfolioFilter !== "all") {
    if (portfolioFilter === "attention") sortedProjects = sortedProjects.filter(p => p.attentionLevel !== "none");
    else sortedProjects = sortedProjects.filter(p => p.status === portfolioFilter);
  }
  sortedProjects.sort((a, b) => {
    let cmp = 0;
    if (portfolioSort.field === "readiness") cmp = a.readiness - b.readiness;
    else if (portfolioSort.field === "name") cmp = a.name.localeCompare(b.name);
    else if (portfolioSort.field === "blockers") cmp = a.blockers - b.blockers;
    else if (portfolioSort.field === "status") cmp = a.status.localeCompare(b.status);
    return portfolioSort.dir === "desc" ? -cmp : cmp;
  });

  const handleAction = (id: string, label: string) => {
    setActionStates(prev => ({ ...prev, [id]: "executing" }));
    setTimeout(() => setActionStates(prev => ({ ...prev, [id]: "done" })), 1800);
  };

  const tabs: { id: ActiveTab; label: string; icon: typeof Activity }[] = [
    { id: "dashboard", label: "Command", icon: Monitor },
    { id: "signals", label: "Signals", icon: Radio },
    { id: "recommendations", label: "AI Actions", icon: Sparkles },
    { id: "impact", label: "Impact", icon: DollarSign },
    { id: "portfolio", label: "Portfolio", icon: Layers },
    { id: "integrations", label: "Integrations", icon: Link2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-sm tracking-wider">LYTE</span>
            <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">COMMAND CENTER</span>
            <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">DEMO</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono hidden md:inline">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
          </div>
        </div>
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto pb-0 -mb-px scrollbar-hide">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === tab.id ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground hover:border-white/10"}`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6">
        {activeTab === "dashboard" && <DashboardTab healthScore={healthScore} avgReadiness={avgReadiness} deployed={deployed} criticals={criticals} attentionNeeded={attentionNeeded} activeSignals={activeSignals} signals={demoSignals} projects={portfolioProjects} onSignalClick={setDrawerSignal} onProjectClick={setDrawerProject} />}
        {activeTab === "signals" && <SignalsTab signals={filteredSignals} filter={signalFilter} setFilter={setSignalFilter} search={searchQuery} setSearch={setSearchQuery} onSignalClick={setDrawerSignal} />}
        {activeTab === "recommendations" && <RecommendationsTab recommendations={demoRecommendations} actionStates={actionStates} onAction={handleAction} />}
        {activeTab === "impact" && <ImpactTab metrics={demoImpact} />}
        {activeTab === "portfolio" && <PortfolioTab projects={sortedProjects} sort={portfolioSort} setSort={setPortfolioSort} filter={portfolioFilter} setFilter={setPortfolioFilter} onProjectClick={setDrawerProject} />}
        {activeTab === "integrations" && <IntegrationsTab integrations={demoIntegrations} />}
        {activeTab === "settings" && <SettingsTab integrations={demoIntegrations} />}
      </div>

      <AnimatePresence>
        {drawerSignal && (
          <SignalDrawer signal={drawerSignal} onClose={() => setDrawerSignal(null)} />
        )}
        {drawerProject && (
          <ProjectDrawer project={drawerProject} signals={demoSignals} onClose={() => setDrawerProject(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardTab({ healthScore, avgReadiness, deployed, criticals, attentionNeeded, activeSignals, signals, projects, onSignalClick, onProjectClick }: any) {
  return (
    <>
      <Section className="mb-6">
        <div className="glass-card rounded-2xl p-6 glow-blue">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-display font-bold mb-1">Ecosystem Health: <span className="text-primary"><AnimatedCounter value={healthScore} />/100</span></h1>
              <p className="text-sm text-muted-foreground">SZL Holdings operational intelligence — {portfolioProjects.length} platforms monitored. All signals, risks, and actions in one view.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mode</p>
                <span className="text-xs font-mono text-amber-400">Demo</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Operational</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="mb-6" delay={0.08}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Health Score", value: healthScore, suffix: "/100", icon: Activity, color: "text-primary" },
            { label: "Avg Readiness", value: avgReadiness, suffix: "%", icon: BarChart3, color: getReadinessColor(avgReadiness) },
            { label: "Deployed", value: deployed, suffix: `/${portfolioProjects.length}`, icon: Server, color: "text-emerald-400" },
            { label: "Critical Signals", value: criticals, suffix: "", icon: AlertCircle, color: criticals > 0 ? "text-red-400" : "text-emerald-400" },
            { label: "Attention Needed", value: attentionNeeded, suffix: "", icon: Eye, color: attentionNeeded > 0 ? "text-orange-400" : "text-emerald-400" },
            { label: "Active Signals", value: activeSignals, suffix: "", icon: Radio, color: "text-blue-400" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{kpi.label}</span>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <p className={`text-xl font-bold font-mono ${kpi.color}`}><AnimatedCounter value={kpi.value} />{kpi.suffix}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Section className="lg:col-span-2" delay={0.15}>
          <div className="glass-card rounded-xl p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-400" /> Attention Queue</h2>
              <span className="text-[10px] text-muted-foreground font-mono">Priority ranked</span>
            </div>
            <div className="space-y-2">
              {signals.filter((s: SignalItem) => (s.severity === "critical" || s.severity === "high") && s.status === "active").map((sig: SignalItem, i: number) => (
                <motion.div key={sig.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06 }} onClick={() => onSignalClick(sig)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/20 transition ${severityConfig[sig.severity].bg} ${severityConfig[sig.severity].border}`}>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${severityConfig[sig.severity].color} ${severityConfig[sig.severity].bg}`}>{sig.severity}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{sig.title}</p>
                    <p className="text-[10px] text-muted-foreground">{sig.owner} · {sig.source}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{sig.confidence}%</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        <Section delay={0.2}>
          <div className="glass-card rounded-xl p-5 h-full">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Strategic Highlights</h2>
            <div className="space-y-3">
              {[
                { label: "Strongest Asset", value: "ROSIE — 96% readiness", color: "text-emerald-400", sub: "Threat engine fully operational" },
                { label: "Near Launch", value: "Firestorm — staging", color: "text-amber-400", sub: "Response time optimization needed" },
                { label: "High Potential", value: "Nimbus — 91% AI platform", color: "text-blue-400", sub: "Model retraining in progress" },
                { label: "Revenue Driver", value: "Carlota Jo — $84K/quarter", color: "text-emerald-400", sub: "Stripe integration active" },
                { label: "Risk Watch", value: "PSEM — unassigned", color: "text-red-400", sub: "$180K revenue at risk" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className={`text-xs font-semibold ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Section delay={0.25}>
          <div className="glass-card rounded-xl p-5 h-full">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-orange-400" /> Risk & Drift</h2>
            <div className="space-y-2.5">
              {[
                { label: "PSEM — stalled, no team", severity: "critical" as Severity },
                { label: "Firestorm — staging >5 days", severity: "high" as Severity },
                { label: "Dreamscape — latency trending up", severity: "high" as Severity },
                { label: "DreamEra — accuracy below target", severity: "medium" as Severity },
                { label: "Lutar — TLS expiring soon", severity: "medium" as Severity },
              ].map((risk, i) => (
                <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg border ${severityConfig[risk.severity].bg} ${severityConfig[risk.severity].border}`}>
                  <span className={`text-[9px] font-bold uppercase ${severityConfig[risk.severity].color}`}>{risk.severity}</span>
                  <p className="text-xs text-foreground">{risk.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section delay={0.3}>
          <div className="glass-card rounded-xl p-5 h-full">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Ownership Map</h2>
            <div className="space-y-2.5">
              {(() => {
                const owners: Record<string, string[]> = {};
                portfolioProjects.forEach(p => {
                  if (!owners[p.owner]) owners[p.owner] = [];
                  owners[p.owner].push(p.name);
                });
                return Object.entries(owners).map(([owner, projs]) => (
                  <div key={owner} className={`p-2.5 rounded-lg border ${owner === "Unassigned" ? "bg-red-500/5 border-red-500/20" : "bg-muted/20 border-border/50"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${owner === "Unassigned" ? "text-red-400" : "text-foreground"}`}>{owner}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{projs.length} project{projs.length > 1 ? "s" : ""}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{projs.join(", ")}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        </Section>

        <Section delay={0.35}>
          <div className="glass-card rounded-xl p-5 h-full">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Cloud className="w-4 h-4 text-purple-400" /> Environment Health</h2>
            <div className="space-y-3">
              {[
                { env: "Production", count: deployed, health: 99.9, lastDeploy: "30 min ago", color: "text-emerald-400" },
                { env: "Staging", count: 1, health: 99.8, lastDeploy: "5 days ago", color: "text-amber-400" },
                { env: "Development", count: 1, health: 0, lastDeploy: "—", color: "text-gray-400" },
              ].map(env => (
                <div key={env.env} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">{env.env}</span>
                    <span className={`text-xs font-mono ${env.color}`}>{env.health > 0 ? `${env.health}%` : "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{env.count} service{env.count !== 1 ? "s" : ""}</span>
                    <span className="text-[10px] text-muted-foreground">Last: {env.lastDeploy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}

function SignalsTab({ signals, filter, setFilter, search, setSearch, onSignalClick }: any) {
  const grouped: Record<string, SignalItem[]> = {};
  signals.forEach((s: SignalItem) => {
    if (!grouped[s.domain]) grouped[s.domain] = [];
    grouped[s.domain].push(s);
  });

  return (
    <>
      <Section className="mb-4">
        <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search signals..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40" />
          </div>
          <select value={filter.severity} onChange={e => setFilter({ ...filter, severity: e.target.value })} className="bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none">
            <option value="all">All Severity</option>
            {(["critical", "high", "medium", "low", "info"] as Severity[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filter.domain} onChange={e => setFilter({ ...filter, domain: e.target.value })} className="bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none">
            <option value="all">All Domains</option>
            {Object.keys(domainConfig).map(d => <option key={d} value={d}>{domainConfig[d as SignalDomain].label}</option>)}
          </select>
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <span className="text-[10px] text-muted-foreground font-mono ml-auto">{signals.length} signals</span>
        </div>
      </Section>

      {Object.entries(grouped).map(([domain, sigs], gi) => {
        const cfg = domainConfig[domain as SignalDomain];
        const Icon = cfg.icon;
        return (
          <Section key={domain} className="mb-4" delay={gi * 0.05}>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span className="text-xs font-semibold">{cfg.label}</span>
                <span className="text-[10px] text-muted-foreground font-mono ml-auto">{sigs.length}</span>
              </div>
              <div className="divide-y divide-border/30">
                {sigs.map((sig: SignalItem) => (
                  <div key={sig.id} onClick={() => onSignalClick(sig)} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition cursor-pointer">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${severityConfig[sig.severity].color} ${severityConfig[sig.severity].bg} ${severityConfig[sig.severity].border}`}>{sig.severity}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{sig.title}</p>
                      <p className="text-[10px] text-muted-foreground">{sig.owner} · {sig.freshness} · {sig.confidence}% confidence</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${sig.status === "active" ? "bg-blue-500/10 text-blue-400" : sig.status === "resolved" ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}`}>{sig.status}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${sig.freshness === "live" ? "bg-emerald-500/10 text-emerald-400" : sig.freshness === "recent" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>{sig.freshness}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          </Section>
        );
      })}
      {signals.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No signals match the current filters.</div>}
    </>
  );
}

function RecommendationsTab({ recommendations, actionStates, onAction }: any) {
  return (
    <>
      <Section className="mb-4">
        <div className="glass-card rounded-xl p-5 glow-blue">
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold">AI-Assisted Recommendations</h2>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">DEMO MODE</span>
          </div>
          <p className="text-xs text-muted-foreground">Prioritized actions ranked by urgency and projected business impact. In production, recommendations are generated by analyzing live signals.</p>
        </div>
      </Section>

      <div className="space-y-4">
        {recommendations.map((rec: Recommendation, i: number) => {
          const atConfig = actionTypeConfig[rec.actionType];
          const state = actionStates[rec.id];
          return (
            <Section key={rec.id} delay={i * 0.06}>
              <div className="glass-card-hover rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm font-mono">#{rec.priority}</div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{rec.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${atConfig.color} ${atConfig.bg}`}>{atConfig.label}</span>
                        <span className="text-[10px] text-muted-foreground">{rec.owner}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{rec.reasoning}</p>
                <div className="p-3 rounded-lg bg-muted/20 border border-border/50 mb-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Projected Impact</p>
                  <p className="text-xs font-medium text-emerald-400">{rec.projectedImpact}</p>
                </div>
                <div className="mb-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Suggested Actions</p>
                  <div className="space-y-1">
                    {rec.suggestedActions.map((a: string, ai: number) => (
                      <div key={ai} className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                        <span className="text-xs text-foreground">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => onAction(rec.id, "execute")} disabled={state === "executing" || state === "done"} className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition flex items-center gap-1.5 ${state === "done" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : state === "executing" ? "bg-muted text-muted-foreground border border-border" : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"}`}>
                    {state === "done" ? <><CheckCircle className="w-3 h-3" /> Marked</> : state === "executing" ? <><RefreshCw className="w-3 h-3 animate-spin" /> Processing...</> : <><Play className="w-3 h-3" /> Execute</>}
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-muted text-muted-foreground border border-border hover:text-foreground transition flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Escalate
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-muted text-muted-foreground border border-border hover:text-foreground transition flex items-center gap-1.5">
                    <Bell className="w-3 h-3" /> Assign
                  </button>
                </div>
              </div>
            </Section>
          );
        })}
      </div>
    </>
  );
}

function ImpactTab({ metrics }: { metrics: ImpactMetric[] }) {
  const catConfig: Record<string, { icon: typeof DollarSign; color: string; label: string }> = {
    cost: { icon: DollarSign, color: "text-emerald-400", label: "Cost" },
    risk: { icon: AlertTriangle, color: "text-red-400", label: "Risk" },
    efficiency: { icon: Zap, color: "text-blue-400", label: "Efficiency" },
    revenue: { icon: TrendingUp, color: "text-emerald-400", label: "Revenue" },
  };

  return (
    <>
      <Section className="mb-4">
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-1"><DollarSign className="w-4 h-4 text-primary" /> Economic Intelligence</h2>
          <p className="text-xs text-muted-foreground">Business impact analysis across the SZL Holdings portfolio. Executive-ready summaries — not raw telemetry.</p>
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((m, i) => {
          const cat = catConfig[m.category];
          const CatIcon = cat.icon;
          const TrendIcon = m.trend === "up" ? TrendingUp : m.trend === "down" ? TrendingDown : Minus;
          return (
            <Section key={m.id} delay={i * 0.05}>
              <div className="glass-card-hover rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${cat.color === "text-emerald-400" ? "bg-emerald-500/10" : cat.color === "text-red-400" ? "bg-red-500/10" : "bg-blue-500/10"} flex items-center justify-center`}>
                      <CatIcon className={`w-4 h-4 ${cat.color}`} />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{cat.label}</span>
                      <h3 className="text-sm font-semibold">{m.title}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold font-mono ${m.category === "risk" ? "text-red-400" : "text-emerald-400"}`}>{m.value}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <TrendIcon className={`w-3 h-3 ${m.trend === "up" ? m.category === "risk" ? "text-red-400" : "text-emerald-400" : m.trend === "down" ? "text-emerald-400" : "text-gray-400"}`} />
                      <span className="text-[10px] text-muted-foreground">{m.trend}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{m.narrative}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {m.relatedProjects.map((p: string) => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">{p}</span>
                  ))}
                </div>
              </div>
            </Section>
          );
        })}
      </div>
    </>
  );
}

function PortfolioTab({ projects, sort, setSort, filter, setFilter, onProjectClick }: any) {
  const toggleSort = (field: string) => {
    if (sort.field === field) setSort({ field, dir: sort.dir === "asc" ? "desc" : "asc" });
    else setSort({ field, dir: "desc" });
  };
  const SortIcon = sort.dir === "desc" ? SortDesc : SortAsc;

  return (
    <>
      <Section className="mb-4">
        <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none">
            <option value="all">All Projects</option>
            <option value="deployed">Deployed</option>
            <option value="staging">Staging</option>
            <option value="not-started">Not Started</option>
            <option value="attention">Needs Attention</option>
          </select>
          <div className="flex items-center gap-1 ml-auto">
            {["name", "readiness", "blockers", "status"].map(f => (
              <button key={f} onClick={() => toggleSort(f)} className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded transition ${sort.field === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {f} {sort.field === f && <SortIcon className="w-3 h-3 inline" />}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">{projects.length} shown</span>
        </div>
      </Section>

      <Section delay={0.05}>
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-[1fr_60px_80px_60px_60px_80px_60px_100px] gap-3 px-4 py-2.5 border-b border-border/50 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            <span>Project</span><span className="text-center">Score</span><span className="text-center">Status</span><span className="text-center">DNS</span><span className="text-center">TLS</span><span className="text-center">Blockers</span><span className="text-center">Attn</span><span>Next Action</span>
          </div>
          {projects.map((p: PortfolioProject, i: number) => {
            const statusColors: Record<string, string> = { deployed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", staging: "text-amber-400 bg-amber-500/10 border-amber-500/20", development: "text-blue-400 bg-blue-500/10 border-blue-500/20", "not-started": "text-gray-400 bg-gray-500/10 border-gray-500/20" };
            const attnColors: Record<string, string> = { none: "", watch: "text-amber-400", action: "text-orange-400", critical: "text-red-400" };
            return (
              <motion.div key={p.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} onClick={() => onProjectClick(p)} className="grid grid-cols-1 lg:grid-cols-[1fr_60px_80px_60px_60px_80px_60px_100px] gap-3 px-4 py-3 border-b border-border/30 hover:bg-muted/20 transition cursor-pointer items-center">
                <div className="flex items-center gap-3">
                  <ProgressRing score={p.readiness} size={36} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{p.name}</span>
                      {p.route !== "#" && <a href={p.route} onClick={e => e.stopPropagation()} className="text-muted-foreground hover:text-primary"><SquareArrowOutUpRight className="w-3 h-3" /></a>}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{p.category} · {p.owner}</p>
                  </div>
                </div>
                <div className="text-center hidden lg:block"><span className={`text-xs font-bold font-mono ${getReadinessColor(p.readiness)}`}>{p.readiness}%</span></div>
                <div className="text-center hidden lg:block"><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${statusColors[p.status]}`}>{p.status === "not-started" ? "N/A" : p.status}</span></div>
                <div className="text-center hidden lg:block"><span className={p.dns ? "text-emerald-400" : "text-red-400"}>{p.dns ? "✓" : "✗"}</span></div>
                <div className="text-center hidden lg:block"><span className={p.tls ? "text-emerald-400" : "text-red-400"}>{p.tls ? "✓" : "✗"}</span></div>
                <div className="text-center hidden lg:block"><span className={p.blockers > 0 ? "text-red-400 font-bold" : "text-emerald-400"}>{p.blockers}</span></div>
                <div className="text-center hidden lg:block">{p.attentionLevel !== "none" && <span className={`text-[9px] font-bold ${attnColors[p.attentionLevel]}`}>{p.attentionLevel.toUpperCase()}</span>}</div>
                <div className="hidden lg:block"><span className="text-[10px] text-muted-foreground truncate">{p.nextAction}</span></div>
              </motion.div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

function IntegrationsTab({ integrations }: { integrations: IntegrationStatus[] }) {
  const statusColors: Record<string, { color: string; bg: string; dot: string }> = {
    connected: { color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
    degraded: { color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
    disconnected: { color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400" },
  };

  return (
    <>
      <Section className="mb-4">
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-1"><Link2 className="w-4 h-4 text-primary" /> Integration Adapters</h2>
          <p className="text-xs text-muted-foreground">Service adapter connection states, sync freshness, and operational mode.</p>
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((int: IntegrationStatus, i: number) => {
          const sc = statusColors[int.status];
          return (
            <Section key={int.id} delay={i * 0.05}>
              <div className="glass-card-hover rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${sc.dot} ${int.status === "connected" ? "animate-pulse-slow" : ""}`} />
                    <h3 className="text-sm font-semibold">{int.name}</h3>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sc.color} ${sc.bg}`}>{int.status}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Adapter</span>
                    <span className="text-[10px] text-foreground font-mono">{int.adapter}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Mode</span>
                    <span className="text-[10px] text-amber-400 font-mono">{int.mode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Last Sync</span>
                    <span className="text-[10px] text-foreground font-mono">{int.lastSync}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Freshness</span>
                    <span className={`text-[10px] font-mono ${int.freshness === "fresh" ? "text-emerald-400" : int.freshness === "stale" ? "text-amber-400" : "text-red-400"}`}>{int.freshness}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border/30">{int.details}</p>
              </div>
            </Section>
          );
        })}
      </div>
    </>
  );
}

function SettingsTab({ integrations }: { integrations: IntegrationStatus[] }) {
  return (
    <>
      <Section className="mb-4">
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-1"><Settings className="w-4 h-4 text-primary" /> Settings & Admin</h2>
          <p className="text-xs text-muted-foreground">Environment status, AI mode, integration overview, and system health.</p>
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section delay={0.05}>
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">System Status</h3>
            <div className="space-y-3">
              {[
                { label: "API Server", value: "Healthy", ok: true },
                { label: "Database (PostgreSQL)", value: "Connected", ok: true },
                { label: "Build Pipeline", value: "All passing", ok: true },
                { label: "AI Insight Engine", value: "Demo mode", ok: false },
                { label: "Error Rate (24h)", value: "0.02%", ok: true },
                { label: "Uptime (30d)", value: "99.94%", ok: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-semibold ${item.ok ? "text-emerald-400" : "text-amber-400"}`}>{item.value}</span>
                    {item.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section delay={0.1}>
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Environment</h3>
            <div className="space-y-3">
              {[
                { label: "Mode", value: "Demo (synthetic data)" },
                { label: "AI Provider", value: "Not configured" },
                { label: "Region", value: "US East" },
                { label: "Node.js", value: "v20.x" },
                { label: "Framework", value: "React 19 + Vite 7" },
                { label: "Total Frontend Artifacts", value: "17" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-mono text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section className="md:col-span-2" delay={0.15}>
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Integration Adapter Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {integrations.map((int: IntegrationStatus) => (
                <div key={int.id} className="p-3 rounded-lg bg-muted/20 border border-border/50 text-center">
                  <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${int.status === "connected" ? "bg-emerald-400" : int.status === "degraded" ? "bg-amber-400" : "bg-red-400"}`} />
                  <p className="text-[10px] font-semibold text-foreground">{int.name}</p>
                  <p className="text-[9px] text-muted-foreground">{int.status}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}

function SignalDrawer({ signal, onClose }: { signal: SignalItem; onClose: () => void }) {
  const cfg = domainConfig[signal.domain];
  const DomainIcon = cfg.icon;
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l border-border z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold">Signal Detail</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition"><X className="w-4 h-4" /></button>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase ${severityConfig[signal.severity].color} ${severityConfig[signal.severity].bg} border ${severityConfig[signal.severity].border} mb-4`}>
            {signal.severity}
          </div>
          <h3 className="text-lg font-semibold mb-2">{signal.title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{signal.description}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Domain", value: cfg.label },
              { label: "Source", value: signal.source },
              { label: "Status", value: signal.status },
              { label: "Confidence", value: `${signal.confidence}%` },
              { label: "Freshness", value: signal.freshness },
              { label: "Owner", value: signal.owner },
            ].map(f => (
              <div key={f.label} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{f.label}</p>
                <p className="text-xs font-semibold">{f.value}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10 mb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Business Impact</p>
            <p className="text-sm text-red-400">{signal.businessImpact}</p>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 mb-6">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Recommended Action</p>
            <p className="text-sm text-blue-400">{signal.recommendedAction}</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
            </button>
            <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-muted text-muted-foreground border border-border hover:text-foreground transition flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Escalate
            </button>
            <button className="px-4 py-2 rounded-lg text-xs font-semibold bg-muted text-muted-foreground border border-border hover:text-foreground transition flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Assign
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function ProjectDrawer({ project, signals, onClose }: { project: PortfolioProject; signals: SignalItem[]; onClose: () => void }) {
  const relatedSignals = signals.filter((s: SignalItem) => s.title.toLowerCase().includes(project.name.toLowerCase()));
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l border-border z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold">Project Detail</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <ProgressRing score={project.readiness} size={64} />
            <div>
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-xs text-muted-foreground">{project.category} · {project.owner}</p>
              {project.route !== "#" && <a href={project.route} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">Open App <ArrowUpRight className="w-3 h-3" /></a>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Status", value: project.status },
              { label: "Environment", value: project.environment },
              { label: "Uptime", value: project.uptime > 0 ? `${project.uptime}%` : "N/A" },
              { label: "Last Deploy", value: project.lastDeploy },
              { label: "DNS", value: project.dns ? "Verified" : "Not configured" },
              { label: "TLS", value: project.tls ? "Valid" : "None" },
              { label: "Blockers", value: `${project.blockers}` },
              { label: "Attention", value: project.attentionLevel },
            ].map(f => (
              <div key={f.label} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{f.label}</p>
                <p className="text-xs font-semibold">{f.value}</p>
              </div>
            ))}
          </div>

          {project.nextAction !== "—" && (
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 mb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Next Action</p>
              <p className="text-sm text-blue-400">{project.nextAction}</p>
            </div>
          )}

          {relatedSignals.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Related Signals</p>
              <div className="space-y-2">
                {relatedSignals.map((s: SignalItem) => (
                  <div key={s.id} className={`p-3 rounded-lg border ${severityConfig[s.severity].bg} ${severityConfig[s.severity].border}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-bold uppercase ${severityConfig[s.severity].color}`}>{s.severity}</span>
                      <span className="text-[10px] text-muted-foreground">{s.source}</span>
                    </div>
                    <p className="text-xs text-foreground">{s.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
