import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  CheckCircle, AlertTriangle, XCircle, Clock, Shield, Globe,
  Lock, Server, Activity, BarChart3, ArrowUpRight, RefreshCw,
  Wifi, Database, Cpu, Cloud, Filter, SortAsc, SortDesc,
  ChevronDown, ChevronRight, Printer, AlertCircle, Users,
  Target, Milestone, FileWarning, Zap, ArrowUp, X, Layers
} from "lucide-react";

type ProjectStatus = "deployed" | "staging" | "development" | "not-started";
type DnsStatus = "verified" | "pending" | "not-configured";
type TlsStatus = "valid" | "expiring" | "invalid" | "none";
type Severity = "critical" | "high" | "medium" | "low";

interface CategoryScore {
  name: string;
  score: number;
  weight: number;
}

interface MilestoneItem {
  name: string;
  status: "completed" | "in-progress" | "upcoming";
}

interface Blocker {
  title: string;
  severity: Severity;
  owner: string;
}

interface Project {
  name: string;
  route: string;
  readiness: number;
  status: ProjectStatus;
  dns: DnsStatus;
  tls: TlsStatus;
  tlsExpiry?: string;
  domain: string;
  lastDeploy: string;
  uptime: number;
  responseTime: number;
  category: string;
  owner: string;
  categories: CategoryScore[];
  milestones: MilestoneItem[];
  blockers: Blocker[];
  recommendations: string[];
}

