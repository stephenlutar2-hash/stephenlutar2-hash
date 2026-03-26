import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "./auth";
import { requireAdmin } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";
import type { AuthenticatedRequest } from "../types";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import {
  socialPostsTable,
  socialTokensTable,
  contentTemplatesTable,
  brandAssetsTable,
} from "@szl-holdings/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { parseContentCalendar } from "../services/calendar-parser";
import {
  getSchedulerStatus,
  pauseScheduler,
  resumeScheduler,
  checkAndPublish,
} from "../services/scheduler";

const router = Router();

router.get("/social-command/health", (_req, res) => {
  res.json({ ok: true, group: "social-command", timestamp: new Date().toISOString() });
});

const createPostSchema = z.object({
  platform: z.string().min(1),
  content: z.string().min(1).max(10000),
  status: z.string().default("draft"),
  mediaUrl: z.string().url().optional().nullable(),
  scheduledAt: z.string().nullable().optional(),
});

const updatePostSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  status: z.string().optional(),
  scheduledAt: z.string().nullable().optional(),
  platform: z.string().optional(),
});

const rescheduleSchema = z.object({
  scheduledAt: z.string().min(1),
});

const generateSchema = z.object({
  topic: z.string().min(1).max(1000),
  platforms: z.array(z.string()),
  tone: z.string().default("Professional"),
  includeHashtags: z.boolean().default(true),
});

const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().default("general"),
  platform: z.string().nullable().optional(),
  content: z.string().min(1).max(10000),
  tags: z.string().nullable().optional(),
});

const createAssetSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().min(1),
  value: z.string().min(1).max(5000),
  category: z.string().default("general"),
});

