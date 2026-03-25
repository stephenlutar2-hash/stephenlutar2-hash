import { useState } from "react";
import { format } from "date-fns";
import { useContent, useMutateContent, useCampaigns, useMutateCampaigns } from "@/hooks/use-dreamera";
import { Layout } from "@/components/Layout";
import { Modal } from "@/components/Modal";
import { Plus, Edit2, Trash2, MonitorPlay, FileVideo, Eye, Heart } from "lucide-react";
import { cn } from "@workspace/ui";
import type { DreameraContent } from "@workspace/api-client-react";

export default function DreamEra() {
  const { data: content, isLoading: loadingContent } = useContent();
  const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns();
  const { create: createContent, update: updateContent, remove: removeContent } = useMutateContent();
  const { create: createCampaign, remove: removeCampaign } = useMutateCampaigns();

  const [contentModal, setContentModal] = useState<{ isOpen: boolean; data?: DreameraContent }>({ isOpen: false });
  const [campaignModal, setCampaignModal] = useState({ isOpen: false });

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

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
              <MonitorPlay className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-white tracking-wide">DREAM ERA</h2>
              <p className="text-muted-foreground text-sm font-mono tracking-wider">GLOBAL MEDIA & LIFESTYLE PLATFORM</p>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
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
              {[1, 2, 3].map(i => <div key={i} className="h-40 glass-panel rounded-xl animate-pulse border-pink-500/20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content?.map(item => (
                <div key={item.id} className="glass-panel rounded-xl p-5 border-pink-500/10 hover:border-pink-500/30 transition-all group relative">
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CAMPAIGNS TABLE */}
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
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading campaigns...</td></tr>
                ) : campaigns?.map(camp => (
                  <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors">
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
                  </tr>
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
