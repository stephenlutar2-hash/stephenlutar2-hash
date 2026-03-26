import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "./auth";
import { validateBody, validateAndSanitizeBody } from "../middleware/validate";
import type { AuthenticatedRequest } from "../types";
import crypto from "crypto";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { socialTokensTable, socialPostsTable } from "@szl-holdings/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "../lib/logger";

const ALL_PLATFORMS = ["twitter", "linkedin", "meta", "instagram", "youtube", "medium", "substack"] as const;
type Platform = typeof ALL_PLATFORMS[number];

const publishSchema = z.object({
  platform: z.string().min(1),
  content: z.string().min(1).max(10000),
  mediaUrl: z.string().url().optional(),
});

const disconnectSchema = z.object({
  platform: z.string().min(1),
});

const crossPostSchema = z.object({
  content: z.string().min(1).max(10000),
  platforms: z.array(z.string().min(1)),
  mediaUrl: z.string().url().optional(),
  schedule: z.boolean().default(false),
});

const seedCalendarSchema = z.object({
  username: z.string().min(1).optional(),
  startDate: z.string().optional(),
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
  metadata?: Record<string, any>;
}

async function getDbTokens(username: string, platform: string): Promise<OAuthTokens | null> {
  try {
    if (!isDatabaseAvailable()) return null;
    const [row] = await db
      .select()
      .from(socialTokensTable)
      .where(and(eq(socialTokensTable.username, username), eq(socialTokensTable.platform, platform)))
      .limit(1);
    if (!row || !row.connected) return null;
    return {
      accessToken: row.accessToken,
      refreshToken: row.refreshToken || undefined,
      expiresAt: row.expiresAt ? row.expiresAt.getTime() : undefined,
      userId: row.userId || undefined,
      pageId: row.pageId || undefined,
      pageToken: row.pageToken || undefined,
      metadata: (row.metadata as Record<string, any>) || undefined,
    };
  } catch {
    return null;
  }
}

async function saveDbTokens(username: string, platform: string, tokens: OAuthTokens): Promise<void> {
  try {
    if (!isDatabaseAvailable()) return;
    const existing = await db
      .select({ id: socialTokensTable.id })
      .from(socialTokensTable)
      .where(and(eq(socialTokensTable.username, username), eq(socialTokensTable.platform, platform)))
      .limit(1);

    const data = {
      username,
      platform,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || null,
      expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : null,
      userId: tokens.userId || null,
      pageId: tokens.pageId || null,
      pageToken: tokens.pageToken || null,
      connected: true,
      tokenHealth: "healthy" as const,
      lastHealthCheck: new Date(),
      metadata: tokens.metadata || null,
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      await db.update(socialTokensTable).set(data).where(eq(socialTokensTable.id, existing[0].id));
    } else {
      await db.insert(socialTokensTable).values(data);
    }
  } catch (e) {
    console.error(`Failed to save tokens for ${platform}:`, e);
  }
}

async function removeDbTokens(username: string, platform: string): Promise<void> {
  try {
    if (!isDatabaseAvailable()) return;
    await db
      .update(socialTokensTable)
      .set({ connected: false, tokenHealth: "disconnected", updatedAt: new Date() })
      .where(and(eq(socialTokensTable.username, username), eq(socialTokensTable.platform, platform)));
  } catch {}
}

function isTokenExpired(tokens: OAuthTokens): boolean {
  if (!tokens.expiresAt) return false;
  return Date.now() > tokens.expiresAt - 60000;
}

const PLATFORM_CONFIG: Record<string, { name: string; envKeys: string[]; authType: string }> = {
  twitter: { name: "X (Twitter)", envKeys: ["TWITTER_API_KEY", "TWITTER_API_SECRET"], authType: "oauth2" },
  linkedin: { name: "LinkedIn", envKeys: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"], authType: "oauth2" },
  meta: { name: "Meta (Facebook)", envKeys: ["META_APP_ID", "META_APP_SECRET"], authType: "oauth2" },
  instagram: { name: "Instagram", envKeys: ["META_APP_ID", "META_APP_SECRET"], authType: "oauth2" },
  youtube: { name: "YouTube", envKeys: ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET"], authType: "oauth2" },
  medium: { name: "Medium", envKeys: ["MEDIUM_TOKEN"], authType: "token" },
  substack: { name: "Substack", envKeys: ["SUBSTACK_EMAIL", "SUBSTACK_PASSWORD"], authType: "credentials" },
};

function isPlatformConfigured(platform: string): boolean {
  const config = PLATFORM_CONFIG[platform];
  if (!config) return false;
  return config.envKeys.every((key) => !!process.env[key]);
}

async function getSocialStatus(username?: string) {
  const results = [];
  for (const platform of ALL_PLATFORMS) {
    const configured = isPlatformConfigured(platform);
    let connected = false;
    let tokenHealth = "unknown";
    if (username && configured) {
      const tokens = await getDbTokens(username, platform);
      connected = !!tokens?.accessToken;
      if (connected && tokens) {
        tokenHealth = isTokenExpired(tokens) ? "expired" : "healthy";
      }
    }
    const config = PLATFORM_CONFIG[platform];
    let message = "";
    if (connected) {
      message = `${config.name} connected`;
    } else if (configured) {
      message = `${config.name} configured — connect your account`;
    } else {
      message = `Set ${config.envKeys.join(" and ")} to enable ${config.name}`;
    }
    results.push({ platform, configured, connected, message, tokenHealth });
  }
  return results;
}

router.get("/social/status", requireAuth, async (req, res) => {
  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  const platforms = await getSocialStatus(username);
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

  const scopes = "pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,instagram_basic,instagram_content_publish";
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
    const tokenData: any = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(400).send("Failed to exchange code for token: " + JSON.stringify(tokenData));
    }

    const longLivedRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`
    );
    const longLivedData: any = await longLivedRes.json();
    const userToken = longLivedData.access_token || tokenData.access_token;

    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userToken}`
    );
    const pagesData: any = await pagesRes.json();
    const page = pagesData.data?.[0];

    let instagramAccountId: string | undefined;
    if (page?.id && page?.access_token) {
      try {
        const igRes = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        );
        const igData: any = await igRes.json();
        instagramAccountId = igData.instagram_business_account?.id;
      } catch { }
    }

    const metaTokens: OAuthTokens = {
      accessToken: userToken,
      expiresAt: Date.now() + (longLivedData.expires_in || 5184000) * 1000,
      userId: tokenData.user_id,
      pageId: page?.id,
      pageToken: page?.access_token,
      metadata: { instagramAccountId },
    };

    await saveDbTokens(stateData.username, "meta", metaTokens);

    if (instagramAccountId) {
      await saveDbTokens(stateData.username, "instagram", {
        accessToken: page?.access_token || userToken,
        expiresAt: metaTokens.expiresAt,
        userId: instagramAccountId,
        pageId: page?.id,
        pageToken: page?.access_token,
        metadata: { instagramAccountId, linkedToMeta: true },
      });
    }


    return res.send('<html><body><script>window.close(); window.opener && window.opener.postMessage("social-oauth-complete","*");</script><p>Connected! You can close this window.</p></body></html>');
  } catch (e: any) {
    return res.status(500).send("OAuth error: " + e.message);
  }
});

