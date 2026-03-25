import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Flame,
  Crosshair,
  Bug,
  Radio,
  LayoutDashboard,
  Globe,
  Activity,
  Settings,
  LogOut,
  Bell,
  Target,
  Eye,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Server,
  Zap,
  Clock,
  Users
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from "recharts";
import { Badge } from "@/components/ui/badge";

const opsData = [
  { hour: "00:00", recon: 12, attacks: 3, vulns: 8 },
  { hour: "02:00", recon: 8, attacks: 1, vulns: 5 },
  { hour: "04:00", recon: 5, attacks: 0, vulns: 3 },
  { hour: "06:00", recon: 15, attacks: 2, vulns: 7 },
  { hour: "08:00", recon: 28, attacks: 5, vulns: 14 },
  { hour: "10:00", recon: 42, attacks: 8, vulns: 22 },
  { hour: "12:00", recon: 38, attacks: 12, vulns: 19 },
  { hour: "14:00", recon: 45, attacks: 6, vulns: 25 },
  { hour: "16:00", recon: 35, attacks: 9, vulns: 18 },
  { hour: "18:00", recon: 22, attacks: 4, vulns: 11 },
  { hour: "20:00", recon: 18, attacks: 3, vulns: 9 },
  { hour: "22:00", recon: 14, attacks: 2, vulns: 6 },
];

const vulnSeverityData = [
  { name: "Critical", count: 4, color: "#ef4444" },
  { name: "High", count: 12, color: "#f97316" },
  { name: "Medium", count: 34, color: "#eab308" },
  { name: "Low", count: 67, color: "#22c55e" },
  { name: "Info", count: 128, color: "#6366f1" },
];

