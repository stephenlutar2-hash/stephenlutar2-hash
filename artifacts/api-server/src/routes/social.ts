import { Router } from "express";
import { requireAuth } from "./auth";

const router = Router();

interface SocialPlatformStatus {
  platform: string;
  configured: boolean;
  message: string;
}

function getSocialStatus(): SocialPlatformStatus[] {
  return [
    {
      platform: "meta",
      configured: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
      message: process.env.META_APP_ID
        ? "Meta (Facebook/Instagram) connected"
        : "Set META_APP_ID and META_APP_SECRET to enable Meta publishing",
    },
    {
      platform: "twitter",
      configured: !!(process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET),
      message: process.env.TWITTER_API_KEY
        ? "X (Twitter) connected"
        : "Set TWITTER_API_KEY and TWITTER_API_SECRET to enable X publishing",
    },
    {
      platform: "linkedin",
      configured: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
      message: process.env.LINKEDIN_CLIENT_ID
        ? "LinkedIn connected"
        : "Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to enable LinkedIn publishing",
    },
  ];
}

router.get("/social/status", (_req, res) => {
  const platforms = getSocialStatus();
  return res.json({
    platforms,
    anyConfigured: platforms.some((p) => p.configured),
  });
});

router.post("/social/publish", requireAuth, async (req, res) => {
  try {
    const { platform, content, mediaUrl } = req.body;
    if (!platform || !content) {
      return res.status(400).json({ error: "Platform and content are required" });
    }

    const status = getSocialStatus();
    const platformConfig = status.find((s) => s.platform === platform);
    if (!platformConfig?.configured) {
      return res.status(400).json({
        error: `${platform} is not configured. Please set the required API keys.`,
        configured: false,
      });
    }

    if (platform === "meta") {
      const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
      const pageId = process.env.META_PAGE_ID;
      if (!pageToken || !pageId) {
        return res.status(400).json({
          error: "META_PAGE_ACCESS_TOKEN and META_PAGE_ID are required for publishing",
        });
      }

      const url = mediaUrl
        ? `https://graph.facebook.com/v18.0/${pageId}/photos`
        : `https://graph.facebook.com/v18.0/${pageId}/feed`;

      const body: Record<string, string> = { access_token: pageToken };
      if (mediaUrl) {
        body.url = mediaUrl;
        body.caption = content;
      } else {
        body.message = content;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        return res.status(400).json({ error: data.error?.message || "Meta API error" });
      }

      return res.json({ success: true, platform: "meta", postId: data.id });
    }

    if (platform === "twitter") {
      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      if (!bearerToken) {
        return res.status(400).json({
          error: "TWITTER_BEARER_TOKEN is required for publishing",
        });
      }

      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: content }),
      });
      const data = await response.json();

      if (!response.ok) {
        return res.status(400).json({ error: data.detail || "Twitter API error" });
      }

      return res.json({ success: true, platform: "twitter", postId: data.data?.id });
    }

    if (platform === "linkedin") {
      const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
      const personUrn = process.env.LINKEDIN_PERSON_URN;
      if (!accessToken || !personUrn) {
        return res.status(400).json({
          error: "LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN are required",
        });
      }

      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

      if (!response.ok) {
        return res.status(400).json({ error: data.message || "LinkedIn API error" });
      }

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
    const status = getSocialStatus();

    if (platform) {
      const config = status.find((s) => s.platform === platform);
      if (!config?.configured) {
        return res.json({ configured: false, platform, metrics: null });
      }
    }

    const analytics: Record<string, any> = {};

    if (!platform || platform === "meta") {
      const metaConfig = status.find((s) => s.platform === "meta");
      if (metaConfig?.configured) {
        const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
        const pageId = process.env.META_PAGE_ID;
        if (pageToken && pageId) {
          try {
            const response = await fetch(
              `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_impressions,page_engaged_users,page_fans&period=day&access_token=${pageToken}`
            );
            const data = await response.json();
            analytics.meta = {
              configured: true,
              insights: data.data || [],
            };
          } catch {
            analytics.meta = { configured: true, insights: [], error: "Failed to fetch" };
          }
        }
      } else {
        analytics.meta = { configured: false };
      }
    }

    if (!platform || platform === "twitter") {
      analytics.twitter = {
        configured: status.find((s) => s.platform === "twitter")?.configured || false,
      };
    }

    if (!platform || platform === "linkedin") {
      analytics.linkedin = {
        configured: status.find((s) => s.platform === "linkedin")?.configured || false,
      };
    }

    return res.json({ analytics });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to fetch analytics" });
  }
});

export default router;