router.get("/social/oauth/instagram/authorize", requireAuth, (req, res) => {
  const appId = process.env.META_APP_ID;
  if (!appId) return res.status(400).json({ error: "META_APP_ID not configured (Instagram uses Meta OAuth)" });

  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${req.protocol}://${req.get("host")}/api/social/oauth/meta/callback`;

  oauthStates.set(state, { username, platform: "meta", redirectUri });
  setTimeout(() => oauthStates.delete(state), 600000);

  const scopes = "pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish";
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scopes}&response_type=code`;

  return res.json({ authUrl });
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
    const tokenData: any = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(400).send("Failed to exchange code: " + JSON.stringify(tokenData));
    }

    await saveDbTokens(stateData.username, "twitter", {
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
    const tokenData: any = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(400).send("Failed to exchange code: " + JSON.stringify(tokenData));
    }

    const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const meData: any = await meRes.json();

    await saveDbTokens(stateData.username, "linkedin", {
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

router.get("/social/oauth/youtube/authorize", requireAuth, (req, res) => {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  if (!clientId) return res.status(400).json({ error: "YOUTUBE_CLIENT_ID not configured" });

  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${req.protocol}://${req.get("host")}/api/social/oauth/youtube/callback`;

  oauthStates.set(state, { username, platform: "youtube", redirectUri });
  setTimeout(() => oauthStates.delete(state), 600000);

  const scopes = "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl";
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}&access_type=offline&prompt=consent`;

  return res.json({ authUrl });
});

router.get("/social/oauth/youtube/callback", async (req, res) => {
  try {
    const { code, state } = req.query as { code: string; state: string };
    const stateData = oauthStates.get(state);
    if (!stateData) return res.status(400).send("Invalid or expired state");
    oauthStates.delete(state);

    const clientId = process.env.YOUTUBE_CLIENT_ID!;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET!;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: stateData.redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData: any = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(400).send("Failed to exchange code: " + JSON.stringify(tokenData));
    }

    let channelId: string | undefined;
    try {
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      );
      const channelData: any = await channelRes.json();
      channelId = channelData.items?.[0]?.id;
    } catch {}

    await saveDbTokens(stateData.username, "youtube", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
      userId: channelId,
      metadata: { channelId },
    });

    return res.send('<html><body><script>window.close(); window.opener && window.opener.postMessage("social-oauth-complete","*");</script><p>Connected! You can close this window.</p></body></html>');
  } catch (e: any) {
    return res.status(500).send("OAuth error: " + e.message);
  }
});

router.get("/social/oauth/medium/authorize", requireAuth, async (req, res) => {
  const token = process.env.MEDIUM_TOKEN;
  if (!token) return res.status(400).json({ error: "MEDIUM_TOKEN not configured" });

  const username = (req as AuthenticatedRequest).user?.username || "unknown";

  try {
    const meRes = await fetch("https://api.medium.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData: any = await meRes.json();

    if (!meRes.ok) {
      return res.status(400).json({ error: "Invalid Medium token" });
    }

    await saveDbTokens(username, "medium", {
      accessToken: token,
      userId: meData.data?.id,
      metadata: { mediumUsername: meData.data?.username, name: meData.data?.name },
    });

    return res.json({ authUrl: null, directConnect: true, connected: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/social/oauth/substack/authorize", requireAuth, async (req, res) => {
  const email = process.env.SUBSTACK_EMAIL;
  const publication = process.env.SUBSTACK_PUBLICATION || "szlholdings";
  if (!email) return res.status(400).json({ error: "SUBSTACK_EMAIL not configured" });

  const username = (req as AuthenticatedRequest).user?.username || "unknown";

  await saveDbTokens(username, "substack", {
    accessToken: "email-based",
    metadata: { email, publication, authType: "email-publish" },
  });

  return res.json({ authUrl: null, directConnect: true, connected: true });
});

async function refreshTwitterToken(username: string): Promise<OAuthTokens | null> {
  const tokens = await getDbTokens(username, "twitter");
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
    const data: any = await tokenRes.json();
    if (!tokenRes.ok || !data.access_token) return null;

    const updated: OAuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + (data.expires_in || 7200) * 1000,
    };
    await saveDbTokens(username, "twitter", updated);
    return updated;
  } catch {
    return null;
  }
}

async function refreshYouTubeToken(username: string): Promise<OAuthTokens | null> {
  const tokens = await getDbTokens(username, "youtube");
  if (!tokens?.refreshToken) return null;

  const clientId = process.env.YOUTUBE_CLIENT_ID!;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET!;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const data: any = await tokenRes.json();
    if (!tokenRes.ok || !data.access_token) return null;

    const updated: OAuthTokens = {
      ...tokens,
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };
    await saveDbTokens(username, "youtube", updated);
    return updated;
  } catch {
    return null;
  }
}

async function refreshMetaToken(username: string): Promise<OAuthTokens | null> {
  const tokens = await getDbTokens(username, "meta");
  if (!tokens?.accessToken) return null;

  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;

  try {
    const longLivedRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokens.accessToken}`
    );
    const data: any = await longLivedRes.json();
    if (!longLivedRes.ok || !data.access_token) return null;

    const updated: OAuthTokens = {
      ...tokens,
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 5184000) * 1000,
    };
    await saveDbTokens(username, "meta", updated);
    return updated;
  } catch {
    return null;
  }
}

async function getValidToken(username: string, platform: string): Promise<string | null> {
  const tokens = await getDbTokens(username, platform);
  if (!tokens?.accessToken) return null;

  if (isTokenExpired(tokens)) {
    let refreshed: OAuthTokens | null = null;
    if (platform === "twitter") refreshed = await refreshTwitterToken(username);
    else if (platform === "youtube") refreshed = await refreshYouTubeToken(username);
    else if (platform === "meta" || platform === "instagram") refreshed = await refreshMetaToken(username);
    if (refreshed) return refreshed.accessToken;
    return null;
  }

  return tokens.accessToken;
}

const PLATFORM_LIMITS: Record<string, { maxChars: number; supportsMarkdown: boolean; supportsHashtags: boolean; supportsMedia: boolean }> = {
  twitter: { maxChars: 280, supportsMarkdown: false, supportsHashtags: true, supportsMedia: true },
  linkedin: { maxChars: 3000, supportsMarkdown: false, supportsHashtags: true, supportsMedia: true },
  meta: { maxChars: 63206, supportsMarkdown: false, supportsHashtags: true, supportsMedia: true },
  instagram: { maxChars: 2200, supportsMarkdown: false, supportsHashtags: true, supportsMedia: true },
  youtube: { maxChars: 5000, supportsMarkdown: false, supportsHashtags: true, supportsMedia: false },
  medium: { maxChars: 100000, supportsMarkdown: true, supportsHashtags: true, supportsMedia: true },
  substack: { maxChars: 100000, supportsMarkdown: true, supportsHashtags: false, supportsMedia: true },
};

