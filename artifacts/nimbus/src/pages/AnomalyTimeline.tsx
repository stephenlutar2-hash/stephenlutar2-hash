import { useMemo } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ZAxis } from "recharts";
import { Zap, AlertTriangle, Eye, Brain } from "lucide-react";

const ANOMALIES = [
  { id: 1, time: "03:14", day: 1, severity: 0.92, type: "spike", description: "Unusual latency spike in prediction pipeline", source: "API Gateway", aiConfidence: 0.95 },
  { id: 2, time: "07:22", day: 3, severity: 0.78, type: "drift", description: "Feature distribution drift detected in input data", source: "Data Pipeline", aiConfidence: 0.88 },
  { id: 3, time: "11:45", day: 5, severity: 0.65, type: "volume", description: "Prediction volume 3x above baseline", source: "Inference Engine", aiConfidence: 0.72 },
  { id: 4, time: "14:30", day: 7, severity: 0.88, type: "error", description: "Model timeout rate exceeded threshold", source: "Model Server", aiConfidence: 0.91 },
  { id: 5, time: "09:15", day: 9, severity: 0.45, type: "pattern", description: "Cyclic pattern deviation in confidence scores", source: "Post-Processor", aiConfidence: 0.67 },
  { id: 6, time: "16:50", day: 11, severity: 0.95, type: "spike", description: "Critical: prediction accuracy dropped below SLA", source: "Model v2.3", aiConfidence: 0.98 },
  { id: 7, time: "02:30", day: 13, severity: 0.72, type: "drift", description: "Label drift detected in feedback loop", source: "Training Pipeline", aiConfidence: 0.84 },
  { id: 8, time: "20:10", day: 15, severity: 0.55, type: "volume", description: "Batch inference queue growing unexpectedly", source: "Queue Manager", aiConfidence: 0.69 },
  { id: 9, time: "08:45", day: 18, severity: 0.82, type: "error", description: "GPU memory pressure during ensemble inference", source: "GPU Cluster", aiConfidence: 0.90 },
  { id: 10, time: "13:20", day: 20, severity: 0.68, type: "pattern", description: "Prediction bias shift in demographic segment", source: "Fairness Monitor", aiConfidence: 0.76 },
];

const typeColors: Record<string, string> = {
  spike: "#ef4444",
  drift: "#f59e0b",
  volume: "#3b82f6",
  error: "#ec4899",
  pattern: "#8b5cf6",
};

export default function AnomalyTimeline() {
  const scatterData = ANOMALIES.map(a => ({
    day: a.day,
    severity: a.severity,
    size: a.severity * 100,
    type: a.type,
    description: a.description,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Zap className="w-6 h-6 text-amber-400" />
          Anomaly Detection Timeline
        </h2>
        <p className="text-sm text-muted-foreground mt-1">AI-highlighted unusual patterns over time</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {Object.entries(typeColors).map(([type, color], i) => (
          <motion.div key={type} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="p-3 rounded-xl border border-white/[0.06] backdrop-blur-md text-center"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
            <div className="w-3 h-3 rounded-full mx-auto mb-1.5" style={{ background: color }} />
            <p className="text-[10px] text-muted-foreground uppercase">{type}</p>
            <p className="text-lg font-display font-bold text-white">{ANOMALIES.filter(a => a.type === type).length}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6 border border-white/[0.06] backdrop-blur-md"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
        <h3 className="font-display font-bold text-white mb-4">Anomaly Severity Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" name="Day" stroke="#64748b" fontSize={10} label={{ value: "Day", position: "bottom", fill: "#64748b", fontSize: 10 }} />
              <YAxis dataKey="severity" name="Severity" stroke="#64748b" fontSize={10} domain={[0, 1]} />
              <ZAxis dataKey="size" range={[30, 200]} />
              <Tooltip contentStyle={{ background: "rgba(6,6,18,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number, name: string) => [name === "Severity" ? v.toFixed(2) : v, name]} />
              <Scatter data={scatterData} animationDuration={1200}>
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={typeColors[entry.type] || "#64748b"} fillOpacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="space-y-3">
        <h3 className="font-display font-bold text-white flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-400" /> Detected Anomalies
        </h3>
        {ANOMALIES.sort((a, b) => b.severity - a.severity).map((anomaly, i) => (
          <motion.div
            key={anomaly.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="p-4 rounded-xl border border-white/[0.06] hover:bg-white/[0.03] transition-colors backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-1">
                <div className="w-3 h-3 rounded-full" style={{ background: typeColors[anomaly.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{anomaly.description}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>Day {anomaly.day} · {anomaly.time}</span>
                  <span className="uppercase px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03]">{anomaly.type}</span>
                  <span>{anomaly.source}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-sm font-mono font-bold ${anomaly.severity >= 0.8 ? "text-red-400" : anomaly.severity >= 0.6 ? "text-amber-400" : "text-cyan-400"}`}>
                  {(anomaly.severity * 100).toFixed(0)}%
                </p>
                <p className="text-[9px] text-muted-foreground">severity</p>
                <div className="flex items-center gap-1 mt-1">
                  <Eye className="w-3 h-3 text-violet-400" />
                  <span className="text-[9px] text-violet-400 font-mono">{(anomaly.aiConfidence * 100).toFixed(0)}% AI</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