router.get("/social-command/posts", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const status = req.query.status as string | undefined;
    const platform = req.query.platform as string | undefined;

    let conditions = [eq(socialPostsTable.username, username)];
    if (status) conditions.push(eq(socialPostsTable.status, status));
    if (platform) conditions.push(eq(socialPostsTable.platform, platform));

    const posts = await db
      .select()
      .from(socialPostsTable)
      .where(and(...conditions))
      .orderBy(desc(socialPostsTable.createdAt));

    return res.json({ data: posts });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/posts", requireAuth, validateBody(createPostSchema), async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const { platform, content, status, mediaUrl, scheduledAt } = req.body;

    const [post] = await db
      .insert(socialPostsTable)
      .values({
        username,
        platform,
        content,
        status: status || "draft",
        mediaUrl: mediaUrl || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      })
      .returning();

    return res.json({ data: post });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.put("/social-command/posts/:id", requireAuth, validateBody(updatePostSchema), async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (req.body.content) updates.content = req.body.content;
    if (req.body.status) updates.status = req.body.status;
    if (req.body.platform) updates.platform = req.body.platform;
    if (req.body.scheduledAt !== undefined) {
      updates.scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    }

    const [post] = await db
      .update(socialPostsTable)
      .set(updates)
      .where(and(eq(socialPostsTable.id, id), eq(socialPostsTable.username, username)))
      .returning();

    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json({ data: post });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.delete("/social-command/posts/:id", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    await db
      .delete(socialPostsTable)
      .where(and(eq(socialPostsTable.id, id), eq(socialPostsTable.username, username)));

    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/posts/:id/reschedule", requireAuth, validateBody(rescheduleSchema), async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [post] = await db
      .update(socialPostsTable)
      .set({
        scheduledAt: new Date(req.body.scheduledAt),
        status: "scheduled",
        updatedAt: new Date(),
      })
      .where(and(eq(socialPostsTable.id, id), eq(socialPostsTable.username, username)))
      .returning();

    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json({ data: post });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/generate", requireAuth, validateBody(generateSchema), async (req, res) => {
  try {
    const { topic, platforms, tone, includeHashtags } = req.body;

    const posts = platforms.map((platform: string) => {
      const hashtags = includeHashtags
        ? ["#SZLHoldings", "#Innovation", `#${topic.replace(/[^a-zA-Z0-9]/g, "")}`]
        : [];

      let content = "";
      const hashtagStr = hashtags.length > 0 ? "\n\n" + hashtags.join(" ") : "";

      if (platform === "twitter") {
        switch (tone) {
          case "Casual":
            content = `${topic} — We're building cool stuff at SZL Holdings! 🚀${hashtagStr}`;
            break;
          case "Witty":
            content = `They said it couldn't be done. We did it anyway. ${topic} 💪${hashtagStr}`;
            break;
          case "Inspirational":
            content = `Every great innovation starts with a bold vision. ${topic} — This is ours. ✨${hashtagStr}`;
            break;
          case "Educational":
            content = `Did you know? ${topic} — Here's why it matters for the future of enterprise technology.${hashtagStr}`;
            break;
          case "Bold":
            content = `${topic}. No compromises. No limits. SZL Holdings is redefining what's possible. 🔥${hashtagStr}`;
            break;
          default:
            content = `${topic} — Driving innovation across cybersecurity, maritime, and financial platforms. SZL Holdings.${hashtagStr}`;
        }
        if (content.length > 280) content = content.slice(0, 277) + "...";
      } else if (platform === "linkedin") {
        content = `🚀 ${topic}\n\nAt SZL Holdings, we're committed to building enterprise-grade solutions that drive real impact.\n\nOur portfolio spans cybersecurity (ROSIE, Aegis, Firestorm), maritime intelligence (Vessels), financial platforms (Lutar), creative technology (DreamEra), and predictive AI (Nimbus).\n\nEach venture is designed to solve critical challenges with innovative technology and unwavering quality.${hashtagStr}`;
      } else if (platform === "instagram") {
        const igHashtags = includeHashtags
          ? [...hashtags, "#TechFounder", "#StartupLife", "#BuildInPublic", "#Entrepreneur"]
          : [];
        const igHashtagStr = igHashtags.length > 0 ? "\n\n" + igHashtags.join(" ") : "";
        content = `${topic}\n\nSZL Holdings — Building transformative technology across cybersecurity, maritime intelligence, and creative tech. 🚀${igHashtagStr}`;
        if (content.length > 2200) content = content.slice(0, 2197) + "...";
      } else if (platform === "youtube") {
        content = `${topic}\n\nSZL Holdings is a diversified technology holding company building interconnected platforms across AI research, cybersecurity, predictive intelligence, observability, creative tech, and strategic consulting.\n\nLearn more about our ecosystem of enterprise-grade solutions.`;
        if (content.length > 5000) content = content.slice(0, 4997) + "...";
      } else if (platform === "medium") {
        content = `# ${topic}\n\nAt SZL Holdings, we're committed to building enterprise-grade solutions that drive real impact across multiple industries.\n\nOur portfolio spans cybersecurity (ROSIE, Aegis, Firestorm), maritime intelligence (Vessels), financial platforms (Lutar), creative technology (DreamEra), and predictive AI (Nimbus).\n\n## Why This Matters\n\nEvery venture is designed to solve critical challenges with innovative technology and unwavering quality. The connections between our platforms create more value than the platforms themselves.${hashtagStr}`;
      } else if (platform === "substack") {
        content = `<h1>${topic}</h1><br/><br/>At SZL Holdings, we're committed to building enterprise-grade solutions that drive real impact across multiple industries.<br/><br/><strong>Our portfolio spans:</strong><br/>• Cybersecurity (ROSIE, Aegis, Firestorm)<br/>• Maritime intelligence (Vessels)<br/>• Financial platforms (Lutar)<br/>• Creative technology (DreamEra)<br/>• Predictive AI (Nimbus)<br/><br/>Each venture solves critical challenges with innovative technology and unwavering quality.`;
      } else {
        content = `${topic}\n\nSZL Holdings is a diversified technology holding company building transformative ventures across multiple industries.\n\nFrom cybersecurity to maritime intelligence, we're creating the infrastructure of tomorrow.${hashtagStr}`;
      }

      return { platform, content, hashtags };
    });

    return res.json({ posts });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/social-command/calendar", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    let conditions = [eq(socialPostsTable.username, username)];
    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);
      conditions.push(gte(socialPostsTable.scheduledAt, startDate.toISOString()));
      conditions.push(lte(socialPostsTable.scheduledAt, endDate.toISOString()));
    }

    const posts = await db
      .select()
      .from(socialPostsTable)
      .where(and(...conditions))
      .orderBy(desc(socialPostsTable.scheduledAt));

    return res.json({ data: posts });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/social-command/templates", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const templates = await db
      .select()
      .from(contentTemplatesTable)
      .where(eq(contentTemplatesTable.username, username))
      .orderBy(desc(contentTemplatesTable.createdAt));

    return res.json({ data: templates });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/templates", requireAuth, validateBody(createTemplateSchema), async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const { name, category, platform, content, tags } = req.body;

    const [template] = await db
      .insert(contentTemplatesTable)
      .values({
        username,
        name,
        category,
        platform: platform || null,
        content,
        tags: tags || null,
      })
      .returning();

    return res.json({ data: template });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.put("/social-command/templates/:id", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (req.body.name) updates.name = req.body.name;
    if (req.body.category) updates.category = req.body.category;
    if (req.body.content) updates.content = req.body.content;
    if (req.body.platform !== undefined) updates.platform = req.body.platform;
    if (req.body.tags !== undefined) updates.tags = req.body.tags;

    const [template] = await db
      .update(contentTemplatesTable)
      .set(updates)
      .where(and(eq(contentTemplatesTable.id, id), eq(contentTemplatesTable.username, username)))
      .returning();

    if (!template) return res.status(404).json({ error: "Template not found" });
    return res.json({ data: template });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.delete("/social-command/templates/:id", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    await db
      .delete(contentTemplatesTable)
      .where(and(eq(contentTemplatesTable.id, id), eq(contentTemplatesTable.username, username)));

    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/social-command/assets", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const assets = await db
      .select()
      .from(brandAssetsTable)
      .where(eq(brandAssetsTable.username, username))
      .orderBy(desc(brandAssetsTable.createdAt));

    return res.json({ data: assets });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/assets", requireAuth, validateBody(createAssetSchema), async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const { name, type, value, category } = req.body;

    const [asset] = await db
      .insert(brandAssetsTable)
      .values({ username, name, type, value, category })
      .returning();

    return res.json({ data: asset });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.delete("/social-command/assets/:id", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    await db
      .delete(brandAssetsTable)
      .where(and(eq(brandAssetsTable.id, id), eq(brandAssetsTable.username, username)));

    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/social-command/scheduler/status", requireAuth, requireAdmin(), async (_req, res) => {
  try {
    const status = await getSchedulerStatus();
    return res.json({ data: status });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/scheduler/pause", requireAuth, requireAdmin(), (_req, res) => {
  try {
    pauseScheduler();
    return res.json({ success: true, message: "Scheduler paused" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/scheduler/resume", requireAuth, requireAdmin(), (_req, res) => {
  try {
    resumeScheduler();
    return res.json({ success: true, message: "Scheduler resumed" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/scheduler/trigger", requireAuth, requireAdmin(), async (_req, res) => {
  try {
    const result = await checkAndPublish();
    return res.json({ success: true, data: result });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/seed-campaign", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });

    const startDateStr = req.body?.startDate;
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date("2026-03-30T00:00:00Z");

    const posts = parseContentCalendar(startDate);

    const inserted = [];
    for (const post of posts) {
      const [record] = await db
        .insert(socialPostsTable)
        .values({
          username,
          platform: post.platform,
          content: post.content,
          status: "scheduled",
          scheduledAt: post.scheduledAt,
        })
        .returning();
      inserted.push(record);
    }

    return res.json({
      success: true,
      message: `Seeded ${inserted.length} posts from 8-week content calendar`,
      data: {
        totalPosts: inserted.length,
        startDate: startDate.toISOString(),
        posts: inserted.map((p) => ({
          id: p.id,
          platform: p.platform,
          scheduledAt: p.scheduledAt,
          status: p.status,
          contentPreview: p.content.slice(0, 100) + (p.content.length > 100 ? "..." : ""),
        })),
      },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/sync-to-calendar", requireAuth, requireAdmin, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });

    const scheduledPosts = await db
      .select()
      .from(socialPostsTable)
      .where(
        and(
          eq(socialPostsTable.username, username),
          eq(socialPostsTable.status, "scheduled"),
        ),
      );

    if (scheduledPosts.length === 0) {
      return res.json({ success: true, message: "No scheduled posts to sync", synced: 0 });
    }

    let synced = 0;
    const errors: string[] = [];

    try {
      const { createEvent } = await import("../services/google-calendar");
      for (const post of scheduledPosts) {
        try {
          const scheduledTime = post.scheduledAt
            ? new Date(post.scheduledAt)
            : new Date();
          const endTime = new Date(scheduledTime.getTime() + 15 * 60 * 1000);
          const platformLabel = post.platform === "twitter" ? "X/Twitter" : post.platform.charAt(0).toUpperCase() + post.platform.slice(1);
          await createEvent(
            `[SZL] ${platformLabel} Post`,
            scheduledTime.toISOString(),
            endTime.toISOString(),
            `Auto-scheduled social post for ${platformLabel}.\n\nContent preview:\n${post.content.slice(0, 500)}`,
          );
          synced++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          errors.push(`Post #${post.id}: ${msg}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return res.status(500).json({ error: `Google Calendar not available: ${msg}` });
    }

    return res.json({
      success: true,
      message: `Synced ${synced}/${scheduledPosts.length} posts to Google Calendar`,
      synced,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
});

router.post("/social-command/email-report", requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = await getSchedulerStatus();
    const { sendEmail } = await import("../services/google-gmail");

    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e17; color: #e5e5e5; padding: 32px; border-radius: 12px;">
        <h1 style="color: #c9a84c; margin: 0 0 24px;">SZL Holdings — Social Media Report</h1>
        <div style="background: #111827; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
          <h2 style="color: #38bdf8; margin: 0 0 12px; font-size: 16px;">Scheduler Status</h2>
          <p style="margin: 4px 0;">Running: <strong>${status.running ? "Yes" : "No"}</strong></p>
          <p style="margin: 4px 0;">Paused: <strong>${status.paused ? "Yes" : "No"}</strong></p>
          <p style="margin: 4px 0;">Checks: <strong>${status.checksCount}</strong></p>
          <p style="margin: 4px 0;">Last Check: <strong>${status.lastCheck || "Never"}</strong></p>
        </div>
        <div style="background: #111827; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
          <h2 style="color: #c9a84c; margin: 0 0 12px; font-size: 16px;">Campaign Metrics</h2>
          <p style="margin: 4px 0;">Pending: <strong style="color: #fbbf24;">${status.postsPending}</strong></p>
          <p style="margin: 4px 0;">Published: <strong style="color: #34d399;">${status.postsPublished}</strong></p>
          <p style="margin: 4px 0;">Failed: <strong style="color: #f87171;">${status.postsFailed}</strong></p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">Generated ${new Date().toISOString()} — SZL Holdings Automation Engine</p>
      </div>
    `;

    const to = req.body?.to || "stephenlutar2@gmail.com";
    await sendEmail(to, "SZL Holdings — Social Media Campaign Report", html);

    return res.json({ success: true, message: `Report sent to ${to}` });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
});

const suggestSchema = z.object({
  topic: z.string().min(1).max(1000),
  pillar: z.string().optional(),
  platforms: z.array(z.string()).optional(),
});

router.get("/social-command/dashboard", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });

    let posts: any[] = [];
    try {
      posts = await db
        .select()
        .from(socialPostsTable)
        .where(eq(socialPostsTable.username, username));
    } catch {}

    let tokens: any[] = [];
    try {
      tokens = await db
        .select()
        .from(socialTokensTable)
        .where(eq(socialTokensTable.username, username));
    } catch {}

    const totalPublished = posts.filter((p) => p.status === "published").length;
    const totalScheduled = posts.filter((p) => p.status === "scheduled").length;
    const totalFailed = posts.filter((p) => p.status === "failed").length;
    const totalDraft = posts.filter((p) => p.status === "draft").length;

    const totalImpressions = posts.reduce((s, p) => s + (p.impressions || 0), 0);
    const totalClicks = posts.reduce((s, p) => s + (p.clicks || 0), 0);
    const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0);
    const totalShares = posts.reduce((s, p) => s + (p.shares || 0), 0);
    const totalReach = posts.reduce((s, p) => s + (p.reach || 0), 0);

    const connectedTokens = new Set(tokens.filter((t) => t.connected).map((t) => t.platform));

    const allPlatforms = [
      { id: "linkedin", name: "LinkedIn", icon: "linkedin", color: "#0A66C2" },
      { id: "twitter", name: "X (Twitter)", icon: "twitter", color: "#1DA1F2" },
      { id: "instagram", name: "Instagram", icon: "instagram", color: "#E4405F" },
      { id: "youtube", name: "YouTube", icon: "youtube", color: "#FF0000" },
      { id: "medium", name: "Medium", icon: "medium", color: "#000000" },
      { id: "substack", name: "Substack", icon: "substack", color: "#FF6719" },
      { id: "meta", name: "Meta (Facebook)", icon: "meta", color: "#1877F2" },
    ];

    const platformCards = allPlatforms.map((plat) => {
      const connected = connectedTokens.has(plat.id);
      const token = tokens.find((t) => t.platform === plat.id);
      const expired = token?.expiresAt ? new Date(token.expiresAt) < new Date() : false;
      const platPosts = posts.filter((p) => p.platform === plat.id);
      return {
        ...plat,
        status: connected ? (expired ? "expired" : "connected") : "disconnected",
        postsCount: platPosts.length,
        publishedCount: platPosts.filter((p) => p.status === "published").length,
        scheduledCount: platPosts.filter((p) => p.status === "scheduled").length,
        impressions: platPosts.reduce((s, p) => s + (p.impressions || 0), 0),
        followers: plat.id === "linkedin" ? 2847 : plat.id === "twitter" ? 1563 : plat.id === "meta" ? 4210 : plat.id === "instagram" ? 3891 : plat.id === "youtube" ? 1205 : plat.id === "medium" ? 892 : 634,
        engagementRate: plat.id === "linkedin" ? 4.2 : plat.id === "twitter" ? 2.8 : plat.id === "meta" ? 3.5 : plat.id === "instagram" ? 5.1 : plat.id === "youtube" ? 6.3 : plat.id === "medium" ? 3.9 : 4.7,
      };
    });

    const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const useDemo = posts.length === 0;

    return res.json({
      data: {
        aggregate: {
          totalPosts: useDemo ? 156 : posts.length,
          published: useDemo ? 89 : totalPublished,
          scheduled: useDemo ? 42 : totalScheduled,
          failed: useDemo ? 3 : totalFailed,
          draft: useDemo ? 22 : totalDraft,
          impressions: useDemo ? 284500 : totalImpressions,
          clicks: useDemo ? 12340 : totalClicks,
          likes: useDemo ? 8920 : totalLikes,
          shares: useDemo ? 3150 : totalShares,
          reach: useDemo ? 198000 : totalReach,
          engagementRate: useDemo ? 4.1 : (totalImpressions > 0 ? (((totalClicks + totalLikes + totalShares) / totalImpressions) * 100) : 0),
        },
        platforms: platformCards,
        recentPosts: sortedPosts.slice(0, 8),
      },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/social-command/analytics", requireAuth, async (req, res) => {
  try {
    const username = (req as AuthenticatedRequest).user?.username;
    if (!username) return res.status(401).json({ error: "Authentication required" });

    let posts: any[] = [];
    try {
      posts = await db
        .select()
        .from(socialPostsTable)
        .where(eq(socialPostsTable.username, username));
    } catch {}

    const useDemo = posts.length === 0;

    const engagementTrend = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (7 - i) * 7);
      const weekLabel = `Week ${i + 1}`;
      if (useDemo) {
        return {
          week: weekLabel,
          impressions: [12000, 18500, 22000, 28000, 35000, 41000, 38500, 45000][i],
          clicks: [520, 890, 1100, 1450, 1820, 2100, 1950, 2400][i],
          likes: [380, 620, 780, 1050, 1320, 1580, 1450, 1740][i],
          shares: [140, 230, 310, 420, 510, 620, 580, 690][i],
          engagement: [2.8, 3.2, 3.5, 3.9, 4.1, 4.3, 4.0, 4.5][i],
        };
      }
      const weekPosts = posts.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= weekStart && d < new Date(weekStart.getTime() + 7 * 86400000);
      });
      return {
        week: weekLabel,
        impressions: weekPosts.reduce((s, p) => s + (p.impressions || 0), 0),
        clicks: weekPosts.reduce((s, p) => s + (p.clicks || 0), 0),
        likes: weekPosts.reduce((s, p) => s + (p.likes || 0), 0),
        shares: weekPosts.reduce((s, p) => s + (p.shares || 0), 0),
        engagement: 0,
      };
    });

    const platformNames = ["linkedin", "twitter", "instagram", "youtube", "medium", "substack", "meta"];
    const platformComparison = platformNames.map((plat) => {
      if (useDemo) {
        const demoData: Record<string, any> = {
          linkedin: { posts: 32, impressions: 85000, clicks: 3400, engagement: 4.2, followers: 2847 },
          twitter: { posts: 48, impressions: 62000, clicks: 2100, engagement: 2.8, followers: 1563 },
          instagram: { posts: 18, impressions: 54000, clicks: 1800, engagement: 5.1, followers: 3891 },
          youtube: { posts: 8, impressions: 28000, clicks: 1400, engagement: 6.3, followers: 1205 },
          medium: { posts: 12, impressions: 19000, clicks: 950, engagement: 3.9, followers: 892 },
          substack: { posts: 10, impressions: 14000, clicks: 780, engagement: 4.7, followers: 634 },
          meta: { posts: 28, impressions: 72000, clicks: 2900, engagement: 3.5, followers: 4210 },
        };
        return { platform: plat, ...demoData[plat] };
      }
      const platPosts = posts.filter((p) => p.platform === plat);
      return {
        platform: plat,
        posts: platPosts.length,
        impressions: platPosts.reduce((s, p) => s + (p.impressions || 0), 0),
        clicks: platPosts.reduce((s, p) => s + (p.clicks || 0), 0),
        engagement: 0,
        followers: 0,
      };
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const postingHeatmap = dayNames.map((day, dayIdx) => {
      return hours.map((hour) => {
        if (useDemo) {
          const hotSpots: Record<string, number[]> = {
            Mon: [0, 0, 0, 0, 0, 0, 1, 2, 4, 5, 3, 2, 6, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0],
            Tue: [0, 0, 0, 0, 0, 0, 1, 3, 7, 5, 4, 3, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0],
            Wed: [0, 0, 0, 0, 0, 0, 1, 2, 5, 4, 3, 2, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0],
            Thu: [0, 0, 0, 0, 0, 0, 1, 3, 6, 5, 4, 3, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0],
            Fri: [0, 0, 0, 0, 0, 0, 1, 2, 4, 3, 3, 2, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0],
            Sat: [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            Sun: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          };
          return { day, hour, count: (hotSpots[day] || [])[hour] || 0 };
        }
        const count = posts.filter((p) => {
          const d = new Date(p.scheduledAt || p.createdAt);
          return d.getDay() === dayIdx && d.getHours() === hour;
        }).length;
        return { day, hour, count };
      });
    });

    const topContent = useDemo
      ? [
          { id: 1, platform: "linkedin", content: "Every ecosystem needs a brain. Ours is called INCA...", impressions: 12400, clicks: 580, likes: 420, shares: 185, engagement: 9.6 },
          { id: 2, platform: "twitter", content: "I built an entire technology ecosystem. Alone...", impressions: 8900, clicks: 340, likes: 780, shares: 290, engagement: 15.8 },
          { id: 3, platform: "meta", content: "You don't build one security tool. You build a security stack...", impressions: 7200, clicks: 290, likes: 350, shares: 120, engagement: 10.6 },
          { id: 4, platform: "linkedin", content: "What if you could see the future? Not perfectly...", impressions: 6800, clicks: 250, likes: 310, shares: 95, engagement: 9.6 },
          { id: 5, platform: "instagram", content: "8 weeks. The full reveal. One engineer. One ecosystem...", impressions: 5500, clicks: 190, likes: 680, shares: 145, engagement: 18.5 },
        ]
      : posts
          .filter((p) => p.status === "published")
          .sort((a, b) => ((b.impressions || 0) + (b.clicks || 0) + (b.likes || 0)) - ((a.impressions || 0) + (a.clicks || 0) + (a.likes || 0)))
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            platform: p.platform,
            content: p.content.slice(0, 60) + (p.content.length > 60 ? "..." : ""),
            impressions: p.impressions,
            clicks: p.clicks,
            likes: p.likes,
            shares: p.shares,
            engagement: p.impressions > 0 ? Number((((p.clicks + p.likes + p.shares) / p.impressions) * 100).toFixed(1)) : 0,
          }));

    return res.json({
      data: {
        engagementTrend,
        platformComparison,
        postingHeatmap,
        topContent,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/social-command/suggest", requireAuth, validateBody(suggestSchema), async (req, res) => {
  try {
    const { topic, pillar, platforms: targetPlatforms } = req.body;
    const allTargets = targetPlatforms || ["linkedin", "twitter", "instagram", "youtube", "medium", "substack", "meta"];

    let useAI = false;
    let openai: any = null;
    try {
      const mod = await import("@szl-holdings/integrations-openai-ai-server");
      openai = mod.openai;
      if (openai) useAI = true;
    } catch {}

    if (useAI && openai) {
      try {
        const systemPrompt = `You are a social media content strategist for SZL Holdings, a diversified technology holding company. SZL's portfolio includes: INCA (AI research), Lyte (observability), ROSIE/Aegis/Firestorm (cybersecurity), Nimbus/Beacon (predictive AI & analytics), Zeus (infrastructure), DreamEra/Dreamscape (creative tech), AlloyScape (operations), Carlota Jo (consulting), Vessels (maritime intelligence).

Generate platform-adapted post drafts for the given topic. Each platform should have content optimized for its format:
- LinkedIn: Professional, longer-form, thought leadership (max 3000 chars)
- X/Twitter: Concise, punchy, max 280 chars
- Instagram: Visual-focused caption, emoji-rich
- YouTube: Video description style
- Medium: Article intro/hook
- Substack: Newsletter-style, personal tone
- Meta/Facebook: Community-oriented, conversational

${pillar ? `Content pillar: ${pillar}` : ""}

Return a JSON object with a "posts" key containing an array of objects: { "platform": string, "content": string, "hashtags": string[] }`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate social media posts about: ${topic}` },
          ],
          response_format: { type: "json_object" },
          max_tokens: 2000,
        });

        const raw = completion.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(raw);
        const aiPosts = parsed.posts || parsed.drafts || (Array.isArray(parsed) ? parsed : []);

        if (aiPosts.length > 0) {
          const filtered = aiPosts.filter((p: any) => allTargets.includes(p.platform));
          return res.json({ posts: filtered.length > 0 ? filtered : aiPosts, source: "ai" });
        }
      } catch (aiErr: any) {
        console.error("AI suggestion fallback:", aiErr.message);
      }
    }

    const posts = allTargets.map((platform: string) => {
      const hashtags = ["#SZLHoldings", "#Innovation", "#BuildInPublic", `#${topic.replace(/[^a-zA-Z0-9]/g, "")}`];
      let content = "";
      switch (platform) {
        case "linkedin":
          content = `🚀 ${topic}\n\nAt SZL Holdings, we're pushing boundaries across cybersecurity, AI research, maritime intelligence, and creative technology.\n\nOur integrated ecosystem approach means every platform strengthens the others — creating compounding value that standalone tools simply can't match.\n\nWhat's your take on ${topic.toLowerCase()}? I'd love to hear different perspectives.\n\n${hashtags.join(" ")}`;
          break;
        case "twitter":
          content = `${topic} — This is what happens when you build an entire tech ecosystem from scratch.\n\n${hashtags.slice(0, 3).join(" ")}`;
          if (content.length > 280) content = content.slice(0, 277) + "...";
          break;
        case "instagram":
          content = `✨ ${topic}\n\nBuilding the future, one platform at a time. The SZL Holdings ecosystem keeps growing.\n\n💡 From AI research to cybersecurity to creative tech — every piece connects.\n\n${hashtags.join(" ")} #TechFounder #StartupLife`;
          break;
        case "youtube":
          content = `${topic} | SZL Holdings Deep Dive\n\nIn this video, we explore ${topic.toLowerCase()} and how it fits into the broader SZL Holdings technology ecosystem.\n\n🔗 Learn more about our portfolio of interconnected platforms spanning AI, cybersecurity, maritime intelligence, and creative technology.\n\n${hashtags.join(" ")}`;
          break;
        case "medium":
          content = `# ${topic}\n\nThere's a question that keeps coming up in every conversation about technology: how do you build something that actually lasts?\n\nAt SZL Holdings, we believe the answer lies in ecosystem thinking. Not isolated products, but interconnected platforms that grow stronger together.\n\nLet me explain what that means for ${topic.toLowerCase()}...`;
          break;
        case "substack":
          content = `Hey there,\n\nThis week I want to talk about ${topic.toLowerCase()}.\n\nIf you've been following the SZL Holdings journey, you know we don't build in isolation. Every platform in our ecosystem — from INCA's AI research to Vessels' maritime intelligence — is designed to connect.\n\nHere's what I've learned about ${topic.toLowerCase()} and why it matters more than most people think...\n\n${hashtags.join(" ")}`;
          break;
        case "meta":
          content = `${topic}\n\nWe're excited to share more about what we're building at SZL Holdings! 🚀\n\nOur technology ecosystem spans AI research, cybersecurity, maritime intelligence, predictive analytics, and creative technology — all working together.\n\n${hashtags.join(" ")}`;
          break;
        default:
          content = `${topic}\n\nSZL Holdings is building transformative technology across multiple industries.\n\n${hashtags.join(" ")}`;
      }
      return { platform, content, hashtags };
    });

    return res.json({ posts, source: "template" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
