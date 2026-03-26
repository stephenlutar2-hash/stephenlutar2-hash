import { useState, useEffect } from "react";
import SocialLayout from "@/components/social/SocialLayout";
import { getSocialStatus, listScheduledPosts } from "@/lib/api";
import {
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";

interface PlatformStatus {
  platform: string;
  configured: boolean;
  connected: boolean;
  message: string;
}

interface PostSummary {
  total: number;
  draft: number;
  scheduled: number;
  published: number;
  failed: number;
}

export default function SocialDashboard() {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([]);
  const [postSummary, setPostSummary] = useState<PostSummary>({
    total: 0,
    draft: 0,
    scheduled: 0,
    published: 0,
    failed: 0,
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statusRes, postsRes] = await Promise.allSettled([
          getSocialStatus(),
          listScheduledPosts(),
        ]);

        if (statusRes.status === "fulfilled") {
          setPlatforms(statusRes.value.platforms || []);
        }

        if (postsRes.status === "fulfilled") {
          const posts = postsRes.value.data || [];
          setRecentPosts(posts.slice(0, 5));
          const summary = {
            total: posts.length,
            draft: posts.filter((p: any) => p.status === "draft").length,
            scheduled: posts.filter((p: any) => p.status === "scheduled").length,
            published: posts.filter((p: any) => p.status === "published").length,
            failed: posts.filter((p: any) => p.status === "failed").length,
          };
          setPostSummary(summary);
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const statCards = [
    { label: "Total Posts", value: postSummary.total, icon: Send, color: "text-primary" },
    { label: "Scheduled", value: postSummary.scheduled, icon: Clock, color: "text-blue-400" },
    { label: "Published", value: postSummary.published, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Failed", value: postSummary.failed, icon: AlertCircle, color: "text-red-400" },
  ];

  const quickActions = [
    { label: "Generate Content", path: "/social-command/generator", icon: Sparkles, desc: "AI-powered post creation" },
    { label: "View Calendar", path: "/social-command/calendar", icon: Calendar, desc: "See your content schedule" },
    { label: "Check Analytics", path: "/social-command/analytics", icon: TrendingUp, desc: "Engagement metrics" },
  ];

  const platformIcons: Record<string, string> = {
    meta: "📘",
    twitter: "𝕏",
    linkedin: "💼",
  };

  if (loading) {
    return (
      <SocialLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Social Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your social media presence across all platforms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-card/50 border border-border/50 rounded-xl p-5 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                  <span className="text-2xl font-bold text-foreground">
                    {card.value}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="group bg-card/50 border border-border/50 rounded-xl p-5 backdrop-blur-sm hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">
                        {action.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {action.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Platform Connections
            </h3>
            <div className="space-y-3">
              {platforms.map((p) => (
                <div
                  key={p.platform}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{platformIcons[p.platform] || "📱"}</span>
                    <span className="text-sm font-medium text-foreground capitalize">
                      {p.platform === "twitter" ? "X (Twitter)" : p.platform}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      p.connected
                        ? "bg-emerald-500/15 text-emerald-400"
                        : p.configured
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.connected ? "Connected" : p.configured ? "Ready" : "Not configured"}
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/social-command/connections"
              className="mt-4 text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              Manage connections <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Recent Posts
            </h3>
            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <Send className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No posts yet</p>
                <Link
                  to="/social-command/generator"
                  className="text-sm text-primary hover:text-primary/80 mt-2 inline-block"
                >
                  Create your first post
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post: any) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0"
                  >
                    <span className="text-sm mt-0.5">
                      {platformIcons[post.platform] || "📱"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {post.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {post.status} · {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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
