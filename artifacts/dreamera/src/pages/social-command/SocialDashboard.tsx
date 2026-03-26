import { useState, useEffect } from "react";
import SocialLayout from "@/components/social/SocialLayout";
import { getDashboardData, suggestContent, listScheduledPosts, getTokenHealth } from "@/lib/api";
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
  Eye,
  MousePointerClick,
  Heart,
  Share2,
  Users,
  Wifi,
  WifiOff,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "wouter";

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
  instagram: "Instagram",
  youtube: "YouTube",
  medium: "Medium",
  substack: "Substack",
  meta: "Meta (Facebook)",
};

const PLATFORM_EMOJIS: Record<string, string> = {
  linkedin: "💼",
  twitter: "𝕏",
  instagram: "📸",
  youtube: "🎬",
  medium: "📝",
  substack: "📰",
  meta: "📘",
};

const CONTENT_PILLARS = [
  "Thought Leadership",
  "Product Launch",
  "Behind the Scenes",
  "Industry Insights",
  "Case Study",
  "Team Culture",
  "Technical Deep Dive",
];

interface PlatformCard {
  id: string;
  name: string;
  color: string;
  status: "connected" | "disconnected" | "expired";
  postsCount: number;
  publishedCount: number;
  scheduledCount: number;
  impressions: number;
  followers: number;
  engagementRate: number;
}

interface DashboardData {
  aggregate: {
    totalPosts: number;
    published: number;
    scheduled: number;
    failed: number;
    draft: number;
    impressions: number;
    clicks: number;
    likes: number;
    shares: number;
    reach: number;
    engagementRate: number;
  };
  platforms: PlatformCard[];
  recentPosts: any[];
}

interface TimelinePost {
  id: number;
  platform: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
}

interface SuggestedPost {
  platform: string;
  content: string;
  hashtags: string[];
}

const PLATFORM_ICONS: Record<string, string> = {
  meta: "📘",
  twitter: "𝕏",
  linkedin: "💼",
  instagram: "📸",
  youtube: "▶️",
  medium: "✍️",
  substack: "📰",
};

const PLATFORM_NAMES: Record<string, string> = {
  meta: "Meta",
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  medium: "Medium",
  substack: "Substack",
};

