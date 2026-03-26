import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useMetrics, useMutateMetrics, useProjects, useMutateProjects } from "@/hooks/use-beacon";
import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Plus, TrendingUp, TrendingDown, Edit2, Trash2, AlertTriangle, BarChart3, FolderOpen, RefreshCw, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Receipt, Wallet, AlertCircle } from "lucide-react";
import { cn } from "@szl-holdings/ui";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import type { BeaconMetric, BeaconProject } from "@szl-holdings/api-client-react";

function generateSparklineData(value: number, change: number) {
  const points = 12;
  const data = [];
  const startVal = value / (1 + change / 100);
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const noise = (Math.sin(i * 2.1 + value) * 0.08 + Math.cos(i * 1.3 + change) * 0.05);
    const v = startVal + (value - startVal) * progress + value * noise;
    data.push({ v: Math.max(0, v) });
  }
  return data;
}

interface StripeRevenue {
  configured: boolean;
  totalRevenue: number;
  mrr: number;
  transactionCount: number;
  balanceAvailable?: number;
  balancePending?: number;
  currency?: string;
}

interface StripeTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  customer: string;
  created: string;
  receiptUrl?: string;
}

function StripeRevenueSection() {
  const [revenue, setRevenue] = useState<StripeRevenue | null>(null);
  const [transactions, setTransactions] = useState<StripeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("szl_token");
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    Promise.all([
      fetch("/api/stripe/revenue", { headers }).then(r => r.json()),
      fetch("/api/stripe/transactions?limit=10", { headers }).then(r => r.json()),
    ])
      .then(([rev, txns]) => {
        setRevenue(rev);
        setTransactions(txns.transactions || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div className="h-5 bg-white/5 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-20" />
              <div className="h-8 bg-white/5 rounded w-24" />
              <div className="h-16 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!revenue?.configured) {
    return (
      <div className="glass-panel rounded-xl p-6 border border-yellow-500/20">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-display font-bold text-white">Stripe Revenue</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-yellow-400/80">
          <AlertCircle className="w-4 h-4" />
          <span>Stripe is not configured. Set STRIPE_SECRET_KEY in environment to enable revenue tracking.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-display font-bold text-white">Stripe Revenue</h3>
        </div>
        <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Live</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue (30d)", value: `$${revenue.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", stroke: "#4ade80" },
          { label: "Monthly Recurring", value: `$${revenue.mrr.toLocaleString()}`, icon: Wallet, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", stroke: "#22d3ee" },
          { label: "Transactions", value: revenue.transactionCount.toString(), icon: Receipt, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", stroke: "#60a5fa" },
          { label: "Available Balance", value: `$${(revenue.balanceAvailable || 0).toLocaleString()}`, icon: CreditCard, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", stroke: "hsl(var(--primary))" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`glass-panel rounded-xl p-5 ${s.border} border overflow-hidden`}>
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {transactions.length > 0 && (
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider">Recent Transactions</h4>
            <span className="text-xs text-muted-foreground">{transactions.length} shown</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-sm text-white">{t.customer}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{t.description}</td>
                    <td className="px-5 py-3 text-sm font-mono text-green-400">${t.amount.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={cn("px-2 py-0.5 text-xs rounded-full border font-bold uppercase",
                        t.status === "succeeded" ? "text-green-400 bg-green-500/10 border-green-500/20" :
                        t.status === "pending" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" :
                        "text-red-400 bg-red-500/10 border-red-500/20"
                      )}>{t.status}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground font-mono">{new Date(t.created).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-sm glass-panel rounded-2xl p-6 border border-destructive/20 mx-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 text-sm bg-destructive/20 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/30 transition-colors font-semibold">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

function formatMetricValue(value: number, unit: string) {
  if (unit === "%" || unit === "ms" || unit === "s") return `${value.toLocaleString()}`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function MiniSparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <div className="w-full h-10 mt-2 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color.replace('#', '')})`}
            dot={false}
            isAnimationActive={true}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics, error: metricsError, refetch: refetchMetrics } = useMetrics();
  const { data: projects, isLoading: loadingProjects, error: projectsError, refetch: refetchProjects } = useProjects();
  const { create: createMetric, update: updateMetric, remove: removeMetric } = useMutateMetrics();
  const { create: createProject, update: updateProject, remove: removeProject } = useMutateProjects();

  const [metricModal, setMetricModal] = useState<{ isOpen: boolean; data?: BeaconMetric }>({ isOpen: false });
  const [projectModal, setProjectModal] = useState<{ isOpen: boolean; data?: BeaconProject }>({ isOpen: false });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: "metric" | "project"; id: number; name: string }>({ isOpen: false, type: "metric", id: 0, name: "" });

  const handleMetricSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      value: Number(fd.get("value")),
      unit: fd.get("unit") as string,
      change: Number(fd.get("change")),
      category: fd.get("category") as string,
    };

    if (metricModal.data) {
      updateMetric.mutate({ id: metricModal.data.id, data });
    } else {
      createMetric.mutate({ data });
    }
    setMetricModal({ isOpen: false });
  };

  const handleProjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      status: fd.get("status") as any,
      progress: Number(fd.get("progress")),
      platform: fd.get("platform") as string,
    };

    if (projectModal.data) {
      updateProject.mutate({ id: projectModal.data.id, data });
    } else {
      createProject.mutate({ data });
    }
    setProjectModal({ isOpen: false });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.type === "metric") {
      removeMetric.mutate({ id: deleteConfirm.id });
    } else {
      removeProject.mutate({ id: deleteConfirm.id });
    }
  };

  const sparkColors = ["#4ade80", "#22d3ee", "#a78bfa", "#f472b6", "#facc15", "#fb923c"];

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 -mt-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[80px]" />
          <div className="relative px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-mono font-semibold">Beacon Command Center</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                  Unified Observability. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-primary">Full-Stack Visibility.</span>
                </h1>
                <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                  Your System of Intelligence for the SZL ecosystem — aggregated telemetry, revenue analytics, and strategic initiative tracking across all active holdings.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-right shrink-0">
                <div className="flex items-center gap-2 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-400 font-semibold">OPERATIONAL</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono space-y-0.5">
                  <p>Uptime 99.98% · Readiness 92%</p>
                  <p>Last sync 2 min ago</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Platforms Monitored", value: "15+", color: "text-primary" },
                { label: "System Health", value: "92%", color: "text-emerald-400" },
                { label: "Active Alerts", value: "0", color: "text-emerald-400" },
                { label: "Revenue Tracked", value: "Live", color: "text-cyan-400" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={`text-lg font-display font-bold ${s.color}`}>{s.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        {(metricsError || projectsError) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-5 py-3 text-destructive text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="flex-1">{metricsError ? "Failed to load telemetry data." : "Failed to load initiative data."}</span>
            <button onClick={() => { if (metricsError) refetchMetrics(); if (projectsError) refetchProjects(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-xs font-bold uppercase tracking-wider transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </motion.div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold glow-text">Overview Telemetry</h2>
            <p className="text-muted-foreground mt-1 text-sm">Aggregated global metrics across all active holdings.</p>
          </div>
          <button 
            onClick={() => setMetricModal({ isOpen: true })}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all glow-border self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Metric</span>
          </button>
        </div>

        {loadingMetrics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass-panel rounded-xl p-6 animate-pulse space-y-4">
                <div className="h-3 bg-white/5 rounded w-2/3" />
                <div className="h-8 bg-white/5 rounded w-1/2" />
                <div className="h-10 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {metrics?.map((metric, i) => {
              const sparkData = generateSparklineData(metric.value, metric.change);
              const color = sparkColors[i % sparkColors.length];
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={metric.id} 
                  className="glass-panel rounded-xl p-5 sm:p-6 group relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                    <button onClick={() => setMetricModal({ isOpen: true, data: metric })} className="text-muted-foreground hover:text-white"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, type: "metric", id: metric.id, name: metric.name })} className="text-destructive hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <p className="text-xs sm:text-sm font-mono text-muted-foreground mb-2">{metric.category} // {metric.name}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl sm:text-4xl font-display font-bold text-white">{formatMetricValue(metric.value, metric.unit)}</span>
                    <span className="text-base sm:text-lg text-muted-foreground mb-1">{metric.unit}</span>
                  </div>
                  <MiniSparkline data={sparkData} color={color} />
                  <div className={cn("mt-2 flex items-center gap-1.5 text-sm font-medium", metric.change >= 0 ? "text-green-400" : "text-destructive")}>
                    {metric.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{metric.change >= 0 ? "+" : ""}{Math.abs(metric.change)}% from last cycle</span>
                  </div>
                </motion.div>
              );
            })}
            {(!metrics || metrics.length === 0) && (
              <div className="col-span-full py-12 text-center text-muted-foreground glass-panel rounded-xl">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium mb-1">No telemetry metrics deployed</p>
                <p className="text-xs text-muted-foreground/60">Click "Add Metric" to deploy your first data point.</p>
              </div>
            )}
          </div>
        )}

        <div className="pt-8">
          <StripeRevenueSection />
        </div>

        <div className="pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-display font-bold text-white">Active Initiatives</h3>
            <button 
              onClick={() => setProjectModal({ isOpen: true })}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Initiative</span>
            </button>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-white/5 border-b border-border">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 font-display tracking-wider text-xs text-muted-foreground uppercase">Project</th>
                    <th className="px-4 sm:px-6 py-4 font-display tracking-wider text-xs text-muted-foreground uppercase">Platform</th>
                    <th className="px-4 sm:px-6 py-4 font-display tracking-wider text-xs text-muted-foreground uppercase">Status</th>
                    <th className="px-4 sm:px-6 py-4 font-display tracking-wider text-xs text-muted-foreground uppercase">Progress</th>
                    <th className="px-4 sm:px-6 py-4 font-display tracking-wider text-xs text-muted-foreground uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loadingProjects ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-white/5 rounded w-32" /><div className="h-3 bg-white/5 rounded w-48 mt-2" /></td>
                        <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-white/5 rounded w-20" /></td>
                        <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-white/5 rounded w-16" /></td>
                        <td className="px-4 sm:px-6 py-4"><div className="h-2 bg-white/5 rounded w-full" /></td>
                        <td className="px-4 sm:px-6 py-4"><div className="h-4 bg-white/5 rounded w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : projects?.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium mb-1">No active initiatives found</p>
                      <p className="text-xs text-muted-foreground/60">Click "New Initiative" to start tracking a project.</p>
                    </td></tr>
                  ) : (
                    projects?.map((project) => (
                      <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="font-semibold text-white">{project.name}</div>
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 font-mono text-sm text-primary">{project.platform}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 text-xs rounded-full border font-bold tracking-wider uppercase",
                            project.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            project.status === 'building' ? "bg-primary/10 text-primary border-primary/20" :
                            project.status === 'planning' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                            "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          )}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 w-48">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-primary rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${project.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                            <span className="text-sm font-mono text-muted-foreground w-10 text-right">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right">
                          <button onClick={() => setProjectModal({ isOpen: true, data: project })} className="p-2 text-muted-foreground hover:text-white transition-colors inline-block"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteConfirm({ isOpen: true, type: "project", id: project.id, name: project.name })} className="p-2 text-muted-foreground hover:text-destructive transition-colors inline-block ml-1"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(d => ({ ...d, isOpen: false }))}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteConfirm.type === "metric" ? "Metric" : "Initiative"}`}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
      />

      <Modal isOpen={metricModal.isOpen} onClose={() => setMetricModal({ isOpen: false })} title={metricModal.data ? "Edit Metric" : "Deploy New Metric"}>
        <form onSubmit={handleMetricSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Metric Name</label>
            <input required name="name" defaultValue={metricModal.data?.name} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Value</label>
              <input required type="number" step="0.01" name="value" defaultValue={metricModal.data?.value} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Unit</label>
              <input required name="unit" defaultValue={metricModal.data?.unit} placeholder="e.g. %, ms, users" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Change %</label>
              <input required type="number" step="0.1" name="change" defaultValue={metricModal.data?.change} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Category</label>
              <input required name="category" defaultValue={metricModal.data?.category} placeholder="e.g. GROWTH, PERF" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setMetricModal({ isOpen: false })} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createMetric.isPending || updateMetric.isPending} className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 glow-border transition-all disabled:opacity-50">
              {(createMetric.isPending || updateMetric.isPending) ? "Saving…" : "Save Metric"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={projectModal.isOpen} onClose={() => setProjectModal({ isOpen: false })} title={projectModal.data ? "Edit Initiative" : "Launch New Initiative"}>
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Initiative Name</label>
            <input required name="name" defaultValue={projectModal.data?.name} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea required name="description" defaultValue={projectModal.data?.description} rows={2} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Status</label>
              <select required name="status" defaultValue={projectModal.data?.status || 'planning'} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all">
                <option value="planning">Planning</option>
                <option value="building">Building</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Platform</label>
              <input required name="platform" defaultValue={projectModal.data?.platform} placeholder="e.g. Web, Mobile" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Progress %</label>
              <input required type="number" min="0" max="100" name="progress" defaultValue={projectModal.data?.progress || 0} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-all" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setProjectModal({ isOpen: false })} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createProject.isPending || updateProject.isPending} className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 glow-border transition-all disabled:opacity-50">
              {(createProject.isPending || updateProject.isPending) ? "Saving…" : "Save Initiative"}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
