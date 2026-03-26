import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "./auth";
import { validateBody, validateAndSanitizeBody } from "../middleware/validate";
import type { AuthenticatedRequest } from "../types";
import crypto from "crypto";

const publishSchema = z.object({
  platform: z.string().min(1),
  content: z.string().min(1).max(10000),
  mediaUrl: z.string().url().optional(),
});

const disconnectSchema = z.object({
  platform: z.string().min(1),
});

const router = Router();

router.get("/social/health", (_req, res) => {
  res.json({ ok: true, group: "social", timestamp: new Date().toISOString() });
});

interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  userId?: string;
  pageId?: string;
  pageToken?: string;
}

const userTokens: Map<string, Map<string, OAuthTokens>> = new Map();

function getUserTokenStore(username: string): Map<string, OAuthTokens> {
  if (!userTokens.has(username)) {
    userTokens.set(username, new Map());
  }
  return userTokens.get(username)!;
}

function isTokenExpired(tokens: OAuthTokens): boolean {
  if (!tokens.expiresAt) return false;
  return Date.now() > tokens.expiresAt - 60000;
}

interface SocialPlatformStatus {
  platform: string;
  configured: boolean;
  connected: boolean;
  message: string;
}

function getSocialStatus(username?: string): SocialPlatformStatus[] {
  const store = username ? getUserTokenStore(username) : undefined;
  return [
    {
      platform: "meta",
      configured: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
      connected: !!(store?.get("meta")?.accessToken),
      message: process.env.META_APP_ID
        ? (store?.get("meta")?.accessToken ? "Meta connected" : "Meta configured — connect your account")
        : "Set META_APP_ID and META_APP_SECRET to enable Meta publishing",
    },
    {
      platform: "twitter",
      configured: !!(process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET),
      connected: !!(store?.get("twitter")?.accessToken),
      message: process.env.TWITTER_API_KEY
        ? (store?.get("twitter")?.accessToken ? "X (Twitter) connected" : "X configured — connect your account")
        : "Set TWITTER_API_KEY and TWITTER_API_SECRET to enable X publishing",
    },
    {
      platform: "linkedin",
      configured: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
      connected: !!(store?.get("linkedin")?.accessToken),
      message: process.env.LINKEDIN_CLIENT_ID
        ? (store?.get("linkedin")?.accessToken ? "LinkedIn connected" : "LinkedIn configured — connect your account")
        : "Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to enable LinkedIn publishing",
    },
  ];
}

router.get("/social/status", requireAuth, (req, res) => {
  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  const platforms = getSocialStatus(username);
  return res.json({
    platforms,
    anyConfigured: platforms.some((p) => p.configured),
    anyConnected: platforms.some((p) => p.connected),
  });
});

const oauthStates: Map<string, { username: string; platform: string; redirectUri: string }> = new Map();

router.get("/social/oauth/meta/authorize", requireAuth, (req, res) => {
  const appId = process.env.META_APP_ID;
  if (!appId) return res.status(400).json({ error: "META_APP_ID not configured" });

  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${req.protocol}://${req.get("host")}/api/social/oauth/meta/callback`;

  oauthStates.set(state, { username, platform: "meta", redirectUri });
  setTimeout(() => oauthStates.delete(state), 600000);

  const scopes = "pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content";
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes}&response_type=code`;

  return res.json({ authUrl });
});

router.get("/social/oauth/meta/callback", async (req, res) => {
  try {
    const { code, state } = req.query as { code: string; state: string };
    const stateData = oauthStates.get(state);
    if (!stateData) return res.status(400).send("Invalid or expired state");
    oauthStates.delete(state);

    const appId = process.env.META_APP_ID!;
    const appSecret = process.env.META_APP_SECRET!;

    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(stateData.redirectUri)}&client_secret=${appSecret}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(400).send("Failed to exchange code for token: " + JSON.stringify(tokenData));
    }

    const longLivedRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`
    );
    const longLivedData = await longLivedRes.json();
    const userToken = longLivedData.access_token || tokenData.access_token;

    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userToken}`
    );
    const pagesData = await pagesRes.json();
    const page = pagesData.data?.[0];

    const store = getUserTokenStore(stateData.username);
    store.set("meta", {
      accessToken: userToken,
      expiresAt: Date.now() + (longLivedData.expires_in || 5184000) * 1000,
      userId: tokenData.user_id,
      pageId: page?.id,
      pageToken: page?.access_token,
    });

    return res.send('<html><body><script>window.close(); window.opener && window.opener.postMessage("social-oauth-complete","*");</script><p>Connected! You can close this window.</p></body></html>');
  } catch (e: any) {
    return res.status(500).send("OAuth error: " + e.message);
  }
});

router.get("/social/oauth/twitter/authorize", requireAuth, (req, res) => {
  const apiKey = process.env.TWITTER_API_KEY;
  if (!apiKey) return res.status(400).json({ error: "TWITTER_API_KEY not configured" });

  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  const redirectUri = `${req.protocol}://${req.get("host")}/api/social/oauth/twitter/callback`;

  oauthStates.set(state, { username, platform: "twitter", redirectUri });
  (oauthStates as any).set(state + "_verifier", codeVerifier);
  setTimeout(() => { oauthStates.delete(state); (oauthStates as any).delete(state + "_verifier"); }, 600000);

  const scopes = "tweet.read tweet.write users.read offline.access";
  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${apiKey}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  return res.json({ authUrl });
});

