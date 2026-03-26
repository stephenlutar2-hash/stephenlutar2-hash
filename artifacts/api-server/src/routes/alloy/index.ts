import { Router, type Request } from "express";
import { z } from "zod";
import { db } from "@szl-holdings/db";
import { conversations, messages } from "@szl-holdings/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import { requireAuth } from "../auth";
import { validateBody, validateAndSanitizeBody } from "../../middleware/validate";
import { asyncHandler } from "../../middleware/errorHandler";
import { AppError } from "../../lib/errors";
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

router.post("/alloy/conversations", requireAuth, validateBody(conversationSchema), asyncHandler(async (req, res) => {
  const title = sanitizeString(req.body.title || "New Conversation");
  const username = getUsername(req);
  const [created] = await db
    .insert(conversations)
    .values({ title, username, agentType: "alloy" })
    .returning();
  res.status(201).json(created);
}));

router.get("/alloy/conversations", requireAuth, asyncHandler(async (req, res) => {
  const username = getUsername(req);
  const rows = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.username, username), eq(conversations.agentType, "alloy")))
    .orderBy(desc(conversations.createdAt));
  res.json(rows);
}));

router.get("/alloy/conversations/:id", requireAuth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const username = getUsername(req);
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.username, username), eq(conversations.agentType, "alloy")))
    .limit(1);
  if (!conversation) throw AppError.notFound("Conversation not found");
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));
  res.json({ ...conversation, messages: msgs });
}));

router.delete("/alloy/conversations/:id", requireAuth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const username = getUsername(req);
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.username, username), eq(conversations.agentType, "alloy")))
    .limit(1);
  if (!conversation) throw AppError.notFound("Conversation not found");
  await db.delete(conversations).where(eq(conversations.id, id));
  res.status(204).send();
}));

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
        if (!res.headersSent) {
          const requestId = (req as any).id as string | undefined;
          return res.status(404).json({ status: 404, code: "NOT_FOUND", message: "Conversation not found", ...(requestId && { requestId }), timestamp: new Date().toISOString() });
        }
        return;
      }
      await runAgentLoop(id, content, res);
    } catch (e: any) {
      if (!res.headersSent) {
        const requestId = (req as any).id as string | undefined;
        res.status(500).json({ status: 500, code: "INTERNAL_ERROR", message: e.message || "Failed to send message", ...(requestId && { requestId }), timestamp: new Date().toISOString() });
      }
    }
  },
);

router.post("/alloy/monitor", requireAuth, asyncHandler(async (_req, res) => {
  const report = await runHealthSweep();
  res.json(report);
}));

export default router;
