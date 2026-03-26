import { useMemo } from "react";
import { motion } from "framer-motion";
import { useExperiments, useIncaProjects } from "@/hooks/use-inca";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid } from "recharts";
import { SlidersHorizontal, Sigma } from "lucide-react";

function generateHyperparams(expId: number) {
  const seed = expId * 7;
  return {
    learningRate: parseFloat((0.0001 + Math.sin(seed) * 0.0005 + Math.random() * 0.001).toFixed(5)),
    batchSize: [16, 32, 64, 128, 256][Math.abs(seed) % 5],
    dropout: parseFloat((0.1 + Math.sin(seed * 3) * 0.15 + Math.random() * 0.1).toFixed(2)),
    hiddenLayers: [2, 3, 4, 5, 6][Math.abs(seed * 2) % 5],
    epochs: [50, 100, 150, 200, 300][Math.abs(seed * 3) % 5],
    optimizer: ["Adam", "SGD", "AdamW", "RMSprop"][Math.abs(seed) % 4],
  };
}

const PARAM_LABELS: Record<string, string> = {
  learningRate: "Learning Rate",
  batchSize: "Batch Size",
  dropout: "Dropout",
  hiddenLayers: "Hidden Layers",
  epochs: "Epochs",
};

export default function HyperparameterChart() {
  const { data: experiments } = useExperiments();
  const { data: projects } = useIncaProjects();

  const scatterData = useMemo(() => {
    if (!experiments) return [];
    return experiments.map(e => {
      const hp = generateHyperparams(e.id);
      return {
        name: e.name,
        accuracy: Number(e.accuracy),
        learningRate: hp.learningRate,
        batchSize: hp.batchSize,
        dropout: hp.dropout,
        hiddenLayers: hp.hiddenLayers,
        epochs: hp.epochs,
        optimizer: hp.optimizer,
        status: e.status,
      };
    });
  }, [experiments]);

  const parallelData = useMemo(() => {
    if (!experiments) return [];
    return experiments.slice(0, 15).map(e => {
      const hp = generateHyperparams(e.id);
      return { id: e.id, name: e.name, accuracy: Number(e.accuracy), ...hp };
    });
  }, [experiments]);

  const params = Object.keys(PARAM_LABELS);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <SlidersHorizontal className="w-6 h-6 text-violet" />
          Hyperparameter Analysis
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Parameter combinations and their impact on model outcomes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-xl p-6 border border-white/[0.06]"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <h3 className="font-display font-bold text-white mb-4">Learning Rate vs Accuracy</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="learningRate" name="Learning Rate" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="accuracy" name="Accuracy" stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <ZAxis dataKey="batchSize" range={[40, 200]} name="Batch Size" />
                <Tooltip
                  contentStyle={{ background: "rgba(15,15,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                  formatter={(value: number, name: string) => [name === "Accuracy" ? `${value}%` : value, name]}
                />
                <Scatter data={scatterData} fill="#06b6d4" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-xl p-6 border border-white/[0.06]"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <h3 className="font-display font-bold text-white mb-4">Dropout vs Accuracy</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="dropout" name="Dropout" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="accuracy" name="Accuracy" stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <ZAxis dataKey="epochs" range={[40, 200]} name="Epochs" />
                <Tooltip contentStyle={{ background: "rgba(15,15,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Scatter data={scatterData} fill="#8b5cf6" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-xl p-6 border border-white/[0.06]"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sigma className="w-4 h-4 text-cyan" />
          <h3 className="font-display font-bold text-white">Parallel Coordinates</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <svg viewBox="0 0 800 300" className="w-full h-auto">
              {params.map((param, pi) => {
                const x = 60 + pi * (680 / (params.length - 1));
                return (
                  <g key={param}>
                    <line x1={x} y1={30} x2={x} y2={260} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                    <text x={x} y={20} textAnchor="middle" fill="#64748b" fontSize={10}>{PARAM_LABELS[param]}</text>
                    <text x={x} y={278} textAnchor="middle" fill="#475569" fontSize={8}>
                      {param === "learningRate" ? "0.0001" : param === "batchSize" ? "16" : param === "dropout" ? "0.0" : param === "hiddenLayers" ? "2" : "50"}
                    </text>
                    <text x={x} y={28} textAnchor="middle" fill="#475569" fontSize={8}>
                      {param === "learningRate" ? "0.002" : param === "batchSize" ? "256" : param === "dropout" ? "0.5" : param === "hiddenLayers" ? "6" : "300"}
                    </text>
                  </g>
                );
              })}
              <line x1={760} y1={30} x2={760} y2={260} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <text x={760} y={20} textAnchor="middle" fill="#64748b" fontSize={10}>Accuracy</text>
              {parallelData.map((d, di) => {
                const getY = (param: string) => {
                  const ranges: Record<string, [number, number]> = {
                    learningRate: [0.0001, 0.002],
                    batchSize: [16, 256],
                    dropout: [0, 0.5],
                    hiddenLayers: [2, 6],
                    epochs: [50, 300],
                  };
                  const [min, max] = ranges[param] || [0, 100];
                  const val = d[param as keyof typeof d] as number;
                  return 260 - ((val - min) / (max - min)) * 230;
                };
                const accY = 260 - ((d.accuracy) / 100) * 230;
                const points = params.map((param, pi) => {
                  const x = 60 + pi * (680 / (params.length - 1));
                  return `${x},${getY(param)}`;
                });
                points.push(`760,${accY}`);
                const hue = d.accuracy >= 85 ? "#10b981" : d.accuracy >= 70 ? "#06b6d4" : d.accuracy >= 50 ? "#f59e0b" : "#ef4444";
                return (
                  <motion.polyline
                    key={d.id}
                    points={points.join(" ")}
                    fill="none"
                    stroke={hue}
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: di * 0.05 }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
