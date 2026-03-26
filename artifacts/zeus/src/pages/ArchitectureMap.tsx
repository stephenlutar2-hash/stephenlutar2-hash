import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Network, Server, Database, Shield, Activity, Zap, Globe, Brain, CheckCircle2, AlertTriangle } from "lucide-react";

const defaultServices = [
  { name: "Zeus Core", type: "Infrastructure", status: "healthy", uptime: "99.97%", connections: ["Beacon", "Rosie", "INCA", "AlloyScape"], load: 34, instances: 4 },
  { name: "Beacon", type: "Observability", status: "healthy", uptime: "99.99%", connections: ["Zeus Core", "All Services"], load: 42, instances: 3 },
  { name: "Rosie", type: "Security", status: "healthy", uptime: "99.98%", connections: ["Zeus Core", "Aegis", "Firestorm"], load: 28, instances: 2 },
  { name: "Aegis", type: "Compliance", status: "healthy", uptime: "99.95%", connections: ["Rosie", "Zeus Core"], load: 18, instances: 2 },
  { name: "INCA", type: "Intelligence", status: "healthy", uptime: "99.94%", connections: ["Zeus Core", "AlloyScape"], load: 56, instances: 3 },
  { name: "Vessels", type: "Maritime", status: "warning", uptime: "99.92%", connections: ["Zeus Core", "Beacon", "Nimbus"], load: 71, instances: 4 },
  { name: "AlloyScape", type: "Orchestration", status: "healthy", uptime: "99.96%", connections: ["Zeus Core", "INCA", "All Agents"], load: 45, instances: 3 },
  { name: "Nimbus", type: "Predictions", status: "healthy", uptime: "99.93%", connections: ["Zeus Core", "Vessels", "INCA"], load: 62, instances: 2 },
  { name: "Firestorm", type: "Incident Response", status: "healthy", uptime: "99.97%", connections: ["Rosie", "Zeus Core"], load: 12, instances: 2 },
  { name: "DreamEra", type: "Creative AI", status: "healthy", uptime: "99.91%", connections: ["Zeus Core", "Dreamscape"], load: 38, instances: 2 },
  { name: "Shared PostgreSQL", type: "Database", status: "healthy", uptime: "99.99%", connections: ["All Services"], load: 68, instances: 3 },
  { name: "Redis Cluster", type: "Cache", status: "healthy", uptime: "99.99%", connections: ["All Services"], load: 41, instances: 6 },
];

const defaultSelfHealingEvents = [
  { id: 1, time: "2026-03-25T14:32:00Z", service: "Vessels Fleet API", event: "Auto-scaled from 3 to 4 instances", trigger: "CPU > 75% for 5 minutes", result: "Load reduced to 52%", type: "scaling" },
  { id: 2, time: "2026-03-25T08:15:00Z", service: "INCA Experiment Runner", event: "Restarted unhealthy pod (inca-runner-7b8c9)", trigger: "Health check failed 3 consecutive times", result: "Service restored in 12 seconds", type: "restart" },
  { id: 3, time: "2026-03-24T22:45:00Z", service: "Redis Cluster", event: "Failover to replica node (redis-replica-02)", trigger: "Primary node memory > 95%", result: "Zero-downtime failover completed", type: "failover" },
  { id: 4, time: "2026-03-24T16:20:00Z", service: "AlloyScape Orchestrator", event: "Circuit breaker opened for INCA dependency", trigger: "INCA latency > 5s for 30 seconds", result: "Graceful degradation — cached responses served", type: "circuit-breaker" },
];

const typeColor = (t: string) => {
  const colors: Record<string, string> = { scaling: "text-cyan-400 bg-cyan-500/10", restart: "text-amber-400 bg-amber-500/10", failover: "text-purple-400 bg-purple-500/10", "circuit-breaker": "text-emerald-400 bg-emerald-500/10" };
  return colors[t] || "text-gray-400 bg-white/5";
};

const loadColor = (l: number) => l >= 70 ? "text-red-400" : l >= 50 ? "text-amber-400" : "text-emerald-400";
const statusDot = (s: string) => s === "healthy" ? "bg-emerald-400" : s === "warning" ? "bg-amber-400" : "bg-red-400";

export default function ArchitectureMap() {
  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  const [services, setServices] = useState(defaultServices);
  const [selfHealingEvents, setSelfHealingEvents] = useState(defaultSelfHealingEvents);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/zeus/topology`).then(r => r.ok ? r.json() : null),
      fetch(`${API_BASE}/zeus/self-healing-events`).then(r => r.ok ? r.json() : null),
    ]).then(([topoRes, healRes]) => {
      if (topoRes?.services) setServices(topoRes.services);
      if (healRes?.events) setSelfHealingEvents(healRes.events);
    }).catch(() => {});
  }, [API_BASE]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Live Infrastructure Topology</p>
          <h1 className="text-3xl font-bold tracking-tight">Architecture Map</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time service topology with self-healing event log and dependency visualization</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Services", value: `${services.length}`, icon: Server, color: "text-cyan-400" },
            { label: "Healthy", value: `${services.filter(s => s.status === "healthy").length}`, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Self-Healing Events (24h)", value: `${selfHealingEvents.length}`, icon: Zap, color: "text-purple-400" },
            { label: "Avg Uptime", value: `${(services.reduce((s, sv) => s + parseFloat(sv.uptime), 0) / services.length).toFixed(2)}%`, icon: Activity, color: "text-amber-400" },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-gray-500 uppercase">{m.label}</p>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </motion.div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Network className="w-4 h-4 text-cyan-400" /> Service Registry</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {services.map((svc, idx) => (
              <motion.div key={svc.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + idx * 0.04 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <motion.div className={`w-2 h-2 rounded-full ${statusDot(svc.status)}`} animate={svc.status === "healthy" ? {} : { scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <span className="text-sm font-semibold">{svc.name}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mb-2">{svc.type}</p>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div><p className="text-xs font-mono text-emerald-400">{svc.uptime}</p><p className="text-[8px] text-gray-600">Uptime</p></div>
                  <div><p className={`text-xs font-mono ${loadColor(svc.load)}`}>{svc.load}%</p><p className="text-[8px] text-gray-600">Load</p></div>
                  <div><p className="text-xs font-mono text-cyan-400">{svc.instances}</p><p className="text-[8px] text-gray-600">Inst.</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-purple-400" /> Self-Healing Event Log (24h)</h3>
          <div className="space-y-3">
            {selfHealingEvents.map((evt, idx) => (
              <motion.div key={evt.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + idx * 0.06 }} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${typeColor(evt.type)}`}>{evt.type}</span>
                    <span className="text-sm font-semibold text-white">{evt.service}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{new Date(evt.time).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-300 mb-1">{evt.event}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Trigger: {evt.trigger}</span>
                  <span className="text-emerald-400">Result: {evt.result}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
