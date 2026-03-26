import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area, Legend
} from "recharts";
import { TrendingDown, AlertTriangle, Target } from "lucide-react";

export default function PredictionDrift() {
  const driftData = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      day: `Day ${i + 1}`,
      accuracy: parseFloat((95 - i * 0.3 - Math.sin(i * 0.5) * 2 + Math.random() * 1.5).toFixed(1)),
      precision: parseFloat((93 - i * 0.25 - Math.sin(i * 0.4 + 1) * 1.5 + Math.random() * 1.2).toFixed(1)),
      recall: parseFloat((91 - i * 0.35 - Math.sin(i * 0.6 + 2) * 2 + Math.random() * 1.8).toFixed(1)),
      threshold: 85,
    }))
  , []);

  const modelDrift = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      week: `W${i + 1}`,
      featureDrift: parseFloat((0.02 + i * 0.008 + Math.sin(i * 0.7) * 0.01 + Math.random() * 0.005).toFixed(4)),
      conceptDrift: parseFloat((0.01 + i * 0.005 + Math.sin(i * 0.5 + 1) * 0.008 + Math.random() * 0.003).toFixed(4)),
      alertThreshold: 0.15,
    }))
  , []);

  const latestAccuracy = driftData[driftData.length - 1]?.accuracy || 0;
  const driftRate = ((driftData[0]?.accuracy || 95) - latestAccuracy).toFixed(1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <TrendingDown className="w-6 h-6 text-amber-400" />
          Prediction Accuracy Drift
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Model performance degradation over time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Current Accuracy", value: `${latestAccuracy}%`, color: latestAccuracy >= 90 ? "text-emerald-400" : latestAccuracy >= 85 ? "text-amber-400" : "text-red-400" },
          { label: "Drift Rate", value: `-${driftRate}%`, color: "text-amber-400" },
          { label: "Days Since Retrain", value: "30", color: "text-cyan-400" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl border border-white/[0.06] backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
            <p className={`text-2xl font-display font-bold ${m.color}`}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6 border border-white/[0.06] backdrop-blur-md"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" /> Performance Metrics Over Time
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={driftData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={9} interval={4} />
              <YAxis stroke="#64748b" fontSize={10} domain={[70, 100]} />
              <Tooltip contentStyle={{ background: "rgba(6,6,18,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Threshold", position: "right", fill: "#ef4444", fontSize: 10 }} />
              <Line type="monotone" dataKey="accuracy" stroke="#22d3ee" strokeWidth={2} dot={false} name="Accuracy" />
              <Line type="monotone" dataKey="precision" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Precision" />
              <Line type="monotone" dataKey="recall" stroke="#10b981" strokeWidth={2} dot={false} name="Recall" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl p-6 border border-white/[0.06] backdrop-blur-md"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Feature & Concept Drift
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={modelDrift}>
              <defs>
                <linearGradient id="featureDriftGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="conceptDriftGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(6,6,18,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0.15} stroke="#ef4444" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="featureDrift" stroke="#f59e0b" fill="url(#featureDriftGrad)" strokeWidth={2} name="Feature Drift" />
              <Area type="monotone" dataKey="conceptDrift" stroke="#ef4444" fill="url(#conceptDriftGrad)" strokeWidth={2} name="Concept Drift" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
