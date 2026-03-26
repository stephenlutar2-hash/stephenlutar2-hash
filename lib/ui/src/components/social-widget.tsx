import { useState, useEffect, useCallback, useRef } from "react";

export interface SocialWidgetProps {
  appName: string;
  appContext?: string;
  defaultHashtags?: string[];
  accentColor?: string;
  commandCenterUrl?: string;
  getToken?: () => string | null;
}

interface PlatformStatus {
  platform: string;
  configured: boolean;
  connected: boolean;
  message: string;
  tokenHealth?: string;
}

interface SocialPost {
  id: number;
  platform: string;
  content: string;
  status: string;
  scheduledAt?: string | null;
  createdAt?: string;
}

const PLATFORM_META: Record<string, { name: string; icon: string }> = {
  twitter: { name: "X", icon: "𝕏" },
  linkedin: { name: "LinkedIn", icon: "💼" },
  meta: { name: "Facebook", icon: "📘" },
  instagram: { name: "Instagram", icon: "📸" },
  youtube: { name: "YouTube", icon: "▶️" },
  medium: { name: "Medium", icon: "✍️" },
  substack: { name: "Substack", icon: "📰" },
};

function socialApiBase(): string {
  if (typeof window === "undefined") return "";
  return (window as any).__SZL_API_BASE || "";
}

