import { motion } from "framer-motion";
import { Brain, Layers, TrendingUp, Activity, Zap, BarChart3, CheckCircle2, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const models = [
  { name: "NimbusNet v3", type: "Transformer", accuracy: 94.2, latency: 340, weight: 0.35, status: "active" },
  { name: "WeatherGPT-L", type: "Foundation Model", accuracy: 91.8, latency: 520, weight: 0.25, status: "active" },
  { name: "ConvLSTM-Maritime", type: "CNN-LSTM Hybrid", accuracy: 89.4, latency: 180, weight: 0.20, status: "active" },
  { name: "GFS-ML Bridge", type: "Statistical + ML", accuracy: 87.1, latency: 120, weight: 0.15, status: "active" },
  { name: "EnsembleAggregator", type: "Meta-Learner", accuracy: 96.8, latency: 45, weight: 0.05, status: "active" },
];

const performanceByRegion = [
  { region: "N. Atlantic", NimbusNet: 95, WeatherGPT: 93, ConvLSTM: 88, Ensemble: 97 },
  { region: "S. China Sea", NimbusNet: 92, WeatherGPT: 90, ConvLSTM: 91, Ensemble: 96 },
  { region: "Mediterranean", NimbusNet: 96, WeatherGPT: 94, ConvLSTM: 87, Ensemble: 98 },
  { region: "Arabian Sea", NimbusNet: 91, WeatherGPT: 89, ConvLSTM: 86, Ensemble: 95 },
  { region: "Gulf of Mexico", NimbusNet: 93, WeatherGPT: 92, ConvLSTM: 89, Ensemble: 96 },
];

const radarData = [
  { metric: "Accuracy", value: 96.8 },
  { metric: "Speed", value: 88 },
  { metric: "Consistency", value: 94 },
  { metric: "Coverage", value: 91 },
  { metric: "Reliability", value: 97 },
  { metric: "Explainability", value: 82 },
];

const auditTrail = [
  { id: 1, timestamp: "2026-03-25T14:30:00Z", prediction: "Tropical storm development — S. China Sea", outcome: "Confirmed", confidence: 87, models: "NimbusNet (high), WeatherGPT (high), ConvLSTM (medium)", ensembleDecision: "Tropical depression upgraded to storm classification at 14:00 UTC. Ensemble correctly predicted intensification 18 hours ahead of GFS. All three primary models agreed on trajectory — ConvLSTM showed lower confidence due to limited historical analogues in this basin." },
  { id: 2, timestamp: "2026-03-24T06:00:00Z", prediction: "Clear conditions — Mediterranean (48h)", outcome: "Correct", confidence: 96, models: "NimbusNet (very high), WeatherGPT (very high), ConvLSTM (high)", ensembleDecision: "High-confidence consensus across all models. Ensemble weight adjusted to favor NimbusNet based on Mediterranean regional performance advantage (+3% accuracy in this basin)." },
  { id: 3, timestamp: "2026-03-23T10:15:00Z", prediction: "Heavy precipitation — Gulf of Mexico (72h)", outcome: "Partially correct", confidence: 71, models: "NimbusNet (medium), WeatherGPT (low), ConvLSTM (medium)", ensembleDecision: "Disagreement between models. NimbusNet and ConvLSTM predicted 40-60mm; WeatherGPT predicted 15-25mm. Ensemble hedged toward moderate precipitation. Actual: 35mm — closer to NimbusNet/ConvLSTM prediction. Ensemble weighting for WeatherGPT in Gulf region reduced by 5%." },
];

export default function EnsembleStudio() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Multi-Model Prediction Engine</p>
        <h1 className="text-2xl font-bold tracking-tight">Ensemble Studio</h1>
        <p className="text-muted-foreground text-sm mt-1">Multi-model prediction ensemble with dynamic weighting and performance audit trail</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ensemble Accuracy", value: "96.8%", icon: Brain, color: "text-emerald-400" },
          { label: "Active Models", value: "5", icon: Layers, color: "text-cyan-400" },
          { label: "Avg Latency", value: "241ms", icon: Zap, color: "text-amber-400" },
          { label: "Predictions (24h)", value: "14,847", icon: Activity, color: "text-purple-400" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Model Accuracy by Region (%)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceByRegion}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="region" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis domain={[80, 100]} stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "8px", fontSize: 11 }} />
                <Bar dataKey="NimbusNet" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                <Bar dataKey="WeatherGPT" fill="#a78bfa" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ConvLSTM" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Ensemble" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Ensemble Quality</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} />
                <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-cyan-400" /> Model Registry</h3>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-card border-b border-border">
              <tr className="text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="px-5 py-3">Model</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Accuracy</th><th className="px-5 py-3">Latency</th><th className="px-5 py-3">Weight</th><th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {models.map(m => (
                <tr key={m.name} className="hover:bg-card/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-semibold">{m.name}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{m.type}</td>
                  <td className="px-5 py-3 text-sm font-mono text-emerald-400">{m.accuracy}%</td>
                  <td className="px-5 py-3 text-sm font-mono">{m.latency}ms</td>
                  <td className="px-5 py-3 text-sm font-mono text-cyan-400">{(m.weight * 100).toFixed(0)}%</td>
                  <td className="px-5 py-3"><span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-amber-400" /> Prediction Audit Trail</h3>
        <div className="space-y-3">
          {auditTrail.map((a, idx) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + idx * 0.06 }} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold">{a.prediction}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()} · {a.confidence}% confidence</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${a.outcome === "Correct" || a.outcome === "Confirmed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{a.outcome}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Models: {a.models}</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{a.ensembleDecision}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
