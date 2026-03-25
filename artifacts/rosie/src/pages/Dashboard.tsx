import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, Activity, LogOut, Zap, AlertTriangle, CheckCircle, Clock, XCircle, Loader2, Bug, Scan, Bot, RefreshCw } from "lucide-react";

interface Threat { id: number; type: string; source: string; target: string; severity: string; status: string; description: string; createdAt: string; }
interface Incident { id: number; title: string; description: string; severity: string; status: string; assignee: string; platform: string; resolved: boolean; createdAt: string; }
interface ScanRecord { id: number; platform: string; scanType: string; status: string; threatsFound: number; threatsBlocked: number; duration: number; createdAt: string; }

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = { critical: "bg-red-500/20 text-red-400 border-red-500/30", high: "bg-orange-500/20 text-orange-400 border-orange-500/30", medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", low: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
  return <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${colors[severity] || colors.medium}`}>{severity}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { blocked: "text-emerald-400", resolved: "text-emerald-400", active: "text-red-400", monitoring: "text-yellow-400", scheduled: "text-blue-400", open: "text-orange-400", completed: "text-emerald-400", running: "text-cyan-400" };
  const icons: Record<string, any> = { blocked: ShieldCheck, resolved: CheckCircle, active: Zap, monitoring: Activity, scheduled: Clock, open: AlertTriangle, completed: CheckCircle, running: Loader2 };
  const Icon = icons[status] || Activity;
  return <span className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${colors[status] || "text-gray-400"}`}><Icon className={`w-3.5 h-3.5 ${status === "running" ? "animate-spin" : ""}`} />{status}</span>;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3">
          <div className="h-4 bg-white/5 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-white/5 rounded w-24" />
        <div className="h-4 bg-white/5 rounded w-16" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  );
}

const tabVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
};

