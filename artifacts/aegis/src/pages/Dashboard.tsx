import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  Globe,
  Activity,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Cpu,
  Server,
  Wifi
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Badge } from "@workspace/ui";

const threatData = [
  { hour: "00:00", blocked: 142, detected: 8 },
  { hour: "02:00", blocked: 98, detected: 3 },
  { hour: "04:00", blocked: 67, detected: 2 },
  { hour: "06:00", blocked: 134, detected: 5 },
  { hour: "08:00", blocked: 289, detected: 12 },
  { hour: "10:00", blocked: 456, detected: 18 },
  { hour: "12:00", blocked: 523, detected: 22 },
  { hour: "14:00", blocked: 412, detected: 15 },
  { hour: "16:00", blocked: 378, detected: 11 },
  { hour: "18:00", blocked: 267, detected: 9 },
  { hour: "20:00", blocked: 198, detected: 6 },
  { hour: "22:00", blocked: 156, detected: 4 },
];

const attackTypeData = [
  { name: "DDoS", count: 1247 },
  { name: "SQL Injection", count: 834 },
  { name: "XSS", count: 612 },
  { name: "Brute Force", count: 489 },
  { name: "Zero-Day", count: 156 },
  { name: "Malware", count: 298 },
];

const complianceData = [
  { name: "SOC 2", value: 98 },
  { name: "ISO 27001", value: 100 },
  { name: "HIPAA", value: 95 },
  { name: "GDPR", value: 97 },
  { name: "PCI DSS", value: 100 },
];

const PIE_COLORS = ["#f59e0b", "#ef4444", "#10b981", "#6366f1"];
const severityPie = [
  { name: "Critical", value: 12 },
  { name: "High", value: 34 },
  { name: "Medium", value: 89 },
  { name: "Low", value: 156 },
];