function adaptContentForPlatform(content: string, platform: string): string {
  const limits = PLATFORM_LIMITS[platform];
  if (!limits) return content;

  let adapted = content;

  if (platform === "twitter") {
    adapted = adapted.replace(/\n{3,}/g, "\n\n");
    if (adapted.length > 280) {
      const hashtagMatch = adapted.match(/((?:\s*#\w+)+)\s*$/);
      const hashtags = hashtagMatch ? hashtagMatch[0].trim() : "";
      const mainContent = adapted.replace(/((?:\s*#\w+)+)\s*$/, "").trim();
      const maxMain = 280 - hashtags.length - (hashtags ? 4 : 3);
      adapted = mainContent.length > maxMain
        ? mainContent.slice(0, maxMain) + "..." + (hashtags ? "\n" + hashtags : "")
        : mainContent + (hashtags ? "\n" + hashtags : "");
    }
  }

  if (platform === "instagram") {
    if (!adapted.match(/(#\w+)/)) {
      adapted += "\n\n#SZLHoldings #Innovation #TechFounder #BuildInPublic";
    }
    adapted = adapted.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    if (adapted.length > 2200) adapted = adapted.slice(0, 2197) + "...";
  }

  if (platform === "medium") {
    if (!adapted.startsWith("#")) {
      const firstLine = adapted.split("\n")[0];
      adapted = `# ${firstLine}\n\n${adapted.split("\n").slice(1).join("\n")}`;
    }
  }

  if (platform === "substack") {
    adapted = adapted.replace(/^#\s+(.+)/gm, "<h1>$1</h1>");
    adapted = adapted.replace(/^##\s+(.+)/gm, "<h2>$1</h2>");
    adapted = adapted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    adapted = adapted.replace(/\*(.+?)\*/g, "<em>$1</em>");
    adapted = adapted.replace(/\n/g, "<br/>");
  }

  if (platform === "youtube") {
    adapted = adapted.replace(/(#\w+)/g, "").trim();
    if (adapted.length > 5000) adapted = adapted.slice(0, 4997) + "...";
  }

  if (platform === "linkedin") {
    if (adapted.length > 3000) adapted = adapted.slice(0, 2997) + "...";
  }

  if (platform === "meta") {
    if (adapted.length > 63206) adapted = adapted.slice(0, 63203) + "...";
  }

  return adapted;
}

const OPTIMAL_POSTING_WINDOWS: Record<string, { days: number[]; hours: number[] }> = {
  twitter: { days: [1, 3, 5], hours: [12, 13] },
  linkedin: { days: [2, 4], hours: [8, 9] },
  meta: { days: [2, 4, 6], hours: [10, 14] },
  instagram: { days: [1, 3, 5], hours: [11, 17] },
  youtube: { days: [4, 5], hours: [14, 16] },
  medium: { days: [2, 3], hours: [10, 11] },
  substack: { days: [2, 4], hours: [7, 8] },
};

function getNextOptimalTime(platform: string, afterDate: Date = new Date()): Date {
  const windows = OPTIMAL_POSTING_WINDOWS[platform] || { days: [1, 3, 5], hours: [12] };
  const result = new Date(afterDate);
  result.setMinutes(0, 0, 0);

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const candidate = new Date(result);
    candidate.setDate(candidate.getDate() + dayOffset);
    const dayOfWeek = candidate.getDay();

    if (windows.days.includes(dayOfWeek)) {
      for (const hour of windows.hours) {
        candidate.setHours(hour);
        if (candidate > afterDate) {
          return candidate;
        }
      }
    }
  }

  result.setDate(result.getDate() + 1);
  result.setHours(12);
  return result;
}

router.post("/social/publish", requireAuth, validateAndSanitizeBody(publishSchema), async (req, res) => {
  try {
    const { platform, content, mediaUrl } = req.body;
    const username = (req as AuthenticatedRequest).user?.username || "unknown";

    if (!isPlatformConfigured(platform)) {
      return res.status(400).json({ error: `${platform} is not configured.`, configured: false });
    }

    const token = await getValidToken(username, platform);
    if (!token && platform !== "substack") {
      return res.status(400).json({ error: `${platform} is not connected. Please connect your account.`, connected: false });
    }

    if (platform === "meta") {
      const tokens = await getDbTokens(username, "meta");
      const pageToken = tokens?.pageToken || tokens?.accessToken;
      const pageId = tokens?.pageId;
      if (!pageId) return res.status(400).json({ error: "No Facebook Page found." });

      const url = mediaUrl
        ? `https://graph.facebook.com/v18.0/${pageId}/photos`
        : `https://graph.facebook.com/v18.0/${pageId}/feed`;
      const body: Record<string, string> = { access_token: pageToken! };
      if (mediaUrl) { body.url = mediaUrl; body.caption = content; }
      else { body.message = content; }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: any = await response.json();
      if (!response.ok) return res.status(400).json({ error: data.error?.message || "Meta API error" });
      return res.json({ success: true, platform: "meta", postId: data.id });
    }

    if (platform === "twitter") {
      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: adaptContentForPlatform(content, "twitter") }),
      });
      const data: any = await response.json();
      if (!response.ok) return res.status(400).json({ error: data.detail || "Twitter API error" });
      return res.json({ success: true, platform: "twitter", postId: data.data?.id });
    }

    if (platform === "linkedin") {
      const tokens = await getDbTokens(username, "linkedin");
      const personUrn = `urn:li:person:${tokens?.userId}`;
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
      const data: any = await response.json();
      if (!response.ok) return res.status(400).json({ error: data.message || "LinkedIn API error" });
      return res.json({ success: true, platform: "linkedin", postId: data.id });
    }

    if (platform === "instagram") {
      const tokens = await getDbTokens(username, "instagram");
      const igAccountId = tokens?.userId || (tokens?.metadata as any)?.instagramAccountId;
      const pageToken = tokens?.pageToken || tokens?.accessToken;
      if (!igAccountId) return res.status(400).json({ error: "No Instagram business account linked." });

      if (mediaUrl) {
        const containerRes = await fetch(
          `https://graph.facebook.com/v18.0/${igAccountId}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url: mediaUrl,
              caption: adaptContentForPlatform(content, "instagram"),
              access_token: pageToken,
            }),
          }
        );
        const containerData: any = await containerRes.json();
        if (!containerRes.ok) return res.status(400).json({ error: containerData.error?.message || "Instagram container error" });

        const publishRes = await fetch(
          `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: containerData.id,
              access_token: pageToken,
            }),
          }
        );
        const publishData: any = await publishRes.json();
        if (!publishRes.ok) return res.status(400).json({ error: publishData.error?.message || "Instagram publish error" });
        return res.json({ success: true, platform: "instagram", postId: publishData.id });
      }

      return res.status(400).json({ error: "Instagram requires a media URL (image) for posting." });
    }

    if (platform === "youtube") {
      const tokens = await getDbTokens(username, "youtube");
      const channelId = tokens?.userId || (tokens?.metadata as any)?.channelId;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snippet: {
              channelId,
              topLevelComment: {
                snippet: {
                  textOriginal: adaptContentForPlatform(content, "youtube"),
                },
              },
            },
          }),
        }
      );

      if (response.ok) {
        const data: any = await response.json();
        return res.json({ success: true, platform: "youtube", postId: data.id });
      }

      const errorData: any = await response.json().catch(() => ({}));
      return res.status(400).json({
        success: false,
        platform: "youtube",
        status: "manual_required",
        error: errorData.error?.message || "YouTube community posts require manual posting via YouTube Studio.",
        channelId,
      });
    }

    if (platform === "medium") {
      const tokens = await getDbTokens(username, "medium");
      const userId = tokens?.userId;
      if (!userId) return res.status(400).json({ error: "Medium user not found. Reconnect." });

      const adapted = adaptContentForPlatform(content, "medium");
      const title = adapted.split("\n")[0].replace(/^#\s*/, "").trim() || "SZL Holdings Update";

      const response = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          contentFormat: "markdown",
          content: adapted,
          publishStatus: "public",
          tags: ["SZLHoldings", "Innovation", "Technology"],
        }),
      });
      const data: any = await response.json();
      if (!response.ok) return res.status(400).json({ error: data.errors?.[0]?.message || "Medium API error" });
      return res.json({ success: true, platform: "medium", postId: data.data?.id, url: data.data?.url });
    }

    if (platform === "substack") {
      const tokens = await getDbTokens(username, "substack");
      const meta = (tokens?.metadata as any) || {};
      const publication = meta.publication || process.env.SUBSTACK_PUBLICATION || "szlholdings";

      const adapted = adaptContentForPlatform(content, "substack");
      const title = content.split("\n")[0].replace(/^#\s*/, "").trim() || "SZL Holdings Update";

      try {
        const substackRes = await fetch(`https://${publication}.substack.com/api/v1/drafts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: meta.sessionCookie || "",
          },
          body: JSON.stringify({
            draft_title: title,
            draft_body: adapted,
            draft_subtitle: "From SZL Holdings",
            type: "newsletter",
          }),
        });

        if (substackRes.ok) {
          const data: any = await substackRes.json();
          return res.json({ success: true, platform: "substack", postId: data.id || `substack-${Date.now()}` });
        }
      } catch (substackErr: any) {
        return res.status(400).json({
          success: false,
          platform: "substack",
          status: "manual_required",
          error: substackErr?.message || "Failed to create Substack draft. Manual publishing required.",
        });
      }

      return res.status(400).json({
        success: false,
        platform: "substack",
        status: "manual_required",
        error: "Substack API returned an error. Draft not created — manual publishing required.",
      });
    }

    return res.status(400).json({ error: `Unsupported platform: ${platform}` });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to publish" });
  }
});

router.post("/social/cross-post", requireAuth, validateAndSanitizeBody(crossPostSchema), async (req, res) => {
  try {
    const { content, platforms, mediaUrl, schedule } = req.body;
    const username = (req as AuthenticatedRequest).user?.username || "unknown";

    const results: any[] = [];
    const sortedPlatforms = [...platforms].sort((a, b) => {
      const priority: Record<string, number> = {
        linkedin: 1, twitter: 2, meta: 3, instagram: 4, youtube: 5, medium: 6, substack: 7,
      };
      return (priority[a] || 99) - (priority[b] || 99);
    });

    for (const platform of sortedPlatforms) {
      const adapted = adaptContentForPlatform(content, platform);

      if (schedule) {
        const optimalTime = getNextOptimalTime(platform);
        try {
          const [post] = await db
            .insert(socialPostsTable)
            .values({
              username,
              platform,
              content: adapted,
              status: "scheduled",
              scheduledAt: optimalTime,
              mediaUrl: mediaUrl || null,
            })
            .returning();
          results.push({ platform, status: "scheduled", scheduledAt: optimalTime.toISOString(), postId: post.id });
        } catch (e: any) {
          results.push({ platform, status: "error", error: e.message });
        }
      } else {
        try {
          const publishRes = await fetch(`${req.protocol}://${req.get("host")}/api/social/publish`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: req.headers.authorization || "",
            },
            body: JSON.stringify({ platform, content: adapted, mediaUrl }),
          });
          const data: any = await publishRes.json();
          results.push({ platform, ...data });
        } catch (e: any) {
          results.push({ platform, status: "error", error: e.message });
        }
      }

      if (!schedule) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return res.json({ results });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social/adapt-content", requireAuth, async (req, res) => {
  try {
    const { content, platforms } = req.body;
    const adapted: Record<string, string> = {};
    for (const platform of (platforms || ALL_PLATFORMS)) {
      adapted[platform] = adaptContentForPlatform(content, platform);
    }
    return res.json({ adapted, limits: PLATFORM_LIMITS });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/social/optimal-times", requireAuth, (req, res) => {
  const platform = req.query.platform as string;
  if (platform) {
    const time = getNextOptimalTime(platform);
    return res.json({ platform, nextOptimalTime: time.toISOString(), windows: OPTIMAL_POSTING_WINDOWS[platform] });
  }
  const times: Record<string, any> = {};
  for (const p of ALL_PLATFORMS) {
    times[p] = {
      nextOptimalTime: getNextOptimalTime(p).toISOString(),
      windows: OPTIMAL_POSTING_WINDOWS[p],
    };
  }
  return res.json({ times });
});