function authHeaders(getToken?: () => string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken?.() || (typeof window !== "undefined" ? localStorage.getItem("szl_token") : null);
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export function SocialShareWidget({
  appName,
  appContext,
  defaultHashtags = ["#SZLHoldings"],
  accentColor = "#a855f7",
  commandCenterUrl,
  getToken,
}: SocialWidgetProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"post" | "status" | "feed">("post");
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [content, setContent] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("twitter");
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<string | null>(null);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${socialApiBase()}/api/social/status`, { headers: authHeaders(getToken) });
      if (res.ok) {
        const json = await res.json();
        setPlatforms(json.platforms || []);
      }
    } catch {}
  }, [getToken]);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch(`${socialApiBase()}/api/social-command/posts`, { headers: authHeaders(getToken) });
      if (res.ok) {
        const json = await res.json();
        setPosts((json.data || []).slice(0, 8));
      }
    } catch {}
  }, [getToken]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([fetchStatus(), fetchFeed()]).finally(() => setLoading(false));
    }
  }, [open, fetchStatus, fetchFeed]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const btn = document.getElementById("szl-social-trigger");
        if (btn && btn.contains(e.target as Node)) return;
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    setPostResult(null);
    try {
      const payload: any = {
        platform: selectedPlatform,
        content: content.trim(),
        status: scheduleMode ? "scheduled" : "draft",
      };
      if (scheduleMode && scheduleDate) {
        payload.scheduledAt = new Date(scheduleDate).toISOString();
      }
      const res = await fetch(`${socialApiBase()}/api/social-command/posts`, {
        method: "POST",
        headers: authHeaders(getToken),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setPostResult(scheduleMode ? "Scheduled!" : "Saved as draft!");
        setContent("");
        setScheduleDate("");
        fetchFeed();
        setTimeout(() => setPostResult(null), 3000);
      } else {
        setPostResult("Failed to save");
      }
    } catch {
      setPostResult("Error posting");
    } finally {
      setPosting(false);
    }
  };

  const prefillContent = () => {
    const ctx = appContext || `Check out ${appName}`;
    const tags = defaultHashtags.join(" ");
    setContent(`${ctx}\n\n${tags}`);
  };

  const connectedCount = platforms.filter((p) => p.connected).length;
  const cmdUrl = commandCenterUrl || "/dreamera/social-command";

  return (
    <>
      <button
        id="szl-social-trigger"
        onClick={() => { setOpen(!open); if (!open && !content) prefillContent(); }}
        style={{ backgroundColor: accentColor }}
        className="fixed bottom-24 right-4 z-[60] w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
        title="Social Media"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        {connectedCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
            {connectedCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-40 right-4 z-[61] w-[360px] max-h-[520px] rounded-2xl border shadow-2xl overflow-hidden flex flex-col"
          style={{
            backgroundColor: "hsl(var(--background, 222 47% 6%))",
            borderColor: "hsl(var(--border, 215 20% 16%))",
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between border-b"
            style={{ borderColor: "hsl(var(--border, 215 20% 16%))" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: accentColor }}
              >
                S
              </div>
              <div>
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "hsl(var(--foreground, 210 40% 98%))" }}
                >
                  Social Hub
                </h3>
                <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground, 215 20% 55%))" }}>
                  {appName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: "hsl(var(--muted-foreground, 215 20% 55%))" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex border-b" style={{ borderColor: "hsl(var(--border, 215 20% 16%))" }}>
            {(["post", "status", "feed"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 text-xs font-medium transition-colors"
                style={{
                  color: tab === t ? accentColor : "hsl(var(--muted-foreground, 215 20% 55%))",
                  borderBottom: tab === t ? `2px solid ${accentColor}` : "2px solid transparent",
                }}
              >
                {t === "post" ? "Quick Post" : t === "status" ? "Platforms" : "Recent"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 380 }}>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${accentColor}40`, borderTopColor: accentColor }} />
              </div>
            ) : tab === "post" ? (
              <div className="space-y-3">
                <div className="flex gap-1.5 flex-wrap">
                  {Object.entries(PLATFORM_META).map(([id, meta]) => {
                    const status = platforms.find((p) => p.platform === id);
                    const available = status?.connected || status?.configured;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedPlatform(id)}
                        disabled={!available}
                        className="px-2 py-1 rounded-md text-[11px] font-medium transition-all disabled:opacity-30"
                        style={{
                          backgroundColor: selectedPlatform === id ? accentColor : "hsl(var(--muted, 217 33% 12%))",
                          color: selectedPlatform === id ? "white" : "hsl(var(--muted-foreground, 215 20% 55%))",
                        }}
                      >
                        {meta.icon} {meta.name}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder={`Share from ${appName}...`}
                  className="w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "hsl(var(--input, 217 33% 10%))",
                    color: "hsl(var(--foreground, 210 40% 98%))",
                    border: "1px solid hsl(var(--border, 215 20% 16%))",
                  }}
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[11px] cursor-pointer" style={{ color: "hsl(var(--muted-foreground, 215 20% 55%))" }}>
                    <input
                      type="checkbox"
                      checked={scheduleMode}
                      onChange={(e) => setScheduleMode(e.target.checked)}
                      className="rounded"
                    />
                    Schedule
                  </label>
                  {scheduleMode && (
                    <input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="text-[11px] rounded px-2 py-1"
                      style={{
                        backgroundColor: "hsl(var(--input, 217 33% 10%))",
                        color: "hsl(var(--foreground, 210 40% 98%))",
                        border: "1px solid hsl(var(--border, 215 20% 16%))",
                      }}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePost}
                    disabled={posting || !content.trim()}
                    className="flex-1 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: accentColor }}
                  >
                    {posting ? "Saving..." : scheduleMode ? "Schedule" : "Save Draft"}
                  </button>
                </div>
                {postResult && (
                  <p className="text-xs text-center" style={{ color: postResult.includes("Failed") || postResult.includes("Error") ? "#ef4444" : "#10b981" }}>
                    {postResult}
                  </p>
                )}
              </div>
            ) : tab === "status" ? (
              <div className="space-y-2">
                {platforms.map((p) => {
                  const meta = PLATFORM_META[p.platform] || { name: p.platform, icon: "📱" };
                  return (
                    <div
                      key={p.platform}
                      className="flex items-center justify-between p-2.5 rounded-lg"
                      style={{ backgroundColor: "hsl(var(--muted, 217 33% 12%))" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{meta.icon}</span>
                        <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground, 210 40% 98%))" }}>
                          {meta.name}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: p.connected ? "#10b98120" : p.configured ? "#f59e0b20" : "#64748b20",
                          color: p.connected ? "#10b981" : p.configured ? "#f59e0b" : "#64748b",
                        }}
                      >
                        {p.connected ? "Connected" : p.configured ? "Ready" : "Not configured"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {posts.length === 0 ? (
                  <p className="text-xs text-center py-8" style={{ color: "hsl(var(--muted-foreground, 215 20% 55%))" }}>
                    No recent posts
                  </p>
                ) : (
                  posts.map((post) => {
                    const meta = PLATFORM_META[post.platform] || { name: post.platform, icon: "📱" };
                    return (
                      <div
                        key={post.id}
                        className="p-2.5 rounded-lg"
                        style={{ backgroundColor: "hsl(var(--muted, 217 33% 12%))" }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium" style={{ color: "hsl(var(--foreground, 210 40% 98%))" }}>
                            {meta.icon} {meta.name}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: post.status === "published" ? "#10b98120" : post.status === "scheduled" ? "#3b82f620" : "#64748b20",
                              color: post.status === "published" ? "#10b981" : post.status === "scheduled" ? "#3b82f6" : "#64748b",
                            }}
                          >
                            {post.status}
                          </span>
                        </div>
                        <p className="text-[11px] line-clamp-2" style={{ color: "hsl(var(--muted-foreground, 215 20% 55%))" }}>
                          {post.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div
            className="px-4 py-2.5 border-t flex items-center justify-between"
            style={{ borderColor: "hsl(var(--border, 215 20% 16%))" }}
          >
            <a
              href={cmdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium hover:underline"
              style={{ color: accentColor }}
            >
              Open Command Center →
            </a>
            <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground, 215 20% 55%))" }}>
              {connectedCount}/{platforms.length} connected
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export interface ShareButtonProps {
  content: string;
  platform?: string;
  appName: string;
  hashtags?: string[];
  accentColor?: string;
  getToken?: () => string | null;
  label?: string;
  className?: string;
}

export function ShareContentButton({
  content,
  platform = "twitter",
  appName,
  hashtags = ["#SZLHoldings"],
  accentColor = "#a855f7",
  getToken,
  label = "Share This",
  className = "",
}: ShareButtonProps) {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleShare = async () => {
    setSaving(true);
    setResult(null);
    try {
      const fullContent = `${content}\n\n${hashtags.join(" ")}`;
      const res = await fetch(`${socialApiBase()}/api/social-command/posts`, {
        method: "POST",
        headers: authHeaders(getToken),
        body: JSON.stringify({ platform, content: fullContent, status: "draft" }),
      });
      if (res.ok) {
        setResult("Draft saved!");
        setTimeout(() => setResult(null), 2000);
      } else {
        setResult("Failed");
      }
    } catch {
      setResult("Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={saving}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50 ${className}`}
      style={{ backgroundColor: accentColor }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      {saving ? "Saving..." : result || label}
    </button>
  );
}

export interface CarouselLauncherProps {
  appName: string;
  accentColor?: string;
  className?: string;
}

export function CarouselLauncherButton({
  appName,
  accentColor = "#a855f7",
  className = "",
}: CarouselLauncherProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${className}`}
        style={{ backgroundColor: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
          <polyline points="17 2 12 7 7 2" />
        </svg>
        Create Carousel
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div
            className="w-full max-w-5xl h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
            style={{
              backgroundColor: "hsl(var(--background, 222 47% 6%))",
              borderColor: "hsl(var(--border, 215 20% 16%))",
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor: "hsl(var(--border, 215 20% 16%))" }}
            >
              <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--foreground, 210 40% 98%))" }}>
                Carousel Builder — {appName}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:opacity-70"
                style={{ color: "hsl(var(--muted-foreground, 215 20% 55%))" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src="/dreamera/social-command/carousel"
                className="w-full h-full border-0"
                title="Carousel Builder"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export interface PlatformStatusBadgeProps {
  platform: string;
  connected: boolean;
  configured: boolean;
}

export function PlatformStatusBadge({ platform, connected, configured }: PlatformStatusBadgeProps) {
  const meta = PLATFORM_META[platform] || { name: platform, icon: "📱" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{
        backgroundColor: connected ? "#10b98115" : configured ? "#f59e0b15" : "#64748b15",
        color: connected ? "#10b981" : configured ? "#f59e0b" : "#64748b",
      }}
    >
      <span>{meta.icon}</span>
      {meta.name}
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: connected ? "#10b981" : configured ? "#f59e0b" : "#64748b" }} />
    </span>
  );
}

export interface SocialFeedWidgetProps {
  maxItems?: number;
  accentColor?: string;
  getToken?: () => string | null;
}

export function SocialFeedWidget({ maxItems = 5, accentColor = "#a855f7", getToken }: SocialFeedWidgetProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${socialApiBase()}/api/social-command/posts`, { headers: authHeaders(getToken) });
        if (res.ok) {
          const json = await res.json();
          setPosts((json.data || []).slice(0, maxItems));
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [maxItems, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-20">
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: `${accentColor}40`, borderTopColor: accentColor }} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-xs text-center py-4" style={{ color: "hsl(var(--muted-foreground, 215 20% 55%))" }}>
        No social posts yet
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => {
        const meta = PLATFORM_META[post.platform] || { name: post.platform, icon: "📱" };
        return (
          <div
            key={post.id}
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: "hsl(var(--card, 222 47% 8%) / 0.5)",
              borderColor: "hsl(var(--border, 215 20% 16%) / 0.5)",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground, 210 40% 98%))" }}>
                {meta.icon} {meta.name}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: post.status === "published" ? "#10b98120" : "#64748b20",
                  color: post.status === "published" ? "#10b981" : "#64748b",
                }}
              >
                {post.status}
              </span>
            </div>
            <p className="text-xs line-clamp-2" style={{ color: "hsl(var(--muted-foreground, 215 20% 55%))" }}>
              {post.content}
            </p>
            {post.createdAt && (
              <p className="text-[10px] mt-1" style={{ color: "hsl(var(--muted-foreground, 215 20% 55%) / 0.6)" }}>
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
