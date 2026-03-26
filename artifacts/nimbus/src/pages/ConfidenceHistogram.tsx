import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend } from "recharts";
import { BarChart3, Target, TrendingUp } from "lucide-react";

export default function ConfidenceHistogram() {
  const histogramData = useMemo(() => {
    const bins = Array.from({ length: 20 }, (_, i) => {
      const lower = i * 5;
      const upper = lower + 5;
      const count = Math.round(
        i < 4 ? 2 + Math.random() * 3 :
        i < 8 ? 5 + Math.random() * 8 :
        i < 12 ? 15 + Math.random() * 20 :
        i < 16 ? 30 + Math.random() * 25 :
        40 + Math.random() * 35
      );
      return { range: `${lower}-${upper}%`, count, bin: lower + 2.5 };
    });
    return bins;
  }, []);

  const totalPredictions = histogramData.reduce((s, d) => s + d.count, 0);
  const highConfidence = histogramData.filter(d => d.bin >= 80).reduce((s, d) => s + d.count, 0);
  const lowConfidence = histogramData.filter(d => d.bin < 50).reduce((s, d) => s + d.count, 0);
  const avgConfidence = (histogramData.reduce((s, d) => s + d.bin * d.count, 0) / totalPredictions).toFixed(1);

  const backTestData = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      day: `D${i + 1}`,
      predicted: parseFloat((70 + Math.sin(i * 0.3) * 15 + Math.random() * 8).toFixed(1)),
      actual: parseFloat((68 + Math.sin(i * 0.3 + 0.2) * 16 + Math.random() * 10).toFixed(1)),
    }))
  , []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Confidence Distribution
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Histogram of confidence scores across active predictions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Predictions", value: totalPredictions.toString(), color: "text-white" },
          { label: "Avg Confidence", value: `${avgConfidence}%`, color: "text-cyan-400" },
          { label: "High Confidence (≥80%)", value: highConfidence.toString(), color: "text-emerald-400" },
          { label: "Low Confidence (<50%)", value: lowConfidence.toString(), color: "text-amber-400" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl border border-white/[0.06] backdrop-blur-md"
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
          <Target className="w-4 h-4 text-cyan-400" /> Confidence Score Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" stroke="#64748b" fontSize={8} angle={-45} textAnchor="end" height={50} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(6,6,18,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1200}>
                {histogramData.map((entry, i) => (
                  <Cell key={i} fill={entry.bin >= 80 ? "#10b981" : entry.bin >= 60 ? "#06b6d4" : entry.bin >= 40 ? "#f59e0b" : "#ef4444"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl p-6 border border-white/[0.06] backdrop-blur-md"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-400" /> Prediction vs Actual (Backtesting)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={backTestData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={9} interval={4} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ background: "rgba(6,6,18,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Predicted" />
              <Line type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={2} dot={false} name="Actual" strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
