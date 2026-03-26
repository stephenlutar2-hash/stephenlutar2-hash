import { useState, useEffect } from "react";
import SocialLayout from "@/components/social/SocialLayout";
import { getAnalyticsChartData } from "@/lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Activity,
  Award,
  Eye,
  MousePointerClick,
  Heart,
  Share2,
} from "lucide-react";

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "X",
  instagram: "Instagram",
  youtube: "YouTube",
  medium: "Medium",
  substack: "Substack",
  meta: "Meta",
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  instagram: "#E4405F",
  youtube: "#FF0000",
  medium: "#000000",
  substack: "#FF6719",
  meta: "#1877F2",
};

interface EngagementTrend {
  week: string;
  impressions: number;
  clicks: number;
  likes: number;
  shares: number;
  engagement: number;
}

interface PlatformComparison {
  platform: string;
  posts: number;
  impressions: number;
  clicks: number;
  engagement: number;
  followers: number;
}

interface TopContent {
  id: number;
  platform: string;
  content: string;
  impressions: number;
  clicks: number;
  likes: number;
  shares: number;
  engagement: number;
}

interface HeatmapCell {
  day: string;
  hour: number;
  count: number;
}

interface AnalyticsData {
  engagementTrend: EngagementTrend[];
  platformComparison: PlatformComparison[];
  postingHeatmap: HeatmapCell[][];
  topContent: TopContent[];
}

export default function SocialAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<"impressions" | "clicks" | "likes" | "shares">("impressions");

  useEffect(() => {
    async function load() {
      try {
        const res = await getAnalyticsChartData();
        setData(res.data);
      } catch (e) {
        console.error("Analytics load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <SocialLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </SocialLayout>
    );
  }

  if (!data) {
    return (
      <SocialLayout>
        <div className="text-center py-20">
          <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </SocialLayout>
    );
  }

  const platformBarData = data.platformComparison.map((p) => ({
    name: PLATFORM_LABELS[p.platform] || p.platform,
    impressions: p.impressions,
    clicks: p.clicks,
    posts: p.posts,
    engagement: p.engagement,
    followers: p.followers,
    fill: PLATFORM_COLORS[p.platform] || "#6366f1",
  }));

  const maxHeat = Math.max(...data.postingHeatmap.flat().map((c) => c.count), 1);

  const metricOptions = [
    { key: "impressions" as const, label: "Impressions", icon: Eye, color: "#60a5fa" },
    { key: "clicks" as const, label: "Clicks", icon: MousePointerClick, color: "#34d399" },
    { key: "likes" as const, label: "Likes", icon: Heart, color: "#f87171" },
    { key: "shares" as const, label: "Shares", icon: Share2, color: "#a78bfa" },
  ];

  return (
    <SocialLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Performance metrics and engagement insights across all platforms</p>
        </div>

        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Engagement Trend (8 Weeks)
            </h3>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
              {metricOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setActiveMetric(opt.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeMetric === opt.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.engagementTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e5e7eb" }}
                formatter={(value: number) => [value.toLocaleString(), activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)]}
              />
              <Line
                type="monotone"
                dataKey={activeMetric}
                stroke={metricOptions.find((m) => m.key === activeMetric)?.color || "#60a5fa"}
                strokeWidth={2.5}
                dot={{ r: 4, fill: metricOptions.find((m) => m.key === activeMetric)?.color || "#60a5fa" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Platform Comparison
          </h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={platformBarData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#e5e7eb", fontSize: 12 }} axisLine={false} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e5e7eb" }}
                formatter={(value: number) => [value.toLocaleString(), "Impressions"]}
              />
              <Bar dataKey="impressions" radius={[0, 4, 4, 0]} barSize={20}>
                {platformBarData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Top Performing Content
          </h3>
          {data.topContent.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No published content to rank yet</p>
          ) : (
            <div className="space-y-3">
              {data.topContent.map((post, idx) => (
                <div key={post.id} className="flex items-start gap-4 p-4 rounded-lg border border-border/30 bg-muted/10 hover:bg-muted/20 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${idx === 0 ? "bg-amber-500/20 text-amber-400" : idx === 1 ? "bg-slate-400/20 text-slate-300" : idx === 2 ? "bg-orange-500/20 text-orange-400" : "bg-muted/30 text-muted-foreground"}`}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PLATFORM_COLORS[post.platform]}20`, color: PLATFORM_COLORS[post.platform] }}>
                        {PLATFORM_LABELS[post.platform] || post.platform}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">{post.engagement}% engagement</span>
                    </div>
                    <p className="text-sm text-foreground">{post.content}</p>
                  </div>
                  <div className="hidden sm:grid grid-cols-4 gap-4 text-right shrink-0">
                    {[
                      { label: "Views", value: post.impressions },
                      { label: "Clicks", value: post.clicks },
                      { label: "Likes", value: post.likes },
                      { label: "Shares", value: post.shares },
                    ].map((m) => (
                      <div key={m.label}>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-sm font-semibold text-foreground">{m.value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Posting Frequency Heatmap
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="flex items-center gap-1 mb-1 pl-12">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-center text-[9px] text-muted-foreground">
                    {i % 3 === 0 ? `${i}:00` : ""}
                  </div>
                ))}
              </div>
              {data.postingHeatmap.map((dayRow, dayIdx) => (
                <div key={dayIdx} className="flex items-center gap-1">
                  <span className="w-10 text-xs text-muted-foreground text-right pr-2 shrink-0">{dayRow[0]?.day}</span>
                  {dayRow.map((cell, hourIdx) => {
                    const intensity = maxHeat > 0 ? cell.count / maxHeat : 0;
                    let bg = "bg-muted/20";
                    if (intensity > 0.8) bg = "bg-emerald-500";
                    else if (intensity > 0.6) bg = "bg-emerald-500/70";
                    else if (intensity > 0.4) bg = "bg-emerald-500/50";
                    else if (intensity > 0.2) bg = "bg-emerald-500/30";
                    else if (intensity > 0) bg = "bg-emerald-500/15";
                    return (
                      <div
                        key={hourIdx}
                        className={`flex-1 h-6 rounded-sm ${bg} transition-colors`}
                        title={`${cell.day} ${cell.hour}:00 — ${cell.count} posts`}
                      />
                    );
                  })}
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 mt-3">
                <span className="text-[10px] text-muted-foreground">Less</span>
                <div className="flex gap-0.5">
                  {["bg-muted/20", "bg-emerald-500/15", "bg-emerald-500/30", "bg-emerald-500/50", "bg-emerald-500/70", "bg-emerald-500"].map((c) => (
                    <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SocialLayout>
  );
}
