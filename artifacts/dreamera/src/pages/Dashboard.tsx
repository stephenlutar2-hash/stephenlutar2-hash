import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Plus, BookOpen, Map, Star, Clock, Trash2, Edit2, LogOut,
  ChevronRight, Eye, Layers, TrendingUp, Menu, X, Share2, Send,
  MessageSquare, AlertCircle, CheckCircle2, Globe, Twitter, Linkedin,
  Link as LinkIcon, Loader, Upload
} from "lucide-react";

interface Story {
  id: number;
  title: string;
  description: string;
  status: "draft" | "rendering" | "complete";
  artifacts: number;
  energy: number;
  lastEdited: string;
}

const initialStories: Story[] = [
  { id: 1, title: "The Obsidian Chronicles", description: "A multi-layered narrative exploring the boundaries between digital consciousness and reality", status: "complete", artifacts: 24, energy: 92, lastEdited: "2 hours ago" },
  { id: 2, title: "Nebula's Whisper", description: "An interstellar journey through the memories of a dying star system", status: "rendering", artifacts: 16, energy: 67, lastEdited: "5 hours ago" },
  { id: 3, title: "Fractured Symmetry", description: "Parallel timelines converge in a city that exists in two dimensions simultaneously", status: "draft", artifacts: 8, energy: 34, lastEdited: "1 day ago" },
  { id: 4, title: "The Artifact Protocol", description: "When ancient maps begin rewriting themselves, a cartographer must decode the message", status: "complete", artifacts: 31, energy: 98, lastEdited: "3 days ago" },
  { id: 5, title: "Echo Chambers", description: "Stories within stories — an infinite regression of narrative consciousness", status: "draft", artifacts: 3, energy: 12, lastEdited: "1 week ago" },
];

