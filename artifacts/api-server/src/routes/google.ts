import { Router } from "express";
import { requireAuth } from "./auth";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../lib/logger";

const router = Router();

router.get("/google/status", requireAuth, (_req, res) => {
  const hasConnectors = !!process.env.REPLIT_CONNECTORS_HOSTNAME;
  res.json({
    gmail: { connected: hasConnectors },
    calendar: { connected: hasConnectors },
    drive: { connected: hasConnectors },
  });
});

router.get("/google/gmail/inbox", requireAuth, asyncHandler(async (_req, res) => {
  const { listEmails } = await import("../services/google-gmail");
  const messages = await listEmails(20);
  res.json({ messages, count: messages.length });
}));

router.get("/google/gmail/:messageId", requireAuth, asyncHandler(async (req, res) => {
  const { getEmailById } = await import("../services/google-gmail");
  const message = await getEmailById(req.params.messageId);
  res.json(message);
}));

router.post("/google/gmail/send", requireAuth, asyncHandler(async (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: "Missing required fields: to, subject, body" });
  }
  const { sendEmail } = await import("../services/google-gmail");
  const result = await sendEmail(to, subject, body);
  res.json({ sent: true, messageId: result.id });
}));

router.get("/google/calendar/events", requireAuth, asyncHandler(async (req, res) => {
  const maxResults = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const { listUpcomingEvents } = await import("../services/google-calendar");
  const events = await listUpcomingEvents(maxResults);
  res.json({ events, count: events.length });
}));

router.post("/google/calendar/events", requireAuth, asyncHandler(async (req, res) => {
  const { summary, start, end, description } = req.body;
  if (!summary || !start || !end) {
    return res.status(400).json({ error: "Missing required fields: summary, start, end" });
  }
  const { createEvent } = await import("../services/google-calendar");
  const event = await createEvent(summary, start, end, description);
  res.json({ created: true, eventId: event.id, htmlLink: event.htmlLink });
}));

router.get("/google/drive/files", requireAuth, asyncHandler(async (req, res) => {
  const pageSize = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const query = req.query.q as string | undefined;
  const { listFiles, searchFiles } = await import("../services/google-drive");
  const files = query ? await searchFiles(query, pageSize) : await listFiles(pageSize);
  res.json({ files, count: files.length });
}));

router.get("/google/drive/files/:fileId", requireAuth, asyncHandler(async (req, res) => {
  const { getFileMetadata } = await import("../services/google-drive");
  const file = await getFileMetadata(req.params.fileId);
  res.json(file);
}));

export default router;