export default function Dashboard() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [tab, setTab] = useState<"threats" | "incidents" | "scans">("threats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const user = localStorage.getItem("szl_user");

  function fetchData() {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/rosie/threats").then(r => { if (!r.ok) throw new Error("Failed to load threats"); return r.json(); }),
      fetch("/api/rosie/incidents").then(r => { if (!r.ok) throw new Error("Failed to load incidents"); return r.json(); }),
      fetch("/api/rosie/scans").then(r => { if (!r.ok) throw new Error("Failed to load scans"); return r.json(); }),
    ]).then(([t, i, s]) => { setThreats(t); setIncidents(i); setScans(s); setLoading(false); })
      .catch((err) => { setError(err.message || "Failed to load data"); setLoading(false); });
  }

  useEffect(() => {
    if (!localStorage.getItem("szl_token")) { setLocation("/login"); return; }
    fetchData();
  }, []);

  function logout() {
    const token = localStorage.getItem("szl_token");
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const totalBlocked = threats.filter(t => t.status === "blocked").length;
  const criticalThreats = threats.filter(t => t.severity === "critical").length;
  const activeIncidents = incidents.filter(i => !i.resolved).length;
  const runningScans = scans.filter(s => s.status === "running").length;

  if (loading && threats.length === 0) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex items-center gap-3 text-cyan-400"><Loader2 className="w-6 h-6 animate-spin" /><span className="tracking-widest uppercase text-sm">Loading ROSIE Systems...</span></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center"><Shield className="w-4 h-4 sm:w-5 sm:h-5" /></div>
            <div>
              <h1 className="font-black tracking-wider text-base sm:text-lg">ROSIE.</h1>
              <p className="text-[10px] text-gray-500 tracking-widest hidden sm:block">SECURITY COMMAND CENTER</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span className="text-emerald-400 tracking-wider font-bold">ALL SYSTEMS NOMINAL</span></div>
            <Link href="/alloy" className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-500/10 px-2.5 sm:px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors font-bold tracking-wider"><Bot className="w-3.5 h-3.5" /><span className="hidden sm:inline">NURO ENGINE</span></Link>
            <div className="hidden md:block text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{user?.toUpperCase()} <span className="text-cyan-400">// EMPEROR</span></div>
            <button onClick={logout} className="text-gray-400 hover:text-white transition p-2"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-red-400 text-sm"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold uppercase tracking-wider transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: "Threats Blocked", value: totalBlocked, icon: ShieldCheck, color: "text-emerald-400", bg: "from-emerald-500/20" },
            { label: "Critical Alerts", value: criticalThreats, icon: ShieldAlert, color: "text-red-400", bg: "from-red-500/20" },
            { label: "Active Incidents", value: activeIncidents, icon: AlertTriangle, color: "text-yellow-400", bg: "from-yellow-500/20" },
            { label: "Scans Running", value: runningScans, icon: Scan, color: "text-cyan-400", bg: "from-cyan-500/20" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-gradient-to-br ${stat.bg} to-transparent border border-white/10 rounded-xl p-4 sm:p-5`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(["threats", "incidents", "scans"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${tab === t ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
              {t === "threats" && <ShieldAlert className="w-3.5 h-3.5 inline mr-1.5" />}
              {t === "incidents" && <Bug className="w-3.5 h-3.5 inline mr-1.5" />}
              {t === "scans" && <Scan className="w-3.5 h-3.5 inline mr-1.5" />}
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "threats" && (
            <motion.div key="threats" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-500">
                      <tr><th className="px-5 py-3 text-left">Type</th><th className="px-5 py-3 text-left">Source</th><th className="px-5 py-3 text-left">Target</th><th className="px-5 py-3 text-left">Severity</th><th className="px-5 py-3 text-left">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                      ) : threats.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                          <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">No threats detected. All systems secure.</p>
                        </td></tr>
                      ) : threats.map(t => (
                        <tr key={t.id} className="hover:bg-white/5 transition">
                          <td className="px-5 py-3 font-medium">{t.type}</td>
                          <td className="px-5 py-3 text-gray-400 font-mono text-xs">{t.source}</td>
                          <td className="px-5 py-3 text-gray-300">{t.target}</td>
                          <td className="px-5 py-3"><SeverityBadge severity={t.severity} /></td>
                          <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "incidents" && (
            <motion.div key="incidents" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : incidents.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl py-12 text-center text-gray-500">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No active incidents. All clear.</p>
                  </div>
                ) : incidents.map(inc => (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/[0.07] transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={inc.severity} />
                        <h3 className="font-bold text-sm">{inc.title}</h3>
                      </div>
                      <StatusBadge status={inc.status} />
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{inc.description}</p>
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-gray-500">
                      <span>Platform: <span className="text-gray-300">{inc.platform}</span></span>
                      <span>Assignee: <span className="text-cyan-400">{inc.assignee}</span></span>
                      <span>Resolved: <span className={inc.resolved ? "text-emerald-400" : "text-yellow-400"}>{inc.resolved ? "Yes" : "No"}</span></span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "scans" && (
            <motion.div key="scans" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : scans.length === 0 ? (
                  <div className="col-span-full bg-white/5 border border-white/10 rounded-xl py-12 text-center text-gray-500">
                    <Scan className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No scan records found.</p>
                  </div>
                ) : scans.map(scan => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm">{scan.platform}</h3>
                      <StatusBadge status={scan.status} />
                    </div>
                    <p className="text-gray-400 text-xs mb-4">{scan.scanType}</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-lg font-black text-red-400">{scan.threatsFound}</p>
                        <p className="text-xs text-gray-500">Found</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-lg font-black text-emerald-400">{scan.threatsBlocked}</p>
                        <p className="text-xs text-gray-500">Blocked</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-lg font-black text-cyan-400">{scan.duration > 0 ? `${(scan.duration / 60).toFixed(1)}m` : "—"}</p>
                        <p className="text-xs text-gray-500">Duration</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
