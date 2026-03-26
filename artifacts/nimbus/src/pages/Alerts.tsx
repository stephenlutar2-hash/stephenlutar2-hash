import React, { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Plus, Trash2, ShieldAlert, Zap, Radio, Circle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAlerts, useDeleteAlert } from "@/hooks/use-alerts";
import { Button } from "@workspace/ui";
import { Badge } from "@workspace/ui";
import { Dialog } from "@workspace/ui";
import { AlertForm } from "@/components/AlertForm";

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
          <h3 className="text-lg font-display font-bold text-white">Delete Alert</h3>
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

export default function Alerts() {
  const { data: alerts, isLoading, error: alertsError, refetch } = useAlerts();
  const deleteMutation = useDeleteAlert();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number; name: string }>({ isOpen: false, id: 0, name: "" });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const chartData = React.useMemo(() => {
    if (!alerts) return [];
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    alerts.forEach((a) => {
      if (counts[a.severity as keyof typeof counts] !== undefined) {
        counts[a.severity as keyof typeof counts]++;
      }
    });
    return [
      { name: "Critical", count: counts.critical, fill: "hsl(var(--destructive))" },
      { name: "High", count: counts.high, fill: "#f59e0b" },
      { name: "Medium", count: counts.medium, fill: "#eab308" },
      { name: "Low", count: counts.low, fill: "hsl(var(--primary))" },
    ];
  }, [alerts]);

  const severityCounts = React.useMemo(() => {
    if (!alerts) return { critical: 0, high: 0, medium: 0, low: 0 };
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    alerts.forEach(a => {
      if (counts[a.severity as keyof typeof counts] !== undefined) {
        counts[a.severity as keyof typeof counts]++;
      }
    });
    return counts;
  }, [alerts]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <ShieldAlert className="w-5 h-5 text-destructive animate-pulse" />;
      case "high": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "medium": return <Zap className="w-5 h-5 text-yellow-500" />;
      case "low": return <Radio className="w-5 h-5 text-primary" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-l-destructive bg-destructive/5";
      case "high": return "border-l-amber-500 bg-amber-500/5";
      case "medium": return "border-l-yellow-500 bg-yellow-500/5";
      case "low": return "border-l-primary bg-primary/5";
      default: return "border-l-border bg-muted/10";
    }
  };

  return (
    <div className="space-y-8">
      {alertsError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-5 py-3 text-destructive text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="flex-1">Failed to load alert data.</span>
          <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-xs font-bold uppercase tracking-wider transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </motion.div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-white">
            SYSTEM ALERTS
          </h2>
          <p className="text-sm text-muted-foreground">Neural network anomalies and systemic deviations</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-secondary/20 text-secondary border border-secondary/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:bg-secondary/30 self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-2" /> Broadcast Alert
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Critical", value: severityCounts.critical, color: "text-red-400", border: "border-red-500/20", dot: "bg-red-400" },
          { label: "High", value: severityCounts.high, color: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400" },
          { label: "Medium", value: severityCounts.medium, color: "text-yellow-400", border: "border-yellow-500/20", dot: "bg-yellow-400" },
          { label: "Low", value: severityCounts.low, color: "text-primary", border: "border-primary/20", dot: "bg-primary" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-panel rounded-xl p-4 border ${stat.border}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${stat.dot}`} />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
            <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen} title="New System Alert">
        <AlertForm onSuccess={() => setIsFormOpen(false)} />
      </Dialog>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(d => ({ ...d, isOpen: false }))}
        onConfirm={() => deleteMutation.mutate({ id: deleteConfirm.id })}
        name={deleteConfirm.name}
      />

      <div className="glass-panel p-4 sm:p-6 rounded-xl border border-secondary/20 h-44 sm:h-48">
        <h3 className="text-xs sm:text-sm font-display uppercase tracking-widest text-secondary mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Severity Breakdown
        </h3>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="space-y-3 w-full">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-3 bg-white/5 rounded w-16" />
                  <div className="h-5 bg-white/5 rounded flex-1" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: '#fff', borderRadius: '8px' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel rounded-lg animate-pulse p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-white/5 rounded w-1/3" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
              <div className="h-4 bg-white/5 rounded w-20 hidden sm:block" />
            </div>
          ))
        ) : alerts?.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium mb-1">System nominal</p>
            <p className="text-xs text-muted-foreground/60">Zero active alerts. All systems operating within parameters.</p>
          </div>
        ) : (
          alerts?.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass-panel border-l-[3px] rounded-lg overflow-hidden transition-all duration-300 hover:brightness-125 ${getSeverityColor(alert.severity)}`}
            >
              <div
                className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group cursor-pointer"
                onClick={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="mt-0.5 bg-background p-2 rounded-md shadow-inner border border-white/5 shrink-0">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className={`font-display font-bold text-base sm:text-lg uppercase tracking-wide ${alert.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {alert.title}
                      </h4>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse shrink-0" />
                      )}
                      <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-muted-foreground">
                        {alert.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 sm:pl-4 sm:border-l sm:border-white/5 pl-12 sm:pl-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Detection</div>
                    <div className="text-sm font-medium font-mono">{format(new Date(alert.createdAt), "HH:mm:ss")}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, id: alert.id, name: alert.title }); }}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="text-muted-foreground">
                      {expandedId === alert.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === alert.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-white/5 ml-[52px] sm:ml-[60px]">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Full Message</p>
                          <p className="text-sm text-foreground/80">{alert.message}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Severity</p>
                          <Badge variant="outline" className="text-xs uppercase">{alert.severity}</Badge>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Detected At</p>
                          <p className="text-sm font-mono text-foreground/80">{format(new Date(alert.createdAt), "MMM d, yyyy HH:mm:ss")}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