export default function SocialDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [timelinePosts, setTimelinePosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestTopic, setSuggestTopic] = useState("");
  const [suggestPillar, setSuggestPillar] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedPost[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [pipelineView, setPipelineView] = useState<"timeline" | "kanban">("timeline");
  const [tokenHealth, setTokenHealth] = useState<Record<string, any>>({});

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, postsRes, healthRes] = await Promise.allSettled([
          getDashboardData(),
          listScheduledPosts(),
          getTokenHealth(),
        ]);
        if (dashRes.status === "fulfilled") setDashboard(dashRes.value.data);
        if (postsRes.status === "fulfilled") setTimelinePosts(postsRes.value.data || []);
        if (healthRes.status === "fulfilled") setTokenHealth(healthRes.value.health || {});
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSuggest = async () => {
    if (!suggestTopic.trim()) return;
    setSuggesting(true);
    setSuggestions([]);
    try {
      const res = await suggestContent({
        topic: suggestTopic.trim(),
        pillar: suggestPillar || undefined,
      });
      setSuggestions(res.posts || []);
    } catch (e) {
      console.error("Suggest failed:", e);
    } finally {
      setSuggesting(false);
    }
  };

  const handleCopy = (platform: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  };

  const statusGroups = {
    draft: timelinePosts.filter((p) => p.status === "draft"),
    scheduled: timelinePosts.filter((p) => p.status === "scheduled"),
    published: timelinePosts.filter((p) => p.status === "published"),
    failed: timelinePosts.filter((p) => p.status === "failed"),
  };

  const weekGroups = (() => {
    const sorted = [...timelinePosts]
      .filter((p) => p.scheduledAt)
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
    const weeks: Record<string, TimelinePost[]> = {};
    sorted.forEach((post) => {
      const d = new Date(post.scheduledAt!);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split("T")[0];
      if (!weeks[key]) weeks[key] = [];
      weeks[key].push(post);
    });
    return weeks;
  })();

  if (loading) {
    return (
      <SocialLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </SocialLayout>
    );
  }

  const agg = dashboard?.aggregate || {
    totalPosts: 0, published: 0, scheduled: 0, failed: 0, draft: 0,
    impressions: 0, clicks: 0, likes: 0, shares: 0, reach: 0, engagementRate: 0,
  };

  const expiredTokens = Object.entries(tokenHealth).filter(([, h]) => h.status === "expired");

  return (
    <SocialLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Social Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Unified dashboard across all 7 platforms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/social-command/analytics"
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </Link>
            <Link
              to="/social-command/generator"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create Post
            </Link>
          </div>
        </div>

        {expiredTokens.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">Token Health Alert</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {expiredTokens.map(([p]) => PLATFORM_NAMES[p] || p).join(", ")} {expiredTokens.length === 1 ? "has" : "have"} expired tokens.{" "}
              <Link to="/social-command/connections" className="text-primary hover:underline">
                Reconnect now
              </Link>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Posts", value: agg.totalPosts, icon: Send, color: "text-primary" },
            { label: "Published", value: agg.published, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Scheduled", value: agg.scheduled, icon: Clock, color: "text-blue-400" },
            { label: "Impressions", value: agg.impressions.toLocaleString(), icon: Eye, color: "text-violet-400" },
            { label: "Engagement", value: `${agg.engagementRate.toFixed(1)}%`, icon: TrendingUp, color: "text-amber-400" },
            { label: "Reach", value: agg.reach.toLocaleString(), icon: Users, color: "text-cyan-400" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
                <Icon className={`w-4 h-4 ${card.color} mb-2`} />
                <p className="text-xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Platform Connections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {(dashboard?.platforms || []).map((plat) => {
              const StatusIcon = plat.status === "connected" ? Wifi : plat.status === "expired" ? AlertTriangle : WifiOff;
              const statusColor = plat.status === "connected" ? "text-emerald-400" : plat.status === "expired" ? "text-amber-400" : "text-muted-foreground";
              const statusBg = plat.status === "connected" ? "bg-emerald-500/10 border-emerald-500/20" : plat.status === "expired" ? "bg-amber-500/10 border-amber-500/20" : "bg-muted/30 border-border/50";
              return (
                <div key={plat.id} className={`rounded-xl border p-4 backdrop-blur-sm ${statusBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{PLATFORM_EMOJIS[plat.id] || "📱"}</span>
                      <span className="text-sm font-semibold text-foreground">{plat.name}</span>
                    </div>
                    <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Followers</p>
                      <p className="font-semibold text-foreground">{plat.followers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Engagement</p>
                      <p className="font-semibold text-foreground">{plat.engagementRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Posts</p>
                      <p className="font-semibold text-foreground">{plat.postsCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Published</p>
                      <p className="font-semibold text-foreground">{plat.publishedCount}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/30">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                      {plat.status === "connected" ? "Connected" : plat.status === "expired" ? "Token Expired" : "Disconnected"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Content Pipeline</h2>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
              <button
                onClick={() => setPipelineView("timeline")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${pipelineView === "timeline" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Timeline
              </button>
              <button
                onClick={() => setPipelineView("kanban")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${pipelineView === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Kanban
              </button>
            </div>
          </div>

          {pipelineView === "timeline" ? (
            <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
              {Object.keys(weekGroups).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No scheduled posts in the pipeline</p>
                  <Link to="/social-command/generator" className="text-sm text-primary hover:text-primary/80 mt-2 inline-flex items-center gap-1">
                    Create content <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(weekGroups).map(([weekKey, posts]) => {
                    const weekDate = new Date(weekKey);
                    const endDate = new Date(weekDate);
                    endDate.setDate(endDate.getDate() + 6);
                    return (
                      <div key={weekKey}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                          <h3 className="text-sm font-semibold text-foreground">
                            {weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </h3>
                          <span className="text-xs text-muted-foreground">{posts.length} posts</span>
                        </div>
                        <div className="ml-6 space-y-2">
                          {posts.map((post) => {
                            const statusColors: Record<string, string> = {
                              draft: "border-slate-500/30 bg-slate-500/5",
                              scheduled: "border-blue-500/30 bg-blue-500/5",
                              published: "border-emerald-500/30 bg-emerald-500/5",
                              failed: "border-red-500/30 bg-red-500/5",
                            };
                            const statusTextColors: Record<string, string> = {
                              draft: "text-slate-400",
                              scheduled: "text-blue-400",
                              published: "text-emerald-400",
                              failed: "text-red-400",
                            };
                            return (
                              <div key={post.id} className={`border rounded-lg p-3 ${statusColors[post.status] || "border-border/30"}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm">{PLATFORM_EMOJIS[post.platform] || "📱"}</span>
                                  <span className="text-xs font-medium text-foreground">{PLATFORM_LABELS[post.platform] || post.platform}</span>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ml-auto ${statusTextColors[post.status] || "text-muted-foreground"}`}>
                                    {post.status}
                                  </span>
                                  {post.scheduledAt && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {new Date(post.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(["draft", "scheduled", "published", "failed"] as const).map((status) => {
                const posts = statusGroups[status];
                const colors: Record<string, { bg: string; text: string; header: string }> = {
                  draft: { bg: "bg-slate-500/5", text: "text-slate-400", header: "border-slate-500/30" },
                  scheduled: { bg: "bg-blue-500/5", text: "text-blue-400", header: "border-blue-500/30" },
                  published: { bg: "bg-emerald-500/5", text: "text-emerald-400", header: "border-emerald-500/30" },
                  failed: { bg: "bg-red-500/5", text: "text-red-400", header: "border-red-500/30" },
                };
                const c = colors[status];
                return (
                  <div key={status} className={`rounded-xl border border-border/50 ${c.bg} backdrop-blur-sm`}>
                    <div className={`px-4 py-3 border-b ${c.header}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{status}</span>
                        <span className="text-xs text-muted-foreground">{posts.length}</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                      {posts.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No posts</p>
                      ) : (
                        posts.slice(0, 10).map((post) => (
                          <div key={post.id} className="bg-card/50 border border-border/30 rounded-lg p-2.5">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-xs">{PLATFORM_EMOJIS[post.platform] || "📱"}</span>
                              <span className="text-[10px] font-medium text-foreground">{PLATFORM_LABELS[post.platform] || post.platform}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2">{post.content}</p>
                            {post.scheduledAt && (
                              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {new Date(post.scheduledAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Engagement Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Impressions", value: agg.impressions.toLocaleString(), icon: Eye, color: "text-blue-400" },
                { label: "Clicks", value: agg.clicks.toLocaleString(), icon: MousePointerClick, color: "text-emerald-400" },
                { label: "Likes", value: agg.likes.toLocaleString(), icon: Heart, color: "text-red-400" },
                { label: "Shares", value: agg.shares.toLocaleString(), icon: Share2, color: "text-purple-400" },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Icon className={`w-5 h-5 ${m.color}`} />
                    <div>
                      <p className="text-lg font-bold text-foreground">{m.value}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: "Generate Content", path: "/social-command/generator", icon: Sparkles, desc: "AI-powered post creation" },
                { label: "View Calendar", path: "/social-command/calendar", icon: Calendar, desc: "8-week content schedule" },
                { label: "Analytics Dashboard", path: "/social-command/analytics", icon: TrendingUp, desc: "Charts & performance data" },
                { label: "Manage Connections", path: "/social-command/connections", icon: Wifi, desc: "Platform OAuth & tokens" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground">{action.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Content Suggestions
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Topic or Theme</label>
                <input
                  type="text"
                  value={suggestTopic}
                  onChange={(e) => setSuggestTopic(e.target.value)}
                  placeholder="e.g., AI-powered cybersecurity, Building in public, SZL ecosystem update..."
                  className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={(e) => e.key === "Enter" && handleSuggest()}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Content Pillar</label>
                <select
                  value={suggestPillar}
                  onChange={(e) => setSuggestPillar(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select pillar (optional)</option>
                  {CONTENT_PILLARS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleSuggest}
              disabled={suggesting || !suggestTopic.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {suggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {suggesting ? "Generating..." : "Generate Suggestions"}
            </button>

            {suggestions.length > 0 && (
              <div className="space-y-3 mt-4">
                {suggestions.map((post) => (
                  <div key={post.platform} className="border border-border/50 rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{PLATFORM_EMOJIS[post.platform] || "📱"}</span>
                        <span className="text-sm font-semibold text-foreground">{PLATFORM_LABELS[post.platform] || post.platform}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(post.platform, post.content)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        {copied === post.platform ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {post.hashtags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SocialLayout>
  );
}
