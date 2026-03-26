import { motion } from "framer-motion";
import { Grid3x3, CheckCircle, AlertTriangle, XCircle, Activity } from "lucide-react";

const APPS = [
  { name: "ROSIE", status: "healthy", uptime: 99.97, latency: 42, errors: 0, requests: 12400 },
  { name: "Aegis", status: "warning", uptime: 99.85, latency: 128, errors: 3, requests: 8600 },
  { name: "Beacon", status: "healthy", uptime: 99.98, latency: 38, errors: 0, requests: 15200 },
  { name: "Lutar", status: "healthy", uptime: 99.91, latency: 65, errors: 1, requests: 6800 },
  { name: "Nimbus", status: "healthy", uptime: 99.96, latency: 55, errors: 0, requests: 9400 },
  { name: "Firestorm", status: "degraded", uptime: 99.72, latency: 234, errors: 8, requests: 4200 },
  { name: "DreamEra", status: "healthy", uptime: 99.89, latency: 78, errors: 1, requests: 7100 },
  { name: "Zeus", status: "healthy", uptime: 99.99, latency: 22, errors: 0, requests: 18600 },
  { name: "AlloyScape", status: "healthy", uptime: 99.93, latency: 48, errors: 0, requests: 11200 },
  { name: "Vessels", status: "warning", uptime: 99.80, latency: 145, errors: 5, requests: 5400 },
  { name: "Dreamscape", status: "healthy", uptime: 99.88, latency: 92, errors: 2, requests: 6200 },
  { name: "Lyte", status: "healthy", uptime: 99.95, latency: 35, errors: 0, requests: 14800 },
  { name: "INCA", status: "healthy", uptime: 99.94, latency: 51, errors: 0, requests: 10600 },
  { name: "Career", status: "healthy", uptime: 99.85, latency: 44, errors: 0, requests: 3200 },
  { name: "Carlota Jo", status: "healthy", uptime: 99.88, latency: 56, errors: 1, requests: 4800 },
];

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: typeof CheckCircle }> = {
  healthy: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle },
  warning: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle },
  degraded: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle },
};

export default function CrossAppHealthMatrix() {
  const healthy = APPS.filter(a => a.status === "healthy").length;
  const warning = APPS.filter(a => a.status === "warning").length;
  const degraded = APPS.filter(a => a.status === "degraded").length;
  const avgUptime = (APPS.reduce((s, a) => s + a.uptime, 0) / APPS.length).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Grid3x3 className="w-6 h-6 text-primary" />
          Cross-App Health Matrix
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Status of every monitored application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Healthy", value: healthy, color: "text-emerald-400", bg: "from-emerald-500/10" },
          { label: "Warning", value: warning, color: "text-amber-400", bg: "from-amber-500/10" },
          { label: "Degraded", value: degraded, color: "text-red-400", bg: "from-red-500/10" },
          { label: "Avg Uptime", value: `${avgUptime}%`, color: "text-primary", bg: "from-primary/10" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl border border-white/[0.06] relative overflow-hidden backdrop-blur-md"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${m.bg} to-transparent opacity-30`} />
            <div className="relative">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
              <p className={`text-2xl font-display font-bold ${m.color}`}>{m.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {APPS.map((app, i) => {
          const sc = statusConfig[app.status] || statusConfig.healthy;
          const StatusIcon = sc.icon;
          return (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className={`p-4 rounded-xl border ${sc.border} backdrop-blur-md cursor-default`}
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-display font-bold text-white">{app.name}</span>
                <StatusIcon className={`w-4 h-4 ${sc.color}`} />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Uptime</span>
                  <span className={`font-mono ${app.uptime >= 99.9 ? "text-emerald-400" : app.uptime >= 99.5 ? "text-amber-400" : "text-red-400"}`}>{app.uptime}%</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Latency</span>
                  <span className={`font-mono ${app.latency <= 50 ? "text-emerald-400" : app.latency <= 100 ? "text-cyan-400" : app.latency <= 200 ? "text-amber-400" : "text-red-400"}`}>{app.latency}ms</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Errors</span>
                  <span className={`font-mono ${app.errors === 0 ? "text-emerald-400" : app.errors <= 2 ? "text-amber-400" : "text-red-400"}`}>{app.errors}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Requests</span>
                  <span className="font-mono text-white">{(app.requests / 1000).toFixed(1)}K</span>
                </div>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: app.status === "healthy" ? "#10b981" : app.status === "warning" ? "#f59e0b" : "#ef4444" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (app.uptime - 99) * 100)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.03 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