const radarData = [
  { category: "Recon", score: 92 },
  { category: "Exploit", score: 78 },
  { category: "Social Eng", score: 85 },
  { category: "Persistence", score: 70 },
  { category: "Exfiltration", score: 88 },
  { category: "C2", score: 65 },
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }) + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const username = localStorage.getItem("szl_user") || "Operator";

  return (
    <div className="min-h-screen flex bg-[#0c0a08] text-white overflow-hidden">
      <aside className="w-64 border-r border-orange-500/10 bg-[#0a0908] flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-orange-500/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.3)]">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-[0.2em] text-white">FIRESTORM</span>
          </Link>
        </div>

        <div className="p-4 flex-1 space-y-1">
          <div className="px-2 mb-4 mt-2">
            <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">Operations Center</p>
          </div>

          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-orange-500/10 text-orange-500 transition-colors">
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Ops Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition-colors">
            <Crosshair size={18} />
            <span className="text-sm font-medium">Active Engagements</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition-colors">
            <Bug size={18} />
            <span className="text-sm font-medium">Vulnerability DB</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition-colors">
            <Target size={18} />
            <span className="text-sm font-medium">Target Profiles</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition-colors">
            <Radio size={18} />
            <span className="text-sm font-medium">Signal Intel</span>
          </a>
        </div>

        <div className="p-4 border-t border-orange-500/10">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-white/5 hover:text-white transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium">Configuration</span>
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-1">
            <LogOut size={18} />
            <span className="text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-orange-500/10 bg-[#0a0908]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-semibold text-white tracking-wide">Operations Dashboard</h1>
            <Badge className="hidden sm:inline-flex bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20">
              OFFENSIVE OPS
            </Badge>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center text-xs font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded border border-white/10">
              <Activity className="w-3 h-3 text-orange-500 mr-2" />
              {currentTime || "00:00:00 UTC"}
            </div>
            <button className="text-gray-500 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">{username[0]?.toUpperCase()}</span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <p className="text-gray-500 mb-1">Offensive Operations Report</p>
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">Strike Readiness: Active</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-orange-400 font-mono bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded">
              <Crosshair size={16} /> 3 Active Engagements — 245 Vulnerabilities Found
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Active Ops", value: "3", sub: "2 Pen Tests, 1 Red Team", icon: Crosshair, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { label: "Vulns Found", value: "245", sub: "4 Critical, 12 High", icon: Bug, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
              { label: "Operators Online", value: "8", sub: "Across 3 time zones", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Avg Response", value: "1.4h", sub: "Under SLA target", icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className={`p-6 rounded-xl border ${stat.border} ${stat.bg}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs tracking-wider text-gray-500 uppercase">{stat.label}</p>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <h3 className={`text-3xl font-display font-bold mb-1 ${stat.color}`}>{stat.value}</h3>
                <p className="text-xs text-gray-500">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 p-6 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-white tracking-wide uppercase">Operations Activity (24h)</h3>
                <Badge className="bg-white/5 text-gray-400 border-white/10 hover:bg-white/10">Live</Badge>
              </div>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={opsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRecon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVulns" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#111", borderColor: "rgba(249,115,22,0.3)", borderRadius: "8px", color: "#fff" }} />
                    <Area type="monotone" dataKey="recon" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRecon)" name="Recon Sweeps" />
                    <Area type="monotone" dataKey="vulns" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorVulns)" name="Vulns Found" />
                    <Area type="monotone" dataKey="attacks" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorAttacks)" name="Exploits Run" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col"
            >
              <h3 className="font-display font-bold text-white tracking-wide uppercase mb-6">Attack Coverage</h3>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="category" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <Radar name="Coverage" dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="p-6 rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <h3 className="font-display font-bold text-white tracking-wide uppercase mb-6">Vulnerability Distribution</h3>
              <div className="space-y-4">
                {vulnSeverityData.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-16 text-xs text-gray-400 font-medium">{item.name}</span>
                    <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / 128) * 100}%` }}
                        transition={{ delay: 0.7 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-mono" style={{ color: item.color }}>{item.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-6 rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-white tracking-wide uppercase">Active Engagements</h3>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Operation Nightfall", client: "Financial Corp A", type: "Red Team", status: "In Progress", progress: 65 },
                  { name: "Project Ember", client: "Tech Giant B", type: "Pen Test", status: "In Progress", progress: 42 },
                  { name: "Exercise Titan", client: "Defense Contractor C", type: "Pen Test", status: "Starting", progress: 10 },
                ].map((eng, i) => (
                  <div key={i} className="p-4 rounded-lg border border-white/5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{eng.name}</p>
                        <p className="text-xs text-gray-500">{eng.client} — {eng.type}</p>
                      </div>
                      <Badge className={`text-[10px] ${eng.status === "In Progress" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                        {eng.status}
                      </Badge>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${eng.progress}%` }}
                        transition={{ delay: 0.8 + i * 0.15, duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-600"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5 font-mono">{eng.progress}% Complete</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="p-6 rounded-xl border border-white/10 bg-white/[0.02]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-white tracking-wide uppercase">Recent Findings</h3>
              <button className="text-xs tracking-widest text-gray-500 uppercase hover:text-white flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { title: "Remote Code Execution in API Gateway", detail: "CVE-2026-2341 — Unpatched dependency allows arbitrary command execution", time: "28 minutes ago", severity: "critical" },
                { title: "Privilege Escalation via IDOR", detail: "Insecure direct object reference in /api/admin/users endpoint", time: "1 hour ago", severity: "high" },
                { title: "Exposed S3 Bucket with PII", detail: "Public read access on backup-prod-2026 bucket containing customer data", time: "2 hours ago", severity: "high" },
                { title: "Weak TLS Configuration", detail: "TLS 1.0 still enabled on legacy endpoint legacy.target.com", time: "4 hours ago", severity: "medium" },
                { title: "Default Credentials on Admin Panel", detail: "admin/admin123 working on internal staging environment", time: "5 hours ago", severity: "high" },
              ].map((finding, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <div className="mt-0.5">
                    {finding.severity === "critical" ? (
                      <Flame className="w-5 h-5 text-red-500" />
                    ) : finding.severity === "high" ? (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Bug className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-orange-500 transition-colors">{finding.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{finding.detail}</p>
                  </div>
                  <span className="text-xs text-gray-600 font-mono whitespace-nowrap">{finding.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
