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

export default router;
