import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rss, ArrowRight, ExternalLink, Mail, Check, Loader2 } from "lucide-react";

const PLATFORM_META: Record<string, { name: string; icon: string }> = {
  twitter: { name: "X", icon: "𝕏" },
  linkedin: { name: "LinkedIn", icon: "💼" },
  meta: { name: "Facebook", icon: "📘" },
  instagram: { name: "Instagram", icon: "📸" },
  youtube: { name: "YouTube", icon: "▶️" },
  medium: { name: "Medium", icon: "✍️" },
  substack: { name: "Substack", icon: "📰" },
};

interface SocialPost {
  id: number;
  platform: string;
  content: string;
  status: string;
  createdAt?: string;
}

const mediaLinks = [
  {
    platform: "Medium",
    icon: "✍️",
    title: "SZL Holdings on Medium",
    description: "Deep dives on enterprise technology, cybersecurity, and platform engineering",
    url: "#",
    tag: "Blog",
  },
  {
    platform: "Substack",
    icon: "📰",
    title: "SZL Holdings Newsletter",
    description: "Weekly insights on innovation, venture building, and emerging technology",
    url: "#",
    tag: "Newsletter",
  },
  {
    platform: "YouTube",
    icon: "▶️",
    title: "SZL Holdings Channel",
    description: "Product demos, thought leadership talks, and behind-the-scenes content",
    url: "#",
    tag: "Video",
  },
  {
    platform: "LinkedIn",
    icon: "💼",
    title: "SZL Holdings LinkedIn",
    description: "Company updates, team highlights, and professional community",
    url: "#",
    tag: "Social",
  },
];

function apiBase(): string {
  if (typeof window === "undefined") return "";
  return (window as any).__SZL_API_BASE || "";
}

export default function ContentHub() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    async function loadPosts() {
      try {
        const token = localStorage.getItem("szl_token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${apiBase()}/api/social-command/posts`, { headers });
        if (res.ok) {
          const json = await res.json();
          setPosts((json.data || []).filter((p: SocialPost) => p.status === "published" || p.status === "scheduled").slice(0, 6));
        }
      } catch {}
      setLoading(false);
    }
    loadPosts();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubscribed(true);
    setSubscribing(false);
  };

  return (
    <section id="content-hub" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/10 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4 block">
            Content & Media
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-6">
            <span className="text-foreground">Social </span>
            <span className="text-gradient-gold italic">Presence</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto font-light">
            Stay connected with SZL Holdings across all platforms. Latest updates, articles, and community content.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-white/[0.06] bg-surface-elevated/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
                  <Rss className="w-4 h-4 text-gold" />
                  Latest Social Posts
                </h3>
                <a
                  href="/dreamera/social-command"
                  className="text-xs text-gold hover:text-gold-light flex items-center gap-1 transition-colors"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted text-sm mb-2">No published posts yet</p>
                  <p className="text-muted/60 text-xs">
                    Visit the <a href="/dreamera/social-command" className="text-gold hover:underline">Social Command Center</a> to create content
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => {
                    const meta = PLATFORM_META[post.platform] || { name: post.platform, icon: "📱" };
                    return (
                      <div
                        key={post.id}
                        className="p-4 rounded-xl border border-white/[0.04] bg-background/50 hover:border-gold/10 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{meta.icon}</span>
                            <span className="text-xs font-medium text-foreground/80">{meta.name}</span>
                          </div>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: post.status === "published" ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
                              color: post.status === "published" ? "#10b981" : "#3b82f6",
                            }}
                          >
                            {post.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted leading-relaxed line-clamp-2">
                          {post.content}
                        </p>
                        {post.createdAt && (
                          <p className="text-[10px] text-muted/40 mt-2">
                            {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-6">
            {mediaLinks.map((link, i) => (
              <motion.a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="block p-5 rounded-2xl border border-white/[0.06] bg-surface-elevated/50 hover:border-gold/20 transition-all duration-500 group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{link.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-gold-light transition-colors">
                        {link.title}
                      </h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-medium uppercase tracking-wider">
                        {link.tag}
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{link.description}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted/40 group-hover:text-gold flex-shrink-0 transition-colors mt-0.5" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto rounded-2xl border border-gold/10 bg-gradient-to-br from-gold/[0.04] to-transparent p-8 text-center"
        >
          <Mail className="w-8 h-8 text-gold mx-auto mb-4" />
          <h3 className="font-serif text-xl font-medium text-foreground mb-2">
            Stay Informed
          </h3>
          <p className="text-sm text-muted mb-6">
            Get weekly insights on innovation, venture building, and emerging technology from the SZL Holdings team.
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-gold">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">You're subscribed! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-white/10 text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-gold/40 transition-colors"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-2.5 rounded-xl bg-gold text-background text-sm font-medium hover:bg-gold-light disabled:opacity-50 transition-colors"
              >
                {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
