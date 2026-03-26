import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { MapPin, Clock, Anchor } from "lucide-react";

const PORT_DATA = [
  { port: "Rotterdam", avgDwell: 3.2, berthUtil: 87, calls: 42, turnaround: 18.5 },
  { port: "Singapore", avgDwell: 2.8, berthUtil: 92, calls: 56, turnaround: 14.2 },
  { port: "Shanghai", avgDwell: 4.1, berthUtil: 78, calls: 38, turnaround: 22.1 },
  { port: "Houston", avgDwell: 3.5, berthUtil: 71, calls: 28, turnaround: 20.4 },
  { port: "Hamburg", avgDwell: 2.9, berthUtil: 85, calls: 35, turnaround: 16.8 },
  { port: "Dubai", avgDwell: 2.1, berthUtil: 68, calls: 22, turnaround: 12.5 },
  { port: "Hong Kong", avgDwell: 3.8, berthUtil: 89, calls: 45, turnaround: 19.2 },
  { port: "Los Angeles", avgDwell: 4.5, berthUtil: 75, calls: 31, turnaround: 24.3 },
];

const COLORS = ["#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#3b82f6", "#14b8a6"];

export default function PortAnalytics() {
  const dwellData = PORT_DATA.map(p => ({ name: p.port, dwell: p.avgDwell }));
  const berthData = PORT_DATA.map(p => ({ name: p.port, value: p.berthUtil }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
          <MapPin className="w-5 h-5 text-violet-400" />
          Port Analytics
        </h2>
        <p className="text-sm text-gray-500 mt-1">Dwell time distributions and berth utilization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6 border border-white/[0.06] backdrop-blur-md"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-white">Average Dwell Time (Days)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dwellData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={80} />
                <Tooltip contentStyle={{ background: "rgba(10,14,23,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="dwell" radius={[0, 6, 6, 0]} animationDuration={1200}>
                  {dwellData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-6 border border-white/[0.06] backdrop-blur-md"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Anchor className="w-4 h-4 text-emerald-400" />
            <h3 className="font-display font-bold text-white">Berth Utilization</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={berthData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" animationDuration={1200}>
                  {berthData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(10,14,23,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Utilization"]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {PORT_DATA.map((p, i) => (
          <motion.div
            key={p.port}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.04 }}
            className="p-4 rounded-xl border border-white/[0.06] backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{p.port}</span>
              <span className={`text-xs font-mono ${p.berthUtil >= 85 ? "text-emerald-400" : p.berthUtil >= 70 ? "text-amber-400" : "text-red-400"}`}>{p.berthUtil}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
                initial={{ width: 0 }}
                animate={{ width: `${p.berthUtil}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.04 }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>{p.avgDwell}d avg dwell</span>
              <span>{p.calls} calls</span>
              <span>{p.turnaround}h turn</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