type SidebarTab = "overview" | "threats" | "perimeter" | "access" | "forensics" | "config";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [monitoring, setMonitoring] = useState<any>(null);
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<SidebarTab>("overview");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour12: false }) + " UTC"
      );
    }, 1000);
    fetch("/api/monitoring/health")
      .then(r => r.json())
      .then(d => setMonitoring(d))
      .catch(() => {});
    return () => clearInterval(timer);
  }, []);

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const username = localStorage.getItem("szl_user") || "Operator";

  return (
    <div className="min-h-screen flex bg-[#0c0c0c] text-white overflow-hidden">
      <aside className="w-64 border-r border-amber-500/10 bg-[#0a0a0a] flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-amber-500/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="font-display font-bold text-xl tracking-[0.2em] text-white">
              AEGIS
            </span>
          </Link>
        </div>

        <div className="p-4 flex-1 space-y-1">
          <div className="px-2 mb-4 mt-2">
            <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">
              Security Operations
            </p>
          </div>

          {([
            { id: "overview" as SidebarTab, icon: LayoutDashboard, label: "Threat Overview" },
            { id: "threats" as SidebarTab, icon: ShieldAlert, label: "Active Threats" },
            { id: "perimeter" as SidebarTab, icon: Globe, label: "Network Perimeter" },
            { id: "access" as SidebarTab, icon: Lock, label: "Access Control" },
            { id: "forensics" as SidebarTab, icon: Eye, label: "Forensics" },
          ]).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === item.id ? "bg-amber-500/10 text-amber-500" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-amber-500/10">
          <button
            onClick={() => setActiveTab("config")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === "config" ? "bg-amber-500/10 text-amber-500" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}
          >
            <Settings size={18} />
            <span className="text-sm font-medium">Configuration</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-1"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-amber-500/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-semibold text-white tracking-wide">
              {{ overview: "Threat Overview", threats: "Active Threats", perimeter: "Network Perimeter", access: "Access Control", forensics: "Forensics", config: "Configuration" }[activeTab]}
            </h1>
            <Badge className="hidden sm:inline-flex bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
              FORTRESS MODE
            </Badge>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center text-xs font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded border border-white/10">
              <Activity className="w-3 h-3 text-amber-500 mr-2" />
              {currentTime || "00:00:00 UTC"}
            </div>
            <button className="text-gray-500 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center border border-amber-500/30">
              <span className="font-display font-bold text-black text-sm">
                {username[0]?.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {activeTab === "overview" && (<>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <p className="text-gray-500 mb-1">
                Defense Status Report
              </p>
              <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">
                All Systems Nominal
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded">
              <ShieldCheck size={16} /> Perimeter Secured — 3,636 threats
              blocked today
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Threats Blocked",
                value: "3,636",
                sub: "+12% vs yesterday",
                icon: ShieldCheck,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
              },
              {
                label: "Active Alerts",
                value: "7",
                sub: "3 Critical, 4 High",
                icon: AlertTriangle,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
              },
              {
                label: "Uptime",
                value: "99.998%",
                sub: "Last incident: 47 days ago",
                icon: Activity,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
              },
              {
                label: "Compliance Score",
                value: "98%",
                sub: "All frameworks passing",
                icon: CheckCircle2,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className={`p-6 rounded-xl border ${stat.border} ${stat.bg}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs tracking-wider text-gray-500 uppercase">
                    {stat.label}
                  </p>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <h3 className={`text-3xl font-display font-bold mb-1 ${stat.color}`}>
                  {stat.value}
                </h3>
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
                <h3 className="font-display font-bold text-white tracking-wide uppercase">
                  Threat Activity (24h)
                </h3>
                <Badge className="bg-white/5 text-gray-400 border-white/10 hover:bg-white/10">
                  Live
                </Badge>
              </div>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={threatData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorBlocked"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorDetected"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="hour"
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        borderColor: "rgba(245,158,11,0.3)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="blocked"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBlocked)"
                      name="Blocked"
                    />
                    <Area
                      type="monotone"
                      dataKey="detected"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDetected)"
                      name="Unresolved"
                    />
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
              <h3 className="font-display font-bold text-white tracking-wide uppercase mb-6">
                Severity Breakdown
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={severityPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {severityPie.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        borderColor: "rgba(245,158,11,0.3)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {severityPie.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i] }}
                    />
                    <span className="text-gray-400">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
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
              <h3 className="font-display font-bold text-white tracking-wide uppercase mb-6">
                Attack Vectors (Today)
              </h3>
              <div className="min-h-[250px]">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={attackTypeData}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111",
                        borderColor: "rgba(245,158,11,0.3)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#f59e0b"
                      radius={[0, 4, 4, 0]}
                      name="Attacks"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-6 rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <h3 className="font-display font-bold text-white tracking-wide uppercase mb-6">
                Compliance Status
              </h3>
              <div className="space-y-5">
                {complianceData.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400 font-medium">
                        {item.name}
                      </span>
                      <span
                        className={
                          item.value === 100
                            ? "text-emerald-400 font-mono"
                            : "text-amber-500 font-mono"
                        }
                      >
                        {item.value}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                        className={`h-full rounded-full ${
                          item.value === 100
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />
                    </div>
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
              <h3 className="font-display font-bold text-white tracking-wide uppercase">
                Recent Security Events
              </h3>
              <button className="text-xs tracking-widest text-gray-500 uppercase hover:text-white flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "DDoS Attack Mitigated",
                  detail: "Volumetric attack from 192.168.x.x (RU) — 45Gbps peak",
                  time: "12 minutes ago",
                  severity: "critical",
                },
                {
                  title: "SQL Injection Blocked",
                  detail: "Attempted payload on /api/users endpoint — WAF Rule #4521",
                  time: "34 minutes ago",
                  severity: "high",
                },
                {
                  title: "Brute Force Detected",
                  detail: "2,847 login attempts from botnet cluster — IP range banned",
                  time: "1 hour ago",
                  severity: "high",
                },
                {
                  title: "SSL Certificate Renewed",
                  detail: "Wildcard cert for *.szlholdings.com — expires in 365 days",
                  time: "3 hours ago",
                  severity: "info",
                },
                {
                  title: "Zero-Day Signature Updated",
                  detail: "CVE-2026-1847 patch applied to WAF rules automatically",
                  time: "5 hours ago",
                  severity: "medium",
                },
              ].map((event, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-lg border border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <div className="mt-0.5">
                    {event.severity === "critical" ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : event.severity === "high" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    ) : event.severity === "medium" ? (
                      <ShieldAlert className="w-5 h-5 text-blue-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-amber-500 transition-colors">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{event.detail}</p>
                  </div>
                  <span className="text-xs text-gray-600 font-mono whitespace-nowrap">
                    {event.time}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Server,
                label: "Protected Nodes",
                value: "247",
                status: "All Healthy",
                statusColor: "text-emerald-400",
              },
              {
                icon: Wifi,
                label: "Network Latency",
                value: "0.8ms",
                status: "Optimal",
                statusColor: "text-emerald-400",
              },
              {
                icon: Cpu,
                label: "AI Engine Load",
                value: "34%",
                status: "Processing",
                statusColor: "text-amber-500",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="p-5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-xl font-display font-bold text-white">
                    {item.value}
                  </p>
                  <p className={`text-xs ${item.statusColor}`}>
                    {item.status}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {monitoring && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="p-6 rounded-xl border border-amber-500/10 bg-white/[0.02]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-white tracking-wide uppercase">
                  Infrastructure Monitoring
                </h3>
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
                  {monitoring.appInsights?.configured ? "TELEMETRY ACTIVE" : "TELEMETRY PENDING"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] tracking-wider text-gray-500 uppercase mb-2">Server Uptime</p>
                  <p className="text-lg font-display font-bold text-emerald-400">{monitoring.server?.uptimeFormatted || "—"}</p>
                </div>
                <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] tracking-wider text-gray-500 uppercase mb-2">Heap Memory</p>
                  <p className="text-lg font-display font-bold text-blue-400">{monitoring.server?.memoryUsageMB?.heapUsed || "—"} MB</p>
                </div>
                <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] tracking-wider text-gray-500 uppercase mb-2">Identity Provider</p>
                  <p className="text-lg font-display font-bold text-amber-500">{monitoring.identity?.configured ? "Entra ID" : "Demo"}</p>
                </div>
                <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] tracking-wider text-gray-500 uppercase mb-2">App Insights</p>
                  <p className={`text-lg font-display font-bold ${monitoring.appInsights?.configured ? "text-emerald-400" : "text-gray-500"}`}>{monitoring.appInsights?.configured ? "Active" : "Not Set"}</p>
                </div>
              </div>
            </motion.div>
          )}
          </>)}

          {activeTab === "threats" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Active Threat Intelligence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "DDoS Attack — Mitigated", source: "192.168.x.x (RU)", severity: "Critical", time: "12 min ago", icon: XCircle, color: "text-red-500", desc: "Volumetric attack at 45Gbps peak. Auto-mitigated by edge WAF." },
                  { title: "SQL Injection — Blocked", source: "203.0.113.x (CN)", severity: "High", time: "34 min ago", icon: AlertTriangle, color: "text-amber-500", desc: "Attempted payload on /api/users endpoint. WAF Rule #4521 triggered." },
                  { title: "Brute Force — Contained", source: "Botnet Cluster", severity: "High", time: "1 hr ago", icon: AlertTriangle, color: "text-amber-500", desc: "2,847 login attempts detected. IP range banned automatically." },
                  { title: "Zero-Day Signature", source: "CVE-2026-1847", severity: "Medium", time: "5 hrs ago", icon: ShieldAlert, color: "text-blue-400", desc: "Patch applied to WAF rules automatically. No exploitation detected." },
                ].map((t, i) => (
                  <div key={i} className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-start gap-3 mb-3">
                      <t.icon className={`w-5 h-5 mt-0.5 ${t.color}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-semibold text-white">{t.title}</h4>
                          <span className="text-[10px] text-gray-500 font-mono">{t.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Source: {t.source}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{t.desc}</p>
                    <Badge className="mt-3 bg-white/5 text-gray-400 border-white/10">{t.severity}</Badge>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "perimeter" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Network Perimeter</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Edge Nodes", value: "24", status: "All Online", statusColor: "text-emerald-400" },
                  { label: "Firewall Rules", value: "1,847", status: "12 Updated Today", statusColor: "text-amber-500" },
                  { label: "GeoBlocked Regions", value: "7", status: "Active Enforcement", statusColor: "text-red-400" },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                    <p className="text-xs tracking-wider text-gray-500 uppercase">{item.label}</p>
                    <p className="text-3xl font-display font-bold text-white mt-2">{item.value}</p>
                    <p className={`text-xs mt-1 ${item.statusColor}`}>{item.status}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="font-display font-bold text-white tracking-wide uppercase mb-4">Perimeter Zones</h3>
                <div className="space-y-3">
                  {["DMZ (Public-facing services)", "Internal Zone (Core infrastructure)", "Restricted Zone (Data stores)", "Management Zone (Admin services)"].map((zone, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.01]">
                      <span className="text-sm text-gray-300">{zone}</span>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Secured</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "access" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Access Control</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Active Sessions", value: "142", color: "text-blue-400" },
                  { label: "MFA Enforced", value: "100%", color: "text-emerald-400" },
                  { label: "Failed Logins (24h)", value: "2,847", color: "text-red-400" },
                  { label: "Service Accounts", value: "38", color: "text-amber-500" },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <p className="text-xs tracking-wider text-gray-500 uppercase">{item.label}</p>
                    <p className={`text-2xl font-display font-bold mt-2 ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="font-display font-bold text-white tracking-wide uppercase mb-4">Role-Based Access</h3>
                <div className="space-y-3">
                  {[
                    { role: "Emperor", users: 1, perms: "Full System Access" },
                    { role: "Commander", users: 4, perms: "Operations & Monitoring" },
                    { role: "Analyst", users: 12, perms: "Read-Only Intelligence" },
                    { role: "Service", users: 38, perms: "API Access Only" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.01]">
                      <div>
                        <span className="text-sm font-medium text-white">{r.role}</span>
                        <span className="text-xs text-gray-500 ml-3">{r.perms}</span>
                      </div>
                      <span className="text-xs text-gray-400">{r.users} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "forensics" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Forensics & Analysis</h2>
              <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="font-display font-bold text-white tracking-wide uppercase mb-4">Recent Investigations</h3>
                <div className="space-y-4">
                  {[
                    { id: "FOR-2026-0847", title: "Lateral Movement Attempt", status: "Closed", date: "2026-03-22", finding: "Contained to sandbox. No data exfiltration." },
                    { id: "FOR-2026-0839", title: "Anomalous DNS Queries", status: "Active", date: "2026-03-24", finding: "Under investigation. Pattern matches known C2 framework." },
                    { id: "FOR-2026-0831", title: "Privilege Escalation", status: "Closed", date: "2026-03-19", finding: "Misconfigured service account. Remediated." },
                  ].map((inv, i) => (
                    <div key={i} className="p-4 rounded-lg border border-white/5 bg-white/[0.01]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-mono text-amber-500">{inv.id}</span>
                          <h4 className="text-sm font-medium text-white mt-1">{inv.title}</h4>
                        </div>
                        <Badge className={inv.status === "Active" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}>{inv.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{inv.finding}</p>
                      <p className="text-[10px] text-gray-600 mt-2 font-mono">{inv.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "config" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "WAF Rules Engine", desc: "1,847 active rules. Last updated 3 hours ago.", status: "Active" },
                  { title: "DDoS Mitigation", desc: "Auto-scaling enabled. Threshold: 10Gbps.", status: "Active" },
                  { title: "SSL/TLS Settings", desc: "TLS 1.3 enforced. HSTS enabled. Certificate valid.", status: "Active" },
                  { title: "Log Retention", desc: "90-day retention policy. 847GB stored.", status: "Active" },
                  { title: "Alerting Channels", desc: "Slack, PagerDuty, Email configured.", status: "Active" },
                  { title: "Backup & Recovery", desc: "Daily snapshots. RPO: 1hr, RTO: 15min.", status: "Active" },
                ].map((cfg, i) => (
                  <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-white">{cfg.title}</h4>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{cfg.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{cfg.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
