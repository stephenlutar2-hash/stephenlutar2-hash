import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Sparkles, LogOut, Menu, X, Upload, BarChart3, Calendar,
  FileText, Eye, Send, Archive, Plus, GripVertical, Clock,
  TrendingUp, ArrowRight, Loader, CheckCircle2, AlertCircle,
  Filter, ChevronDown, MoreHorizontal, Zap
} from "lucide-react";

type PipelineStage = "draft" | "review" | "published" | "archived";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  stage: PipelineStage;
  type: "article" | "video" | "social" | "email";
  engagement: number;
  author: string;
  updatedAt: string;
  thumbnail?: string;
}

const stageConfig: Record<PipelineStage, { label: string; icon: typeof FileText; color: string; bg: string; borderColor: string }> = {
  draft: { label: "Draft", icon: FileText, color: "text-gray-400", bg: "bg-gray-500/10", borderColor: "border-gray-500/20" },
  review: { label: "In Review", icon: Eye, color: "text-amber-400", bg: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  published: { label: "Published", icon: Send, color: "text-emerald-400", bg: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
  archived: { label: "Archived", icon: Archive, color: "text-blue-400", bg: "bg-blue-500/10", borderColor: "border-blue-500/20" },
};

const typeColors: Record<string, string> = {
  article: "bg-violet-500/20 text-violet-400",
  video: "bg-rose-500/20 text-rose-400",
  social: "bg-cyan-500/20 text-cyan-400",
  email: "bg-amber-500/20 text-amber-400",
};

const initialItems: ContentItem[] = [
  { id: "c1", title: "Q1 Brand Story Series", description: "Multi-part narrative exploring our brand evolution", stage: "draft", type: "article", engagement: 0, author: "Creative Team", updatedAt: "2 hours ago" },
  { id: "c2", title: "Product Launch Video", description: "60-second hero video for social distribution", stage: "draft", type: "video", engagement: 0, author: "Video Dept", updatedAt: "5 hours ago" },
  { id: "c3", title: "Weekly Newsletter #42", description: "Industry insights and product updates", stage: "review", type: "email", engagement: 0, author: "Content Ops", updatedAt: "1 hour ago" },
  { id: "c4", title: "Instagram Campaign — Spring", description: "12-post carousel with engagement hooks", stage: "review", type: "social", engagement: 0, author: "Social Team", updatedAt: "3 hours ago" },
  { id: "c5", title: "Case Study: Enterprise Deploy", description: "Deep-dive into successful enterprise client onboarding", stage: "published", type: "article", engagement: 4521, author: "Marketing", updatedAt: "1 day ago" },
  { id: "c6", title: "Thought Leadership Post", description: "LinkedIn article on AI-driven content strategy", stage: "published", type: "article", engagement: 2890, author: "CEO", updatedAt: "2 days ago" },
  { id: "c7", title: "Holiday Campaign Wrap", description: "Full analysis of Q4 holiday campaign performance", stage: "published", type: "social", engagement: 8734, author: "Social Team", updatedAt: "3 days ago" },
  { id: "c8", title: "Legacy Brand Guidelines v1", description: "Original brand guidelines document", stage: "archived", type: "article", engagement: 1200, author: "Design", updatedAt: "2 weeks ago" },
  { id: "c9", title: "Email Template Archive", description: "Previous season email templates", stage: "archived", type: "email", engagement: 890, author: "Content Ops", updatedAt: "1 month ago" },
  { id: "c10", title: "A/B Test: CTA Variants", description: "Testing button color and copy variations on landing page", stage: "review", type: "article", engagement: 0, author: "Growth Team", updatedAt: "4 hours ago" },
];

const funnelData = [
  { stage: "Reach", value: 125000, color: "from-violet-500 to-purple-600" },
  { stage: "Engagement", value: 34200, color: "from-blue-500 to-cyan-500" },
  { stage: "Click-through", value: 8900, color: "from-cyan-500 to-teal-500" },
  { stage: "Conversion", value: 2340, color: "from-emerald-500 to-green-500" },
];

export default function ContentPipeline() {
  const [, setLocation] = useLocation();
  const [items, setItems] = useState(initialItems);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (submitTimer.current) clearTimeout(submitTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  function logout() {
    const token = localStorage.getItem("szl_token");
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  function moveItem(itemId: string, newStage: PipelineStage) {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, stage: newStage, updatedAt: "Just now" } : item
    ));
  }

  function addItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const description = fd.get("description") as string;
    const type = fd.get("type") as ContentItem["type"];
    if (!title.trim()) { setFormError("Title is required"); return; }
    setFormError("");
    setFormSubmitting(true);
    submitTimer.current = setTimeout(() => {
      setItems(prev => [...prev, {
        id: `c-${Date.now()}`,
        title,
        description: description || "New content item",
        stage: "draft",
        type: type || "article",
        engagement: 0,
        author: "You",
        updatedAt: "Just now",
      }]);
      setFormSubmitting(false);
      setFormSuccess(true);
      closeTimer.current = setTimeout(() => { setFormSuccess(false); setShowForm(false); }, 1500);
    }, 600);
  }

  const stages: PipelineStage[] = ["draft", "review", "published", "archived"];
  const maxFunnel = funnelData[0].value;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center cursor-pointer" onClick={() => setLocation("/dashboard")}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-wider">DREAMERA</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Content Pipeline</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Dashboard</Link>
            <Link href="/content-pipeline" className="px-3 py-2 rounded-lg text-sm bg-violet-500/10 text-violet-400 border border-violet-500/20">Pipeline</Link>
            <Link href="/campaign-analytics" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Analytics</Link>
            <Link href="/content-calendar" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Calendar</Link>
            <Link href="/story-intelligence" className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Intelligence</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold hover:bg-violet-500/20 transition">
              <Plus className="w-4 h-4" /> New Content
            </button>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <div className="px-4 py-3 space-y-1">
                <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Dashboard</Link>
                <Link href="/content-pipeline" className="block px-3 py-2 rounded-lg text-sm bg-violet-500/10 text-violet-400 border border-violet-500/20">Pipeline</Link>
                <Link href="/campaign-analytics" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Analytics</Link>
                <Link href="/content-calendar" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Calendar</Link>
                <Link href="/story-intelligence" className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">Intelligence</Link>
                <button onClick={() => setShowForm(true)} className="w-full text-left px-3 py-2 rounded-lg text-sm text-violet-400 hover:bg-white/5 transition flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Content
                </button>
                <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
            Content Pipeline
          </h2>
          <p className="text-sm text-gray-500 mt-1">Drag content through your production workflow</p>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <form onSubmit={addItem} className="p-6 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-4">
                <h3 className="text-lg font-display font-bold text-white">New Content Item</h3>
                {formError && <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm"><AlertCircle className="w-4 h-4" />{formError}</div>}
                {formSuccess && <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm"><CheckCircle2 className="w-4 h-4" />Content added!</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input name="title" placeholder="Content Title" required disabled={formSubmitting || formSuccess} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition text-sm disabled:opacity-50" />
                  <select name="type" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition text-sm appearance-none">
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="social">Social Post</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <textarea name="description" placeholder="Description..." rows={2} disabled={formSubmitting || formSuccess} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition text-sm resize-none disabled:opacity-50" />
                <div className="flex gap-3">
                  <button type="submit" disabled={formSubmitting || formSuccess} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
                    {formSubmitting ? <><Loader className="w-4 h-4 animate-spin" />Adding...</> : formSuccess ? <><CheckCircle2 className="w-4 h-4" />Added!</> : "Add to Pipeline"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setFormError(""); setFormSuccess(false); }} disabled={formSubmitting} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition disabled:opacity-50">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/[0.02] border border-white/5 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Campaign ROI Funnel</h3>
          </div>
          <div className="space-y-3">
            {funnelData.map((item, i) => (
              <motion.div
                key={item.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-4"
              >
                <span className="text-xs text-gray-400 w-24 text-right shrink-0">{item.stage}</span>
                <div className="flex-1 relative">
                  <div className="h-10 rounded-xl bg-white/[0.03] overflow-hidden" style={{ width: `${Math.max((item.value / maxFunnel) * 100, 15)}%` }}>
                    <motion.div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-end px-3`}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                    >
                      <span className="text-xs font-bold text-white">{item.value.toLocaleString()}</span>
                    </motion.div>
                  </div>
                </div>
                {i < funnelData.length - 1 && (
                  <span className="text-[10px] text-gray-600 w-12 shrink-0">
                    {((funnelData[i + 1].value / item.value) * 100).toFixed(1)}%
                  </span>
                )}
              </motion.div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-gray-400">Overall conversion: <span className="text-emerald-400 font-bold">{((funnelData[3].value / funnelData[0].value) * 100).toFixed(2)}%</span></span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stages.map((stage, si) => {
            const config = stageConfig[stage];
            const stageItems = items.filter(item => item.stage === stage);
            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + si * 0.05 }}
                className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const itemId = e.dataTransfer.getData("text/plain");
                  if (itemId) moveItem(itemId, stage);
                  setDraggedItem(null);
                }}
              >
                <div className={`px-4 py-3 border-b border-white/5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-sm font-bold text-white">{config.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.color} border ${config.borderColor}`}>
                    {stageItems.length}
                  </span>
                </div>
                <div className="p-3 space-y-2 min-h-[200px]">
                  {stageItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData("text/plain", item.id);
                        setDraggedItem(item.id);
                      }}
                      onDragEnd={() => setDraggedItem(null)}
                    >
                      <motion.div
                        layout
                        whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.12)" }}
                        className={`p-3 rounded-xl bg-white/[0.03] border border-white/5 cursor-grab active:cursor-grabbing transition-all ${
                          draggedItem === item.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-medium text-white line-clamp-1">{item.title}</h4>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${typeColors[item.type]}`}>
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-gray-600">
                          <span>{item.author}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {item.updatedAt}
                          </span>
                        </div>
                        {item.engagement > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1">
                            <BarChart3 className="w-3 h-3 text-violet-400" />
                            <span className="text-[10px] text-violet-400 font-bold">{item.engagement.toLocaleString()} engagements</span>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  ))}
                  {stageItems.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-gray-700 text-xs">
                      Drop items here
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
