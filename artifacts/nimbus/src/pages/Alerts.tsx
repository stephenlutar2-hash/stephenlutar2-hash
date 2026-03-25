import React, { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Plus, Trash2, ShieldAlert, Zap, Radio, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAlerts, useDeleteAlert } from "@/hooks/use-alerts";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { AlertForm } from "@/components/AlertForm";

export default function Alerts() {
  const { data: alerts, isLoading } = useAlerts();
  const deleteMutation = useDeleteAlert();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Calculate chart data
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
      { name: "High", count: counts.high, fill: "#f59e0b" }, // Amber
      { name: "Medium", count: counts.medium, fill: "#eab308" }, // Yellow
      { name: "Low", count: counts.low, fill: "hsl(var(--primary))" },
    ];
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-white">
            SYSTEM ALERTS
          </h2>
          <p className="text-muted-foreground">Neural network anomalies and systemic deviations</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-secondary/20 text-secondary border border-secondary/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:bg-secondary/30">
          <Plus className="w-4 h-4 mr-2" /> Broadcast Alert
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen} title="New System Alert">
        <AlertForm onSuccess={() => setIsFormOpen(false)} />
      </Dialog>

      {/* Analytics Chart */}
      <div className="glass-panel p-6 rounded-xl border border-secondary/20 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <RechartsTooltip 
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: '#fff' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel h-20 rounded-lg animate-pulse" />
          ))
        ) : alerts?.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>System nominal. Zero active alerts.</p>
          </div>
        ) : (
          alerts?.map((alert) => (
            <motion.div
              key={alert.id}
              layoutId={`alert-${alert.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`glass-panel border-l-[3px] rounded-lg p-4 flex items-center justify-between gap-4 group transition-all duration-300 hover:brightness-125 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1 bg-background p-2 rounded-md shadow-inner border border-white/5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-display font-bold text-lg uppercase tracking-wide ${alert.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {alert.title}
                    </h4>
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
                    )}
                    <Badge variant="outline" className="ml-2 text-[10px] font-mono border-white/10 text-muted-foreground">
                      {alert.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{alert.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 pl-4 border-l border-white/5">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Detection Time</div>
                  <div className="text-sm font-medium">{format(new Date(alert.createdAt), "HH:mm:ss.SSS")}</div>
                </div>
                <button 
                  onClick={() => deleteMutation.mutate({ id: alert.id })}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
