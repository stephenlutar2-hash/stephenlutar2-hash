import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useExperiments } from "@/hooks/use-inca";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { Cpu, HardDrive, MemoryStick, Gauge } from "lucide-react";

function useLiveResource(base: number, variance: number) {
  const [data, setData] = useState<{ t: string; v: number }[]>([]);
  useEffect(() => {
    const init = Array.from({ length: 30 }, (_, i) => ({
      t: `${30 - i}s`,
      v: parseFloat((base + Math.sin(i * 0.5) * variance + Math.random() * variance * 0.5).toFixed(1)),
    }));
    setData(init);
    const timer = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1]?.v || base;
        const next = parseFloat(Math.max(0, Math.min(100, last + (Math.random() - 0.5) * variance * 0.4)).toFixed(1));
        return [...prev.slice(1), { t: "now", v: next }];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [base, variance]);
  return data;
}

function GaugeCard({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: typeof Cpu }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (value / 100) * circumference * 0.75;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-5 border border-white/[0.06] flex flex-col items-center"
      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
    >
      <div className="relative w-24 h-20">
        <svg viewBox="0 0 100 70" className="w-full h-full">
          <path d="M 10 60 A 40 40 0 0 1 90 60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} strokeLinecap="round" />
          <motion.path
            d="M 10 60 A 40 40 0 0 1 90 60"
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference * 0.75}
            initial={{ strokeDashoffset: circumference * 0.75 }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-lg font-display font-bold text-white">{value}%</span>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
    </motion.div>
  );
}

export default function ResourceUtilization() {
  const { data: experiments } = useExperiments();
  const runningExps = experiments?.filter(e => e.status === "running") || [];

  const gpuData = useLiveResource(65, 15);
  const cpuData = useLiveResource(45, 20);
  const memData = useLiveResource(72, 10);

  const gpuVal = gpuData[gpuData.length - 1]?.v || 0;
  const cpuVal = cpuData[cpuData.length - 1]?.v || 0;
  const memVal = memData[memData.length - 1]?.v || 0;

  const perExpData = (runningExps.length > 0 ? runningExps : experiments?.slice(0, 5) || []).map((e, i) => ({
    name: e.name.length > 15 ? e.name.slice(0, 15) + "…" : e.name,
    gpu: parseFloat((30 + Math.sin(e.id * 7) * 20 + Math.random() * 15).toFixed(1)),
    cpu: parseFloat((20 + Math.sin(e.id * 5) * 15 + Math.random() * 20).toFixed(1)),
    memory: parseFloat((40 + Math.sin(e.id * 3) * 20 + Math.random() * 10).toFixed(1)),
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Gauge className="w-6 h-6 text-amber-400" />
            Resource Utilization
          </h2>
          <p className="text-sm text-muted-foreground mt-1">GPU/CPU/Memory usage per experiment</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
          <motion.div className="w-2 h-2 rounded-full bg-emerald" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="text-xs font-mono text-emerald">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GaugeCard label="GPU" value={Math.round(gpuVal)} color="#10b981" icon={Cpu} />
        <GaugeCard label="CPU" value={Math.round(cpuVal)} color="#06b6d4" icon={Cpu} />
        <GaugeCard label="Memory" value={Math.round(memVal)} color="#8b5cf6" icon={MemoryStick} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { label: "GPU Usage", data: gpuData, color: "#10b981", id: "gpu" },
          { label: "CPU Usage", data: cpuData, color: "#06b6d4", id: "cpu" },
          { label: "Memory Usage", data: memData, color: "#8b5cf6", id: "mem" },
        ].map((chart, ci) => (
          <motion.div
            key={chart.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.08 }}
            className="glass-panel rounded-xl p-5 border border-white/[0.06]"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <h3 className="text-sm font-display font-bold text-white mb-3">{chart.label}</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data}>
                  <defs>
                    <linearGradient id={`res-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chart.color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chart.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} width={30} />
                  <Tooltip contentStyle={{ background: "rgba(15,15,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 11 }} />
                  <Area type="monotone" dataKey="v" stroke={chart.color} fill={`url(#res-${chart.id})`} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>

      {perExpData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl p-6 border border-white/[0.06]"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <h3 className="font-display font-bold text-white mb-4">Per-Experiment Resource Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perExpData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={100} />
                <Tooltip contentStyle={{ background: "rgba(15,15,35,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="gpu" fill="#10b981" name="GPU %" radius={[0, 4, 4, 0]} barSize={8} />
                <Bar dataKey="cpu" fill="#06b6d4" name="CPU %" radius={[0, 4, 4, 0]} barSize={8} />
                <Bar dataKey="memory" fill="#8b5cf6" name="Memory %" radius={[0, 4, 4, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
