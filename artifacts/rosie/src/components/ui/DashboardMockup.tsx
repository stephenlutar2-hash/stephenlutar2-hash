import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { Activity, AlertTriangle, CheckCircle2, Server, ShieldAlert, Terminal } from "lucide-react";

const activityData = Array.from({ length: 20 }).map((_, i) => ({
  time: i,
  threats: Math.floor(Math.random() * 50) + 10,
  blocked: Math.floor(Math.random() * 45) + 15,
}));

const serverLoad = [
  { name: 'NIMBUS', load: 85 },
  { name: 'BEACON', load: 45 },
  { name: 'ZEUS', load: 92 },
  { name: 'INCA', load: 28 },
  { name: 'DREAM', load: 60 },
];

export function DashboardMockup() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-black/50 backdrop-blur-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,255,255,0.15)] relative">
      {/* Mac-like Window Controls */}
      <div className="h-12 bg-white/[0.02] border-b border-white/10 flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-destructive/80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        <div className="mx-auto flex items-center gap-2 text-muted-foreground/50 text-xs font-mono">
          <Terminal className="w-3 h-3" />
          rosie-command-center_v2.4.1
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Threat Feed */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-semibold text-white/80">THREAT FEED</h3>
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                DEMO
              </div>
            </div>
            <div className="space-y-3">
              {[
                { type: "DDoS Attempt", ip: "192.168.1.44", status: "Blocked", time: "2s ago", icon: ShieldAlert, color: "text-destructive" },
                { type: "SQL Injection", ip: "10.0.0.8", status: "Mitigated", time: "12s ago", icon: AlertTriangle, color: "text-yellow-500" },
                { type: "Brute Force", ip: "172.16.0.2", status: "Blocked", time: "45s ago", icon: ShieldAlert, color: "text-destructive" },
                { type: "Port Scan", ip: "192.168.2.100", status: "Tracked", time: "1m ago", icon: Activity, color: "text-primary" },
              ].map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-white/5"
                >
                  <log.icon className={`w-4 h-4 mt-0.5 ${log.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/90">{log.type}</span>
                      <span className="text-[10px] text-muted-foreground">{log.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-mono text-muted-foreground">{log.ip}</span>
                      <span className={`text-[10px] ${log.color}`}>{log.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Charts & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Global Block Rate", value: "99.98%", trend: "+0.02%", positive: true },
              { label: "Active Nodes", value: "1,248", trend: "+12", positive: true },
              { label: "Avg Response", value: "0.8ms", trend: "-0.2ms", positive: true },
            ].map((kpi, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs text-muted-foreground font-mono">{kpi.label}</span>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-2xl font-display font-bold text-white">{kpi.value}</span>
                  <span className="text-xs text-green-400 mb-1">{kpi.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Chart */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 h-64 flex flex-col">
            <h3 className="font-display text-sm font-semibold text-white/80 mb-4">THREAT MITIGATION VOLUME</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ fontFamily: 'Menlo' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area type="monotone" dataKey="threats" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorThreats)" strokeWidth={2} />
                  <Area type="monotone" dataKey="blocked" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBlocked)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="font-display text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-secondary" />
                SYSTEM LOAD
              </h3>
              <div className="w-full h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serverLoad} layout="vertical" margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 10, fontFamily: 'Menlo' }} />
                    <Bar dataKey="load" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-center text-center">
              <div>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-primary border-dashed animate-spin" style={{ animationDuration: '3s' }}></div>
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-display font-bold text-lg text-white">ALL SYSTEMS SECURE</h4>
                <p className="text-xs text-primary/80 mt-1 font-mono">AUTONOMOUS MODE: ENGAGED</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
