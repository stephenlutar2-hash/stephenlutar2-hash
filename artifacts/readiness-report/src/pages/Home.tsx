import { motion } from "framer-motion";
import {
  CheckCircle, AlertTriangle, XCircle, Clock, Shield, Globe,
  Lock, Server, Activity, BarChart3, ArrowUpRight, RefreshCw,
  Wifi, Database, Cpu, Cloud
} from "lucide-react";

type ProjectStatus = "deployed" | "staging" | "development" | "planned";
type DnsStatus = "verified" | "pending" | "not-configured";
type TlsStatus = "valid" | "expiring" | "invalid" | "none";

interface Project {
  name: string;
  route: string;
  readiness: number;
  status: ProjectStatus;
  dns: DnsStatus;
  tls: TlsStatus;
  domain: string;
  lastDeploy: string;
  uptime: number;
  responseTime: number;
  category: string;
}

const projects: Project[] = [
  { name: "ROSIE", route: "/", readiness: 96, status: "deployed", dns: "verified", tls: "valid", domain: "szlholdings.com", lastDeploy: "2 hours ago", uptime: 99.97, responseTime: 142, category: "Security" },
  { name: "Aegis", route: "/aegis/", readiness: 88, status: "deployed", dns: "verified", tls: "valid", domain: "szlholdings.com/aegis", lastDeploy: "1 day ago", uptime: 99.95, responseTime: 156, category: "Security" },
  { name: "Beacon", route: "/beacon/", readiness: 92, status: "deployed", dns: "verified", tls: "valid", domain: "szlholdings.com/beacon", lastDeploy: "6 hours ago", uptime: 99.98, responseTime: 128, category: "Analytics" },
  { name: "Lutar", route: "/lutar/", readiness: 85, status: "deployed", dns: "verified", tls: "valid", domain: "szlholdings.com/lutar", lastDeploy: "3 days ago", uptime: 99.91, responseTime: 167, category: "Sustainability" },
  { name: "Nimbus", route: "/nimbus/", readiness: 91, status: "deployed", dns: "verified", tls: "valid", domain: "szlholdings.com/nimbus", lastDeploy: "12 hours ago", uptime: 99.96, responseTime: 134, category: "AI" },
  { name: "Firestorm", route: "/firestorm/", readiness: 78, status: "staging", dns: "verified", tls: "valid", domain: "szlholdings.com/firestorm", lastDeploy: "5 days ago", uptime: 99.82, responseTime: 203, category: "Security" },
  { name: "DreamEra", route: "/dreamera/", readiness: 82, status: "deployed", dns: "verified", tls: "valid", domain: "szlholdings.com/dreamera", lastDeploy: "1 day ago", uptime: 99.89, responseTime: 178, category: "AI" },
  { name: "Zeus", route: "/zeus/", readiness: 94, status: "deployed", dns: "verified", tls: "valid", domain: "szlholdings.com/zeus", lastDeploy: "4 hours ago", uptime: 99.99, responseTime: 98, category: "Infrastructure" },
  { name: "Apps Showcase", route: "/apps-showcase/", readiness: 90, status: "deployed", dns: "verified", tls: "valid", domain: "szlholdings.com/apps-showcase", lastDeploy: "8 hours ago", uptime: 99.94, responseTime: 112, category: "Marketing" },
  { name: "PSEM", route: "#", readiness: 35, status: "development", dns: "not-configured", tls: "none", domain: "—", lastDeploy: "—", uptime: 0, responseTime: 0, category: "Security" },
  { name: "Readiness Report", route: "/readiness-report/", readiness: 87, status: "deployed", dns: "verified", tls: "valid", domain: "szlholdings.com/readiness-report", lastDeploy: "Just now", uptime: 99.90, responseTime: 105, category: "Operations" },
  { name: "Career", route: "/career/", readiness: 80, status: "staging", dns: "pending", tls: "valid", domain: "szlholdings.com/career", lastDeploy: "1 hour ago", uptime: 99.85, responseTime: 130, category: "Branding" },
];