router.get("/social/analytics", requireAuth, async (req, res) => {
  try {
    const platform = req.query.platform as string;
    const username = (req as AuthenticatedRequest).user?.username || "unknown";
    const platforms = await getSocialStatus(username);
    const analytics: Record<string, any> = {};

    for (const p of ALL_PLATFORMS) {
      if (platform && platform !== p) continue;
      const pConfig = platforms.find((s) => s.platform === p);

      if (pConfig?.connected) {
        const token = await getValidToken(username, p);

        if (p === "twitter" && token) {
          try {
            const meRes = await fetch("https://api.twitter.com/2/users/me?user.fields=public_metrics", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const meData: any = await meRes.json();
            analytics.twitter = {
              configured: true, connected: true,
              metrics: meData.data?.public_metrics || null,
              username: meData.data?.username,
              tokenHealth: pConfig.tokenHealth,
            };
          } catch {
            analytics.twitter = { configured: true, connected: true, metrics: null, error: "Failed to fetch", tokenHealth: pConfig.tokenHealth };
          }
        } else if (p === "meta" && token) {
          const tokens = await getDbTokens(username, "meta");
          const pageToken = tokens?.pageToken || tokens?.accessToken;
          const pageId = tokens?.pageId;
          if (pageToken && pageId) {
            try {
              const response = await fetch(
                `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_impressions,page_engaged_users,page_fans&period=day&access_token=${pageToken}`
              );
              const data: any = await response.json();
              analytics.meta = { configured: true, connected: true, insights: data.data || [], tokenHealth: pConfig.tokenHealth };
            } catch {
              analytics.meta = { configured: true, connected: true, insights: [], error: "Failed to fetch", tokenHealth: pConfig.tokenHealth };
            }
          }
        } else if (p === "linkedin" && token) {
          try {
            const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const profileData: any = await meRes.json();
            analytics.linkedin = { configured: true, connected: true, profile: profileData, tokenHealth: pConfig.tokenHealth };
          } catch {
            analytics.linkedin = { configured: true, connected: true, profile: null, error: "Failed to fetch", tokenHealth: pConfig.tokenHealth };
          }
        } else if (p === "instagram" && token) {
          const tokens = await getDbTokens(username, "instagram");
          const igId = tokens?.userId;
          if (igId) {
            try {
              const igRes = await fetch(
                `https://graph.facebook.com/v18.0/${igId}?fields=followers_count,media_count,username&access_token=${token}`
              );
              const igData: any = await igRes.json();
              analytics.instagram = { configured: true, connected: true, metrics: igData, tokenHealth: pConfig.tokenHealth };
            } catch {
              analytics.instagram = { configured: true, connected: true, metrics: null, error: "Failed to fetch", tokenHealth: pConfig.tokenHealth };
            }
          }
        } else if (p === "youtube" && token) {
          try {
            const chRes = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const chData: any = await chRes.json();
            analytics.youtube = {
              configured: true, connected: true,
              metrics: chData.items?.[0]?.statistics || null,
              channelTitle: chData.items?.[0]?.snippet?.title,
              tokenHealth: pConfig.tokenHealth,
            };
          } catch {
            analytics.youtube = { configured: true, connected: true, metrics: null, error: "Failed to fetch", tokenHealth: pConfig.tokenHealth };
          }
        } else {
          analytics[p] = { configured: true, connected: true, metrics: null, tokenHealth: pConfig.tokenHealth };
        }
      } else {
        analytics[p] = { configured: pConfig?.configured || false, connected: false, tokenHealth: "disconnected" };
      }
    }

    return res.json(analytics);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to fetch analytics" });
  }
});

router.post("/social/disconnect", requireAuth, validateBody(disconnectSchema), async (req, res) => {
  const { platform } = req.body;
  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  await removeDbTokens(username, platform);
  return res.json({ success: true });
});

router.get("/social/token-health", requireAuth, async (req, res) => {
  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  const healthReport: Record<string, any> = {};

  for (const platform of ALL_PLATFORMS) {
    if (!isPlatformConfigured(platform)) {
      healthReport[platform] = { status: "not_configured" };
      continue;
    }
    const tokens = await getDbTokens(username, platform);
    if (!tokens) {
      healthReport[platform] = { status: "not_connected" };
      continue;
    }
    if (isTokenExpired(tokens)) {
      healthReport[platform] = {
        status: "expired",
        expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : null,
        canAutoRefresh: ["twitter", "youtube", "meta"].includes(platform),
      };
    } else {
      healthReport[platform] = {
        status: "healthy",
        expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt).toISOString() : null,
      };
    }
  }

  return res.json({ health: healthReport });
});

router.post("/social/seed-calendar", requireAuth, validateBody(seedCalendarSchema), async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username || req.body.username || "szlholdings";
    const startDateStr = req.body.startDate;
    const startDate = startDateStr ? new Date(startDateStr) : new Date();

    const calendarContent = getCalendarContent();
    const seededPosts: any[] = [];

    for (let weekIdx = 0; weekIdx < calendarContent.length; weekIdx++) {
      const week = calendarContent[weekIdx];
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + weekIdx * 7);

      for (const platformContent of week.platforms) {
        const optimalTime = getNextOptimalTime(platformContent.platform, weekStart);

        try {
          const [post] = await db
            .insert(socialPostsTable)
            .values({
              username,
              platform: platformContent.platform,
              content: platformContent.content,
              status: "scheduled",
              scheduledAt: optimalTime,
              parentPostId: null,
            })
            .returning();
          seededPosts.push({ id: post.id, platform: platformContent.platform, week: weekIdx + 1, scheduledAt: optimalTime.toISOString() });
        } catch (e: any) {
          seededPosts.push({ platform: platformContent.platform, week: weekIdx + 1, error: e.message });
        }
      }
    }

    return res.json({ success: true, seeded: seededPosts.length, posts: seededPosts });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

