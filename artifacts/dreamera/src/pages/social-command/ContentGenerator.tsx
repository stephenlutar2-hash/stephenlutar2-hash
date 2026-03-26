import { useState } from "react";
import SocialLayout from "@/components/social/SocialLayout";
import { generateContent, createScheduledPost } from "@/lib/api";
import {
  Sparkles,
  Copy,
  Check,
  Send,
  Clock,
  Hash,
  Loader2,
} from "lucide-react";

const TONES = ["Professional", "Casual", "Witty", "Inspirational", "Educational", "Bold"];
const PLATFORMS = [
  { id: "twitter", label: "X (Twitter)", maxLen: 280 },
  { id: "linkedin", label: "LinkedIn", maxLen: 3000 },
  { id: "meta", label: "Meta (Facebook)", maxLen: 5000 },
];

interface GeneratedPost {
  platform: string;
  content: string;
  hashtags: string[];
}

export default function ContentGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter", "linkedin", "meta"]);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedPost[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim() || selectedPlatforms.length === 0) return;
    setGenerating(true);
    setGenerated([]);
    try {
      const result = await generateContent({
        topic: topic.trim(),
        platforms: selectedPlatforms,
        tone,
        includeHashtags,
      });
      setGenerated(result.posts || []);
      const initial: Record<string, string> = {};
      (result.posts || []).forEach((p: GeneratedPost) => {
        initial[p.platform] = p.content;
      });
      setEditedContent(initial);
    } catch (e: any) {
      const fallbackPosts = selectedPlatforms.map((p) => {
        const platform = PLATFORMS.find((pl) => pl.id === p);
        const hashtags = includeHashtags
          ? ["#SZLHoldings", "#Innovation", `#${topic.replace(/\s+/g, "")}`]
          : [];
        let content = "";
        if (p === "twitter") {
          content = `${topic.trim()} — Powered by SZL Holdings. Driving innovation across every vertical. ${hashtags.join(" ")}`;
          if (content.length > 280) content = content.slice(0, 277) + "...";
        } else if (p === "linkedin") {
          content = `🚀 ${topic.trim()}\n\nAt SZL Holdings, we're building the future across cybersecurity, maritime intelligence, financial platforms, and creative technology.\n\nOur approach combines enterprise-grade infrastructure with cutting-edge AI to deliver solutions that matter.\n\n${hashtags.join(" ")}`;
        } else {
          content = `${topic.trim()}\n\nSZL Holdings is committed to innovation and excellence. Learn more about our portfolio of transformative ventures.\n\n${hashtags.join(" ")}`;
        }
        return { platform: p, content, hashtags };
      });
      setGenerated(fallbackPosts);
      const initial: Record<string, string> = {};
      fallbackPosts.forEach((p) => {
        initial[p.platform] = p.content;
      });
      setEditedContent(initial);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (platform: string) => {
    const content = editedContent[platform] || "";
    navigator.clipboard.writeText(content);
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSchedule = async (platform: string, publishNow: boolean) => {
    const content = editedContent[platform] || "";
    if (!content) return;
    setSaving(platform);
    try {
      await createScheduledPost({
        platform,
        content,
        status: publishNow ? "pending" : "draft",
        scheduledAt: publishNow ? new Date().toISOString() : null,
      });
    } catch (e) {
      console.error("Failed to save:", e);
    } finally {
      setSaving(null);
    }
  };

  const getCharCount = (platform: string) => {
    const content = editedContent[platform] || "";
    const config = PLATFORMS.find((p) => p.id === platform);
    return { current: content.length, max: config?.maxLen || 5000 };
  };

  return (
    <SocialLayout>
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Content Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered post creation from your marketing materials
          </p>
        </div>

        <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Topic or Content Brief
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Announce our new cybersecurity platform launch, Share insights about maritime intelligence..."
              className="w-full h-28 bg-input border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tone & Style
              </label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      tone === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedPlatforms.includes(p.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <Hash className="w-4 h-4 text-muted-foreground" />
              Include hashtag suggestions
            </label>

            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim() || selectedPlatforms.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? "Generating..." : "Generate Posts"}
            </button>
          </div>
        </div>

        {generated.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-foreground">
              Generated Content
            </h2>
            {generated.map((post) => {
              const charCount = getCharCount(post.platform);
              const platformConfig = PLATFORMS.find((p) => p.id === post.platform);
              return (
                <div
                  key={post.platform}
                  className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {platformConfig?.label}
                      </span>
                      <span
                        className={`text-xs ${
                          charCount.current > charCount.max
                            ? "text-red-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {charCount.current}/{charCount.max}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(post.platform)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied === post.platform ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={editedContent[post.platform] || ""}
                    onChange={(e) =>
                      setEditedContent((prev) => ({
                        ...prev,
                        [post.platform]: e.target.value,
                      }))
                    }
                    className="w-full bg-input border border-border rounded-lg p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={post.platform === "linkedin" ? 8 : 4}
                  />

                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleSchedule(post.platform, false)}
                      disabled={saving === post.platform}
                      className="flex items-center gap-1.5 px-4 py-2 bg-muted text-foreground rounded-lg text-xs font-medium hover:bg-muted/80 disabled:opacity-50 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Save as Draft
                    </button>
                    <button
                      onClick={() => handleSchedule(post.platform, true)}
                      disabled={saving === post.platform}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Schedule Post
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SocialLayout>
  );
}
