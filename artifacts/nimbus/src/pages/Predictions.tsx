import React, { useState } from "react";
import { format } from "date-fns";
import { Plus, Target, Trash2, Brain, Activity, Clock, AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, LineChart, Line } from "recharts";
import { usePredictions, useDeletePrediction } from "@/hooks/use-predictions";
import { Button } from "@workspace/ui";
import { Badge } from "@workspace/ui";
import { Dialog } from "@workspace/ui";
import { CircularProgress } from "@/components/CircularProgress";
import { PredictionForm } from "@/components/PredictionForm";

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: '#fff',
  borderRadius: '8px',
  fontSize: '12px',
};

function ConfirmDialog({ isOpen, onClose, onConfirm, name }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; name: string }) {
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
          <h3 className="text-lg font-display font-bold text-white">Delete Prediction</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete "<span className="text-white">{name}</span>"? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 text-sm bg-destructive/20 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/30 transition-colors font-semibold">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Predictions() {
  const { data: predictions, isLoading, error: predictionsError, refetch } = usePredictions();
  const deleteMutation = useDeletePrediction();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number; name: string }>({ isOpen: false, id: 0, name: "" });

  const chartData = React.useMemo(() => {
    if (!predictions) return [];
    const ranges = [
      { name: "0-25%", count: 0 },
      { name: "26-50%", count: 0 },
      { name: "51-75%", count: 0 },
      { name: "76-100%", count: 0 },
    ];
    predictions.forEach((p) => {
      if (p.confidence <= 25) ranges[0].count++;
      else if (p.confidence <= 50) ranges[1].count++;
      else if (p.confidence <= 75) ranges[2].count++;
      else ranges[3].count++;
    });
    return ranges;
  }, [predictions]);

  const trendData = React.useMemo(() => {
    if (!predictions) return [];
    return predictions.slice(0, 10).map((p, i) => ({
      name: p.title.slice(0, 8),
      confidence: p.confidence,
      upper: Math.min(100, p.confidence + 15),
      lower: Math.max(0, p.confidence - 15),
    })).reverse();
  }, [predictions]);

  const avgConfidence = React.useMemo(() => {
    if (!predictions || predictions.length === 0) return 0;
    return Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length);
  }, [predictions]);

  const statusCounts = React.useMemo(() => {
    if (!predictions) return { pending: 0, confirmed: 0, refuted: 0 };
    const counts = { pending: 0, confirmed: 0, refuted: 0 };
    predictions.forEach(p => {
      if (counts[p.status as keyof typeof counts] !== undefined) {
        counts[p.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [predictions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "success";
      case "refuted": return "destructive";
      default: return "outline";
    }
  };

  const getConfidenceColor = (val: number) => {
    if (val >= 80) return "text-emerald-400";
    if (val >= 50) return "text-primary";
    return "text-amber-400";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/5 px-4 py-1.5 text-[10px] font-mono -mt-2">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 uppercase tracking-wider">SZL Portfolio</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-400">Operational</span>
          <span className="text-gray-600">·</span>
          <span className="text-violet-400">Readiness 88%</span>
          <span className="text-gray-600">·</span>
          <span className="text-amber-400">1 Alert</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-gray-500">
          <span>Uptime 99.96%</span>
          <span>·</span>
          <span>Last sync 6 min ago</span>
          <span>·</span>
          <span className="text-amber-400">Demo Mode</span>
        </div>
      </div>
      {predictionsError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-5 py-3 text-destructive text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="flex-1">Failed to load prediction data.</span>
          <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-xs font-bold uppercase tracking-wider transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            PREDICTIVE INTELLIGENCE
          </h2>
          <p className="text-sm text-muted-foreground">AI-powered forecasting for your empire</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} variant="glow" className="self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-2" /> Initialize Vector
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Avg Confidence", value: `${avgConfidence}%`, color: "text-primary", border: "border-primary/20" },
          { label: "Pending", value: statusCounts.pending, color: "text-amber-400", border: "border-amber-500/20" },
          { label: "Confirmed", value: statusCounts.confirmed, color: "text-emerald-400", border: "border-emerald-500/20" },
          { label: "Refuted", value: statusCounts.refuted, color: "text-red-400", border: "border-red-500/20" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-panel rounded-xl p-4 border ${stat.border}`}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen} title="New Prediction Vector">
        <PredictionForm onSuccess={() => setIsFormOpen(false)} />
      </Dialog>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(d => ({ ...d, isOpen: false }))}
        onConfirm={() => deleteMutation.mutate({ id: deleteConfirm.id })}
        name={deleteConfirm.name}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-4 sm:p-6 rounded-xl border border-primary/10 h-56 sm:h-64">
          <h3 className="text-xs sm:text-sm font-display uppercase tracking-widest text-primary mb-3 sm:mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Confidence Distribution
          </h3>
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="space-y-4 w-full">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-3 bg-white/5 rounded w-12" />
                    <div className="h-8 bg-white/5 rounded flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={chartTooltipStyle}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-4 sm:p-6 rounded-xl border border-secondary/10 h-56 sm:h-64"
        >
          <h3 className="text-xs sm:text-sm font-display uppercase tracking-widest text-secondary mb-3 sm:mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Confidence Trend with Intervals
          </h3>
          {isLoading || trendData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="space-y-3 w-full animate-pulse">
                <div className="h-full bg-white/5 rounded" />
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="confInterval" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="confLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confInterval)" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" />
                <Line type="monotone" dataKey="confidence" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel rounded-xl animate-pulse p-5 space-y-4">
              <div className="flex justify-between">
                <div className="h-5 bg-white/5 rounded w-20" />
                <div className="h-5 bg-white/5 rounded w-16" />
              </div>
              <div className="flex gap-4">
                <div className="w-[60px] h-[60px] rounded-full bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                </div>
              </div>
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))
        ) : predictions?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium mb-1">No active predictions</p>
            <p className="text-xs text-muted-foreground/60">Neural net idle. Click "Initialize Vector" to begin.</p>
          </div>
        ) : (
          predictions?.map((pred, i) => (
            <motion.div
              key={pred.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-xl p-5 flex flex-col group hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <Badge variant="secondary" className="font-mono bg-secondary/10 text-secondary border-secondary/20">
                  {pred.category}
                </Badge>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(pred.status)} className="uppercase text-[10px]">
                    {pred.status}
                  </Badge>
                  <button 
                    onClick={() => setDeleteConfirm({ isOpen: true, id: pred.id, name: pred.title })}
                    className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <CircularProgress 
                  value={pred.confidence} 
                  size={60} 
                  strokeWidth={4}
                  colorClass={getConfidenceColor(pred.confidence)}
                />
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors">{pred.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pred.description}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground font-mono gap-2">
                <div className="flex items-center gap-1.5 text-foreground/80 min-w-0 truncate">
                  <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{pred.outcome}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-secondary" />
                  {pred.timeframe}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
