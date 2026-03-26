import { motion } from "framer-motion";
import { Clock, TrendingDown, TrendingUp, Zap, Shield } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KpiData {
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down";
  trendValue: string;
  trendGood: boolean;
  sparkline: number[];
  icon: any;
  color: string;
  sparkColor: string;
}

const kpis: KpiData[] = [
  {
    label: "MTTD",
    value: "4.2",
    unit: "min",
    trend: "down",
    trendValue: "-18%",
    trendGood: true,
    sparkline: [8, 7.2, 6.5, 5.8, 5.1, 4.8, 4.5, 4.2],
    icon: Clock,
    color: "#06b6d4",
    sparkColor: "#06b6d4",
  },
  {
    label: "MTTR",
    value: "12.8",
    unit: "min",
    trend: "down",
    trendValue: "-24%",
    trendGood: true,
    sparkline: [22, 19, 17, 15.5, 14.2, 13.8, 13.1, 12.8],
    icon: Zap,
    color: "#8b5cf6",
    sparkColor: "#8b5cf6",
  },
  {
    label: "Detection Rate",
    value: "97.3",
    unit: "%",
    trend: "up",
    trendValue: "+2.1%",
    trendGood: true,
    sparkline: [91, 92, 93.5, 94, 95, 96, 96.8, 97.3],
    icon: Shield,
    color: "#10b981",
    sparkColor: "#10b981",
  },
  {
    label: "False Positive Rate",
    value: "3.2",
    unit: "%",
    trend: "down",
    trendValue: "-1.4%",
    trendGood: true,
    sparkline: [8, 7, 6.2, 5.5, 4.8, 4.1, 3.6, 3.2],
    icon: TrendingDown,
    color: "#f59e0b",
    sparkColor: "#f59e0b",
  },
];

export default function KpiCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-all cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${kpi.color}08, transparent)` }}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{kpi.label}</span>
              </div>
              <span className={`text-[10px] font-bold font-mono flex items-center gap-0.5 ${kpi.trendGood ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.trendValue}
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-display font-bold text-white">{kpi.value}</span>
              <span className="text-sm text-gray-500">{kpi.unit}</span>
            </div>

            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpi.sparkline.map((v, j) => ({ v, i: j }))}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={kpi.sparkColor}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
