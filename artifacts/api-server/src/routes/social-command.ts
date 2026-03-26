import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "./auth";
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
    const id = parseInt(req.params.id, 10);
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
    const id = parseInt(req.params.id, 10);
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
    const id = parseInt(req.params.id, 10);
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
    const id = parseInt(req.params.id, 10);
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
    const id = parseInt(req.params.id, 10);
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
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    await db
      .delete(brandAssetsTable)
      .where(and(eq(brandAssetsTable.id, id), eq(brandAssetsTable.username, username)));

    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
