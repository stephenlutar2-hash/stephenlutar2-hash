import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "./auth";
import { validateAndSanitizeBody } from "../middleware/validate";
import { sanitizeString } from "../lib/sanitize";

const router = Router();

const inquirySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  service: z.string().max(200).optional(),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
  message: z.string().max(5000).optional(),
  company: z.string().max(200).optional(),
  datePreference: z.string().max(100).optional(),
  description: z.string().max(5000).optional(),
  type: z.string().max(100).optional(),
});

interface Inquiry {
  id: string;
  name: string;
  email: string;
  service: string;
  budget?: string;
  timeline?: string;
  message?: string;
  company?: string;
  datePreference?: string;
  description?: string;
  type?: string;
  createdAt: string;
}

const inquiries: Inquiry[] = [];

router.get("/carlota-jo/health", (_req, res) => {
  res.json({ ok: true, group: "carlota-jo", timestamp: new Date().toISOString() });
});

router.post("/carlota-jo/inquiries", validateAndSanitizeBody(inquirySchema), (req, res) => {
  const { name, email, service, budget, timeline, message, company, datePreference, description, type } = req.body;

  const inquiry: Inquiry = {
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: sanitizeString(name),
    email: sanitizeString(email),
    service: sanitizeString(service || ""),
    budget: budget ? sanitizeString(budget) : undefined,
    timeline: timeline ? sanitizeString(timeline) : undefined,
    message: message ? sanitizeString(message) : undefined,
    company: company ? sanitizeString(company) : undefined,
    datePreference: datePreference ? sanitizeString(datePreference) : undefined,
    description: description ? sanitizeString(description) : undefined,
    type: type ? sanitizeString(type) : "general_inquiry",
    createdAt: new Date().toISOString(),
  };

  inquiries.push(inquiry);

  res.json({ success: true, id: inquiry.id, message: "Inquiry received successfully" });
});

router.get("/carlota-jo/inquiries", requireAuth, (req, res) => {
  res.json({ inquiries, total: inquiries.length });
});


export default router;
