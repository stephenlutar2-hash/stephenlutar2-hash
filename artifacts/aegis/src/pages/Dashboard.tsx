import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Shield, ShieldAlert, ShieldCheck, LayoutDashboard, Globe, Activity,
  Settings, LogOut, Bell, TrendingUp, Lock, Eye, AlertTriangle, CheckCircle2,
  XCircle, ChevronRight, Server, Wifi, Cpu, Upload, Users, BarChart3, Menu, X
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { Badge, ShareContentButton } from "@szl-holdings/ui";
import MitreHeatmap from "@/components/MitreHeatmap";
import ComplianceTracker from "@/components/ComplianceTracker";
import VulnerabilityTable from "@/components/VulnerabilityTable";
import CrossAppSummary from "@/components/CrossAppSummary";

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

const PIE_COLORS = ["#f59e0b", "#ef4444", "#10b981", "#6366f1"];
const severityPie = [
  { name: "Critical", value: 12 },
  { name: "High", value: 34 },
  { name: "Medium", value: 89 },
  { name: "Low", value: 156 },
];

type SidebarTab = "overview" | "threats" | "perimeter" | "access" | "forensics" | "config";
type RoleView = "ciso" | "analyst";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState("");
  const [monitoring, setMonitoring] = useState<any>(null);
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<SidebarTab>("overview");
  const [roleView, setRoleView] = useState<RoleView>("ciso");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }) + " UTC");
    }, 1000);
    fetch("/api/monitoring/health").then(r => r.json()).then(d => setMonitoring(d)).catch(() => {});
    return () => clearInterval(timer);
  }, []);

  function handleLogout() {
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const username = localStorage.getItem("szl_user") || "Operator";

  const sidebarTabs = [
    { id: "overview" as SidebarTab, icon: LayoutDashboard, label: "Threat Overview" },
    { id: "threats" as SidebarTab, icon: ShieldAlert, label: "Active Threats" },
    { id: "perimeter" as SidebarTab, icon: Globe, label: "Network Perimeter" },
    { id: "access" as SidebarTab, icon: Lock, label: "Access Control" },
    { id: "forensics" as SidebarTab, icon: Eye, label: "Forensics" },
  ];

  const bottomNavTabs = sidebarTabs.slice(0, 4);

  return (
    <div className="min-h-screen flex bg-[#0c0c0c] text-white overflow-hidden">
      <aside className="w-64 border-r border-amber-500/10 bg-[#0a0a0a] flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-amber-500/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="font-display font-bold text-xl tracking-[0.2em] text-white">AEGIS</span>
          </Link>
        </div>

        <div className="p-4 flex-1 space-y-1">
          <div className="px-2 mb-4 mt-2">
            <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">Security Operations</p>
          </div>

          {sidebarTabs.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeTab === item.id ? "bg-amber-500/10 text-amber-500 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}

          <Link href="/import" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-500 hover:bg-white/5 hover:text-white">
            <Upload size={18} />
            <span className="text-sm font-medium">Import Center</span>
          </Link>

          <Link href="/compliance" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-500 hover:bg-white/5 hover:text-white">
            <BarChart3 size={18} />
            <span className="text-sm font-medium">Compliance Matrix</span>
          </Link>
        </div>

        <div className="p-4 border-t border-amber-500/10 space-y-2">
          <CrossAppSummary />
          <button onClick={() => setActiveTab("config")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === "config" ? "bg-amber-500/10 text-amber-500" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}>
            <Settings size={18} />
            <span className="text-sm font-medium">Configuration</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-amber-500/10 flex flex-col z-10 safe-top">
            <div className="h-16 flex items-center justify-between px-5 border-b border-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-black" />
                </div>
                <span className="font-display font-bold text-lg tracking-[0.2em] text-white">AEGIS</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-white touch-target">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 space-y-1">
              {sidebarTabs.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors touch-target ${activeTab === item.id ? "bg-amber-500/10 text-amber-500" : "text-gray-500 hover:bg-white/5 hover:text-white"}`}
                >
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
              <Link href="/import" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-gray-500 hover:bg-white/5 hover:text-white touch-target">
                <Upload size={18} />
                <span className="text-sm font-medium">Import Center</span>
              </Link>
            </div>
            <div className="p-4 border-t border-amber-500/10">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors touch-target">
                <LogOut size={18} />
                <span className="text-sm font-medium">Disconnect</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-20 md:pb-0">
        <header className="h-14 sm:h-20 border-b border-amber-500/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8 safe-top">
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="md:hidden p-2 rounded-lg hover:bg-white/10 text-gray-400 touch-target" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-xl font-display font-semibold text-white tracking-wide">
              {{ overview: "Threat Overview", threats: "Active Threats", perimeter: "Network Perimeter", access: "Access Control", forensics: "Forensics", config: "Configuration" }[activeTab]}
            </h1>
            <Badge className="hidden sm:inline-flex bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
              FORTRESS MODE
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {activeTab === "overview" && (
              <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
                <button
                  onClick={() => setRoleView("ciso")}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all ${roleView === "ciso" ? "bg-amber-500/20 text-amber-400" : "text-gray-500 hover:text-white"}`}
                >
                  <Users className="w-3 h-3 inline mr-1" />CISO
                </button>
                <button
                  onClick={() => setRoleView("analyst")}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all ${roleView === "analyst" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-white"}`}
                >
                  <Eye className="w-3 h-3 inline mr-1" />ANALYST
                </button>
              </div>
            )}
            <div className="hidden md:flex items-center text-xs font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded border border-white/10">
              <Activity className="w-3 h-3 text-amber-500 mr-2" />
              {currentTime || "00:00:00 UTC"}
            </div>
            <button className="text-gray-500 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center border border-amber-500/30">
              <span className="font-display font-bold text-black text-sm">{username[0]?.toUpperCase()}</span>
            </div>
          </div>
        </header>

        <div className="border-b border-cyan-500/10 bg-cyan-500/[0.02] px-8 py-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 uppercase tracking-wider">SZL Portfolio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400">Operational</span>
              <span className="text-gray-600">·</span>
              <span className="text-cyan-400">Readiness 88%</span>
              <span className="text-gray-600">·</span>
              <span className="text-amber-400">1 Alert</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-gray-500">
              <span>Uptime 99.95%</span>
              <span>·</span>
              <span>Last sync 3 min ago</span>
              <span>·</span>
              <span className="text-amber-400">Demo Mode</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {activeTab === "overview" && (<>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-gray-500 mb-1">Defense Status Report</p>
                <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider">All Systems Nominal</h2>
              </div>
              <div className="flex items-center gap-3">
                <ShareContentButton
                  content="Aegis Security — Security Posture 98/100, Compliance Score 98%, Business Risk Low. Perimeter secured with 3,636 threats blocked today."
                  appName="Aegis"
                  hashtags={["#SZLHoldings", "#Aegis", "#SecurityPosture", "#Compliance"]}
                  accentColor="#f59e0b"
                  label="Draft Post"
                />
                <div className="flex items-center gap-2 text-sm text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                  <ShieldCheck size={16} /> Perimeter Secured — 3,636 threats blocked today
                </div>
              </div>
            </motion.div>

            {roleView === "ciso" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Security Posture", value: "98/100", sub: "Industry top 5%", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]" },
                    { label: "Active Alerts", value: "7", sub: "3 Critical, 4 High", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-[inset_0_0_30px_rgba(245,158,11,0.05)]" },
                    { label: "Compliance Score", value: "98%", sub: "6 frameworks tracked", icon: CheckCircle2, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "shadow-[inset_0_0_30px_rgba(6,182,212,0.05)]" },
                    { label: "Business Risk", value: "Low", sub: "No critical exposure", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-[inset_0_0_30px_rgba(16,185,129,0.05)]" },
                  ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className={`p-5 rounded-2xl border ${stat.border} ${stat.bg} ${stat.glow} backdrop-blur-sm hover:scale-[1.02] transition-transform cursor-pointer`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-[10px] tracking-wider text-gray-500 uppercase">{stat.label}</p>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <h3 className={`text-3xl font-display font-bold mb-1 ${stat.color}`}>{stat.value}</h3>
                      <p className="text-xs text-gray-500">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent pointer-events-none" />
                    <div className="relative">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-display font-bold text-white tracking-wide uppercase">Global Threat Map</h3>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" /></span>
                          <span className="text-[10px] font-mono text-amber-400 tracking-wider">DEMO</span>
                        </div>
                      </div>
                      <div className="relative w-full h-[280px] rounded-xl bg-[#0a0a0a] border border-white/5 overflow-hidden">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(245,158,11,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                          <defs>
                            <radialGradient id="attackPulse" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" /><stop offset="100%" stopColor="#ef4444" stopOpacity="0" /></radialGradient>
                            <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" /><stop offset="100%" stopColor="#f59e0b" stopOpacity="0" /></radialGradient>
                          </defs>
                          <path d="M120,180 Q200,160 280,170 Q320,140 360,150 Q400,120 440,130 Q480,110 520,140 Q560,130 600,150 Q640,140 680,160 L680,200 Q640,210 600,220 Q560,240 520,230 Q480,250 440,240 Q400,260 360,250 Q320,270 280,250 Q240,240 200,230 Q160,220 120,210 Z" fill="none" stroke="rgba(245,158,11,0.1)" strokeWidth="1" />
                          {[
                            { x: 180, y: 150, label: "US-EAST", attacks: 847 },
                            { x: 350, y: 120, label: "EU-WEST", attacks: 1247 },
                            { x: 550, y: 140, label: "APAC", attacks: 634 },
                            { x: 480, y: 180, label: "ME-SOUTH", attacks: 423 },
                            { x: 250, y: 200, label: "SA-EAST", attacks: 312 },
                            { x: 620, y: 200, label: "OCE", attacks: 173 },
                          ].map((node, i) => (
                            <g key={i}>
                              <line x1={node.x} y1={node.y} x2={400} y2={200} stroke="rgba(239,68,68,0.15)" strokeWidth="1" strokeDasharray="4 4"><animate attributeName="stroke-dashoffset" values="0;-8" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" /></line>
                              <circle cx={node.x} cy={node.y} r="16" fill="url(#attackPulse)"><animate attributeName="r" values="12;20;12" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" /><animate attributeName="opacity" values="0.8;0.3;0.8" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" /></circle>
                              <circle cx={node.x} cy={node.y} r="3" fill="#ef4444" />
                              <text x={node.x} y={node.y - 20} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">{node.label}</text>
                              <text x={node.x} y={node.y + 20} textAnchor="middle" fill="rgba(239,68,68,0.7)" fontSize="7" fontFamily="monospace">{node.attacks}</text>
                            </g>
                          ))}
                          <circle cx={400} cy={200} r="24" fill="url(#shieldGlow)"><animate attributeName="r" values="20;28;20" dur="3s" repeatCount="indefinite" /></circle>
                          <circle cx={400} cy={200} r="8" fill="#f59e0b" />
                          <text x={400} y={240} textAnchor="middle" fill="rgba(245,158,11,0.8)" fontSize="9" fontFamily="monospace" fontWeight="bold">AEGIS CORE</text>
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-sm flex flex-col items-center shadow-[inset_0_0_30px_rgba(245,158,11,0.03)]"
                  >
                    <h3 className="font-display font-bold text-white tracking-wide uppercase mb-4 self-start">Security Posture</h3>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="relative w-48 h-48">
                        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                          <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                          <circle cx="100" cy="100" r="85" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${98 * 5.34} ${534 - 98 * 5.34}`}>
                            <animate attributeName="stroke-dasharray" from="0 534" to={`${98 * 5.34} ${534 - 98 * 5.34}`} dur="1.5s" fill="freeze" />
                          </circle>
                          <defs><linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="50%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-display font-bold text-white">98</span>
                          <span className="text-xs text-gray-500 tracking-widest uppercase">/ 100</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full space-y-2 mt-4">
                      {[
                        { label: "Perimeter", score: 100, color: "bg-emerald-500" },
                        { label: "Endpoint", score: 96, color: "bg-amber-500" },
                        { label: "Identity", score: 98, color: "bg-emerald-500" },
                        { label: "Data", score: 97, color: "bg-emerald-500" },
                      ].map((item, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-gray-500 uppercase tracking-wider">{item.label}</span>
                            <span className="text-gray-400 font-mono">{item.score}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }} className={`h-full rounded-full ${item.color}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <ComplianceTracker />
                <MitreHeatmap />
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Threats Blocked", value: "3,636", sub: "+12% vs yesterday", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                    { label: "Active Alerts", value: "7", sub: "3 Critical, 4 High", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                    { label: "Uptime", value: "99.998%", sub: "Last incident: 47 days ago", icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    { label: "Triage Queue", value: "12", sub: "5 pending analyst review", icon: Eye, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                  ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className={`p-5 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-sm hover:scale-[1.02] transition-transform cursor-pointer shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-[10px] tracking-wider text-gray-500 uppercase">{stat.label}</p>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <h3 className={`text-3xl font-display font-bold mb-1 ${stat.color}`}>{stat.value}</h3>
                      <p className="text-xs text-gray-500">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent pointer-events-none" />
                    <div className="relative flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-display font-bold text-white tracking-wide uppercase">Threat Activity (24h)</h3>
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20">Demo</Badge>
                      </div>
                      <div className="flex-1 min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={threatData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                              <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#111", borderColor: "rgba(245,158,11,0.3)", borderRadius: "8px", color: "#fff" }} />
                            <Area type="monotone" dataKey="blocked" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" name="Blocked" />
                            <Area type="monotone" dataKey="detected" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDetected)" name="Unresolved" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-transparent pointer-events-none" />
                    <div className="relative flex-1 flex flex-col">
                      <h3 className="font-display font-bold text-white tracking-wide uppercase mb-6">Severity Breakdown</h3>
                      <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie data={severityPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                              {severityPie.map((_, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#111", borderColor: "rgba(245,158,11,0.3)", borderRadius: "8px", color: "#fff" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {severityPie.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                            <span className="text-gray-400">{item.name}: {item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <VulnerabilityTable />
                <MitreHeatmap />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                  className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.02] to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display font-bold text-white tracking-wide uppercase">Recent Security Events</h3>
                      <button className="text-xs tracking-widest text-gray-500 uppercase hover:text-white flex items-center gap-1">View All <ChevronRight size={14} /></button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { title: "DDoS Attack Mitigated", detail: "Volumetric attack from 192.168.x.x (RU) — 45Gbps peak", time: "12 minutes ago", severity: "critical" },
                        { title: "SQL Injection Blocked", detail: "Attempted payload on /api/users endpoint — WAF Rule #4521", time: "34 minutes ago", severity: "high" },
                        { title: "Brute Force Detected", detail: "2,847 login attempts from botnet cluster — IP range banned", time: "1 hour ago", severity: "high" },
                        { title: "SSL Certificate Renewed", detail: "Wildcard cert for *.szlholdings.com — expires in 365 days", time: "3 hours ago", severity: "info" },
                        { title: "Zero-Day Signature Updated", detail: "CVE-2026-1847 patch applied to WAF rules automatically", time: "5 hours ago", severity: "medium" },
                      ].map((event, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-white/5 hover:bg-white/[0.02] hover:border-white/10 transition-all group cursor-pointer">
                          <div className="mt-0.5">
                            {event.severity === "critical" ? <XCircle className="w-5 h-5 text-red-500" /> : event.severity === "high" ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : event.severity === "medium" ? <ShieldAlert className="w-5 h-5 text-blue-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-white group-hover:text-amber-500 transition-colors">{event.title}</p>
                              <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${event.severity === "critical" ? "text-red-400 bg-red-500/10 border-red-500/20" : event.severity === "high" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : event.severity === "medium" ? "text-blue-400 bg-blue-500/10 border-blue-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}>
                                {event.severity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{event.detail}</p>
                          </div>
                          <span className="text-xs text-gray-600 font-mono whitespace-nowrap">{event.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Server, label: "Protected Nodes", value: "247", status: "All Healthy", statusColor: "text-emerald-400" },
                { icon: Wifi, label: "Network Latency", value: "0.8ms", status: "Optimal", statusColor: "text-emerald-400" },
                { icon: Cpu, label: "AI Engine Load", value: "34%", status: "Processing", statusColor: "text-amber-500" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }}
                  className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm flex items-center gap-4 hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p>
                    <p className="text-xl font-display font-bold text-white">{item.value}</p>
                    <p className={`text-xs ${item.statusColor}`}>{item.status}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>)}

          {activeTab === "threats" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Active Threat Intelligence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "DDoS Attack — Mitigated", source: "192.168.x.x (RU)", severity: "Critical", time: "12 min ago", icon: XCircle, color: "text-red-500", desc: "Volumetric attack at 45Gbps peak. Auto-mitigated by edge WAF." },
                  { title: "SQL Injection — Blocked", source: "203.0.113.x (CN)", severity: "High", time: "34 min ago", icon: AlertTriangle, color: "text-amber-500", desc: "Attempted payload on /api/users endpoint. WAF Rule #4521 triggered." },
                  { title: "Brute Force — Contained", source: "Botnet Cluster", severity: "High", time: "1 hr ago", icon: AlertTriangle, color: "text-amber-500", desc: "2,847 login attempts detected. IP range banned automatically." },
                  { title: "Zero-Day Signature", source: "CVE-2026-1847", severity: "Medium", time: "5 hrs ago", icon: ShieldAlert, color: "text-blue-400", desc: "Patch applied to WAF rules automatically. No exploitation detected." },
                ].map((t, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:border-white/20 transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <t.icon className={`w-5 h-5 mt-0.5 ${t.color}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start"><h4 className="text-sm font-semibold text-white">{t.title}</h4><span className="text-[10px] text-gray-500 font-mono">{t.time}</span></div>
                        <p className="text-xs text-gray-500 mt-1">Source: {t.source}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{t.desc}</p>
                    <Badge className="mt-3 bg-white/5 text-gray-400 border-white/10">{t.severity}</Badge>
                  </div>
                ))}
              </div>
              <VulnerabilityTable />
            </motion.div>
          )}

          {activeTab === "perimeter" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Network Perimeter</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Edge Nodes", value: "24", status: "All Online", statusColor: "text-emerald-400" },
                  { label: "Firewall Rules", value: "1,847", status: "12 Updated Today", statusColor: "text-amber-500" },
                  { label: "GeoBlocked Regions", value: "7", status: "Active Enforcement", statusColor: "text-red-400" },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                    <p className="text-xs tracking-wider text-gray-500 uppercase">{item.label}</p>
                    <p className="text-3xl font-display font-bold text-white mt-2">{item.value}</p>
                    <p className={`text-xs mt-1 ${item.statusColor}`}>{item.status}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                <h3 className="font-display font-bold text-white tracking-wide uppercase mb-4">Perimeter Zones</h3>
                <div className="space-y-2">
                  {["DMZ (Public-facing services)", "Internal Zone (Core infrastructure)", "Restricted Zone (Data stores)", "Management Zone (Admin services)"].map((zone, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Active Sessions", value: "142", color: "text-blue-400" },
                  { label: "MFA Enforced", value: "100%", color: "text-emerald-400" },
                  { label: "Failed Logins (24h)", value: "2,847", color: "text-red-400" },
                  { label: "Service Accounts", value: "38", color: "text-amber-500" },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                    <p className="text-xs tracking-wider text-gray-500 uppercase">{item.label}</p>
                    <p className={`text-2xl font-display font-bold mt-2 ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                <h3 className="font-display font-bold text-white tracking-wide uppercase mb-4">Role-Based Access</h3>
                <div className="space-y-2">
                  {[
                    { role: "Emperor", users: 1, perms: "Full System Access" },
                    { role: "Commander", users: 4, perms: "Operations & Monitoring" },
                    { role: "Analyst", users: 12, perms: "Read-Only Intelligence" },
                    { role: "Service", users: 38, perms: "API Access Only" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
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
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                <h3 className="font-display font-bold text-white tracking-wide uppercase mb-4">Recent Investigations</h3>
                <div className="space-y-3">
                  {[
                    { id: "FOR-2026-0847", title: "Lateral Movement Attempt", status: "Closed", date: "2026-03-22", finding: "Contained to sandbox. No data exfiltration." },
                    { id: "FOR-2026-0839", title: "Anomalous DNS Queries", status: "Active", date: "2026-03-24", finding: "Under investigation. Pattern matches known C2 framework." },
                  ].map((inv, i) => (
                    <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-cyan-400">{inv.id}</span>
                          <span className="text-sm font-medium text-white">{inv.title}</span>
                        </div>
                        <Badge className={inv.status === "Active" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}>{inv.status}</Badge>
                      </div>
                      <p className="text-xs text-gray-400">{inv.finding}</p>
                      <p className="text-[10px] text-gray-600 mt-1 font-mono">{inv.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "config" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">Configuration</h2>
              {!monitoring ? (
                <div className="p-6 rounded-2xl border border-amber-500/10 bg-white/[0.02] animate-pulse">
                  <div className="h-5 w-56 bg-white/5 rounded mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (<div key={i} className="p-4 rounded-lg border border-white/5 bg-white/[0.02]"><div className="h-3 w-20 bg-white/5 rounded mb-3" /><div className="h-6 w-24 bg-white/5 rounded" /></div>))}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-amber-500/10 bg-white/[0.02] backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display font-bold text-white tracking-wide uppercase">Infrastructure Monitoring</h3>
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">{monitoring.appInsights?.configured ? "TELEMETRY ACTIVE" : "TELEMETRY PENDING"}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]"><p className="text-[10px] tracking-wider text-gray-500 uppercase mb-2">Server Uptime</p><p className="text-lg font-display font-bold text-emerald-400">{monitoring.server?.uptimeFormatted || "—"}</p></div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]"><p className="text-[10px] tracking-wider text-gray-500 uppercase mb-2">Heap Memory</p><p className="text-lg font-display font-bold text-blue-400">{monitoring.server?.memoryUsageMB?.heapUsed || "—"} MB</p></div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]"><p className="text-[10px] tracking-wider text-gray-500 uppercase mb-2">Identity Provider</p><p className="text-lg font-display font-bold text-amber-500">{monitoring.identity?.configured ? "Entra ID" : "Demo"}</p></div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]"><p className="text-[10px] tracking-wider text-gray-500 uppercase mb-2">App Insights</p><p className={`text-lg font-display font-bold ${monitoring.appInsights?.configured ? "text-emerald-400" : "text-gray-500"}`}>{monitoring.appInsights?.configured ? "Active" : "Not Set"}</p></div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-amber-500/10 safe-bottom">
        <div className="flex items-center justify-around px-2 h-16">
          {bottomNavTabs.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 rounded-lg transition-colors touch-target ${
                activeTab === item.id ? "text-amber-500" : "text-gray-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate max-w-[64px]">{item.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