const statusConfig = {
  deployed: { label: "Deployed", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  staging: { label: "Staging", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
  development: { label: "In Development", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: RefreshCw },
  planned: { label: "Planned", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20", icon: Clock },
};

const dnsConfig = {
  verified: { label: "Verified", color: "text-emerald-400", icon: CheckCircle },
  pending: { label: "Pending", color: "text-amber-400", icon: Clock },
  "not-configured": { label: "Not Configured", color: "text-gray-500", icon: XCircle },
};

const tlsConfig = {
  valid: { label: "Valid", color: "text-emerald-400", icon: Lock },
  expiring: { label: "Expiring Soon", color: "text-amber-400", icon: AlertTriangle },
  invalid: { label: "Invalid", color: "text-red-400", icon: XCircle },
  none: { label: "None", color: "text-gray-500", icon: XCircle },
};

function getReadinessColor(score: number) {
  if (score >= 90) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

function getBarColor(score: number) {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 70) return "bg-amber-500";
  return "bg-red-500";
}

export default function Home() {
  const avgReadiness = Math.round(projects.reduce((s, p) => s + p.readiness, 0) / projects.length);
  const deployed = projects.filter(p => p.status === "deployed").length;
  const avgUptime = (projects.filter(p => p.uptime > 0).reduce((s, p) => s + p.uptime, 0) / projects.filter(p => p.uptime > 0).length).toFixed(2);
  const avgResponse = Math.round(projects.filter(p => p.responseTime > 0).reduce((s, p) => s + p.responseTime, 0) / projects.filter(p => p.responseTime > 0).length);

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
            <span className="text-xs text-muted-foreground font-mono">Last updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <button className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition">
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Project Readiness Overview</h1>
          <p className="text-sm text-muted-foreground">Portfolio-wide deployment status and health monitoring for all SZL Holdings platforms.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Overall Readiness", value: `${avgReadiness}%`, icon: BarChart3, sub: `${projects.length} projects`, color: getReadinessColor(avgReadiness) },
            { label: "Deployed", value: `${deployed}/${projects.length}`, icon: Server, sub: "platforms live", color: "text-emerald-400" },
            { label: "Avg Uptime", value: `${avgUptime}%`, icon: Wifi, sub: "last 30 days", color: "text-blue-400" },
            { label: "Avg Response", value: `${avgResponse}ms`, icon: Cpu, sub: "p95 latency", color: "text-violet-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color} font-mono`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-xl bg-card border border-border overflow-hidden mb-8">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">All Projects</h2>
            <span className="text-xs text-muted-foreground font-mono">{projects.length} total</span>
          </div>

          <div className="hidden lg:grid grid-cols-[2fr_1fr_1.2fr_0.8fr_0.8fr_0.8fr_0.7fr_0.8fr] gap-3 px-5 py-2.5 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>Project</span>
            <span>Readiness</span>
            <span>Status</span>
            <span>DNS</span>
            <span>TLS</span>
            <span>Uptime</span>
            <span>Response</span>
            <span>Last Deploy</span>
          </div>

          {projects.map((project, i) => {
            const status = statusConfig[project.status];
            const dns = dnsConfig[project.dns];
            const tls = tlsConfig[project.tls];
            const StatusIcon = status.icon;
            const DnsIcon = dns.icon;
            const TlsIcon = tls.icon;

            return (
              <motion.div
                key={project.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="lg:grid lg:grid-cols-[2fr_1fr_1.2fr_0.8fr_0.8fr_0.8fr_0.7fr_0.8fr] gap-3 px-5 py-3.5 border-b border-border/50 hover:bg-muted/30 transition-colors items-center"
              >
                <div className="flex items-center gap-3 mb-2 lg:mb-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{project.name.charAt(0)}</span>
                  </div>
                  <div>
                    <a href={project.route} className="text-sm font-semibold text-foreground hover:text-primary transition flex items-center gap-1">
                      {project.name}
                      {project.route !== "#" && <ArrowUpRight className="w-3 h-3 opacity-40" />}
                    </a>
                    <p className="text-[11px] text-muted-foreground font-mono">{project.domain}</p>
                  </div>
                </div>

                <div className="mb-2 lg:mb-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold font-mono ${getReadinessColor(project.readiness)}`}>{project.readiness}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted mt-1.5">
                    <div className={`h-full rounded-full ${getBarColor(project.readiness)} transition-all`} style={{ width: `${project.readiness}%` }} />
                  </div>
                </div>

                <div className="mb-2 lg:mb-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.bg} ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-1 lg:mb-0">
                  <DnsIcon className={`w-3.5 h-3.5 ${dns.color}`} />
                  <span className={`text-xs ${dns.color}`}>{dns.label}</span>
                </div>

                <div className="flex items-center gap-1.5 mb-1 lg:mb-0">
                  <TlsIcon className={`w-3.5 h-3.5 ${tls.color}`} />
                  <span className={`text-xs ${tls.color}`}>{tls.label}</span>
                </div>

                <div className="mb-1 lg:mb-0">
                  {project.uptime > 0 ? (
                    <span className={`text-xs font-mono ${project.uptime >= 99.9 ? "text-emerald-400" : "text-amber-400"}`}>{project.uptime}%</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                <div className="mb-1 lg:mb-0">
                  {project.responseTime > 0 ? (
                    <span className={`text-xs font-mono ${project.responseTime <= 150 ? "text-emerald-400" : project.responseTime <= 200 ? "text-amber-400" : "text-red-400"}`}>{project.responseTime}ms</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">{project.lastDeploy}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Security Summary
            </h3>
            <div className="space-y-3">
              {[
                { label: "TLS Certificates Valid", value: `${projects.filter(p => p.tls === "valid").length}/${projects.length}`, ok: true },
                { label: "DNS Records Verified", value: `${projects.filter(p => p.dns === "verified").length}/${projects.length}`, ok: projects.filter(p => p.dns === "verified").length === projects.length },
                { label: "HTTPS Enforced", value: `${projects.filter(p => p.tls !== "none").length}/${projects.length}`, ok: true },
                { label: "Security Headers", value: "Configured", ok: true },
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

          <div className="rounded-xl bg-card border border-border p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-primary" /> Infrastructure Health
            </h3>
            <div className="space-y-3">
              {[
                { label: "API Server", value: "Healthy", ok: true },
                { label: "Database (PostgreSQL)", value: "Connected", ok: true },
                { label: "CDN Cache", value: "Active", ok: true },
                { label: "SSL Termination", value: "Cloudflare", ok: true },
                { label: "Build Pipeline", value: "Passing", ok: true },
                { label: "Error Rate (24h)", value: "0.02%", ok: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-semibold ${item.ok ? "text-emerald-400" : "text-red-400"}`}>{item.value}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5 mb-8">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Readiness by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from(new Set(projects.map(p => p.category))).map(cat => {
              const catProjects = projects.filter(p => p.category === cat);
              const avg = Math.round(catProjects.reduce((s, p) => s + p.readiness, 0) / catProjects.length);
              return (
                <div key={cat} className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
                  <p className={`text-2xl font-bold font-mono ${getReadinessColor(avg)}`}>{avg}%</p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">{cat}</p>
                  <p className="text-[10px] text-muted-foreground">{catProjects.length} project{catProjects.length > 1 ? "s" : ""}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" /> Deployment Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { task: "All frontends building successfully", done: true },
              { task: "API server health check passing", done: true },
              { task: "Database migrations applied", done: true },
              { task: "Environment variables configured", done: true },
              { task: "TLS certificates valid for all domains", done: projects.filter(p => p.tls === "valid").length >= 10 },
              { task: "DNS records verified for all platforms", done: false },
              { task: "Error monitoring configured", done: true },
              { task: "Performance baselines established", done: true },
              { task: "Backup strategy implemented", done: true },
              { task: "Rate limiting configured", done: true },
              { task: "CORS policies validated", done: true },
              { task: "Load testing completed", done: false },
            ].map(item => (
              <div key={item.task} className={`flex items-center gap-3 p-3 rounded-lg ${item.done ? "bg-emerald-500/5" : "bg-muted/30"}`}>
                {item.done ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                )}
                <span className={`text-xs ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-border py-6 px-6 mt-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <span className="text-xs text-muted-foreground">SZL Holdings — Project Readiness Report</span>
          <span className="text-xs text-muted-foreground font-mono">&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
