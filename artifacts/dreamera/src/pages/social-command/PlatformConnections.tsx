import { useState, useEffect, useCallback } from "react";
import SocialLayout from "@/components/social/SocialLayout";
import { getSocialStatus, getOAuthUrl, disconnectPlatform, getTokenHealth } from "@/lib/api";
import {
  Link2,
  Unlink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Loader2,
  AlertTriangle,
  Heart,
} from "lucide-react";

interface PlatformInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  configured: boolean;
  connected: boolean;
  message: string;
  tokenHealth?: string;
}

const PLATFORM_META: Record<string, { name: string; icon: string; description: string }> = {
  meta: { name: "Meta (Facebook)", icon: "📘", description: "Publish to Facebook Pages and manage your Meta presence" },
  twitter: { name: "X (Twitter)", icon: "𝕏", description: "Post tweets and threads to your X account" },
  linkedin: { name: "LinkedIn", icon: "💼", description: "Share professional updates on LinkedIn" },
  instagram: { name: "Instagram", icon: "📸", description: "Publish photos and reels to your Instagram business account" },
  youtube: { name: "YouTube", icon: "▶️", description: "Post community updates and manage your YouTube channel" },
  medium: { name: "Medium", icon: "✍️", description: "Publish articles and stories to Medium" },
  substack: { name: "Substack", icon: "📰", description: "Publish newsletters to your Substack publication" },
};

const TOKEN_HEALTH_STYLES: Record<string, { icon: any; color: string; label: string }> = {
  healthy: { icon: Heart, color: "text-emerald-400", label: "Healthy" },
  expired: { icon: AlertTriangle, color: "text-amber-400", label: "Expired" },
  disconnected: { icon: XCircle, color: "text-muted-foreground", label: "Disconnected" },
  not_configured: { icon: XCircle, color: "text-muted-foreground", label: "Not configured" },
  not_connected: { icon: AlertCircle, color: "text-amber-400", label: "Not connected" },
};

export default function PlatformConnections() {
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [tokenHealth, setTokenHealth] = useState<Record<string, any>>({});

  const loadStatus = useCallback(async () => {
    try {
      const [statusRes, healthRes] = await Promise.allSettled([
        getSocialStatus(),
        getTokenHealth(),
      ]);

      if (statusRes.status === "fulfilled") {
        const mapped = (statusRes.value.platforms || []).map((p: any) => ({
          ...p,
          id: p.platform,
          ...(PLATFORM_META[p.platform] || { name: p.platform, icon: "📱", description: "" }),
        }));
        setPlatforms(mapped);
      }

      if (healthRes.status === "fulfilled") {
        setTokenHealth(healthRes.value.health || {});
      }
    } catch {
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const handler = (e: MessageEvent) => {
      if (e.data === "social-oauth-complete") {
        setConnecting(null);
        loadStatus();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [loadStatus]);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const result = await getOAuthUrl(platformId);
      if (result.directConnect) {
        setConnecting(null);
        loadStatus();
        return;
      }
      if (result.authUrl) {
        window.open(result.authUrl, "social-oauth", "width=600,height=700,popup=1");
      }
    } catch (e) {
      console.error("OAuth error:", e);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    setDisconnecting(platformId);
    try {
      await disconnectPlatform(platformId);
      await loadStatus();
    } catch (e) {
      console.error("Disconnect error:", e);
    } finally {
      setDisconnecting(null);
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

  return (
    <SocialLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Platform Connections
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect and manage all 7 social media platforms
          </p>
        </div>

        <div className="bg-card/50 border border-primary/20 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Secure Authentication
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                OAuth 2.0 for Twitter, LinkedIn, Meta, Instagram, and YouTube.
                Token-based authentication for Medium. Email-based publishing for Substack.
                All tokens are encrypted and stored in the database, persisting across restarts.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {platforms.map((platform) => {
            const health = tokenHealth[platform.id] || {};
            const healthStyle = TOKEN_HEALTH_STYLES[health.status] || TOKEN_HEALTH_STYLES.not_configured;
            const HealthIcon = healthStyle.icon;

            return (
              <div
                key={platform.id}
                className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {platform.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {platform.connected ? (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Connected
                          </span>
                        ) : platform.configured ? (
                          <span className="flex items-center gap-1.5 text-xs text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Ready to connect
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <XCircle className="w-3.5 h-3.5" />
                            Not configured
                          </span>
                        )}
                        {platform.connected && (
                          <span className={`flex items-center gap-1 text-xs ${healthStyle.color}`}>
                            <HealthIcon className="w-3 h-3" />
                            {healthStyle.label}
                          </span>
                        )}
                        {health.expiresAt && platform.connected && (
                          <span className="text-[10px] text-muted-foreground">
                            Expires: {new Date(health.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {!platform.configured && (
                        <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg p-2">
                          {platform.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {platform.connected ? (
                      <>
                        <button
                          onClick={() => loadStatus()}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Refresh status"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDisconnect(platform.id)}
                          disabled={disconnecting === platform.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {disconnecting === platform.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Unlink className="w-3.5 h-3.5" />
                          )}
                          Disconnect
                        </button>
                      </>
                    ) : platform.configured ? (
                      <button
                        onClick={() => handleConnect(platform.id)}
                        disabled={connecting === platform.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {connecting === platform.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Link2 className="w-3.5 h-3.5" />
                        )}
                        Connect
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card/50 border border-border/50 rounded-xl p-5 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Token Management
          </h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              Access tokens are encrypted and stored in the database, persisting across
              server restarts. Twitter, YouTube, and Meta tokens are automatically refreshed
              when they expire.
            </p>
            <p>
              To fully revoke access, disconnect the platform here and revoke
              access in your platform's app settings.
            </p>
          </div>
        </div>
      </div>
    </SocialLayout>
  );
}