router.get("/social/oauth/twitter/callback", async (req, res) => {
  try {
    const { code, state } = req.query as { code: string; state: string };
    const stateData = oauthStates.get(state);
    const codeVerifier = (oauthStates as any).get(state + "_verifier");
    if (!stateData || !codeVerifier) return res.status(400).send("Invalid or expired state");
    oauthStates.delete(state);
    (oauthStates as any).delete(state + "_verifier");

    const apiKey = process.env.TWITTER_API_KEY!;
    const apiSecret = process.env.TWITTER_API_SECRET!;

    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: stateData.redirectUri,
        code_verifier: codeVerifier,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(400).send("Failed to exchange code: " + JSON.stringify(tokenData));
    }

    const store = getUserTokenStore(stateData.username);
    store.set("twitter", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in || 7200) * 1000,
    });

    return res.send('<html><body><script>window.close(); window.opener && window.opener.postMessage("social-oauth-complete","*");</script><p>Connected! You can close this window.</p></body></html>');
  } catch (e: any) {
    return res.status(500).send("OAuth error: " + e.message);
  }
});

router.get("/social/oauth/linkedin/authorize", requireAuth, (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) return res.status(400).json({ error: "LINKEDIN_CLIENT_ID not configured" });

  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${req.protocol}://${req.get("host")}/api/social/oauth/linkedin/callback`;

  oauthStates.set(state, { username, platform: "linkedin", redirectUri });
  setTimeout(() => oauthStates.delete(state), 600000);

  const scopes = "openid profile w_member_social";
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}`;

  return res.json({ authUrl });
});

router.get("/social/oauth/linkedin/callback", async (req, res) => {
  try {
    const { code, state } = req.query as { code: string; state: string };
    const stateData = oauthStates.get(state);
    if (!stateData) return res.status(400).send("Invalid or expired state");
    oauthStates.delete(state);

    const clientId = process.env.LINKEDIN_CLIENT_ID!;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: stateData.redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(400).send("Failed to exchange code: " + JSON.stringify(tokenData));
    }

    const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const meData = await meRes.json();

    const store = getUserTokenStore(stateData.username);
    store.set("linkedin", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in || 5184000) * 1000,
      userId: meData.sub,
    });

    return res.send('<html><body><script>window.close(); window.opener && window.opener.postMessage("social-oauth-complete","*");</script><p>Connected! You can close this window.</p></body></html>');
  } catch (e: any) {
    return res.status(500).send("OAuth error: " + e.message);
  }
});

async function refreshTwitterToken(username: string): Promise<OAuthTokens | null> {
  const store = getUserTokenStore(username);
  const tokens = store.get("twitter");
  if (!tokens?.refreshToken) return null;

  const apiKey = process.env.TWITTER_API_KEY!;
  const apiSecret = process.env.TWITTER_API_SECRET!;

  try {
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
      }),
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok || !data.access_token) return null;

    const updated: OAuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + (data.expires_in || 7200) * 1000,
    };
    store.set("twitter", updated);
    return updated;
  } catch {
    return null;
  }
}

function getAccessToken(username: string, platform: string): string | null {
  const store = getUserTokenStore(username);
  const tokens = store.get(platform);
  if (!tokens?.accessToken) return null;
  return tokens.accessToken;
}

router.post("/social/publish", requireAuth, validateAndSanitizeBody(publishSchema), async (req, res) => {
  try {
    const { platform, content, mediaUrl } = req.body;

    const username = (req as AuthenticatedRequest).user?.username || "unknown";
    const status = getSocialStatus(username);
    const platformConfig = status.find((s) => s.platform === platform);

    if (!platformConfig?.configured) {
      return res.status(400).json({
        error: `${platform} is not configured. Please set the required API keys.`,
        configured: false,
      });
    }

    if (!platformConfig?.connected) {
      return res.status(400).json({
        error: `${platform} is not connected. Please connect your account via OAuth first.`,
        connected: false,
      });
    }

    if (platform === "meta") {
      const store = getUserTokenStore(username);
      const tokens = store.get("meta")!;
      const pageToken = tokens.pageToken || tokens.accessToken;
      const pageId = tokens.pageId;

      if (!pageId) {
        return res.status(400).json({ error: "No Facebook Page found. Ensure your account manages a Page." });
      }

      const url = mediaUrl
        ? `https://graph.facebook.com/v18.0/${pageId}/photos`
        : `https://graph.facebook.com/v18.0/${pageId}/feed`;

      const body: Record<string, string> = { access_token: pageToken };
      if (mediaUrl) { body.url = mediaUrl; body.caption = content; }
      else { body.message = content; }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) return res.status(400).json({ error: data.error?.message || "Meta API error" });
      return res.json({ success: true, platform: "meta", postId: data.id });
    }

    if (platform === "twitter") {
      let token = getAccessToken(username, "twitter");
      const store = getUserTokenStore(username);
      const tokens = store.get("twitter")!;

      if (isTokenExpired(tokens)) {
        const refreshed = await refreshTwitterToken(username);
        if (refreshed) token = refreshed.accessToken;
        else return res.status(401).json({ error: "Twitter token expired. Please reconnect." });
      }

      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      });
      const data = await response.json();
      if (!response.ok) return res.status(400).json({ error: data.detail || "Twitter API error" });
      return res.json({ success: true, platform: "twitter", postId: data.data?.id });
    }

    if (platform === "linkedin") {
      const token = getAccessToken(username, "linkedin");
      const store = getUserTokenStore(username);
      const tokens = store.get("linkedin")!;
      const personUrn = `urn:li:person:${tokens.userId}`;

      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: personUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: content },
              shareMediaCategory: "NONE",
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      });
      const data = await response.json();
      if (!response.ok) return res.status(400).json({ error: data.message || "LinkedIn API error" });
      return res.json({ success: true, platform: "linkedin", postId: data.id });
    }

    return res.status(400).json({ error: `Unsupported platform: ${platform}` });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to publish" });
  }
});

