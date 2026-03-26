import { useState, useEffect } from "react";
import SocialLayout from "@/components/social/SocialLayout";
import { getSocialAnalytics, listScheduledPosts } from "@/lib/api";
import {
  BarChart3,
  Eye,
  MousePointerClick,
  Heart,
  Share2,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const PLATFORM_NAMES: Record<string, string> = {
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
  meta: "Meta (Facebook)",
};

const PLATFORM_ICONS: Record<string, string> = {
  meta: "📘",
  twitter: "𝕏",
  linkedin: "💼",
};

interface PostMetrics {
  id: number;
  platform: string;
  content: string;
  status: string;
  impressions: number;
  clicks: number;
  likes: number;
  shares: number;
  reach: number;
  publishedAt: string | null;
}

export default function SocialAnalytics() {
  const [posts, setPosts] = useState<PostMetrics[]>([]);
  const [platformAnalytics, setPlatformAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [analyticsRes, postsRes] = await Promise.allSettled([
        getSocialAnalytics(),
        listScheduledPosts({ status: "published" }),
      ]);
      if (analyticsRes.status === "fulfilled") {
        setPlatformAnalytics(analyticsRes.value);
      }
      if (postsRes.status === "fulfilled") {
        setPosts(postsRes.value.data || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = selectedPlatform
    ? posts.filter((p) => p.platform === selectedPlatform)
    : posts;

  const aggregate = {
    totalPosts: filteredPosts.length,
    totalImpressions: filteredPosts.reduce((s, p) => s + p.impressions, 0),
    totalClicks: filteredPosts.reduce((s, p) => s + p.clicks, 0),
    totalLikes: filteredPosts.reduce((s, p) => s + p.likes, 0),
    totalShares: filteredPosts.reduce((s, p) => s + p.shares, 0),
    totalReach: filteredPosts.reduce((s, p) => s + p.reach, 0),
  };

  const engagementRate =
    aggregate.totalImpressions > 0
      ? (((aggregate.totalClicks + aggregate.totalLikes + aggregate.totalShares) /
          aggregate.totalImpressions) *
          100
        ).toFixed(2)
      : "0.00";

  const metricCards = [
    { label: "Total Impressions", value: aggregate.totalImpressions, icon: Eye, color: "text-blue-400" },
    { label: "Total Clicks", value: aggregate.totalClicks, icon: MousePointerClick, color: "text-emerald-400" },
    { label: "Total Likes", value: aggregate.totalLikes, icon: Heart, color: "text-red-400" },
    { label: "Total Shares", value: aggregate.totalShares, icon: Share2, color: "text-purple-400" },
    { label: "Total Reach", value: aggregate.totalReach, icon: Users, color: "text-amber-400" },
    { label: "Engagement Rate", value: `${engagementRate}%`, icon: TrendingUp, color: "text-primary" },
  ];

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Track engagement and performance across platforms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              <option value="">All Platforms</option>
              <option value="twitter">X (Twitter)</option>
              <option value="linkedin">LinkedIn</option>
              <option value="meta">Meta</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-card/50 border border-border/50 rounded-xl p-5 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {typeof card.value === "number"
                    ? card.value.toLocaleString()
                    : card.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>

        {platformAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {["twitter", "linkedin", "meta"].map((platform) => {
              const data = platformAnalytics[platform];
              if (!data) return null;
              return (
                <div
                  key={platform}
                  className="bg-card/50 border border-border/50 rounded-xl p-5 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{PLATFORM_ICONS[platform]}</span>
                    <h3 className="font-semibold text-foreground">
                      {PLATFORM_NAMES[platform]}
                    </h3>
                    <span
                      className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        data.connected
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {data.connected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  {data.connected && data.metrics ? (
                    <div className="space-y-2">
                      {Object.entries(data.metrics).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-1 border-b border-border/30 last:border-0"
                        >
                          <span className="text-xs text-muted-foreground capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {typeof val === "number" ? val.toLocaleString() : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {data.connected
                        ? "No metrics available yet"
                        : "Connect your account to see metrics"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Post Performance
          </h3>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No published posts to analyze yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">
                      Platform
                    </th>
                    <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">
                      Content
                    </th>
                    <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium">
                      Impressions
                    </th>
                    <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium">
                      Clicks
                    </th>
                    <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium">
                      Likes
                    </th>
                    <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium">
                      Shares
                    </th>
                    <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium">
                      Reach
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-b border-border/20 hover:bg-muted/20"
                    >
                      <td className="py-2.5 px-2">
                        <span>{PLATFORM_ICONS[post.platform] || "📱"}</span>
                      </td>
                      <td className="py-2.5 px-2 max-w-[200px]">
                        <p className="truncate text-foreground">{post.content}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </td>
                      <td className="py-2.5 px-2 text-right text-foreground">
                        {post.impressions.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right text-foreground">
                        {post.clicks.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right text-foreground">
                        {post.likes.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right text-foreground">
                        {post.shares.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right text-foreground">
                        {post.reach.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SocialLayout>
  );
}
