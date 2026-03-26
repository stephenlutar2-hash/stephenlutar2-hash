import { motion } from "framer-motion";
import { FileText, Clock, Users, CheckCircle2, AlertTriangle, TrendingUp, Brain, Target, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const timelineData = [
  { phase: "Detection", duration: 2, target: 5 },
  { phase: "Triage", duration: 8, target: 10 },
  { phase: "Containment", duration: 15, target: 15 },
  { phase: "Eradication", duration: 45, target: 30 },
  { phase: "Recovery", duration: 22, target: 20 },
  { phase: "Post-Incident", duration: 120, target: 60 },
];

const incidents = [
  {
    id: "INC-2026-042", title: "Credential Stuffing Campaign — Auth Gateway", date: "2026-03-25", severity: "P1",
    timeline: [
      { time: "02:14 UTC", event: "StormBreaker botnet detected — 4,247 credential pairs", actor: "Rosie Behavioral Engine" },
      { time: "02:14 UTC", event: "Automated rate limiting activated — all attempts blocked", actor: "WAF / Edge Security" },
      { time: "02:16 UTC", event: "SOC alert triggered — Tier 1 analyst assigned", actor: "Alert Pipeline" },
      { time: "02:22 UTC", event: "Threat classification confirmed — known botnet infrastructure", actor: "Threat Intel Integration" },
      { time: "02:30 UTC", event: "IP ranges added to permanent block list", actor: "SOC Analyst (Maria Chen)" },
      { time: "02:45 UTC", event: "All-clear — no successful authentications confirmed", actor: "SOC Lead (James Wilson)" },
    ],
    metrics: { detectionTime: "< 1 min", responseTime: "16 min", containmentTime: "2 min (automated)", impactedUsers: 0, falsePositiveRate: "0%" },
    lessons: [
      "Automated blocking performed as designed — zero credential compromises",
      "Detection-to-block time of < 1 minute demonstrates effective behavioral analysis integration",
      "Recommendation: Implement credential breach database lookup for proactive password resets",
    ],
    grade: "A",
  },
  {
    id: "INC-2026-038", title: "SQL Injection Scanning — Vessels Fleet API", date: "2026-03-24", severity: "P2",
    timeline: [
      { time: "18:42 UTC", event: "sqlmap v1.7 scanning detected on 12 API endpoints", actor: "WAF Detection" },
      { time: "18:42 UTC", event: "All 342 injection payloads blocked at WAF layer", actor: "Web Application Firewall" },
      { time: "18:48 UTC", event: "Automated alert — SOC Tier 1 notified", actor: "Alert Pipeline" },
      { time: "19:05 UTC", event: "API endpoint audit completed — all queries parameterized", actor: "SOC Analyst (Alex Rivera)" },
      { time: "19:15 UTC", event: "Incident closed — no database interaction occurred", actor: "SOC Lead" },
    ],
    metrics: { detectionTime: "Instant", responseTime: "6 min", containmentTime: "Instant (WAF)", impactedUsers: 0, falsePositiveRate: "0%" },
    lessons: [
      "WAF rules effectively blocked all injection attempts — no manual intervention required",
      "sqlmap user-agent fingerprinting provides early attack tool identification",
      "Recommendation: Add Vessels API to quarterly penetration testing scope",
    ],
    grade: "A+",
  },
];

const gradeColor = (g: string) => g.startsWith("A") ? "text-emerald-400 bg-emerald-500/10" : g.startsWith("B") ? "text-cyan-400 bg-cyan-500/10" : "text-amber-400 bg-amber-500/10";

export default function AfterAction() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Post-Incident Intelligence</p>
          <h1 className="text-3xl font-bold tracking-tight">After-Action Intelligence</h1>
          <p className="text-gray-400 text-sm mt-1">Automated post-incident reports with timeline reconstruction, metrics analysis, and lessons learned</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" /> Response Phase Duration (minutes) — Last Incident</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="phase" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} unit="m" />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: 11 }} />
                <Bar dataKey="duration" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Actual" />
                <Bar dataKey="target" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          {incidents.map((inc, idx) => (
            <motion.div key={inc.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="rounded-xl border border-white/5 overflow-hidden">
              <div className="p-5 bg-white/[0.02]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-cyan-400">{inc.id}</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${inc.severity === "P1" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>{inc.severity}</span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded ${gradeColor(inc.grade)}`}>Grade: {inc.grade}</span>
                    </div>
                    <h4 className="text-lg font-semibold">{inc.title}</h4>
                    <p className="text-xs text-gray-500">{inc.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                  {Object.entries(inc.metrics).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-sm font-bold text-white">{v}</p>
                      <p className="text-[9px] text-gray-500 uppercase">{k.replace(/([A-Z])/g, " $1").trim()}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-5">
                  <h5 className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Incident Timeline</h5>
                  <div className="space-y-2">
                    {inc.timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-[10px] font-mono text-cyan-400 w-20 shrink-0 pt-0.5">{t.time}</span>
                        <div className="flex-1">
                          <p className="text-gray-300">{t.event}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{t.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Brain className="w-3 h-3 text-emerald-400" /> Lessons & Recommendations</h5>
                  <ul className="space-y-1.5">
                    {inc.lessons.map((l, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
