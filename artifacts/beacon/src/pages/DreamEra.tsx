import { useState, useMemo } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useContent, useMutateContent, useCampaigns, useMutateCampaigns } from "@/hooks/use-dreamera";
import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Plus, Edit2, Trash2, MonitorPlay, FileVideo, Eye, Heart, BarChart3, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@szl-holdings/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, LineChart, Line } from "recharts";
import type { DreameraContent } from "@szl-holdings/api-client-react";

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color: '#fff',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function DreamEra() {
  const { data: content, isLoading: loadingContent, error: contentError } = useContent();
  const { data: campaigns, isLoading: loadingCampaigns, error: campaignsError } = useCampaigns();
  const { create: createContent, update: updateContent, remove: removeContent } = useMutateContent();
  const { create: createCampaign, remove: removeCampaign } = useMutateCampaigns();

  const [contentModal, setContentModal] = useState<{ isOpen: boolean; data?: DreameraContent }>({ isOpen: false });
  const [campaignModal, setCampaignModal] = useState({ isOpen: false });

  const contentChartData = useMemo(() => {
    if (!content) return [];
    const types: Record<string, { views: number; engagement: number; count: number }> = {};
    content.forEach(item => {
      if (!types[item.type]) types[item.type] = { views: 0, engagement: 0, count: 0 };
      types[item.type].views += item.views;
      types[item.type].engagement += item.engagement;
      types[item.type].count += 1;
    });
    return Object.entries(types).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      views: data.views,
      avgEngagement: Math.round(data.engagement / data.count * 10) / 10,
    }));
  }, [content]);

  const engagementTrend = useMemo(() => {
    if (!content) return [];
    return content.slice(0, 8).map((item, i) => ({
      name: item.title.slice(0, 12),
      views: item.views,
      engagement: item.engagement,
    })).reverse();
  }, [content]);

  const totalViews = useMemo(() => content?.reduce((s, c) => s + c.views, 0) || 0, [content]);
  const avgEngagement = useMemo(() => {
    if (!content || content.length === 0) return 0;
    return Math.round(content.reduce((s, c) => s + c.engagement, 0) / content.length * 10) / 10;
  }, [content]);

  const handleContentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title") as string,
      body: fd.get("body") as string,
      type: fd.get("type") as any,
      status: fd.get("status") as any,
      views: Number(fd.get("views")),
      engagement: Number(fd.get("engagement")),
    };

    if (contentModal.data) {
      updateContent.mutate({ id: contentModal.data.id, data });
    } else {
      createContent.mutate({ data });
    }
    setContentModal({ isOpen: false });
  };

  const handleCampaignSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createCampaign.mutate({ data: {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      status: fd.get("status") as any,
      budget: Number(fd.get("budget")),
      reach: Number(fd.get("reach")),
      startDate: new Date(fd.get("startDate") as string).toISOString(),
      endDate: new Date(fd.get("endDate") as string).toISOString(),
    }});
    setCampaignModal({ isOpen: false });
  };

  const hasError = contentError || campaignsError;

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between border-b border-border/50 pb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
              <MonitorPlay className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-wide">DREAM ERA</h2>
              <p className="text-muted-foreground text-sm font-mono tracking-wider">GLOBAL MEDIA & LIFESTYLE PLATFORM</p>
            </div>
          </div>
        </motion.div>

        {hasError && (
          <div className="glass-panel rounded-xl p-6 border border-pink-500/30 bg-pink-500/5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-pink-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Failed to load data</p>
                <p className="text-xs text-muted-foreground mt-0.5">Please check your connection and try again.</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-lg hover:bg-pink-500/20 transition-colors shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Views", value: totalViews.toLocaleString(), color: "text-pink-400", border: "border-pink-500/20" },
            { label: "Avg Engagement", value: `${avgEngagement}%`, color: "text-violet-400", border: "border-violet-500/20" },
            { label: "Content Items", value: (content?.length || 0).toString(), color: "text-cyan-400", border: "border-cyan-500/20" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`glass-panel rounded-xl p-5 border ${stat.border}`}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {!loadingContent && content && content.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-xl p-5 border border-pink-500/10"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-display uppercase tracking-widest text-pink-400">Views by Content Type</h3>
              </div>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contentChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="views" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-xl p-5 border border-violet-500/10"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-display uppercase tracking-widest text-violet-400">Engagement Trend</h3>
              </div>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="engagement" stroke="#a78bfa" strokeWidth={2} fill="url(#engGrad)" dot={{ fill: '#a78bfa', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold text-white">Content Pipeline</h3>
            <button 
              onClick={() => setContentModal({ isOpen: true })}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 text-pink-400 border border-pink-500/50 rounded-lg hover:bg-pink-500 hover:text-white transition-all shadow-[0_0_15px_rgba(236,72,153,0.2)]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Content</span>
            </button>
          </div>
          
          {loadingContent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-panel rounded-xl p-5 animate-pulse border-pink-500/20 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-white/5 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-white/5 rounded w-3/4" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 bg-white/5 rounded" />
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content?.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel rounded-xl p-5 border-pink-500/10 hover:border-pink-500/30 transition-all group relative"
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setContentModal({ isOpen: true, data: item })} className="text-muted-foreground hover:text-white"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => removeContent.mutate({ id: item.id })} className="text-destructive hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="flex items-start gap-3 mb-3 pr-16">
                    <div className="mt-1">
                      <FileVideo className="w-5 h-5 text-pink-400 opacity-80" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white line-clamp-1">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-pink-400 uppercase">{item.type}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className={cn(
                          "text-[10px] font-mono uppercase",
                          item.status === 'published' ? "text-green-400" : "text-yellow-400"
                        )}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{item.body}</p>
                  
                  <div className="flex items-center gap-4 text-sm font-mono pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Eye className="w-4 h-4 text-muted-foreground" /> {item.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Heart className="w-4 h-4 text-muted-foreground" /> {item.engagement}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold text-white">Active Campaigns</h3>
            <button 
              onClick={() => setCampaignModal({ isOpen: true })}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white text-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Launch Campaign</span>
            </button>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden border-pink-500/20">
            <table className="w-full text-left">
              <thead className="bg-black/40 border-b border-pink-500/20 text-xs text-muted-foreground uppercase font-mono">
                <tr>
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4 w-32">Status</th>
                  <th className="px-6 py-4 w-32">Budget</th>
                  <th className="px-6 py-4 w-32">Reach</th>
                  <th className="px-6 py-4 w-48">Duration</th>
                  <th className="px-6 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {loadingCampaigns ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-5 bg-white/5 rounded w-40" /><div className="h-3 bg-white/5 rounded w-56 mt-2" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-white/5 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-white/5 rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-white/5 rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-white/5 rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-5 bg-white/5 rounded w-8" /></td>
                    </tr>
                  ))
                ) : campaigns?.map((camp, i) => (
                  <motion.tr
                    key={camp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{camp.name}</div>
                      <div className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{camp.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border",
                        camp.status === 'active' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      )}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-white">${camp.budget.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-white">{camp.reach.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground text-xs">
                      {format(new Date(camp.startDate), 'MMM d, yyyy')} - <br/>
                      {format(new Date(camp.endDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => removeCampaign.mutate({ id: camp.id })} className="text-destructive hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={contentModal.isOpen} onClose={() => setContentModal({ isOpen: false })} title={contentModal.data ? "Edit Content" : "Create Content"}>
        <form onSubmit={handleContentSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Title</label>
            <input required name="title" defaultValue={contentModal.data?.title} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Format Type</label>
              <select required name="type" defaultValue={contentModal.data?.type || 'video'} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all">
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
                <option value="social">Social</option>
                <option value="campaign">Campaign Asset</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Status</label>
              <select required name="status" defaultValue={contentModal.data?.status || 'draft'} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all">
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Content Body (Synopsis)</label>
            <textarea required name="body" defaultValue={contentModal.data?.body} rows={3} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Projected Views</label>
              <input required type="number" name="views" defaultValue={contentModal.data?.views || 0} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Target Engagement %</label>
              <input required type="number" step="0.1" name="engagement" defaultValue={contentModal.data?.engagement || 0} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setContentModal({ isOpen: false })} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createContent.isPending || updateContent.isPending} className="px-6 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all">
              Save Content
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={campaignModal.isOpen} onClose={() => setCampaignModal({ isOpen: false })} title="Launch Campaign">
        <form onSubmit={handleCampaignSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Campaign Name</label>
            <input required name="name" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Strategy Description</label>
            <textarea required name="description" rows={2} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Budget USD</label>
              <input required type="number" name="budget" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Est. Reach</label>
              <input required type="number" name="reach" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Status</label>
              <select required name="status" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">Start Date</label>
              <input required type="date" name="startDate" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-display text-muted-foreground uppercase tracking-wider">End Date</label>
              <input required type="date" name="endDate" className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-pink-500 transition-all" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setCampaignModal({ isOpen: false })} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={createCampaign.isPending} className="px-6 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20">
              Initialize
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
