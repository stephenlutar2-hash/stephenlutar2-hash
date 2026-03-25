import DashboardLayout from "@/components/DashboardLayout";
import {
  Plug, ArrowRight, CheckCircle2, XCircle, AlertCircle, Zap,
} from "lucide-react";
import { connectors } from "@/data/demo";

const statusConfig = {
  active: { label: "Active", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  inactive: { label: "Inactive", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", dot: "bg-gray-400" },
  error: { label: "Error", color: "text-red-400 bg-red-500/10 border-red-500/20", dot: "bg-red-400 animate-pulse" },
};

const typeColors: Record<string, string> = {
  "Event Stream": "from-cyan-500 to-blue-500",
  "ETL": "from-emerald-500 to-green-500",
  "API Bridge": "from-violet-500 to-purple-500",
  "SAML/OIDC": "from-amber-500 to-orange-500",
  "WebSocket": "from-pink-500 to-rose-500",
  "Message Queue": "from-blue-500 to-indigo-500",
  "Webhook": "from-teal-500 to-cyan-500",
  "Metrics Stream": "from-gray-500 to-slate-500",
};

export default function Connectors() {
  const active = connectors.filter(c => c.status === "active").length;
  const errored = connectors.filter(c => c.status === "error").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Connector Management</h2>
          <p className="text-sm text-gray-500 mt-1">View and configure integrations between services</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">{active} Active</span>
          </div>
          {errored > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">{errored} Error</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10">
            <Zap className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">
              {connectors.reduce((sum, c) => sum + c.eventsProcessed, 0).toLocaleString()} events total
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {connectors.map(conn => {
            const cfg = statusConfig[conn.status];
            return (
              <div key={conn.id} className={`rounded-xl bg-white/[0.03] border ${conn.status === "error" ? "border-red-500/20" : "border-white/5"} hover:border-white/10 transition-colors p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Plug className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-bold text-white">{conn.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${typeColors[conn.type] || "from-gray-500 to-gray-600"} text-white text-[10px] font-bold`}>
                        {conn.type}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 my-4 px-2">
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-medium text-gray-300 truncate">
                    {conn.source}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 shrink-0" />
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-medium text-gray-300 truncate">
                    {conn.target}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                  <span>Last sync: {conn.lastSync}</span>
                  <span>{conn.eventsProcessed.toLocaleString()} events</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
