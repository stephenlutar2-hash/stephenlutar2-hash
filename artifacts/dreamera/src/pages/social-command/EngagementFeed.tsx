import { useState, useEffect } from "react";
import SocialLayout from "@/components/social/SocialLayout";
import { getEngagementFeed, pollEngagement } from "@/lib/api";
import {
  Zap,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Users,
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react";

const PLATFORM_ICONS: Record<string, string> = {
  meta: "📘", twitter: "𝕏", linkedin: "💼", instagram: "📸",
  youtube: "▶️", medium: "✍️", substack: "📰",
};

const PLATFORM_NAMES: Record<string, string> = {
  twitter: "X (Twitter)", linkedin: "LinkedIn", meta: "Meta",
  instagram: "Instagram", youtube: "YouTube", medium: "Medium", substack: "Substack",
};

export default function EngagementFeed() {
  const [feedData, setFeedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState<number | null>(null);

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    setLoading(true);
    try {
      const data = await getEngagementFeed();
      setFeedData(data);
    } catch {
      setFeedData(null);
    } finally {
      setLoading(false);
    }
  }

  const handlePollPost = async (postId: number) => {
    setPolling(postId);
    try {
      await pollEngagement(postId);
      await loadFeed();
    } catch (e) {
      console.error("Poll failed:", e);
    } finally {
      setPolling(null);
    }
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

  const summary = feedData?.summary || {};
  const recentPosts = feedData?.recentPosts || [];
  const byPlatform = feedData?.byPlatform || {};

  return (
    <SocialLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Engagement Feed
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time engagement tracking across all platforms
            </p>
          </div>
          <button
            onClick={loadFeed}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Posts", value: summary.totalPosts || 0, icon: Zap, color: "text-primary" },
            { label: "Impressions", value: summary.totalImpressions || 0, icon: Eye, color: "text-blue-400" },
            { label: "Likes", value: summary.totalLikes || 0, icon: Heart, color: "text-red-400" },
            { label: "Shares", value: summary.totalShares || 0, icon: Share2, color: "text-purple-400" },
            { label: "Comments", value: summary.totalComments || 0, icon: MessageCircle, color: "text-orange-400" },
            { label: "Reach", value: summary.totalReach || 0, icon: Users, color: "text-amber-400" },
            { label: "Engagement Rate", value: `${summary.engagementRate || "0.00"}%`, icon: TrendingUp, color: "text-emerald-400" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-card/50 border border-border/50 rounded-xl p-5 backdrop-blur-sm">
                <Icon className={`w-5 h-5 ${card.color} mb-3`} />
                <p className="text-2xl font-bold text-foreground">
                  {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>

        {Object.keys(byPlatform).length > 0 && (
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Platform Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(byPlatform).map(([platform, data]: [string, any]) => (
                <div key={platform} className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{PLATFORM_ICONS[platform]}</span>
                    <span className="text-sm font-medium text-foreground">{PLATFORM_NAMES[platform]}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{data.posts} posts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1"><Eye className="w-3 h-3 text-blue-400" /><span className="text-foreground">{data.impressions.toLocaleString()}</span></div>
                    <div className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /><span className="text-foreground">{data.likes.toLocaleString()}</span></div>
                    <div className="flex items-center gap-1"><Share2 className="w-3 h-3 text-purple-400" /><span className="text-foreground">{data.shares.toLocaleString()}</span></div>
                    <div className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-orange-400" /><span className="text-foreground">{data.comments.toLocaleString()}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Published Posts</h3>
          {recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No published posts to track yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/20 border border-border/30"
                >
                  <span className="text-lg mt-0.5">{PLATFORM_ICONS[post.platform] || "📱"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.impressions.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{post.shares.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{(post.comments || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePollPost(post.id)}
                    disabled={polling === post.id}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Poll engagement metrics"
                  >
                    {polling === post.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SocialLayout>
  );
}