const statusConfig = {
  draft: { label: "Draft", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
  rendering: { label: "Rendering", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  complete: { label: "Complete", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [stories, setStories] = useState(initialStories);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function logout() {
    const token = localStorage.getItem("szl_token");
    if (token) fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem("szl_token");
    localStorage.removeItem("szl_user");
    setLocation("/login");
  }

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const submitTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => {
    clearTimeout(submitTimer.current);
    clearTimeout(closeTimer.current);
  }, []);

  function addStory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const description = fd.get("description") as string;
    if (!title.trim()) {
      setFormError("Story title is required");
      return;
    }
    setFormError("");
    setFormSubmitting(true);

    submitTimer.current = setTimeout(() => {
      if (title.length > 200) {
        setFormSubmitting(false);
        setFormError("Story title exceeds maximum length (200 characters)");
        return;
      }
      if (description && description.length > 2000) {
        setFormSubmitting(false);
        setFormError("Description exceeds maximum length (2000 characters)");
        return;
      }
      setStories(prev => [...prev, {
        id: Date.now(),
        title,
        description: description || "A new narrative awaits...",
        status: "draft",
        artifacts: 0,
        energy: 0,
        lastEdited: "Just now",
      }]);
      setFormSubmitting(false);
      setFormSuccess(true);
      closeTimer.current = setTimeout(() => {
        setFormSuccess(false);
        setShowForm(false);
      }, 1500);
    }, 800);
  }

  function removeStory(id: number) {
    setStories(prev => prev.filter(s => s.id !== id));
  }

  const stats = [
    { label: "Total Stories", value: stories.length, icon: BookOpen, color: "from-violet-500 to-blue-500" },
    { label: "Artifact Maps", value: stories.reduce((sum, s) => sum + s.artifacts, 0), icon: Map, color: "from-blue-500 to-cyan-500" },
    { label: "Avg Energy", value: Math.round(stories.reduce((sum, s) => sum + s.energy, 0) / (stories.length || 1)), icon: TrendingUp, color: "from-violet-500 to-fuchsia-500" },
    { label: "Rendering", value: stories.filter(s => s.status === "rendering").length, icon: Layers, color: "from-blue-500 to-violet-500" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-wider">DREAMERA</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Story Command</p>
            </div>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[9px] font-mono text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full ml-1"><span className="w-1 h-1 rounded-full bg-emerald-400" />SZL Portfolio · Model Quality 82%</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold hover:bg-violet-500/20 transition">
              <Plus className="w-4 h-4" /> New Story
            </button>
            <Link href="/import" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">
              <Upload className="w-4 h-4" /> Import
            </Link>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">
              <LogOut className="w-4 h-4" /> Disconnect
            </button>
          </div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-white/5">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-white/5 overflow-hidden">
              <div className="px-4 py-3 space-y-2">
                <button onClick={() => { setShowForm(true); setMobileMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold">
                  <Plus className="w-4 h-4" /> New Story
                </button>
                <Link href="/import" className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm">
                  <Upload className="w-4 h-4" /> Import Center
                </Link>
                <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm">
                  <LogOut className="w-4 h-4" /> Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Story Archives</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your narrative worlds and artifact maps</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <form onSubmit={addStory} className="p-6 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-4">
                <h3 className="text-lg font-display font-bold text-white">Initialize New Story</h3>
                {formError && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4" />{formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm">
                    <CheckCircle2 className="w-4 h-4" />Story created successfully!
                  </div>
                )}
                <input name="title" placeholder="Story Title" required disabled={formSubmitting || formSuccess} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition text-sm disabled:opacity-50" />
                <textarea name="description" placeholder="Story Description..." rows={3} disabled={formSubmitting || formSuccess} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition text-sm resize-none disabled:opacity-50" />
                <div className="flex gap-3">
                  <button type="submit" disabled={formSubmitting || formSuccess} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
                    {formSubmitting ? <><Loader className="w-4 h-4 animate-spin" />Creating...</> : formSuccess ? <><CheckCircle2 className="w-4 h-4" />Created!</> : "Create Story"}
                  </button>
                  <button type="button" onClick={() => { clearTimeout(submitTimer.current); clearTimeout(closeTimer.current); setShowForm(false); setFormError(""); setFormSuccess(false); setFormSubmitting(false); }} disabled={formSubmitting} className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition disabled:opacity-50">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-lg font-display font-bold text-white truncate">{story.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig[story.status].color}`}>
                      {statusConfig[story.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-1">{story.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Map className="w-3 h-3" />{story.artifacts} artifacts</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{story.energy}% energy</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{story.lastEdited}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="p-2 rounded-lg hover:bg-violet-500/10 text-gray-500 hover:text-violet-400 transition">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeStory(story.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-600 hidden sm:block" />
                </div>
              </div>
            </motion.div>
          ))}

          {stories.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-display font-bold text-gray-500">No Stories Yet</h3>
              <p className="text-sm text-gray-600 mt-1">Initialize your first story to begin exploring narrative space</p>
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/5 to-blue-500/5 border border-violet-500/10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-display font-bold text-white">Creative Inspiration</h2>
              <p className="text-xs text-gray-500 mt-0.5">AI-generated story prompts to spark your next narrative</p>
            </div>
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { prompt: "A clockmaker discovers their creations can manipulate time itself, but each adjustment erases a memory from their past.", genre: "Sci-Fi", energy: "High" },
              { prompt: "In a world where dreams are shared, a lucid dreamer becomes the first person to dream alone — and finds something waiting.", genre: "Horror", energy: "Critical" },
              { prompt: "Two cities exist in the same physical space but different dimensions. When the walls thin, residents begin switching places.", genre: "Fantasy", energy: "Medium" },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-violet-500/20 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">{p.genre}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${p.energy === "High" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : p.energy === "Critical" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>{p.energy} Energy</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{p.prompt}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <SocialMediaSection />
      </main>
    </div>
  );
}

interface PlatformStatus {
  platform: string;
  configured: boolean;
  connected: boolean;
  message: string;
}

const PLATFORM_META = {
  meta: { label: "Meta", icon: Globe, color: "from-blue-500 to-blue-600", textColor: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  twitter: { label: "X (Twitter)", icon: Twitter, color: "from-gray-600 to-gray-700", textColor: "text-gray-300", bgColor: "bg-gray-500/10", borderColor: "border-gray-500/20" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "from-blue-600 to-blue-700", textColor: "text-blue-400", bgColor: "bg-blue-600/10", borderColor: "border-blue-600/20" },
} as const;

function SocialMediaSection() {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [publishContent, setPublishContent] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("meta");
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPublisher, setShowPublisher] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("szl_token");
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    Promise.all([
      fetch("/api/social/status", { headers }).then(r => r.json()),
      fetch("/api/social/analytics", { headers }).then(r => r.json()).catch(() => ({ analytics: {} })),
    ])
      .then(([statusData, analyticsData]) => {
        setPlatforms(statusData.platforms || []);
        setAnalytics(analyticsData.analytics || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    function handleMessage(e: MessageEvent) {
      if (e.data === "social-oauth-complete") {
        const t = localStorage.getItem("szl_token");
        const h: Record<string, string> = {};
        if (t) h.Authorization = `Bearer ${t}`;
        Promise.all([
          fetch("/api/social/status", { headers: h }).then(r => r.json()),
          fetch("/api/social/analytics", { headers: h }).then(r => r.json()).catch(() => ({ analytics: {} })),
        ]).then(([s, a]) => {
          setPlatforms(s.platforms || []);
          setAnalytics(a.analytics || {});
        });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  async function handleOAuthConnect(platform: string) {
    try {
      const token = localStorage.getItem("szl_token");
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/social/oauth/${platform}/authorize`, { headers });
      const data = await res.json();
      if (data.authUrl) {
        window.open(data.authUrl, "_blank", "width=600,height=700");
      } else {
        setPublishResult({ success: false, message: data.error || "Failed to start OAuth" });
      }
    } catch {
      setPublishResult({ success: false, message: "Failed to start OAuth flow" });
    }
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!publishContent.trim()) return;
    setPublishing(true);
    setPublishResult(null);
    try {
      const token = localStorage.getItem("szl_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/social/publish", {
        method: "POST",
        headers,
        body: JSON.stringify({ platform: selectedPlatform, content: publishContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setPublishResult({ success: true, message: `Published to ${selectedPlatform} successfully!` });
        setPublishContent("");
      } else {
        setPublishResult({ success: false, message: data.error || "Failed to publish" });
      }
    } catch (err: any) {
      setPublishResult({ success: false, message: err.message || "Network error" });
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse">
        <div className="h-5 bg-white/5 rounded w-48 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Social Media Hub</h2>
          <p className="text-sm text-muted-foreground mt-1">Publish stories and track engagement across platforms</p>
        </div>
        <button onClick={() => setShowPublisher(!showPublisher)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold hover:bg-violet-500/20 transition">
          <Share2 className="w-4 h-4" /> {showPublisher ? "Close" : "Publish"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {platforms.map(p => {
          const meta = PLATFORM_META[p.platform as keyof typeof PLATFORM_META];
          if (!meta) return null;
          return (
            <div key={p.platform} className={`p-4 rounded-2xl bg-white/[0.03] border ${p.configured ? meta.borderColor : "border-white/5"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
                  <meta.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{meta.label}</p>
                  <p className={`text-xs ${p.configured ? "text-green-400" : "text-gray-500"}`}>
                    {p.connected ? "Connected" : p.configured ? "Ready to connect" : "Not configured"}
                  </p>
                </div>
              </div>
              {!p.configured && (
                <p className="text-xs text-gray-600 leading-relaxed">{p.message}</p>
              )}
              {p.configured && !p.connected && (
                <button
                  onClick={() => handleOAuthConnect(p.platform)}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold hover:bg-violet-500/20 transition inline-flex items-center gap-1.5"
                >
                  <LinkIcon className="w-3 h-3" /> Connect Account
                </button>
              )}
              {p.configured && p.connected && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Connected & Ready
                  </div>
                  {analytics[p.platform]?.metrics && p.platform === "twitter" && (
                    <div className="text-xs text-gray-500 space-y-0.5 mt-2">
                      <p>Followers: {analytics[p.platform].metrics.followers_count?.toLocaleString()}</p>
                      <p>Tweets: {analytics[p.platform].metrics.tweet_count?.toLocaleString()}</p>
                    </div>
                  )}
                  {analytics[p.platform]?.profile && p.platform === "linkedin" && (
                    <div className="text-xs text-gray-500 mt-2">
                      <p>Profile: {analytics[p.platform].profile.name || "Connected"}</p>
                    </div>
                  )}
                  {analytics[p.platform]?.insights?.length > 0 && p.platform === "meta" && (
                    <div className="text-xs text-gray-500 mt-2">
                      <p>Insights: {analytics[p.platform].insights.length} metrics tracked</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showPublisher && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <form onSubmit={handlePublish} className="p-6 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-4">
              <h3 className="text-lg font-display font-bold text-white">Publish Content</h3>
              <div className="flex gap-2">
                {platforms.map(p => {
                  const meta = PLATFORM_META[p.platform as keyof typeof PLATFORM_META];
                  if (!meta) return null;
                  return (
                    <button key={p.platform} type="button" onClick={() => setSelectedPlatform(p.platform)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
                        selectedPlatform === p.platform
                          ? `${meta.bgColor} ${meta.textColor} ${meta.borderColor}`
                          : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
                      }`}
                      disabled={!p.configured}>
                      <meta.icon className="w-3 h-3" />{meta.label}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={publishContent}
                onChange={e => setPublishContent(e.target.value)}
                placeholder="Write your content..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 transition text-sm resize-none"
              />
              {publishResult && (
                <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${
                  publishResult.success ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {publishResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {publishResult.message}
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={publishing || !publishContent.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
                  <Send className="w-4 h-4" /> {publishing ? "Publishing..." : "Publish Now"}
                </button>
                <button type="button" onClick={() => { setShowPublisher(false); setPublishResult(null); }}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
