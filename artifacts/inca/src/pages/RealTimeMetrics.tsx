import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useExperiments } from "@/hooks/use-inca";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { Activity, Cpu, Zap, Timer, TrendingUp } from "lucide-react";

function useLiveData(seed: number, interval = 2000) {
  const [data, setData] = useState<{ time: string; value: number }[]>([]);
  useEffect(() => {
    const initial = Array.from({ length: 30 }, (_, i) => ({
      time: `${30 - i}s`,
      value: parseFloat((0.5 + Math.sin(seed + i * 0.3) * 0.3 + Math.random() * 0.1).toFixed(3)),
    }));
    setData(initial);
    const timer = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1]?.value || 0.5;
        const next = parseFloat(Math.max(0, Math.min(1, last + (Math.random() - 0.48) * 0.05)).toFixed(3));
        return [...prev.slice(1), { time: "now", value: next }];
      });
    }, interval);
    return () => clearInterval(timer);
  }, [seed, interval]);
  return data;
}

function LiveSparkline({ data, color, label, value, unit }: {
  data: { time: string; value: number }[];
  color: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-5 border border-white/[0.06] relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-display font-bold text-white">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="h-16 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`live-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#live-${label})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default function RealTimeMetrics() {
  const { data: experiments } = useExperiments();
  const runningExps = experiments?.filter(e => e.status === "running") || [];

  const accuracyData = useLiveData(1, 1500);
  const lossData = useLiveData(2, 1800);
  const validationData = useLiveData(3, 2000);
  const learningRateData = useLiveData(4, 2500);

  const latestAccuracy = accuracyData[accuracyData.length - 1]?.value || 0;
  const latestLoss = lossData[lossData.length - 1]?.value || 0;
  const latestValidation = validationData[validationData.length - 1]?.value || 0;

  const [epochData, setEpochData] = useState<{ epoch: number; train: number; val: number; loss: number }[]>([]);
  useEffect(() => {
    const initial = Array.from({ length: 50 }, (_, i) => ({
      epoch: i + 1,
      train: parseFloat((0.3 + (1 - Math.exp(-i * 0.08)) * 0.65 + Math.sin(i * 0.5) * 0.02).toFixed(3)),
      val: parseFloat((0.28 + (1 - Math.exp(-i * 0.07)) * 0.6 + Math.sin(i * 0.4) * 0.03).toFixed(3)),
      loss: parseFloat((2.0 * Math.exp(-i * 0.06) + 0.1 + Math.sin(i * 0.3) * 0.02).toFixed(3)),
    }));
    setEpochData(initial);
    const timer = setInterval(() => {
      setEpochData(prev => {
        const last = prev[prev.length - 1];
        return [...prev, {
          epoch: last.epoch + 1,
          train: parseFloat(Math.min(0.99, last.train + (Math.random() - 0.3) * 0.005).toFixed(3)),
          val: parseFloat(Math.min(0.98, last.val + (Math.random() - 0.35) * 0.005).toFixed(3)),
          loss: parseFloat(Math.max(0.01, last.loss - Math.random() * 0.003).toFixed(3)),
        }].slice(-80);
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald" />
            Real-Time Training Metrics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Live-updating model training telemetry</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
          <motion.div
            className="w-2 h-2 rounded-full bg-emerald"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-mono text-emerald">STREAMING</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LiveSparkline data={accuracyData} color="#06b6d4" label="Training Accuracy" value={(latestAccuracy * 100).toFixed(1)} unit="%" />
        <LiveSparkline data={lossData} color="#ef4444" label="Loss" value={latestLoss.toFixed(4)} unit="" />
        <LiveSparkline data={validationData} color="#8b5cf6" label="Validation Score" value={(latestValidation * 100).toFixed(1)} unit="%" />
        <LiveSparkline data={learningRateData} color="#f59e0b" label="Learning Rate" value={(learningRateData[learningRateData.length - 1]?.value || 0).toFixed(4)} unit="" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-xl p-6 border border-white/[0.06]"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan" />
            <h3 className="font-display font-bold text-white">Training vs Validation</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={epochData.slice(-40)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 1]} />
                <Tooltip contentStyle={{ background: "rgba(15,15,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="train" stroke="#06b6d4" strokeWidth={2} dot={false} name="Training" isAnimationActive={false} />
                <Line type="monotone" dataKey="val" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Validation" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-xl p-6 border border-white/[0.06]"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-bold text-white">Loss Convergence</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={epochData.slice(-40)}>
                <defs>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ background: "rgba(15,15,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="loss" stroke="#ef4444" fill="url(#lossGrad)" strokeWidth={2} dot={false} name="Loss" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel rounded-xl p-6 border border-white/[0.06]"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-4 h-4 text-violet" />
          <h3 className="font-display font-bold text-white">Active Training Jobs</h3>
        </div>
        {runningExps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {runningExps.map((exp, i) => (
              <div key={exp.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{exp.name}</span>
                  <motion.div
                    className="w-2 h-2 rounded-full bg-amber-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Accuracy: <span className="text-cyan font-mono">{exp.accuracy}%</span></span>
                  <span>Epoch: <span className="text-white font-mono">{15 + i * 3}</span></span>
                </div>
                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-violet"
                    initial={{ width: "30%" }}
                    animate={{ width: `${50 + i * 15}%` }}
                    transition={{ duration: 2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Cpu className="w-8 h-8 mx-auto mb-2 opacity-20" />
            No active training jobs
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
