import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingUp, Scale, Globe2, Cpu, Clock, Tag, ArrowUpRight } from "lucide-react";
import { cn, getApiBase, formatDate } from "@/lib/utils";

const categoryIcons: Record<string, any> = {
  market: TrendingUp,
  regulatory: Scale,
  geopolitical: Globe2,
  technology: Cpu,
};

const categoryColors: Record<string, string> = {
  market: "text-cyan-400 bg-cyan-500/10",
  regulatory: "text-purple-400 bg-purple-500/10",
  geopolitical: "text-orange-400 bg-orange-500/10",
  technology: "text-emerald-400 bg-emerald-500/10",
};

const impactColors: Record<string, string> = {
  critical: "text-red-400 bg-red-500/15 border-red-500/30",
  high: "text-orange-400 bg-orange-500/15 border-orange-500/30",
  medium: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30",
  low: "text-blue-400 bg-blue-500/15 border-blue-500/30",
};

export default function IntelligenceView() {
  const { data, isLoading } = useQuery({
    queryKey: ["intelligence"],
    queryFn: () => fetch(`${getApiBase()}/intelligence`).then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const intelligence = data?.intelligence || [];
  const categories = [...new Set(intelligence.map((i: any) => i.category))] as string[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Maritime Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Industry insights, regulatory updates, and market analysis</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {categories.map(cat => {
          const Icon = categoryIcons[cat] || Brain;
          const count = intelligence.filter((i: any) => i.category === cat).length;
          return (
            <div key={cat} className="glass-panel rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-7 h-7 rounded-md flex items-center justify-center", categoryColors[cat])}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider capitalize">{cat}</span>
              </div>
              <div className="text-2xl font-display font-bold">{count}</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {intelligence.map((item: any) => {
          const Icon = categoryIcons[item.category] || Brain;
          return (
            <div key={item.id} className="glass-panel rounded-xl p-6 hover:border-cyan-500/15 transition">
              <div className="flex items-start gap-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", categoryColors[item.category])}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-display font-semibold leading-tight">{item.title}</h3>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border capitalize shrink-0", impactColors[item.impact])}>
                      {item.impact} impact
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.summary}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> {item.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(item.timestamp)}
                    </span>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.tags.map((tag: string) => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-xs text-muted-foreground">
                          <Tag className="w-2.5 h-2.5" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
