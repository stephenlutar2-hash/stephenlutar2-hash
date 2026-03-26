import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { createHmac, randomBytes } from "crypto";
import { db } from "@szl-holdings/db";
import { conversations, messages, sessionsTable } from "@szl-holdings/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import { validateBody, validateAndSanitizeBody } from "../../middleware/validate";
import { sanitizeString } from "../../lib/sanitize";
import { isDatabaseAvailable } from "@szl-holdings/db";
import type { AuthenticatedRequest } from "../../types";
import { isValidAgentType } from "./configs";
import { runDomainAgentLoop } from "./runner";
import { sessionGet, sessionSet } from "../../lib/redis";
import { isEntraConfigured, validateEntraToken } from "../../lib/entra";

const ANON_SECRET = process.env.DOMAIN_AGENT_ANON_SECRET || randomBytes(32).toString("hex");

function deriveAnonUsername(sessionId: string): string {
  const hmac = createHmac("sha256", ANON_SECRET).update(sessionId).digest("hex").slice(0, 16);
  return `anon_${hmac}`;
}

const conversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

const messageSchema = z.object({
  content: z.string().min(1).max(50000),
});

const router = Router();

router.get("/domain-agents/health", (_req, res) => {
  res.json({ ok: true, group: "domain-agents", timestamp: new Date().toISOString() });
});

async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      if (isEntraConfigured()) {
        const result = await validateEntraToken(token);
        if (result.valid) {
          (req as AuthenticatedRequest).user = {
            username: result.claims.preferred_username || result.claims.name || "entra-user",
            role: "viewer",
            authMethod: "entra",
          };
          return next();
        }
      }
      const cached = await sessionGet(token);
      if (cached) {
        const session = JSON.parse(cached) as { username: string; role: string; expiresAt: string };
        if (new Date(session.expiresAt) >= new Date()) {
          (req as AuthenticatedRequest).user = {
            username: session.username,
            role: session.role || "viewer",
            authMethod: "demo",
          };
          return next();
        }
      }
      if (isDatabaseAvailable()) {
        const [session] = await db.select().from(sessionsTable)
          .where(eq(sessionsTable.token, token))
          .limit(1);
        if (session && new Date(session.expiresAt) >= new Date()) {
          const role = session.role || "viewer";
          const ttlSeconds = Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000);
          if (ttlSeconds > 0) {
            await sessionSet(token, JSON.stringify({ username: session.username, role, expiresAt: session.expiresAt }), ttlSeconds);
          }
          (req as AuthenticatedRequest).user = {
            username: session.username,
            role,
            authMethod: "demo",
          };
          return next();
        }
      }
    } catch {}
  }
  const clientSessionId = req.headers["x-session-id"] as string;
  const rawId = clientSessionId || `ip_${req.ip || "unknown"}_${req.headers["user-agent"] || ""}`;
  (req as AuthenticatedRequest).user = {
    username: deriveAnonUsername(rawId),
    role: "viewer",
    authMethod: "demo",
  };
  next();
}

const AGENTS_REQUIRING_AUTH = new Set([
  "inca",
  "vessels",
  "aegis",
  "firestorm",
  "beacon",
  "nimbus",
  "lyte",
  "zeus",
  "dreamera",
  "alloyscape",
]);

function isAuthenticated(req: Request): boolean {
  const user = (req as AuthenticatedRequest).user;
  return !!user && !user.username.startsWith("anon_");
}

function requireAuthForSensitiveAgents(req: Request, res: Response, next: NextFunction) {
  const { agentType } = req.params;
  if (AGENTS_REQUIRING_AUTH.has(agentType) && !isAuthenticated(req)) {
    return res.status(401).json({ error: "Authentication required for this agent" });
  }
  next();
}

function getUsername(req: Request): string {
  return (req as AuthenticatedRequest).user?.username || "unknown";
}

router.post(
  "/domain-agents/:agentType/conversations",
  optionalAuth,
  requireAuthForSensitiveAgents,
  validateBody(conversationSchema),
  async (req, res) => {
    try {
      const { agentType } = req.params;
      if (!isValidAgentType(agentType)) {
        return res.status(400).json({ error: "Invalid agent type" });
      }
      const title = sanitizeString(req.body.title || "New Conversation");
      const username = getUsername(req);
      const [created] = await db
        .insert(conversations)
        .values({ title, username, agentType })
        .returning();
      res.status(201).json(created);
    } catch (e) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  },
);

router.get(
  "/domain-agents/:agentType/conversations",
  optionalAuth,
  requireAuthForSensitiveAgents,
  async (req, res) => {
    try {
      const { agentType } = req.params;
      if (!isValidAgentType(agentType)) {
        return res.status(400).json({ error: "Invalid agent type" });
      }
      const username = getUsername(req);
      const rows = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.username, username),
            eq(conversations.agentType, agentType),
          ),
        )
        .orderBy(desc(conversations.createdAt));
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: "Failed to list conversations" });
    }
  },
);

router.get(
  "/domain-agents/:agentType/conversations/:id",
  optionalAuth,
  requireAuthForSensitiveAgents,
  async (req, res) => {
    try {
      const { agentType } = req.params;
      if (!isValidAgentType(agentType)) {
        return res.status(400).json({ error: "Invalid agent type" });
      }
      const id = parseInt(req.params.id);
      const username = getUsername(req);
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, id),
            eq(conversations.username, username),
            eq(conversations.agentType, agentType),
          ),
        )
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
  },
);

router.delete(
  "/domain-agents/:agentType/conversations/:id",
  optionalAuth,
  requireAuthForSensitiveAgents,
  async (req, res) => {
    try {
      const { agentType } = req.params;
      if (!isValidAgentType(agentType)) {
        return res.status(400).json({ error: "Invalid agent type" });
      }
      const id = parseInt(req.params.id);
      const username = getUsername(req);
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, id),
            eq(conversations.username, username),
            eq(conversations.agentType, agentType),
          ),
        )
        .limit(1);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      await db.delete(conversations).where(eq(conversations.id, id));
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  },
);

router.post(
  "/domain-agents/:agentType/conversations/:id/messages",
  optionalAuth,
  requireAuthForSensitiveAgents,
  validateAndSanitizeBody(messageSchema),
  async (req, res) => {
    try {
      const { agentType } = req.params;
      if (!isValidAgentType(agentType)) {
        return res.status(400).json({ error: "Invalid agent type" });
      }
      const id = parseInt(req.params.id);
      const username = getUsername(req);
      const { content } = req.body;
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.id, id),
            eq(conversations.username, username),
            eq(conversations.agentType, agentType),
          ),
        )
        .limit(1);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      await runDomainAgentLoop(agentType, id, content, res);
    } catch (e: any) {
      if (!res.headersSent) {
        res.status(500).json({ error: e.message || "Failed to send message" });
      }
    }
  },
);

export default router;
