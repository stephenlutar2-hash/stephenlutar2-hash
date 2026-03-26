import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Eye, Globe, Activity, Clock, Brain, Filter, Zap, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const threatData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  blocked: Math.floor(120 + Math.sin(i * 0.5) * 40 + (i >= 2 && i <= 5 ? 80 : 0)),
  detected: Math.floor(15 + Math.cos(i * 0.3) * 8 + (i >= 2 && i <= 5 ? 25 : 0)),
  investigated: Math.floor(3 + Math.random() * 4),
}));

const threatFeed = [
  { id: 1, severity: "critical", type: "Credential Stuffing Campaign", source: "External IP Range 185.220.x.x", detected: "2026-03-25T02:14:00Z", status: "blocked", targets: ["Auth API Gateway", "User Management Service"], iocs: ["185.220.101.42", "185.220.101.87", "185.220.102.11"], ttps: ["T1110.004 — Credential Stuffing", "T1078 — Valid Accounts"], narrative: "Automated credential stuffing campaign detected targeting authentication endpoints. 4,247 unique credential pairs attempted over 3-hour window from Tor exit nodes. All attempts blocked by rate limiting and behavioral analysis. No successful authentications detected. Pattern consistent with known botnet 'StormBreaker' infrastructure." },
  { id: 2, severity: "high", type: "SQL Injection Attempt — Vessels API", source: "45.134.xx.xx (VPN Provider)", detected: "2026-03-24T18:42:00Z", status: "blocked", targets: ["Vessels Fleet API", "vessels-postgres"], iocs: ["45.134.88.92", "User-Agent: sqlmap/1.7"], ttps: ["T1190 — Exploit Public-Facing Application", "T1059.004 — SQL"], narrative: "Automated SQL injection scanning detected against Vessels fleet API endpoints. Attack tool identified as sqlmap v1.7 via user-agent fingerprinting. 342 injection payloads attempted across 12 API endpoints. WAF blocked all attempts — no database interaction occurred. Recommend reviewing parameterized query coverage on Vessels API." },
  { id: 3, severity: "medium", type: "Suspicious Lateral Movement Pattern", source: "Internal — dev-staging-02", detected: "2026-03-24T11:15:00Z", status: "investigating", targets: ["Staging Environment", "Internal API"], iocs: ["dev-staging-02.internal", "Unusual SSH key rotation"], ttps: ["T1021.004 — SSH", "T1098 — Account Manipulation"], narrative: "Unusual SSH connection pattern from staging server dev-staging-02 to 7 internal hosts in 12-minute window. Pattern triggered lateral movement detection rule. Investigation in progress — preliminary analysis suggests automated deployment script misconfiguration rather than compromise. Awaiting confirmation from DevOps team." },
  { id: 4, severity: "low", type: "Reconnaissance — Port Scanning", source: "92.118.xx.xx (Shodan Scanner)", detected: "2026-03-24T06:30:00Z", status: "monitored", targets: ["Edge Network", "Load Balancers"], iocs: ["92.118.160.0/24"], ttps: ["T1595 — Active Scanning"], narrative: "Internet-wide port scanning from known Shodan scanner infrastructure. Routine reconnaissance — no unusual targeting patterns. All non-essential ports properly filtered. Edge firewall performing as expected." },
];

const sevConfig: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  high: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  medium: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  low: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

export default function ThreatIntelFeed() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? threatFeed : threatFeed.filter(t => t.severity === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Real-Time Threat Intelligence</p>
            <h1 className="text-3xl font-bold tracking-tight">Threat Intel Feed</h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 bg-white/[0.03] px-3 py-1.5 rounded border border-white/5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-red-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            LIVE MONITORING
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Threats Blocked (24h)", value: "2,847", icon: Shield, color: "text-emerald-400" },
            { label: "Detected", value: "142", icon: Eye, color: "text-amber-400" },
            { label: "Investigating", value: "3", icon: Target, color: "text-red-400" },
            { label: "Avg Response Time", value: "< 2s", icon: Zap, color: "text-cyan-400" },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-gray-500 uppercase">{m.label}</p>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> Threat Activity (24h)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={threatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: 11 }} />
                <Line type="monotone" dataKey="blocked" stroke="#10b981" strokeWidth={2} dot={false} name="Blocked" />
                <Line type="monotone" dataKey="detected" stroke="#f59e0b" strokeWidth={2} dot={false} name="Detected" />
                <Line type="monotone" dataKey="investigated" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Investigating" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {["all", "critical", "high", "medium", "low"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-white/[0.03] text-gray-500 border border-white/5 hover:text-white"}`}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((t, idx) => {
              const sev = sevConfig[t.severity];
              return (
                <motion.div key={t.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ delay: idx * 0.04 }} layout className={`rounded-xl border ${sev.border} overflow-hidden`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${sev.bg} flex items-center justify-center`}>
                          <AlertTriangle className={`w-5 h-5 ${sev.color}`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{t.type}</h4>
                          <p className="text-xs text-gray-500">{t.source} · {new Date(t.detected).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${sev.bg} ${sev.color}`}>{t.severity}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${t.status === "blocked" ? "bg-emerald-500/10 text-emerald-400" : t.status === "investigating" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>{t.status}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-4">{t.narrative}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div><p className="text-gray-500 uppercase text-[10px] mb-1">Targets</p><div className="space-y-1">{t.targets.map(tg => <span key={tg} className="block font-mono text-gray-400">{tg}</span>)}</div></div>
                      <div><p className="text-gray-500 uppercase text-[10px] mb-1">IOCs</p><div className="space-y-1">{t.iocs.map(ioc => <span key={ioc} className="block font-mono text-red-400/70">{ioc}</span>)}</div></div>
                      <div><p className="text-gray-500 uppercase text-[10px] mb-1">MITRE ATT&CK</p><div className="space-y-1">{t.ttps.map(ttp => <span key={ttp} className="block font-mono text-amber-400/70">{ttp}</span>)}</div></div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
