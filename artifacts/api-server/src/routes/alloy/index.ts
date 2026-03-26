import { Router, type Request } from "express";
import { z } from "zod";
import { db } from "@szl-holdings/db";
import { conversations, messages } from "@szl-holdings/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import { requireAuth } from "../auth";
import { validateBody, validateAndSanitizeBody } from "../../middleware/validate";
import { sanitizeString } from "../../lib/sanitize";
import type { AuthenticatedRequest } from "../../types";
import { runAgentLoop } from "./agent";
import { runHealthSweep } from "./monitor";

const conversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

const messageSchema = z.object({
  content: z.string().min(1).max(50000),
});

const router = Router();

router.get("/alloy/health", (_req, res) => {
  res.json({ ok: true, group: "alloy", timestamp: new Date().toISOString() });
});

function getUsername(req: Request): string {
  return (req as AuthenticatedRequest).user?.username || "unknown";
}

router.post("/alloy/conversations", requireAuth, validateBody(conversationSchema), async (req, res) => {
  try {
    const title = sanitizeString(req.body.title || "New Conversation");
    const username = getUsername(req);
    const [created] = await db
      .insert(conversations)
      .values({ title, username, agentType: "alloy" })
      .returning();
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/alloy/conversations", requireAuth, async (req, res) => {
  try {
    const username = getUsername(req);
    const rows = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.username, username), eq(conversations.agentType, "alloy")))
      .orderBy(desc(conversations.createdAt));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

router.get("/alloy/conversations/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const username = getUsername(req);
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.username, username), eq(conversations.agentType, "alloy")))
      .limit(1);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.createdAt));
    res.json({ ...conversation, messages: msgs });
  } catch (e) {
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

router.delete("/alloy/conversations/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const username = getUsername(req);
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.username, username), eq(conversations.agentType, "alloy")))
      .limit(1);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    await db.delete(conversations).where(eq(conversations.id, id));
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.post(
  "/alloy/conversations/:id/messages",
  requireAuth,
  validateAndSanitizeBody(messageSchema),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const username = getUsername(req);
      const { content } = req.body;
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(and(eq(conversations.id, id), eq(conversations.username, username), eq(conversations.agentType, "alloy")))
        .limit(1);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      await runAgentLoop(id, content, res);
    } catch (e: any) {
      if (!res.headersSent) {
        res.status(500).json({ error: e.message || "Failed to send message" });
      }
    }
  },
);

router.post("/alloy/monitor", requireAuth, async (_req, res) => {
  try {
    const report = await runHealthSweep();
    res.json(report);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Health sweep failed" });
  }
});

export default router;
