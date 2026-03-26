import { motion } from "framer-motion";
import {
  Radio, AlertTriangle, Fuel, Navigation, Gauge, TrendingUp,
  TrendingDown, Clock, Ship, Activity
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const fuelData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  mvPacific: 12.4 + Math.sin(i * 0.5) * 1.2 + (i > 16 ? 3.8 : 0),
  mvCoral: 9.8 + Math.cos(i * 0.3) * 0.8,
  mvJade: 11.2 + Math.sin(i * 0.7) * 1.0,
  baseline: 12.0,
}));

const speedData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  mvPacific: 14.2 + Math.sin(i * 0.4) * 0.5 - (i > 18 ? 2.1 : 0),
  mvCoral: 12.8 + Math.cos(i * 0.6) * 0.3,
  mvJade: 13.5 + Math.sin(i * 0.5) * 0.4,
}));

const anomalies = [
  { id: 1, vessel: "MV Pacific Horizon", type: "Fuel Consumption Spike", severity: "high", confidence: 94, detected: "2026-03-25T16:42:00Z", baseline: "12.4 MT/day", actual: "16.2 MT/day", deviation: "+30.6%", narrative: "Fuel consumption spiked 30.6% above baseline at 16:42 UTC. Correlates with 2.1kn speed reduction suggesting hull fouling or adverse current encounter. No engine room alerts detected — recommend hull inspection at next port call." },
  { id: 2, vessel: "MV Coral Seas", type: "Route Deviation Detected", severity: "medium", confidence: 87, detected: "2026-03-25T09:15:00Z", baseline: "Great Circle Route", actual: "12nm deviation to starboard", deviation: "12nm off course", narrative: "Vessel deviated 12 nautical miles from optimal route. Weather analysis shows localized storm avoidance pattern — deviation consistent with safety protocols. Expected return to course by 14:00 UTC." },
  { id: 3, vessel: "MV Jade Venture", type: "Speed Anomaly — Below Charter Minimum", severity: "medium", confidence: 91, detected: "2026-03-25T06:30:00Z", baseline: "13.5 kn charter min", actual: "11.8 kn average (last 6h)", deviation: "-12.6%", narrative: "Average speed over last 6 hours dropped below charter party minimum of 13.5 knots. Contributing factors: CII optimization mode active, reduced speed to maintain C-rating compliance. Charter clause §8.3 weather exclusion may apply." },
  { id: 4, vessel: "MV Pacific Horizon", type: "Auxiliary Engine Power Fluctuation", severity: "low", confidence: 76, detected: "2026-03-24T22:10:00Z", baseline: "850 kW steady", actual: "720-920 kW oscillating", deviation: "±12%", narrative: "Auxiliary engine power output showing 12% oscillation around baseline. Pattern consistent with variable load from HVAC cycling in tropical conditions. Monitoring — escalation if sustained beyond 48 hours." },
];

const fleetHealth = [
  { vessel: "MV Pacific Horizon", fuel: "warning", route: "healthy", speed: "healthy", engine: "warning", overall: 78 },
  { vessel: "MV Coral Seas", fuel: "healthy", route: "warning", speed: "healthy", engine: "healthy", overall: 88 },
  { vessel: "MV Jade Venture", fuel: "healthy", route: "healthy", speed: "warning", engine: "healthy", overall: 84 },
];

const healthDot = (s: string) => s === "healthy" ? "bg-emerald-400" : s === "warning" ? "bg-amber-400" : "bg-red-400";

export default function SignalIntelligence() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Real-Time Signal Analysis & Anomaly Detection</p>
          <h2 className="text-2xl md:text-3xl font-display font-bold tracking-wide">Signal Intelligence</h2>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 bg-white/[0.03] px-3 py-1.5 rounded border border-white/5">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          LIVE TELEMETRY
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fleetHealth.map(v => (
          <div key={v.vessel} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">{v.vessel}</span>
              </div>
              <span className={`text-sm font-bold font-mono ${v.overall >= 85 ? "text-emerald-400" : v.overall >= 70 ? "text-amber-400" : "text-red-400"}`}>{v.overall}%</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[{ k: "Fuel", v: v.fuel }, { k: "Route", v: v.route }, { k: "Speed", v: v.speed }, { k: "Engine", v: v.engine }].map(s => (
                <div key={s.k} className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${healthDot(s.v)}`} />
                  <span className="text-[9px] text-gray-500">{s.k}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <Fuel className="w-4 h-4 text-amber-400" /> Fuel Consumption (24h)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} unit=" MT" />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", fontSize: 11 }} />
                <ReferenceLine y={12} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Baseline", fontSize: 9, fill: "#ef4444" }} />
                <Line type="monotone" dataKey="mvPacific" stroke="#06b6d4" strokeWidth={2} dot={false} name="MV Pacific" />
                <Line type="monotone" dataKey="mvCoral" stroke="#10b981" strokeWidth={1.5} dot={false} name="MV Coral" />
                <Line type="monotone" dataKey="mvJade" stroke="#a78bfa" strokeWidth={1.5} dot={false} name="MV Jade" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" /> Speed Profile (24h)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} unit=" kn" />
                <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", fontSize: 11 }} />
                <Line type="monotone" dataKey="mvPacific" stroke="#06b6d4" strokeWidth={2} dot={false} name="MV Pacific" />
                <Line type="monotone" dataKey="mvCoral" stroke="#10b981" strokeWidth={1.5} dot={false} name="MV Coral" />
                <Line type="monotone" dataKey="mvJade" stroke="#a78bfa" strokeWidth={1.5} dot={false} name="MV Jade" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Detected Anomalies
        </h3>
        <div className="space-y-3">
          {anomalies.map(a => (
            <div key={a.id} className={`p-4 rounded-lg border ${a.severity === "high" ? "border-red-500/20 bg-red-500/5" : a.severity === "medium" ? "border-amber-500/20 bg-amber-500/5" : "border-white/5 bg-white/[0.01]"}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${a.severity === "high" ? "bg-red-500/20 text-red-400" : a.severity === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-gray-500/20 text-gray-400"}`}>{a.severity}</span>
                  <span className="text-xs text-white font-semibold">{a.type}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500">
                  <span>{a.confidence}% confidence</span>
                  <span>{new Date(a.detected).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                <Ship className="w-3 h-3" /> {a.vessel}
                <span className="text-gray-600">·</span>
                <span>Baseline: {a.baseline}</span>
                <span className="text-gray-600">·</span>
                <span>Actual: {a.actual}</span>
                <span className={`font-mono font-bold ${a.severity === "high" ? "text-red-400" : "text-amber-400"}`}>{a.deviation}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{a.narrative}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
