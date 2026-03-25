import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Shield, ShieldAlert, ShieldCheck, Activity, LogOut, Search, Zap, AlertTriangle, CheckCircle, Clock, XCircle, Loader2, Bug, Scan, Bot } from "lucide-react";

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

export default function Dashboard() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [tab, setTab] = useState<"threats" | "incidents" | "scans">("threats");
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const user = localStorage.getItem("szl_user");

  useEffect(() => {
    if (!localStorage.getItem("szl_token")) { setLocation("/login"); return; }
    Promise.all([
      fetch("/api/rosie/threats").then(r => r.json()),
      fetch("/api/rosie/incidents").then(r => r.json()),
      fetch("/api/rosie/scans").then(r => r.json()),
    ]).then(([t, i, s]) => { setThreats(t); setIncidents(i); setScans(s); setLoading(false); })
      .catch(() => setLoading(false));
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

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex items-center gap-3 text-cyan-400"><Loader2 className="w-6 h-6 animate-spin" /><span className="tracking-widest uppercase text-sm">Loading ROSIE Systems...</span></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center"><Shield className="w-5 h-5" /></div>
            <div>
              <h1 className="font-black tracking-wider text-lg">ROSIE.</h1>
              <p className="text-xs text-gray-500 tracking-widest">SECURITY COMMAND CENTER</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span className="text-emerald-400 tracking-wider font-bold">ALL SYSTEMS NOMINAL</span></div>
            <Link href="/alloy" className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors font-bold tracking-wider"><Bot className="w-3.5 h-3.5" />ALLOY AI</Link>
            <div className="text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{user?.toUpperCase()} <span className="text-cyan-400">// EMPEROR</span></div>
            <button onClick={logout} className="text-gray-400 hover:text-white transition p-2"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Threats Blocked", value: totalBlocked, icon: ShieldCheck, color: "text-emerald-400", bg: "from-emerald-500/20" },
            { label: "Critical Alerts", value: criticalThreats, icon: ShieldAlert, color: "text-red-400", bg: "from-red-500/20" },
            { label: "Active Incidents", value: activeIncidents, icon: AlertTriangle, color: "text-yellow-400", bg: "from-yellow-500/20" },
            { label: "Scans Running", value: runningScans, icon: Scan, color: "text-cyan-400", bg: "from-cyan-500/20" },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.bg} to-transparent border border-white/10 rounded-xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {(["threats", "incidents", "scans"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${tab === t ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"}`}>
              {t === "threats" && <ShieldAlert className="w-3.5 h-3.5 inline mr-2" />}
              {t === "incidents" && <Bug className="w-3.5 h-3.5 inline mr-2" />}
              {t === "scans" && <Scan className="w-3.5 h-3.5 inline mr-2" />}
              {t}
            </button>
          ))}
        </div>

        {tab === "threats" && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-500">
                <tr><th className="px-5 py-3 text-left">Type</th><th className="px-5 py-3 text-left">Source</th><th className="px-5 py-3 text-left">Target</th><th className="px-5 py-3 text-left">Severity</th><th className="px-5 py-3 text-left">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {threats.map(t => (
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
        )}

        {tab === "incidents" && (
          <div className="space-y-3">
            {incidents.map(inc => (
              <div key={inc.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={inc.severity} />
                    <h3 className="font-bold text-sm">{inc.title}</h3>
                  </div>
                  <StatusBadge status={inc.status} />
                </div>
                <p className="text-gray-400 text-sm mb-3">{inc.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Platform: <span className="text-gray-300">{inc.platform}</span></span>
                  <span>Assignee: <span className="text-cyan-400">{inc.assignee}</span></span>
                  <span>Resolved: <span className={inc.resolved ? "text-emerald-400" : "text-yellow-400"}>{inc.resolved ? "Yes" : "No"}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "scans" && (
          <div className="grid grid-cols-2 gap-4">
            {scans.map(scan => (
              <div key={scan.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
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
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
