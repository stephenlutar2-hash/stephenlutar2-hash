import React, { useState } from "react";
import { format } from "date-fns";
import { Plus, Target, Trash2, Brain, Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { usePredictions, useDeletePrediction } from "@/hooks/use-predictions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { CircularProgress } from "@/components/CircularProgress";
import { PredictionForm } from "@/components/PredictionForm";

export default function Predictions() {
  const { data: predictions, isLoading } = usePredictions();
  const deleteMutation = useDeletePrediction();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Calculate chart data
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            PREDICTIVE INTELLIGENCE
          </h2>
          <p className="text-muted-foreground">AI-powered forecasting for your empire</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} variant="glow">
          <Plus className="w-4 h-4 mr-2" /> Initialize Vector
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen} title="New Prediction Vector">
        <PredictionForm onSuccess={() => setIsFormOpen(false)} />
      </Dialog>

      {/* Analytics Chart */}
      <div className="glass-panel p-6 rounded-xl border border-primary/10 h-64">
        <h3 className="text-sm font-display uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Confidence Distribution
        </h3>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground animate-pulse">Loading neural data...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: '#fff' }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel h-64 rounded-xl animate-pulse" />
          ))
        ) : predictions?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No active predictions. Neural net idle.</p>
          </div>
        ) : (
          predictions?.map((pred) => (
            <motion.div
              key={pred.id}
              layoutId={`pred-${pred.id}`}
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
                    onClick={() => deleteMutation.mutate({ id: pred.id })}
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
                <div>
                  <h4 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors">{pred.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pred.description}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <div className="flex items-center gap-1.5 text-foreground/80">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  {pred.outcome}
                </div>
                <div className="flex items-center gap-1.5">
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
