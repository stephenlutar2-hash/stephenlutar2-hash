import { useState, useEffect } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import { Zap, Bell, Webhook, FileText, Key, Settings, ChevronRight, Check, AlertTriangle, Clock, Play, ExternalLink, RefreshCw, Loader2 } from "lucide-react";

  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  function getToken() {
    return localStorage.getItem("szl_token") || "";
  }

  async function apiFetch(endpoint: string) {
    const res = await fetch(`${API_BASE}/extensions/${endpoint}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  const APP_FEATURES = [
    { tab: "Investor Dashboard", desc: "Portfolio performance and valuation", endpoint: "szl-holdings/investor-dashboard", dataKey: null },
  { tab: "Portfolio Heat Map", desc: "Platform health overview", endpoint: "szl-holdings/portfolio-heatmap", dataKey: "entries" },
  ];

  const SHARED_TABS = [
    { tab: "Workflows", icon: Zap },
    { tab: "Notifications", icon: Bell },
    { tab: "Webhooks", icon: Webhook },
    { tab: "API Keys", icon: Key },
    { tab: "Reports", icon: FileText },
  ];

  function StatusDot({ status }: { status: string }) {
    const colors: Record<string, string> = {
      healthy: "bg-emerald-400", compliant: "bg-emerald-400", operational: "bg-emerald-400", passed: "bg-emerald-400",
      warning: "bg-yellow-400", partial: "bg-yellow-400", degraded: "bg-yellow-400", "at-risk": "bg-yellow-400",
      critical: "bg-red-400", breached: "bg-red-400", failed: "bg-red-400", blocked: "bg-red-400",
      pending: "bg-blue-400", "action-required": "bg-orange-400", enabled: "bg-emerald-400",
    };
    return <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || "bg-gray-400"}`} />;
  }

  function DataCard({ title, value, subtitle, accent }: { title: string; value: string | number; subtitle?: string; accent: string }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-xl p-5"
      >
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold" style={{ color: accent }}>{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </motion.div>
    );
  }

  function JsonRenderer({ data }: { data: any }) {
    if (!data) return <p className="text-gray-500 text-sm">No data available</p>;

    if (Array.isArray(data)) {
      if (data.length === 0) return <p className="text-gray-500 text-sm">No items found</p>;
      const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== "object" || data[0][k] === null).slice(0, 8);
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {keys.map(k => <th key={k} className="text-left px-3 py-2 text-xs text-gray-400 uppercase tracking-wider font-medium">{k.replace(/([A-Z])/g, " $1").trim()}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 20).map((row: any, i: number) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {keys.map(k => (
                    <td key={k} className="px-3 py-2.5 text-gray-300 max-w-[200px] truncate">
                      {typeof row[k] === "boolean" ? (row[k] ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="text-gray-600">—</span>) :
                       row[k] === null || row[k] === undefined ? <span className="text-gray-600">—</span> :
                       typeof row[k] === "number" ? (
                         k.toLowerCase().includes("cost") || k.toLowerCase().includes("revenue") || k.toLowerCase().includes("value") || k.toLowerCase().includes("profit") ?
                           `$${row[k].toLocaleString()}` :
                         k.toLowerCase().includes("rate") || k.toLowerCase().includes("percentage") || k.toLowerCase().includes("compliance") || k.toLowerCase().includes("score") || k.toLowerCase().includes("accuracy") || k.toLowerCase().includes("margin") ?
                           `${row[k]}%` :
                           row[k].toLocaleString()
                       ) :
                       <span className="flex items-center gap-1.5"><StatusDot status={String(row[k]).toLowerCase()} />{String(row[k])}</span>}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (typeof data === "object") {
      const entries = Object.entries(data).filter(([_, v]) => typeof v !== "function");
      const simpleEntries = entries.filter(([_, v]) => typeof v !== "object" || v === null);
      const complexEntries = entries.filter(([_, v]) => typeof v === "object" && v !== null);

      return (
        <div className="space-y-4">
          {simpleEntries.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {simpleEntries.map(([k, v]) => (
                <DataCard
                  key={k}
                  title={k.replace(/([A-Z])/g, " $1").trim()}
                  value={typeof v === "number" ? (k.toLowerCase().includes("cost") || k.toLowerCase().includes("value") || k.toLowerCase().includes("revenue") ? `$${(v as number).toLocaleString()}` : (v as number).toLocaleString()) : String(v)}
                  accent="#6366f1"
                />
              ))}
            </div>
          )}
          {complexEntries.map(([k, v]) => (
            <div key={k}>
              <h4 className="text-sm font-medium text-gray-300 mb-2 capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</h4>
              <JsonRenderer data={v} />
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-gray-300">{String(data)}</p>;
  }

  function WorkflowsTab({ domain }: { domain: string }) {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      apiFetch(`automation/rules?appDomain=${domain}`)
        .then(d => setRules(d.rules || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [domain]);

    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
    if (rules.length === 0) return <p className="text-gray-500 text-center py-8">No automation rules configured</p>;

    return (
      <div className="space-y-3">
        {rules.map((rule: any, i: number) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StatusDot status={rule.enabled ? "enabled" : "pending"} />
                <h4 className="font-medium text-white">{rule.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Runs: {rule.runCount}</span>
                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" title="Execute">
                  <Play className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-2">{rule.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />Trigger: {rule.trigger?.type}</span>
              <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" />{rule.actions?.length || 0} action(s)</span>
              {rule.lastRun && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last: {new Date(rule.lastRun).toLocaleDateString()}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  function NotificationsTab({ domain }: { domain: string }) {
    const [notifs, setNotifs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      apiFetch(`notifications?appDomain=${domain}`)
        .then(d => setNotifs(d.notifications || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [domain]);

    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
    if (notifs.length === 0) return <p className="text-gray-500 text-center py-8">No notifications</p>;

    const typeColors: Record<string, string> = { error: "border-red-500/30 bg-red-500/10", warning: "border-yellow-500/30 bg-yellow-500/10", success: "border-emerald-500/30 bg-emerald-500/10", info: "border-blue-500/30 bg-blue-500/10" };

    return (
      <div className="space-y-2">
        {notifs.slice(0, 15).map((n: any, i: number) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`border rounded-lg p-3 ${typeColors[n.type] || typeColors.info} ${n.read ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-medium text-white">{n.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
              </div>
              <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-gray-500">{n.source}</span>
              {!n.read && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">New</span>}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  function WebhooksTab({ domain }: { domain: string }) {
    const [webhooks, setWebhooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      apiFetch(`webhooks?appDomain=${domain}`)
        .then(d => setWebhooks(d.webhooks || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [domain]);

    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
    if (webhooks.length === 0) return <p className="text-gray-500 text-center py-8">No webhooks registered</p>;

    return (
      <div className="space-y-3">
        {webhooks.map((wh: any, i: number) => (
          <motion.div
            key={wh.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StatusDot status={wh.active ? "enabled" : "pending"} />
                <h4 className="font-medium text-white">{wh.name}</h4>
              </div>
              <button className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors text-gray-400">Test</button>
            </div>
            <p className="text-xs text-gray-400 font-mono mb-2 truncate">{wh.url}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {wh.events?.map((e: string) => <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{e}</span>)}
            </div>
            {wh.deliveryLogs?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <p className="text-[10px] text-gray-500 mb-1">Recent Deliveries</p>
                <div className="flex gap-1">
                  {wh.deliveryLogs.slice(0, 10).map((log: any, j: number) => (
                    <div key={j} className={`w-2 h-2 rounded-full ${log.success ? "bg-emerald-400" : "bg-red-400"}`} title={`${log.event}: ${log.success ? "OK" : "Failed"}`} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  function ReportsTab({ domain }: { domain: string }) {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      apiFetch(`reports?appDomain=${domain}`)
        .then(d => setReports(d.reports || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [domain]);

    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
    if (reports.length === 0) return <p className="text-gray-500 text-center py-8">No scheduled reports configured</p>;

    return (
      <div className="space-y-3">
        {reports.map((r: any, i: number) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StatusDot status={r.enabled ? "enabled" : "pending"} />
                <h4 className="font-medium text-white">{r.name}</h4>
              </div>
              <span className="text-xs text-gray-500">{r.schedule}</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{r.type} report • {r.format?.toUpperCase()}</p>
            <div className="flex flex-wrap gap-1.5">
              {r.recipients?.map((email: string) => <span key={email} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{email}</span>)}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  function ApiKeysTab() {
    const [keys, setKeys] = useState<any[]>([]);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      Promise.all([
        apiFetch("developer/api-keys").then(d => setKeys(d.keys || [])),
        apiFetch("developer/usage").then(d => setUsage(d)),
      ]).catch(() => {}).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

    return (
      <div className="space-y-6">
        {usage && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DataCard title="Total Requests" value={usage.totalRequests?.toLocaleString() || "0"} accent="#6366f1" />
            <DataCard title="Avg Response Time" value={`${usage.avgResponseTime || 0}ms`} accent="#6366f1" />
            <DataCard title="API Keys" value={keys.length} accent="#6366f1" />
            <DataCard title="Active Keys" value={keys.filter((k: any) => k.active).length} accent="#6366f1" />
          </div>
        )}
        <div className="space-y-3">
          {keys.map((key: any, i: number) => (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-white">{key.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${key.active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{key.active ? "Active" : "Revoked"}</span>
              </div>
              <p className="text-xs font-mono text-gray-400">{key.keyPrefix}••••••••</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>Tier: {key.rateLimitTier}</span>
                <span>Usage: {key.usageCount?.toLocaleString()}</span>
                {key.lastUsed && <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  function FeatureTab({ feature }: { feature: typeof APP_FEATURES[0] }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      apiFetch(feature.endpoint)
        .then(d => setData(feature.dataKey ? d[feature.dataKey] : d))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }, [feature.endpoint]);

    if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
    if (error) return <div className="text-center py-8"><AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" /><p className="text-gray-400 text-sm">{error}</p></div>;

    return <JsonRenderer data={data} />;
  }

  export default function Extensions() {
    const allTabs = [...APP_FEATURES.map(f => f.tab), ...SHARED_TABS.map(t => t.tab)];
    const [activeTab, setActiveTab] = useState(allTabs[0]);

    const currentFeature = APP_FEATURES.find(f => f.tab === activeTab);
    const currentShared = SHARED_TABS.find(t => t.tab === activeTab);

    return (
      <div className="min-h-screen bg-[#0a0a1a] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${("#6366f1")}20` }}>
                <Zap className="w-5 h-5" style={{ color: "#6366f1" }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SZL Holdings Extensions</h1>
                <p className="text-sm text-gray-400">Premium features, automation, and developer tools</p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-white/10">
            <div className="flex flex-wrap gap-1.5">
              {APP_FEATURES.map(f => (
                <button
                  key={f.tab}
                  onClick={() => setActiveTab(f.tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === f.tab
                      ? "text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  style={activeTab === f.tab ? { background: "#6366f1", color: "white" } : {}}
                >
                  {f.tab}
                </button>
              ))}
            </div>
            <div className="h-6 w-px bg-white/10 mx-1 self-center" />
            <div className="flex flex-wrap gap-1.5">
              {SHARED_TABS.map(({ tab, icon: Icon }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === tab
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentFeature && (
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">{currentFeature.desc}</p>
                  </div>
                  <FeatureTab feature={currentFeature} />
                </div>
              )}
              {activeTab === "Workflows" && <WorkflowsTab domain="szl-holdings" />}
              {activeTab === "Notifications" && <NotificationsTab domain="szl-holdings" />}
              {activeTab === "Webhooks" && <WebhooksTab domain="szl-holdings" />}
              {activeTab === "Reports" && <ReportsTab domain="szl-holdings" />}
              {activeTab === "API Keys" && <ApiKeysTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }
  