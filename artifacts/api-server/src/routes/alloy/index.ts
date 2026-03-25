import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import { requireAuth } from "../auth";
import { runAgentLoop } from "./agent";
import { runHealthSweep } from "./monitor";

const router = Router();

function getUsername(req: any): string {
  return req.user?.username || "unknown";
}

router.post("/alloy/conversations", requireAuth, async (req, res) => {
  try {
    const title = req.body.title || "New Conversation";
    const username = getUsername(req);
    const [created] = await db
      .insert(conversations)
      .values({ title, username })
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
      .where(eq(conversations.username, username))
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
      .where(and(eq(conversations.id, id), eq(conversations.username, username)))
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
      .where(and(eq(conversations.id, id), eq(conversations.username, username)))
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
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const username = getUsername(req);
      const { content } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Message content is required" });
      }
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(and(eq(conversations.id, id), eq(conversations.username, username)))
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