router.get("/social/analytics", requireAuth, async (req, res) => {
  try {
    const platform = req.query.platform as string;
    const username = (req as AuthenticatedRequest).user?.username || "unknown";
    const status = getSocialStatus(username);
    const analytics: Record<string, any> = {};

    if (!platform || platform === "meta") {
      const metaConfig = status.find((s) => s.platform === "meta");
      if (metaConfig?.connected) {
        const store = getUserTokenStore(username);
        const tokens = store.get("meta")!;
        const pageToken = tokens.pageToken || tokens.accessToken;
        const pageId = tokens.pageId;
        if (pageToken && pageId) {
          try {
            const response = await fetch(
              `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_impressions,page_engaged_users,page_fans&period=day&access_token=${pageToken}`
            );
            const data = await response.json();
            analytics.meta = { configured: true, connected: true, insights: data.data || [] };
          } catch {
            analytics.meta = { configured: true, connected: true, insights: [], error: "Failed to fetch" };
          }
        }
      } else {
        analytics.meta = { configured: metaConfig?.configured || false, connected: false };
      }
    }

    if (!platform || platform === "twitter") {
      const twitterConfig = status.find((s) => s.platform === "twitter");
      if (twitterConfig?.connected) {
        let token = getAccessToken(username, "twitter");
        const store = getUserTokenStore(username);
        const tokens = store.get("twitter")!;
        if (isTokenExpired(tokens)) {
          const refreshed = await refreshTwitterToken(username);
          if (refreshed) token = refreshed.accessToken;
        }
        if (token) {
          try {
            const meRes = await fetch("https://api.twitter.com/2/users/me?user.fields=public_metrics", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const meData = await meRes.json();
            analytics.twitter = {
              configured: true,
              connected: true,
              metrics: meData.data?.public_metrics || null,
              username: meData.data?.username,
            };
          } catch {
            analytics.twitter = { configured: true, connected: true, metrics: null, error: "Failed to fetch" };
          }
        }
      } else {
        analytics.twitter = { configured: twitterConfig?.configured || false, connected: false };
      }
    }

    if (!platform || platform === "linkedin") {
      const linkedinConfig = status.find((s) => s.platform === "linkedin");
      if (linkedinConfig?.connected) {
        const token = getAccessToken(username, "linkedin");
        if (token) {
          try {
            const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const profileData = await meRes.json();
            analytics.linkedin = {
              configured: true,
              connected: true,
              profile: profileData,
            };
          } catch {
            analytics.linkedin = { configured: true, connected: true, profile: null, error: "Failed to fetch" };
          }
        }
      } else {
        analytics.linkedin = { configured: linkedinConfig?.configured || false, connected: false };
      }
    }

    return res.json({ analytics });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to fetch analytics" });
  }
});

router.post("/social/disconnect", requireAuth, validateBody(disconnectSchema), (req, res) => {
  const { platform } = req.body;
  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  const store = getUserTokenStore(username);
  if (platform) {
    store.delete(platform);
  }
  return res.json({ success: true });
});

export default router;