function getCalendarContent() {
  const weeks = [
    {
      theme: "Genesis — SZL Holdings",
      platforms: [
        { platform: "twitter", content: "I built an entire technology ecosystem. Alone.\n\nAI research. Cybersecurity. Predictive intelligence. Observability. Creative tech. Consulting.\n\nAll interconnected. All production-grade.\n\nOver 8 weeks, I'm revealing everything.\n\nWeek 1: The Genesis.\n\nThis is SZL Holdings.\n\n#BuildInPublic #TechFounder #SZLHoldings" },
        { platform: "linkedin", content: "What happens when a single engineer decides to build an entire technology ecosystem from scratch?\n\nNot a startup. Not a side project. An ecosystem.\n\nOver the past year, I've been quietly building SZL Holdings — a portfolio of interconnected platforms spanning AI research, cybersecurity, predictive intelligence, observability, creative tech, and strategic consulting.\n\nEvery platform is production-grade. Every one was designed, engineered, and shipped by one person. And every one connects to the others in ways that make the whole greater than the sum of its parts.\n\nOver the next 8 weeks, I'm going to pull back the curtain on every single one.\n\nHere's what I've learned so far:\n- The best systems are the ones that think like ecosystems, not silos\n- Building in public is uncomfortable — but it's the fastest way to earn trust\n- The hardest skill isn't coding. It's knowing what to build next\n\nThis is Week 1. The Genesis. SZL Holdings is the foundation.\n\nNext week, I'll introduce the brain of the operation.\n\nStay tuned.\n\n#BuildInPublic #TechFounder #SZLHoldings #Innovation #StartupLife #FounderJourney #TechLeadership #SaaS" },
        { platform: "meta", content: "🚀 Week 1: The Genesis\n\nI've been building something ambitious — SZL Holdings, an entire technology ecosystem spanning AI research, cybersecurity, predictive intelligence, and more.\n\nEvery platform is production-grade. Every one connects to the others.\n\nOver the next 8 weeks, I'll reveal each platform. Stay tuned.\n\n#BuildInPublic #TechFounder #SZLHoldings #Innovation" },
        { platform: "instagram", content: "I built an entire technology ecosystem from scratch. 🚀\n\nAI research • Cybersecurity • Predictive intelligence • Observability • Creative tech • Consulting\n\nAll interconnected. All production-grade. Over 8 weeks, I'm revealing everything.\n\nWeek 1: The Genesis. This is SZL Holdings.\n\n#BuildInPublic #TechFounder #SZLHoldings #Innovation #StartupLife #FounderJourney #TechLeadership #SaaS #Entrepreneur #TechStartup" },
        { platform: "youtube", content: "Week 1: The Genesis — SZL Holdings\n\nI built an entire technology ecosystem alone. AI research, cybersecurity, predictive intelligence, observability, creative tech, and consulting — all interconnected, all production-grade.\n\nOver the next 8 weeks, I'm pulling back the curtain on every single platform in the SZL Holdings ecosystem.\n\nThis is the foundation. The beginning of everything." },
        { platform: "medium", content: "# The Genesis: Building an Entire Technology Ecosystem from Scratch\n\nWhat happens when a single engineer decides to build an entire technology ecosystem from scratch?\n\nNot a startup. Not a side project. An ecosystem.\n\nOver the past year, I've been quietly building **SZL Holdings** — a portfolio of interconnected platforms spanning AI research, cybersecurity, predictive intelligence, observability, creative tech, and strategic consulting.\n\nEvery platform is production-grade. Every one was designed, engineered, and shipped by one person.\n\n## What I've Learned So Far\n\n1. **The best systems think like ecosystems, not silos.** When you build platforms that connect, the value compounds.\n2. **Building in public is uncomfortable** — but it's the fastest way to earn trust.\n3. **The hardest skill isn't coding.** It's knowing what to build next.\n\nThis is Week 1. Over the next 8 weeks, I'll reveal every platform.\n\nStay tuned." },
        { platform: "substack", content: "<h1>The Genesis: Building an Entire Technology Ecosystem</h1><br/><br/>Welcome to the first edition of the SZL Holdings newsletter.<br/><br/>Over the next 8 weeks, I'll be revealing the entire SZL Holdings technology ecosystem — a portfolio of interconnected platforms spanning AI research, cybersecurity, predictive intelligence, observability, creative tech, and strategic consulting.<br/><br/><strong>Every platform is production-grade.</strong> Every one was designed, engineered, and shipped by one person.<br/><br/>This is Week 1: The Genesis.<br/><br/>Stay tuned for next week when I introduce the brain of the operation." },
      ],
    },
    {
      theme: "The Brain — INCA Intelligence Platform",
      platforms: [
        { platform: "twitter", content: "Meet INCA — the brain of the SZL ecosystem.\n\nAI research intelligence that:\n- Tracks experiments in real-time\n- Benchmarks model performance\n- Surfaces insights across platforms\n\nThe hardest part? Not algorithms. Information architecture.\n\nWeek 2 of 8.\n\n#BuildInPublic #AI #SZLHoldings" },
        { platform: "linkedin", content: "Every ecosystem needs a brain. Ours is called INCA.\n\nINCA is an AI-powered research intelligence platform that serves as the central nervous system for the entire SZL Holdings ecosystem. It manages experiments, tracks model performance, surfaces insights, and turns raw research into actionable intelligence.\n\nHere's what makes INCA different:\n\n1. Live experiment tracking with real-time accuracy metrics\n2. Cross-platform intelligence — connecting insights across Nimbus, Beacon, and Zeus\n3. Model performance benchmarking that alerts before degradation hits users\n\nThe hardest part isn't the algorithms. It's designing the information architecture so that the right insight reaches the right person at the right moment.\n\nMost teams drown in data. INCA was built to surface signal.\n\nWeek 3: The Eyes. Coming next.\n\n#BuildInPublic #AI #MachineLearning #DataScience #SZLHoldings #Innovation #TechFounder #EnterpriseAI" },
        { platform: "meta", content: "🧠 Week 2: Meet INCA — The Brain of SZL\n\nINCA is our AI-powered research intelligence platform. It manages experiments, tracks model performance, and surfaces insights across the entire ecosystem.\n\nThe hardest part isn't the algorithms — it's information architecture.\n\n#BuildInPublic #AI #SZLHoldings #Innovation" },
        { platform: "instagram", content: "🧠 Meet INCA — the brain of the SZL ecosystem.\n\nAI research intelligence that tracks experiments in real-time, benchmarks model performance, and surfaces insights across platforms.\n\nThe hardest part? Not algorithms. Information architecture.\n\nWeek 2 of 8. 🚀\n\n#BuildInPublic #AI #MachineLearning #SZLHoldings #Innovation #TechFounder #DataScience #ArtificialIntelligence #EnterpriseAI #StartupLife" },
        { platform: "youtube", content: "Week 2: INCA — The Brain of the SZL Ecosystem\n\nEvery ecosystem needs a brain. INCA is an AI-powered research intelligence platform that manages experiments, tracks model performance, and surfaces insights across the entire SZL Holdings portfolio.\n\nThe hardest part of building an intelligence platform isn't the algorithms — it's the information architecture." },
        { platform: "medium", content: "# INCA: Building the Brain of a Technology Ecosystem\n\nEvery ecosystem needs a brain. Ours is called INCA.\n\nINCA is an AI-powered research intelligence platform that serves as the central nervous system for the entire SZL Holdings ecosystem.\n\n## What Makes INCA Different\n\n1. **Live experiment tracking** with real-time accuracy metrics\n2. **Cross-platform intelligence** — connecting insights across Nimbus, Beacon, and Zeus\n3. **Model performance benchmarking** that alerts before degradation hits users\n\nThe hardest part isn't the algorithms. It's designing the information architecture so the right insight reaches the right person at the right moment.\n\nMost teams drown in data. INCA was built to surface signal." },
        { platform: "substack", content: "<h1>INCA: The Brain of the Ecosystem</h1><br/><br/>Every ecosystem needs a brain. Ours is called INCA.<br/><br/>INCA is an AI-powered research intelligence platform that manages experiments, tracks model performance, and surfaces insights across the entire SZL Holdings ecosystem.<br/><br/><strong>What makes INCA different:</strong><br/>• Live experiment tracking with real-time accuracy metrics<br/>• Cross-platform intelligence connecting Nimbus, Beacon, and Zeus<br/>• Model performance benchmarking that alerts before degradation hits users" },
      ],
    },
    {
      theme: "The Eyes — Lyte Observability",
      platforms: [
        { platform: "twitter", content: "Lyte — the eyes of the ecosystem.\n\nNot just monitoring. Understanding.\n\nIntelligent observability that tells you:\n- Why it broke\n- What's about to break\n- What to do about it\n\nWhen you run 15+ platforms solo, you need eyes that never blink.\n\nWeek 3 of 8.\n\n#BuildInPublic #Observability #SZLHoldings" },
        { platform: "linkedin", content: "If INCA is the brain, Lyte is the eyes.\n\nLyte is an intelligent observability platform that goes beyond metrics and logs to provide genuine system understanding.\n\nTraditional monitoring tells you something broke. Lyte tells you why it broke, what's about to break next, and what you should do about it.\n\nHere's what I built into Lyte:\n- Real-time system health visualization across the entire SZL ecosystem\n- Anomaly detection that learns normal behaviour patterns\n- Correlation analysis connecting events across services\n- A command center view for the full picture at a glance\n\nWhen you're running 15+ platforms as a solo founder, you need eyes that never blink.\n\nThat's Lyte.\n\nWeek 4: The Shield. Cybersecurity next.\n\n#BuildInPublic #Observability #DevOps #SZLHoldings #SystemDesign #TechFounder #SaaS #Innovation" },
        { platform: "meta", content: "👁️ Week 3: Lyte — The Eyes of the Ecosystem\n\nIntelligent observability that goes beyond monitoring. Lyte tells you why things broke, what's about to break, and what to do about it.\n\nWhen you run 15+ platforms solo, you need eyes that never blink.\n\n#BuildInPublic #Observability #SZLHoldings" },
        { platform: "instagram", content: "👁️ Meet Lyte — the eyes of the SZL ecosystem.\n\nNot just monitoring. Understanding.\n\nIntelligent observability that tells you why it broke, what's about to break, and what to do about it.\n\nWhen you run 15+ platforms solo, you need eyes that never blink. 👀\n\nWeek 3 of 8.\n\n#BuildInPublic #Observability #DevOps #SZLHoldings #TechFounder #SystemDesign #Monitoring #SaaS #Innovation #StartupLife" },
        { platform: "youtube", content: "Week 3: Lyte — Intelligent Observability\n\nIf INCA is the brain, Lyte is the eyes. An intelligent observability platform that goes beyond metrics and logs to provide genuine system understanding.\n\nTraditional monitoring tells you something broke. Lyte tells you why, what's next, and what to do about it." },
        { platform: "medium", content: "# Lyte: Building Eyes That Never Blink\n\nIf INCA is the brain, Lyte is the eyes.\n\nEvery system needs to be watched. Not just monitored — understood. Lyte is an intelligent observability platform that goes beyond metrics and logs.\n\n## The Difference\n\nTraditional monitoring tells you something broke. Lyte tells you:\n- **Why** it broke\n- **What's about to break** next\n- **What you should do** about it\n\nWhen you're running 15+ platforms as a solo founder, you can't manually check each one. You need a system that watches the systems." },
        { platform: "substack", content: "<h1>Lyte: Eyes That Never Blink</h1><br/><br/>If INCA is the brain, Lyte is the eyes.<br/><br/>Lyte is an intelligent observability platform that goes beyond monitoring to provide genuine system understanding.<br/><br/><strong>Traditional monitoring</strong> tells you something broke.<br/><strong>Lyte</strong> tells you why it broke, what's about to break next, and what you should do about it.<br/><br/>When you run 15+ platforms solo, you need eyes that never blink." },
      ],
    },
    {
      theme: "The Shield — Security Stack",
      platforms: [
        { platform: "twitter", content: "One security tool isn't enough. You need a stack.\n\nROSIE — Detection & triage\nAEGIS — Defense & compliance\nFIRESTORM — Incident response simulation\n\nThree platforms. One defense layer.\n\nSecurity isn't a product. It's a system.\n\nWeek 4 of 8.\n\n#BuildInPublic #Cybersecurity #SZLHoldings" },
        { platform: "linkedin", content: "You don't build one security tool. You build a security stack.\n\nROSIE — The Front Line: Threat detection, automated triage, and initial incident response. An AI-powered security assistant working 24/7.\n\nAEGIS — The Fortress: Defensive perimeter — access controls, vulnerability assessments, and compliance monitoring.\n\nFIRESTORM — The War Room: Incident response simulator and trainer — running scenarios and coordinating response procedures.\n\nWhy three platforms? Because security isn't a product. Detection, defense, and response are fundamentally different disciplines.\n\nThe best security architecture mirrors how security teams actually think and work.\n\nWeek 5: Prediction. Things get interesting.\n\n#BuildInPublic #Cybersecurity #SecurityOps #TechFounder #SZLHoldings #Innovation #B2B #StartupLife" },
        { platform: "meta", content: "🛡️ Week 4: The Shield — Our Security Stack\n\nROSIE → Detection & triage\nAEGIS → Defense & compliance\nFIRESTORM → Incident response simulation\n\nSecurity isn't a product. It's a system. Three platforms. One defense layer.\n\n#BuildInPublic #Cybersecurity #SZLHoldings" },
        { platform: "instagram", content: "🛡️ One security tool isn't enough. You need a stack.\n\nROSIE → Detection & triage 🔍\nAEGIS → Defense & compliance 🏰\nFIRESTORM → Incident response simulation 🔥\n\nThree platforms. One defense layer.\n\nSecurity isn't a product. It's a system.\n\nWeek 4 of 8.\n\n#BuildInPublic #Cybersecurity #SecurityOps #SZLHoldings #TechFounder #Innovation #InfoSec #CyberDefense #SecurityStack #StartupLife" },
        { platform: "youtube", content: "Week 4: The Shield — ROSIE, AEGIS, FIRESTORM\n\nYou don't build one security tool. You build a security stack.\n\nROSIE handles threat detection and triage. AEGIS manages defense and compliance. FIRESTORM runs incident response simulations.\n\nSecurity isn't a product. It's a system." },
        { platform: "medium", content: "# The Shield: Why One Security Tool Is Never Enough\n\nYou don't build one security tool. You build a security stack.\n\n## ROSIE — The Front Line\nThreat detection, automated triage, and initial incident response. An AI-powered security assistant working 24/7 without fatigue.\n\n## AEGIS — The Fortress\nDefensive perimeter — managing access controls, vulnerability assessments, and compliance monitoring.\n\n## FIRESTORM — The War Room\nIncident response simulator and trainer — running scenarios and ensuring your team has practised for every eventuality.\n\n## Why Three?\nDetection, defense, and response are fundamentally different disciplines that require different tools, different UIs, and different mental models." },
        { platform: "substack", content: "<h1>The Shield: A Three-Layer Security Stack</h1><br/><br/><h2>ROSIE — The Front Line</h2><br/>Threat detection, automated triage, and AI-powered incident response.<br/><br/><h2>AEGIS — The Fortress</h2><br/>Defensive perimeter — access controls, vulnerability assessments, compliance monitoring.<br/><br/><h2>FIRESTORM — The War Room</h2><br/>Incident response simulation and training.<br/><br/>Security isn't a product. It's a system." },
      ],
    },
    {
      theme: "Prediction Engine — Nimbus + Beacon",
      platforms: [
        { platform: "twitter", content: "Prediction isn't about being right. It's about being early.\n\nNIMBUS — Forecasts what happens next\nBEACON — Surfaces signals across platforms\n\nA 70% accurate prediction that arrives 3 hours early beats a 99% accurate post-mortem.\n\nBuild for speed of insight.\n\nWeek 5 of 8.\n\n#BuildInPublic #PredictiveAI #SZLHoldings" },
        { platform: "linkedin", content: "What if you could see the future? Not perfectly — but well enough to act before everyone else?\n\nNIMBUS — The Forecaster: Predictive AI that analyses patterns, builds forecasting models, and generates predictions across multiple domains.\n\nBEACON — The Signal: Analytics and alerting that connects to every platform, creating cross-platform intelligence reports.\n\nTogether, they form a prediction engine that gets smarter as the ecosystem grows. Every new platform adds data. Every data point improves predictions.\n\nPrediction isn't about being right. It's about being useful. A 70% accurate prediction that arrives 3 hours early is infinitely more valuable than a 99% accurate post-mortem.\n\nBuild for speed of insight, not perfection of analysis.\n\nWeek 6: The Advisory Arm.\n\n#BuildInPublic #PredictiveAI #AI #DataScience #SZLHoldings #TechFounder #Innovation #MachineLearning" },
        { platform: "meta", content: "🔮 Week 5: The Prediction Engine\n\nNIMBUS forecasts what happens next. BEACON surfaces signals across platforms.\n\nA 70% accurate prediction that arrives 3 hours early beats a 99% post-mortem.\n\nBuild for speed of insight.\n\n#BuildInPublic #PredictiveAI #SZLHoldings" },
        { platform: "instagram", content: "🔮 Prediction isn't about being right. It's about being early.\n\nNIMBUS → Forecasts what happens next 📊\nBEACON → Surfaces signals across platforms 📡\n\nA 70% accurate prediction that arrives 3 hours early beats a 99% post-mortem. Build for speed of insight.\n\nWeek 5 of 8.\n\n#BuildInPublic #PredictiveAI #AI #DataScience #SZLHoldings #TechFounder #Innovation #MachineLearning #Forecasting #StartupLife" },
        { platform: "youtube", content: "Week 5: Nimbus + Beacon — The Prediction Engine\n\nWhat if you could see the future? Not perfectly — but well enough to act before everyone else?\n\nNimbus handles forecasting. Beacon surfaces signals. Together they form a prediction engine that gets smarter as the ecosystem grows.\n\nPrediction isn't about being right. It's about being early." },
        { platform: "medium", content: "# The Prediction Engine: Speed of Insight Over Perfection\n\nWhat if you could see the future? Not perfectly — but well enough to act before everyone else?\n\n## NIMBUS — The Forecaster\nPredictive AI that analyses patterns, builds forecasting models, and generates predictions across multiple domains.\n\n## BEACON — The Signal\nAnalytics and alerting that connects to every platform, creating cross-platform intelligence reports.\n\nTogether, they form a prediction engine that gets smarter as the ecosystem grows.\n\n> A 70% accurate prediction that arrives 3 hours early is infinitely more valuable than a 99% accurate post-mortem.\n\nBuild for speed of insight, not perfection of analysis." },
        { platform: "substack", content: "<h1>The Prediction Engine: Nimbus + Beacon</h1><br/><br/><h2>NIMBUS — The Forecaster</h2><br/>Predictive AI that analyses patterns and generates predictions across multiple domains.<br/><br/><h2>BEACON — The Signal</h2><br/>Analytics and alerting that creates cross-platform intelligence reports.<br/><br/><em>A 70% accurate prediction that arrives 3 hours early is infinitely more valuable than a 99% accurate post-mortem.</em>" },
      ],
    },
    {
      theme: "Advisory Arm — Carlota Jo",
      platforms: [
        { platform: "twitter", content: "Technology without strategy is just expensive tooling.\n\nCarlota Jo Consulting bridges the gap:\n- Digital transformation strategy\n- AI integration advisory\n- Security posture assessment\n\nThe feedback loop between building and advising? Most underrated founder advantage.\n\nWeek 6 of 8.\n\n#BuildInPublic #StrategicConsulting #SZLHoldings" },
        { platform: "linkedin", content: "Technology without strategy is just expensive tooling.\n\nThat's why SZL Holdings has a consulting arm: Carlota Jo.\n\nCarlota Jo Consulting delivers elite strategic advisory for enterprises, family offices, and institutional investors.\n\n\"Where Vision Meets Precision\" — helping organisations leverage AI, security, and predictive intelligence for competitive advantage.\n\nOur practice areas:\n- Digital transformation strategy\n- AI integration advisory\n- Security posture assessment using Rosie/Aegis/Firestorm methodology\n- Portfolio management and venture strategy\n\nThe feedback loop between building and advising is the most underrated advantage a founder can have.\n\nWeek 7: The Creative Side.\n\n#BuildInPublic #StrategicConsulting #TechLeadership #SZLHoldings #Innovation #DigitalTransformation #B2B #TechFounder" },
        { platform: "meta", content: "💼 Week 6: Carlota Jo Consulting\n\nTechnology without strategy is just expensive tooling.\n\nCarlota Jo bridges the gap between technology and business — digital transformation, AI integration, and security advisory.\n\nThe feedback loop between building and advising is the most underrated advantage.\n\n#BuildInPublic #Consulting #SZLHoldings" },
        { platform: "instagram", content: "💼 Technology without strategy is just expensive tooling.\n\nCarlota Jo Consulting bridges the gap:\n→ Digital transformation strategy\n→ AI integration advisory\n→ Security posture assessment\n→ Portfolio management\n\nThe feedback loop between building and advising? Most underrated founder advantage.\n\nWeek 6 of 8.\n\n#BuildInPublic #StrategicConsulting #SZLHoldings #TechLeadership #Innovation #DigitalTransformation #B2B #TechFounder #Entrepreneur #StartupLife" },
        { platform: "youtube", content: "Week 6: Carlota Jo — The Advisory Arm\n\nTechnology without strategy is just expensive tooling. That's why SZL Holdings has a consulting arm.\n\nCarlota Jo Consulting delivers strategic advisory for enterprises, family offices, and institutional investors — bridging the gap between technology and real-world business outcomes." },
        { platform: "medium", content: "# Technology Without Strategy Is Just Expensive Tooling\n\nThat's why SZL Holdings has a consulting arm: **Carlota Jo**.\n\nCarlota Jo Consulting delivers elite strategic advisory for enterprises, family offices, and institutional investors.\n\n## Practice Areas\n\n- **Digital transformation strategy** for organisations drowning in tools but starving for direction\n- **AI integration advisory** — moving from \"we should use AI\" to \"here's exactly how\"\n- **Security posture assessment** using our Rosie/Aegis/Firestorm methodology\n- **Portfolio management** and venture strategy\n\nThe feedback loop between building and advising is the most underrated advantage a founder can have." },
        { platform: "substack", content: "<h1>Carlota Jo: Where Vision Meets Precision</h1><br/><br/>Technology without strategy is just expensive tooling.<br/><br/>Carlota Jo Consulting delivers strategic advisory for enterprises, family offices, and institutional investors.<br/><br/><strong>Practice areas:</strong><br/>• Digital transformation strategy<br/>• AI integration advisory<br/>• Security posture assessment<br/>• Portfolio management and venture strategy" },
      ],
    },
    {
      theme: "Creative Side — DreamEra + Dreamscape",
      platforms: [
        { platform: "twitter", content: "Everyone builds the serious stuff. Few build the creative stuff.\n\nDreamEra — Creative AI for concepts & exploration\nDreamscape — Immersive digital experiences\n\nCreative tech is competitive advantage disguised as art.\n\nIt also keeps you sane while building security platforms.\n\nWeek 7 of 8.\n\n#BuildInPublic #CreativeTech #SZLHoldings" },
        { platform: "linkedin", content: "Everyone builds the serious stuff. Few build the creative stuff. I built both.\n\nDREAMERA — The Canvas: A creative AI storytelling platform. Where ideas get their first visual form.\n\nDREAMSCAPE — The Experience: Immersive digital experiences. An immersive creative workspace.\n\nThe companies that win won't just have the best algorithms. They'll have the best experiences. Creative tech is competitive advantage disguised as art.\n\nBuilding creative tools kept me sane while building security and analytics platforms. It uses completely different mental muscles.\n\nWeek 8: The Full Reveal. Everything comes together.\n\n#BuildInPublic #CreativeTech #Innovation #SZLHoldings #TechFounder #ProductDevelopment #Design #AI" },
        { platform: "meta", content: "🎨 Week 7: The Creative Side\n\nDreamEra — Creative AI for concept generation\nDreamscape — Immersive digital experiences\n\nCreative tech is competitive advantage disguised as art. And it keeps you sane while building security platforms.\n\n#BuildInPublic #CreativeTech #SZLHoldings" },
        { platform: "instagram", content: "🎨 Everyone builds the serious stuff. Few build the creative stuff.\n\nDreamEra → Creative AI for concepts & exploration ✨\nDreamscape → Immersive digital experiences 🌌\n\nCreative tech is competitive advantage disguised as art.\n\nIt also keeps you sane while building security platforms. 😄\n\nWeek 7 of 8.\n\n#BuildInPublic #CreativeTech #SZLHoldings #Innovation #TechFounder #Design #AI #DigitalArt #CreativeAI #StartupLife" },
        { platform: "youtube", content: "Week 7: DreamEra + Dreamscape — The Creative Side\n\nEveryone builds the serious stuff. Few build the creative stuff.\n\nDreamEra is a creative AI storytelling platform. Dreamscape turns concepts into immersive digital experiences.\n\nCreative tech is competitive advantage disguised as art." },
        { platform: "medium", content: "# The Creative Side: Why Every Tech Portfolio Needs Art\n\nEveryone builds the serious stuff. Few build the creative stuff. I built both.\n\n## DreamEra — The Canvas\nA creative AI storytelling platform that renders artifact maps and discovers energy breakthroughs in narrative space.\n\n## Dreamscape — The Experience\nImmersive digital experiences — an immersive creative workspace for exploring worlds and crafting artifacts.\n\n## Why Creative Tech Matters\nThe companies that win in the next decade won't just have the best algorithms. They'll have the best experiences.\n\nCreative tech is competitive advantage disguised as art.\n\n*Building creative tools kept me sane while building security and analytics platforms. It uses completely different mental muscles.*" },
        { platform: "substack", content: "<h1>The Creative Side: DreamEra + Dreamscape</h1><br/><br/><h2>DreamEra — The Canvas</h2><br/>Creative AI storytelling platform for concept generation and visual exploration.<br/><br/><h2>Dreamscape — The Experience</h2><br/>Immersive digital experiences and creative workspace.<br/><br/><em>Creative tech is competitive advantage disguised as art. And it keeps you sane while building security platforms.</em>" },
      ],
    },
    {
      theme: "Full Reveal — Complete Portfolio",
      platforms: [
        { platform: "twitter", content: "8 weeks. The full reveal.\n\nOne engineer. One ecosystem:\n\n- INCA (AI research)\n- Lyte (observability)\n- Rosie + Aegis + Firestorm (security)\n- Nimbus + Beacon (predictions)\n- Zeus (orchestration)\n- DreamEra + Dreamscape (creative)\n- Carlota Jo (consulting)\n\nAll interconnected. All production-grade.\n\n#BuildInPublic #TechFounder #SZLHoldings" },
        { platform: "linkedin", content: "8 weeks ago I told you I built an entire technology ecosystem. Alone.\n\nToday, the full picture:\n\nSZL HOLDINGS — The Foundation\n\nTHE ECOSYSTEM:\n- INCA — AI research intelligence\n- Lyte — Intelligent observability\n- Rosie — Threat detection & security\n- Aegis — Defensive perimeter & compliance\n- Firestorm — Incident response simulation\n- Nimbus — Predictive AI & forecasting\n- Beacon — Cross-platform analytics\n- Zeus — Platform orchestration\n- DreamEra — Creative AI\n- Dreamscape — Immersive experiences\n- AlloyScape — Integration layer\n- Carlota Jo — Strategic consulting\n\nEvery platform connects. Intelligence flows. Security protects. Predictions guide. This isn't a collection of side projects. It's a thesis.\n\nMy name is Stephen Lutar. I'm a builder, founder, and system architect.\n\nAnd I'm just getting started.\n\n#BuildInPublic #TechFounder #SZLHoldings #Innovation #FounderJourney #AI #Cybersecurity #SystemDesign" },
        { platform: "meta", content: "🎯 Week 8: The Full Reveal\n\nOne engineer. One entire technology ecosystem.\n\nINCA • Lyte • Rosie • Aegis • Firestorm • Nimbus • Beacon • Zeus • DreamEra • Dreamscape • AlloyScape • Carlota Jo\n\nAll interconnected. All production-grade.\n\nI'm Stephen Lutar. Builder. Founder. System architect. Just getting started.\n\n#BuildInPublic #TechFounder #SZLHoldings" },
        { platform: "instagram", content: "🎯 8 weeks. The full reveal.\n\nOne engineer. One entire technology ecosystem:\n\n🧠 INCA — AI research\n👁️ Lyte — Observability\n🛡️ Rosie + Aegis + Firestorm — Security\n🔮 Nimbus + Beacon — Predictions\n⚡ Zeus — Orchestration\n🎨 DreamEra + Dreamscape — Creative\n💼 Carlota Jo — Consulting\n\nAll interconnected. All production-grade.\n\nI'm Stephen Lutar. Builder. Founder. System architect.\n\nJust getting started. 🚀\n\n#BuildInPublic #TechFounder #SZLHoldings #Innovation #FounderJourney #AI #Cybersecurity #SystemDesign #FullStack #ProductDevelopment" },
        { platform: "youtube", content: "Week 8: The Full Reveal — SZL Holdings Complete Portfolio\n\n8 weeks ago I set out to reveal the entire SZL Holdings technology ecosystem.\n\nINCA (AI research), Lyte (observability), Rosie + Aegis + Firestorm (security), Nimbus + Beacon (predictions), Zeus (orchestration), DreamEra + Dreamscape (creative), AlloyScape (integration), Carlota Jo (consulting).\n\nAll interconnected. All production-grade. Built by one engineer.\n\nI'm Stephen Lutar. Builder. Founder. System architect. And I'm just getting started." },
        { platform: "medium", content: "# The Full Reveal: One Engineer, One Ecosystem\n\n8 weeks ago I told you I built an entire technology ecosystem. Alone.\n\nToday, the full picture.\n\n## The SZL Holdings Ecosystem\n\n- **INCA** — AI research intelligence & experiment tracking\n- **Lyte** — Intelligent observability & system monitoring\n- **Rosie** — Threat detection & security operations\n- **Aegis** — Defensive perimeter & compliance\n- **Firestorm** — Incident response simulation & training\n- **Nimbus** — Predictive AI & forecasting\n- **Beacon** — Cross-platform analytics & alerting\n- **Zeus** — Platform orchestration & management\n- **DreamEra** — Creative AI & concept generation\n- **Dreamscape** — Immersive digital experiences\n- **AlloyScape** — Unified interface & integration layer\n- **Carlota Jo** — Strategic consulting & advisory\n\nEvery platform connects. Intelligence flows from INCA. Lyte watches everything. The security stack protects it all.\n\n## Three Lessons\n\n1. Architecture matters more than any individual feature\n2. The connections between platforms create more value than the platforms themselves\n3. Building in public is the best decision I've made in my career\n\nMy name is Stephen Lutar. I'm just getting started." },
        { platform: "substack", content: "<h1>The Full Reveal: One Engineer, One Ecosystem</h1><br/><br/>8 weeks ago I began this journey of revealing the SZL Holdings technology ecosystem.<br/><br/><h2>The Complete Portfolio</h2><br/>• <strong>INCA</strong> — AI research intelligence<br/>• <strong>Lyte</strong> — Intelligent observability<br/>• <strong>Rosie + Aegis + Firestorm</strong> — Security stack<br/>• <strong>Nimbus + Beacon</strong> — Predictive intelligence<br/>• <strong>Zeus</strong> — Platform orchestration<br/>• <strong>DreamEra + Dreamscape</strong> — Creative technology<br/>• <strong>AlloyScape</strong> — Integration layer<br/>• <strong>Carlota Jo</strong> — Strategic consulting<br/><br/>Every platform connects. Intelligence flows. Security protects. Predictions guide.<br/><br/>My name is Stephen Lutar. Builder, founder, and system architect.<br/><br/><em>And I'm just getting started.</em>" },
      ],
    },
  ];
  return weeks;
}

