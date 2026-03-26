import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Flame, Bot, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { aegisFetch } from "@/lib/api";

interface AppSummary {
  name: string;
  status: string;
  score: number;
  threats: number;
  color: string;
  gradient: string;
}

interface CrossAppData {
  apps: AppSummary[];
  overallScore: number;
  totalThreats: number;
}

const iconMap: Record<string, typeof Shield> = {
  Aegis: Shield,
  Firestorm: Flame,
  ROSIE: Bot,
};

export default function CrossAppSummary() {
  const [data, setData] = useState<CrossAppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    aegisFetch<CrossAppData>("cross-app-summary")
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch cross-app summary:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] animate-pulse">
        <div className="h-4 bg-white/5 rounded w-32 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-5 rounded-2xl border border-amber-500/10 bg-amber-500/5">
        <p className="text-[10px] text-amber-400">Security suite status unavailable</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] via-transparent to-amber-500/[0.03] pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-display font-bold text-white tracking-wide uppercase">
              Security Suite Status
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <div>
            <p className="text-3xl font-display font-bold text-white">{data.overallScore}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Overall Score</p>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex items-center gap-1">
            {data.totalThreats > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">{data.totalThreats}</span>
                <span className="text-[10px] text-gray-500 ml-1">active alerts</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400">All clear</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {data.apps.map((app, i) => {
            const Icon = iconMap[app.name] || Shield;
            return (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r ${app.gradient} border border-white/5 hover:border-white/10 transition-all cursor-pointer group`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${app.color}20` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: app.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{app.name}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: app.color }}>{app.score}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-gray-500 capitalize">{app.status}</span>
                    {app.threats > 0 && <span className="text-[10px] text-amber-400">{app.threats} alerts</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