const projects: Project[] = [
  {
    name: "ROSIE", route: "/", readiness: 96, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-11-15", domain: "szlholdings.com", lastDeploy: "2 hours ago", uptime: 99.97, responseTime: 142, category: "Security", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 98, weight: 25 }, { name: "Backend", score: 95, weight: 30 }, { name: "Infrastructure", score: 96, weight: 20 }, { name: "Security", score: 97, weight: 15 }, { name: "Integrations", score: 92, weight: 10 }],
    milestones: [{ name: "Core UI", status: "completed" }, { name: "Threat Engine", status: "completed" }, { name: "Alloy AI Integration", status: "completed" }, { name: "Production Deploy", status: "completed" }, { name: "Load Testing", status: "in-progress" }],
    blockers: [],
    recommendations: [],
  },
  {
    name: "Aegis", route: "/aegis/", readiness: 88, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-10-22", domain: "szlholdings.com/aegis", lastDeploy: "1 day ago", uptime: 99.95, responseTime: 156, category: "Security", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 92, weight: 25 }, { name: "Backend", score: 85, weight: 30 }, { name: "Infrastructure", score: 90, weight: 20 }, { name: "Security", score: 88, weight: 15 }, { name: "Integrations", score: 82, weight: 10 }],
    milestones: [{ name: "Threat Dashboard", status: "completed" }, { name: "Vuln Scanner", status: "completed" }, { name: "Compliance Module", status: "in-progress" }, { name: "Reporting Suite", status: "upcoming" }],
    blockers: [{ title: "Compliance module API rate limiting", severity: "medium", owner: "DevOps" }],
    recommendations: ["Complete compliance module integration", "Add API rate limit handling"],
  },
  {
    name: "Beacon", route: "/beacon/", readiness: 92, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-12-01", domain: "szlholdings.com/beacon", lastDeploy: "6 hours ago", uptime: 99.98, responseTime: 128, category: "Analytics", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 95, weight: 25 }, { name: "Backend", score: 90, weight: 30 }, { name: "Infrastructure", score: 93, weight: 20 }, { name: "Security", score: 91, weight: 15 }, { name: "Integrations", score: 88, weight: 10 }],
    milestones: [{ name: "KPI Dashboard", status: "completed" }, { name: "Project Tracking", status: "completed" }, { name: "Analytics Engine", status: "completed" }, { name: "Export Module", status: "in-progress" }],
    blockers: [],
    recommendations: ["Finalize PDF export functionality"],
  },
  {
    name: "Lutar", route: "/lutar/", readiness: 85, status: "deployed", dns: "verified", tls: "expiring", tlsExpiry: "2026-04-28", domain: "szlholdings.com/lutar", lastDeploy: "3 days ago", uptime: 99.91, responseTime: 167, category: "Command", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 88, weight: 25 }, { name: "Backend", score: 82, weight: 30 }, { name: "Infrastructure", score: 86, weight: 20 }, { name: "Security", score: 84, weight: 15 }, { name: "Integrations", score: 80, weight: 10 }],
    milestones: [{ name: "Command Dashboard", status: "completed" }, { name: "Portfolio View", status: "completed" }, { name: "Sustainability Module", status: "in-progress" }, { name: "Mobile Optimization", status: "upcoming" }],
    blockers: [{ title: "TLS certificate expiring in 6 months", severity: "low", owner: "Infrastructure" }],
    recommendations: ["Schedule TLS certificate renewal", "Complete sustainability module"],
  },
  {
    name: "Nimbus", route: "/nimbus/", readiness: 91, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-11-30", domain: "szlholdings.com/nimbus", lastDeploy: "12 hours ago", uptime: 99.96, responseTime: 134, category: "AI", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 93, weight: 25 }, { name: "Backend", score: 90, weight: 30 }, { name: "Infrastructure", score: 91, weight: 20 }, { name: "Security", score: 89, weight: 15 }, { name: "Integrations", score: 90, weight: 10 }],
    milestones: [{ name: "Prediction Engine", status: "completed" }, { name: "Alert System", status: "completed" }, { name: "Anomaly Detection", status: "completed" }, { name: "Model Retraining Pipeline", status: "in-progress" }],
    blockers: [],
    recommendations: ["Complete model retraining automation"],
  },
  {
    name: "Firestorm", route: "/firestorm/", readiness: 78, status: "staging", dns: "verified", tls: "valid", tlsExpiry: "2026-08-10", domain: "szlholdings.com/firestorm", lastDeploy: "5 days ago", uptime: 99.82, responseTime: 203, category: "Security", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 82, weight: 25 }, { name: "Backend", score: 75, weight: 30 }, { name: "Infrastructure", score: 78, weight: 20 }, { name: "Security", score: 80, weight: 15 }, { name: "Integrations", score: 70, weight: 10 }],
    milestones: [{ name: "Simulation Engine", status: "completed" }, { name: "Scenario Builder", status: "completed" }, { name: "Real-time Playback", status: "in-progress" }, { name: "Reporting", status: "upcoming" }, { name: "Production Deploy", status: "upcoming" }],
    blockers: [{ title: "Response time exceeds 200ms threshold", severity: "high", owner: "Backend" }, { title: "Integration tests incomplete", severity: "medium", owner: "QA" }],
    recommendations: ["Optimize API response times below 200ms", "Complete integration test suite", "Promote from staging to production"],
  },
  {
    name: "DreamEra", route: "/dreamera/", readiness: 82, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-10-05", domain: "szlholdings.com/dreamera", lastDeploy: "1 day ago", uptime: 99.89, responseTime: 178, category: "AI", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 86, weight: 25 }, { name: "Backend", score: 80, weight: 30 }, { name: "Infrastructure", score: 82, weight: 20 }, { name: "Security", score: 81, weight: 15 }, { name: "Integrations", score: 78, weight: 10 }],
    milestones: [{ name: "Story Engine", status: "completed" }, { name: "Artifact Mapper", status: "completed" }, { name: "Neural Synthesis", status: "in-progress" }, { name: "Export Pipeline", status: "upcoming" }],
    blockers: [{ title: "Neural synthesis model accuracy below target", severity: "high", owner: "ML Team" }],
    recommendations: ["Improve neural synthesis model accuracy to >90%", "Build artifact export pipeline"],
  },
  {
    name: "Zeus", route: "/zeus/", readiness: 94, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2027-01-15", domain: "szlholdings.com/zeus", lastDeploy: "4 hours ago", uptime: 99.99, responseTime: 98, category: "Infrastructure", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 95, weight: 25 }, { name: "Backend", score: 94, weight: 30 }, { name: "Infrastructure", score: 96, weight: 20 }, { name: "Security", score: 93, weight: 15 }, { name: "Integrations", score: 90, weight: 10 }],
    milestones: [{ name: "Module Registry", status: "completed" }, { name: "Health Monitoring", status: "completed" }, { name: "Auto-scaling", status: "completed" }, { name: "Chaos Engineering", status: "in-progress" }],
    blockers: [],
    recommendations: ["Complete chaos engineering test suite"],
  },
  {
    name: "AlloyScape", route: "/alloy/", readiness: 89, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-11-20", domain: "szlholdings.com/alloy", lastDeploy: "8 hours ago", uptime: 99.93, responseTime: 145, category: "Infrastructure", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 91, weight: 25 }, { name: "Backend", score: 88, weight: 30 }, { name: "Infrastructure", score: 90, weight: 20 }, { name: "Security", score: 87, weight: 15 }, { name: "Integrations", score: 86, weight: 10 }],
    milestones: [{ name: "Orchestration UI", status: "completed" }, { name: "Connector Manager", status: "completed" }, { name: "Workflow Templates", status: "in-progress" }, { name: "Advanced Analytics", status: "upcoming" }],
    blockers: [],
    recommendations: ["Complete workflow template library"],
  },
  {
    name: "Apps Showcase", route: "/apps-showcase/", readiness: 90, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-12-10", domain: "szlholdings.com/apps-showcase", lastDeploy: "8 hours ago", uptime: 99.94, responseTime: 112, category: "Marketing", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 94, weight: 25 }, { name: "Backend", score: 86, weight: 30 }, { name: "Infrastructure", score: 90, weight: 20 }, { name: "Security", score: 88, weight: 15 }, { name: "Integrations", score: 85, weight: 10 }],
    milestones: [{ name: "App Catalog", status: "completed" }, { name: "Feature Highlights", status: "completed" }, { name: "Demo Videos", status: "upcoming" }, { name: "Interactive Tours", status: "upcoming" }],
    blockers: [],
    recommendations: ["Add demo video content", "Build interactive product tours"],
  },
  {
    name: "Vessels", route: "/vessels/", readiness: 86, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-11-28", domain: "szlholdings.com/vessels", lastDeploy: "3 hours ago", uptime: 99.90, responseTime: 155, category: "Logistics", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 90, weight: 25 }, { name: "Backend", score: 84, weight: 30 }, { name: "Infrastructure", score: 86, weight: 20 }, { name: "Security", score: 85, weight: 15 }, { name: "Integrations", score: 82, weight: 10 }],
    milestones: [{ name: "Fleet Dashboard", status: "completed" }, { name: "Route Optimizer", status: "completed" }, { name: "Compliance Tracker", status: "in-progress" }, { name: "Predictive Analytics", status: "upcoming" }],
    blockers: [{ title: "AIS data feed intermittent delays", severity: "medium", owner: "Data Eng" }],
    recommendations: ["Stabilize AIS data feed integration", "Complete compliance tracking module"],
  },
  {
    name: "Carlota Jo", route: "/carlota-jo/", readiness: 84, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-11-05", domain: "szlholdings.com/carlota-jo", lastDeploy: "1 hour ago", uptime: 99.88, responseTime: 118, category: "Consulting", owner: "Carlota B.",
    categories: [{ name: "Frontend", score: 90, weight: 25 }, { name: "Backend", score: 78, weight: 30 }, { name: "Infrastructure", score: 84, weight: 20 }, { name: "Security", score: 82, weight: 15 }, { name: "Integrations", score: 80, weight: 10 }],
    milestones: [{ name: "Branding & Hero", status: "completed" }, { name: "Service Pages", status: "completed" }, { name: "Consultation Flow", status: "completed" }, { name: "Stripe Integration", status: "in-progress" }],
    blockers: [],
    recommendations: ["Complete Stripe payment integration"],
  },
  {
    name: "Dreamscape", route: "/dreamscape/", readiness: 80, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-12-20", domain: "szlholdings.com/dreamscape", lastDeploy: "30 min ago", uptime: 99.80, responseTime: 165, category: "Creative", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 85, weight: 25 }, { name: "Backend", score: 76, weight: 30 }, { name: "Infrastructure", score: 80, weight: 20 }, { name: "Security", score: 78, weight: 15 }, { name: "Integrations", score: 75, weight: 10 }],
    milestones: [{ name: "World Explorer", status: "completed" }, { name: "Artifact Gallery", status: "completed" }, { name: "Prompt Studio", status: "completed" }, { name: "AI Generation Pipeline", status: "in-progress" }, { name: "Collaboration Features", status: "upcoming" }],
    blockers: [{ title: "AI generation pipeline latency >5s", severity: "high", owner: "ML Team" }],
    recommendations: ["Optimize AI generation pipeline latency", "Build real-time collaboration"],
  },
  {
    name: "PSEM", route: "#", readiness: 25, status: "not-started", dns: "not-configured", tls: "none", domain: "—", lastDeploy: "—", uptime: 0, responseTime: 0, category: "Security", owner: "Unassigned",
    categories: [{ name: "Frontend", score: 15, weight: 25 }, { name: "Backend", score: 10, weight: 30 }, { name: "Infrastructure", score: 30, weight: 20 }, { name: "Security", score: 40, weight: 15 }, { name: "Integrations", score: 20, weight: 10 }],
    milestones: [{ name: "Requirements Gathering", status: "in-progress" }, { name: "Architecture Design", status: "upcoming" }, { name: "MVP Build", status: "upcoming" }, { name: "Testing", status: "upcoming" }],
    blockers: [{ title: "No assigned development team", severity: "critical", owner: "Management" }, { title: "Requirements specification incomplete", severity: "critical", owner: "Product" }],
    recommendations: ["Assign development team", "Complete requirements specification", "Configure DNS records", "Set up TLS certificates"],
  },
  {
    name: "Readiness Report", route: "/readiness-report/", readiness: 87, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-12-15", domain: "szlholdings.com/readiness-report", lastDeploy: "Just now", uptime: 99.90, responseTime: 105, category: "Operations", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 90, weight: 25 }, { name: "Backend", score: 84, weight: 30 }, { name: "Infrastructure", score: 88, weight: 20 }, { name: "Security", score: 86, weight: 15 }, { name: "Integrations", score: 82, weight: 10 }],
    milestones: [{ name: "Dashboard Layout", status: "completed" }, { name: "Score Visualization", status: "completed" }, { name: "Export Feature", status: "completed" }, { name: "Advanced Filtering", status: "completed" }],
    blockers: [],
    recommendations: [],
  },
  {
    name: "Career", route: "/career/", readiness: 83, status: "deployed", dns: "verified", tls: "valid", tlsExpiry: "2026-11-01", domain: "szlholdings.com/career", lastDeploy: "1 hour ago", uptime: 99.85, responseTime: 130, category: "Branding", owner: "Stephen L.",
    categories: [{ name: "Frontend", score: 88, weight: 25 }, { name: "Backend", score: 78, weight: 30 }, { name: "Infrastructure", score: 84, weight: 20 }, { name: "Security", score: 82, weight: 15 }, { name: "Integrations", score: 76, weight: 10 }],
    milestones: [{ name: "Hero & Bio", status: "completed" }, { name: "Timeline", status: "completed" }, { name: "Case Studies", status: "completed" }, { name: "Contact Flow", status: "completed" }, { name: "SEO Optimization", status: "completed" }],
    blockers: [],
    recommendations: [],
  },
];

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  deployed: { label: "Deployed", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  staging: { label: "Staging", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
  development: { label: "Development", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: RefreshCw },
  "not-started": { label: "Not Started", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20", icon: Clock },
};

const severityConfig: Record<Severity, { color: string; bg: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  low: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
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

function ProgressRing({ score, size = 56 }: { score: number; size?: number }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getReadinessRingColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(220 15% 12%)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold font-mono ${getReadinessColor(score)}`}>
        {score}
      </span>
    </div>
  );
}

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }} className={className}>
      {children}
    </motion.div>
  );
}

type SortField = "name" | "readiness" | "status" | "owner" | "lastDeploy";
type SortDir = "asc" | "desc";

export default function Home() {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");
  const [filterBand, setFilterBand] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("readiness");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [printMode, setPrintMode] = useState(false);

  const allCategories = Array.from(new Set(projects.map(p => p.category)));
  const allOwners = Array.from(new Set(projects.map(p => p.owner)));

  let filtered = projects.filter(p => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    if (filterOwner !== "all" && p.owner !== filterOwner) return false;
    if (filterBand === "90+") return p.readiness >= 90;
    if (filterBand === "70-89") return p.readiness >= 70 && p.readiness < 90;
    if (filterBand === "<70") return p.readiness < 70;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === "name") cmp = a.name.localeCompare(b.name);
    else if (sortField === "readiness") cmp = a.readiness - b.readiness;
    else if (sortField === "status") cmp = a.status.localeCompare(b.status);
    else if (sortField === "owner") cmp = a.owner.localeCompare(b.owner);
    else if (sortField === "lastDeploy") cmp = a.lastDeploy.localeCompare(b.lastDeploy);
    return sortDir === "desc" ? -cmp : cmp;
  });

  const avgReadiness = Math.round(projects.reduce((s, p) => s + p.readiness, 0) / projects.length);
  const deployed = projects.filter(p => p.status === "deployed").length;
  const criticalBlockers = projects.reduce((s, p) => s + p.blockers.filter(b => b.severity === "critical").length, 0);
  const deploymentCoverage = Math.round((deployed / projects.length) * 100);
  const atRisk = projects.filter(p => p.readiness < 70 || p.blockers.some(b => b.severity === "critical")).length;

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = sortDir === "desc" ? SortDesc : SortAsc;

  if (printMode) {
    return (
      <div className="min-h-screen bg-background p-8 print:p-4">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center justify-between mb-8 print:mb-4">
            <div>
              <h1 className="text-2xl font-bold">SZL Holdings — Project Readiness Report</h1>
              <p className="text-sm text-muted-foreground mt-1">Generated {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <button onClick={() => { window.print(); }} className="print:hidden px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
          <button onClick={() => setPrintMode(false)} className="print:hidden mb-6 text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1">
            <X className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="grid grid-cols-5 gap-4 mb-8 print:mb-4">
            {[
              { label: "Total Projects", value: projects.length },
              { label: "Avg Readiness", value: `${avgReadiness}%` },
              { label: "Critical Blockers", value: criticalBlockers },
              { label: "Deploy Coverage", value: `${deploymentCoverage}%` },
              { label: "At Risk", value: atRisk },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-lg border border-border bg-card text-center">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-lg font-bold font-mono">{s.value}</p>
              </div>
            ))}
          </div>

          {projects.map(project => (
            <div key={project.name} className="mb-6 p-4 rounded-lg border border-border bg-card print:break-inside-avoid">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold">{project.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig[project.status].bg} ${statusConfig[project.status].color}`}>{statusConfig[project.status].label}</span>
                </div>
                <span className={`text-lg font-bold font-mono ${getReadinessColor(project.readiness)}`}>{project.readiness}%</span>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {project.categories.map(c => (
                  <div key={c.name} className="text-center">
                    <p className="text-[10px] text-muted-foreground">{c.name} ({c.weight}%)</p>
                    <p className={`text-sm font-bold font-mono ${getReadinessColor(c.score)}`}>{c.score}</p>
                  </div>
                ))}
              </div>
              {project.blockers.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-red-400 mb-1">Blockers:</p>
                  {project.blockers.map((b, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• [{b.severity.toUpperCase()}] {b.title} — {b.owner}</p>
                  ))}
                </div>
              )}
              {project.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-blue-400 mb-1">Recommendations:</p>
                  {project.recommendations.map((r, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {r}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-wide">SZL HOLDINGS</span>
              <span className="text-muted-foreground text-xs ml-2">Readiness Report</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono hidden sm:inline">Last updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <button onClick={() => setPrintMode(true)} className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Generate Report
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <AnimatedSection className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Project Readiness Overview</h1>
          <p className="text-sm text-muted-foreground">Executive operating review — portfolio-wide deployment status, readiness, and risk monitoring.</p>
        </AnimatedSection>

        <AnimatedSection className="mb-8" delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Projects", value: `${projects.length}`, icon: Layers, sub: "in portfolio", color: "text-blue-400" },
              { label: "Avg Readiness", value: `${avgReadiness}%`, icon: BarChart3, sub: "weighted score", color: getReadinessColor(avgReadiness) },
              { label: "Critical Blockers", value: `${criticalBlockers}`, icon: AlertCircle, sub: criticalBlockers > 0 ? "action required" : "none", color: criticalBlockers > 0 ? "text-red-400" : "text-emerald-400" },
              { label: "Deploy Coverage", value: `${deploymentCoverage}%`, icon: Server, sub: `${deployed}/${projects.length} deployed`, color: deploymentCoverage >= 80 ? "text-emerald-400" : "text-amber-400" },
              { label: "At Risk", value: `${atRisk}`, icon: FileWarning, sub: atRisk > 0 ? "projects flagged" : "all clear", color: atRisk > 0 ? "text-orange-400" : "text-emerald-400" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className="p-5 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className={`text-2xl font-bold ${stat.color} font-mono`}>{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mb-6" delay={0.2}>
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/40">
              <option value="all">All Statuses</option>
              <option value="deployed">Deployed</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
              <option value="not-started">Not Started</option>
            </select>
            <select value={filterBand} onChange={e => setFilterBand(e.target.value)} className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/40">
              <option value="all">All Readiness</option>
              <option value="90+">90%+ (Strong)</option>
              <option value="70-89">70-89% (Moderate)</option>
              <option value="<70">&lt;70% (At Risk)</option>
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/40">
              <option value="all">All Categories</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/40">
              <option value="all">All Owners</option>
              {allOwners.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <span className="text-[11px] text-muted-foreground ml-auto font-mono">{filtered.length} of {projects.length} shown</span>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mb-8" delay={0.25}>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">All Projects</h2>
              <div className="flex items-center gap-2">
                {(["name", "readiness", "status", "owner", "lastDeploy"] as SortField[]).map(f => (
                  <button key={f} onClick={() => toggleSort(f)} className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded transition ${sortField === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    {f === "lastDeploy" ? "last deploy" : f} {sortField === f && <SortIcon className="w-3 h-3 inline" />}
                  </button>
                ))}
              </div>
            </div>

            {filtered.map((project, i) => {
              const status = statusConfig[project.status];
              const StatusIcon = status.icon;
              const isExpanded = expandedProject === project.name;
              const completedMilestones = project.milestones.filter(m => m.status === "completed").length;
              const milestoneProgress = Math.round((completedMilestones / project.milestones.length) * 100);

              return (
                <motion.div key={project.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <div
                    className="flex items-center gap-4 px-5 py-4 border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setExpandedProject(isExpanded ? null : project.name)}
                  >
                    <button className="text-muted-foreground">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <ProgressRing score={project.readiness} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <a href={project.route} onClick={e => e.stopPropagation()} className="text-sm font-semibold text-foreground hover:text-primary transition flex items-center gap-1">
                          {project.name}
                          {project.route !== "#" && <ArrowUpRight className="w-3 h-3 opacity-40" />}
                        </a>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        {project.blockers.some(b => b.severity === "critical") && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">CRITICAL</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">{project.domain} · {project.category} · {project.owner}</p>
                    </div>

                    <div className="hidden md:flex items-center gap-6 text-xs">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">DNS</p>
                        <span className={project.dns === "verified" ? "text-emerald-400" : project.dns === "pending" ? "text-amber-400" : "text-gray-500"}>
                          {project.dns === "verified" ? "✓" : project.dns === "pending" ? "⏳" : "✗"}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">TLS</p>
                        <span className={project.tls === "valid" ? "text-emerald-400" : project.tls === "expiring" ? "text-amber-400" : project.tls === "none" ? "text-gray-500" : "text-red-400"}>
                          {project.tls === "valid" ? "✓" : project.tls === "expiring" ? "⚠" : "✗"}
                        </span>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Milestones</p>
                        <span className="text-muted-foreground font-mono">{completedMilestones}/{project.milestones.length}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Blockers</p>
                        <span className={project.blockers.length > 0 ? "text-red-400 font-bold" : "text-emerald-400"}>{project.blockers.length}</span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-b border-border/50 bg-muted/10 px-5 py-5">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5" /> Weighted Scoring
                          </h4>
                          <div className="space-y-2.5">
                            {project.categories.map(cat => (
                              <div key={cat.name}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] text-muted-foreground">{cat.name} <span className="text-muted-foreground/50">({cat.weight}%)</span></span>
                                  <span className={`text-[11px] font-bold font-mono ${getReadinessColor(cat.score)}`}>{cat.score}</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-muted">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: getReadinessRingColor(cat.score) }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${cat.score}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="p-2.5 rounded-lg bg-card border border-border/50">
                              <p className="text-[10px] text-muted-foreground mb-0.5">DNS</p>
                              <p className={`text-xs font-semibold ${project.dns === "verified" ? "text-emerald-400" : project.dns === "pending" ? "text-amber-400" : "text-gray-500"}`}>
                                {project.dns === "verified" ? "Verified" : project.dns === "pending" ? "Pending" : "Not Configured"}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-card border border-border/50">
                              <p className="text-[10px] text-muted-foreground mb-0.5">TLS</p>
                              <p className={`text-xs font-semibold ${project.tls === "valid" ? "text-emerald-400" : project.tls === "expiring" ? "text-amber-400" : "text-gray-500"}`}>
                                {project.tls === "valid" ? `Valid${project.tlsExpiry ? ` (exp ${project.tlsExpiry})` : ""}` : project.tls === "expiring" ? "Expiring Soon" : project.tls === "none" ? "None" : "Invalid"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Milestone className="w-3.5 h-3.5" /> Milestones ({milestoneProgress}%)
                          </h4>
                          <div className="w-full h-2 rounded-full bg-muted mb-3">
                            <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${milestoneProgress}%` }} transition={{ duration: 0.8 }} />
                          </div>
                          <div className="space-y-2">
                            {project.milestones.map((m, mi) => (
                              <div key={mi} className="flex items-center gap-2">
                                {m.status === "completed" ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : m.status === "in-progress" ? (
                                  <RefreshCw className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-spin" style={{ animationDuration: "3s" }} />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                                )}
                                <span className={`text-xs ${m.status === "completed" ? "text-foreground" : m.status === "in-progress" ? "text-blue-400" : "text-muted-foreground"}`}>{m.name}</span>
                              </div>
                            ))}
                          </div>
                          {project.uptime > 0 && (
                            <div className="mt-4 p-2.5 rounded-lg bg-card border border-border/50 flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground">Uptime / Response</span>
                              <span className="text-xs font-mono">
                                <span className={project.uptime >= 99.9 ? "text-emerald-400" : "text-amber-400"}>{project.uptime}%</span>
                                <span className="text-muted-foreground mx-1">/</span>
                                <span className={project.responseTime <= 150 ? "text-emerald-400" : project.responseTime <= 200 ? "text-amber-400" : "text-red-400"}>{project.responseTime}ms</span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          {project.blockers.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Blockers & Risks
                              </h4>
                              <div className="space-y-2">
                                {project.blockers.map((b, bi) => (
                                  <div key={bi} className={`p-2.5 rounded-lg border ${severityConfig[b.severity].bg}`}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`text-[10px] font-bold uppercase ${severityConfig[b.severity].color}`}>{b.severity}</span>
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {b.owner}</span>
                                    </div>
                                    <p className="text-xs text-foreground">{b.title}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {project.recommendations.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-blue-400" /> Recommendations
                              </h4>
                              <div className="space-y-1.5">
                                {project.recommendations.map((r, ri) => (
                                  <div key={ri} className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                    <ArrowUp className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-foreground">{r}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {project.blockers.length === 0 && project.recommendations.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                              <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                              <p className="text-xs text-emerald-400 font-semibold">No blockers or issues</p>
                              <p className="text-[11px] text-muted-foreground mt-1">This project is on track</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center text-muted-foreground text-sm">No projects match the current filters.</div>
            )}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mb-8" delay={0.3}>
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Readiness by Category
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {Array.from(new Set(projects.map(p => p.category))).map(cat => {
                const catProjects = projects.filter(p => p.category === cat);
                const avg = Math.round(catProjects.reduce((s, p) => s + p.readiness, 0) / catProjects.length);
                return (
                  <div key={cat} className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
                    <ProgressRing score={avg} size={48} />
                    <p className="text-[11px] text-muted-foreground mt-2 font-medium uppercase tracking-wider">{cat}</p>
                    <p className="text-[10px] text-muted-foreground">{catProjects.length} project{catProjects.length > 1 ? "s" : ""}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <AnimatedSection delay={0.35}>
            <div className="rounded-xl bg-card border border-border p-5 h-full">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Security & Infrastructure
              </h3>
              <div className="space-y-3">
                {[
                  { label: "TLS Certificates Valid", value: `${projects.filter(p => p.tls === "valid").length}/${projects.length}`, ok: true },
                  { label: "DNS Records Verified", value: `${projects.filter(p => p.dns === "verified").length}/${projects.length}`, ok: projects.filter(p => p.dns !== "verified").length <= 1 },
                  { label: "HTTPS Enforced", value: `${projects.filter(p => p.tls !== "none").length}/${projects.length}`, ok: true },
                  { label: "API Server", value: "Healthy", ok: true },
                  { label: "Database (PostgreSQL)", value: "Connected", ok: true },
                  { label: "Build Pipeline", value: "Passing", ok: true },
                  { label: "Error Rate (24h)", value: "0.02%", ok: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-semibold ${item.ok ? "text-emerald-400" : "text-amber-400"}`}>{item.value}</span>
                      {item.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="rounded-xl bg-card border border-border p-5 h-full">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> Deployment Checklist
              </h3>
              <div className="space-y-2.5">
                {[
                  { task: "All frontends building successfully", done: true },
                  { task: "API server health check passing", done: true },
                  { task: "Database migrations applied", done: true },
                  { task: "Environment variables configured", done: true },
                  { task: "TLS certificates valid for all domains", done: projects.filter(p => p.tls === "valid").length >= 14 },
                  { task: "DNS records verified for all platforms", done: false },
                  { task: "Error monitoring configured", done: true },
                  { task: "Performance baselines established", done: true },
                  { task: "Rate limiting configured", done: true },
                  { task: "CORS policies validated", done: true },
                  { task: "Backup strategy implemented", done: true },
                  { task: "Load testing completed", done: false },
                ].map(item => (
                  <div key={item.task} className={`flex items-center gap-3 p-2.5 rounded-lg ${item.done ? "bg-emerald-500/5" : "bg-muted/30"}`}>
                    {item.done ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                    <span className={`text-xs ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.task}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <footer className="border-t border-border py-6 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <span className="text-xs text-muted-foreground">SZL Holdings — Project Readiness Report</span>
          <span className="text-xs text-muted-foreground font-mono">&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