router.post("/social/poll-engagement/:postId", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username || "unknown";
    const postId = parseInt(req.params.postId as string, 10);
    if (isNaN(postId)) return res.status(400).json({ error: "Invalid post ID" });

    const [post] = await db
      .select()
      .from(socialPostsTable)
      .where(and(eq(socialPostsTable.id, postId), eq(socialPostsTable.username, username)))
      .limit(1);

    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.status !== "published" || !post.externalPostId) {
      return res.json({ message: "Post has no external ID to poll" });
    }

    let metrics: Record<string, number> = {};

    if (post.platform === "twitter") {
      const token = await getValidToken(username, "twitter");
      if (token) {
        try {
          const tweetRes = await fetch(
            `https://api.twitter.com/2/tweets/${post.externalPostId}?tweet.fields=public_metrics`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const tweetData: any = await tweetRes.json();
          const pm = tweetData.data?.public_metrics;
          if (pm) {
            metrics = {
              impressions: pm.impression_count || 0,
              likes: pm.like_count || 0,
              shares: pm.retweet_count || 0,
              comments: pm.reply_count || 0,
            };
          }
        } catch {}
      }
    }

    if (post.platform === "meta") {
      const tokens = await getDbTokens(username, "meta");
      const pageToken = tokens?.pageToken || tokens?.accessToken;
      if (pageToken) {
        try {
          const postRes = await fetch(
            `https://graph.facebook.com/v18.0/${post.externalPostId}?fields=likes.summary(true),shares,comments.summary(true)&access_token=${pageToken}`
          );
          const postData: any = await postRes.json();
          metrics = {
            likes: postData.likes?.summary?.total_count || 0,
            shares: postData.shares?.count || 0,
            comments: postData.comments?.summary?.total_count || 0,
          };
        } catch {}
      }
    }

    if (Object.keys(metrics).length > 0) {
      await db
        .update(socialPostsTable)
        .set({
          impressions: metrics.impressions || post.impressions,
          likes: metrics.likes || post.likes,
          shares: metrics.shares || post.shares,
          comments: metrics.comments || post.comments,
          reach: metrics.reach || post.reach,
          engagementData: metrics,
          lastPolledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(socialPostsTable.id, postId));
    }

    return res.json({ success: true, metrics });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/social/engagement-feed", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username || "unknown";
    const posts = await db
      .select()
      .from(socialPostsTable)
      .where(and(eq(socialPostsTable.username, username), eq(socialPostsTable.status, "published")))
      .orderBy(socialPostsTable.publishedAt)
      .limit(50);

    const totalImpressions = posts.reduce((s, p) => s + p.impressions, 0);
    const totalLikes = posts.reduce((s, p) => s + p.likes, 0);
    const totalShares = posts.reduce((s, p) => s + p.shares, 0);
    const totalComments = posts.reduce((s, p) => s + p.comments, 0);
    const totalReach = posts.reduce((s, p) => s + p.reach, 0);

    const engagementRate = totalImpressions > 0
      ? ((totalLikes + totalShares + totalComments) / totalImpressions * 100).toFixed(2)
      : "0.00";

    const byPlatform: Record<string, any> = {};
    for (const post of posts) {
      if (!byPlatform[post.platform]) {
        byPlatform[post.platform] = { posts: 0, impressions: 0, likes: 0, shares: 0, comments: 0, reach: 0 };
      }
      byPlatform[post.platform].posts++;
      byPlatform[post.platform].impressions += post.impressions;
      byPlatform[post.platform].likes += post.likes;
      byPlatform[post.platform].shares += post.shares;
      byPlatform[post.platform].comments += post.comments;
      byPlatform[post.platform].reach += post.reach;
    }

    return res.json({
      summary: { totalPosts: posts.length, totalImpressions, totalLikes, totalShares, totalComments, totalReach, engagementRate },
      byPlatform,
      recentPosts: posts.slice(0, 20),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
