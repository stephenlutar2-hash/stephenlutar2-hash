import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { validateAndSanitizeBody } from "../middleware/validate";
import { logger } from "../lib/logger";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  inquiryType: z.string().min(1),
  message: z.string().min(1).max(10000),
});

const router = Router();

router.get("/contact/health", (_req: Request, res: Response) => {
  res.json({ ok: true, group: "contact", timestamp: new Date().toISOString() });
});

router.post("/contact", validateAndSanitizeBody(contactSchema), async (req: Request, res: Response) => {
  const { name, email, inquiryType, message } = req.body;

  logger.info({
    name,
    email,
    inquiryType,
    messageLength: message.length,
  }, "Contact inquiry received");

  res.status(200).json({
    success: true,
    message: "Thank you for your inquiry. We will respond within 2 business days.",
  });
});

const accessRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  reason: z.string().min(1).max(10000),
  requestedApp: z.string().min(1),
});

router.post("/contact/access-request", validateAndSanitizeBody(accessRequestSchema), async (req: Request, res: Response) => {
  const { name, email, company, reason, requestedApp } = req.body;

  logger.info({
    name,
    email,
    company: company || "N/A",
    requestedApp,
    reasonLength: reason.length,
  }, "Access request received");

  res.status(200).json({
    success: true,
    message: "Your access request has been submitted. We will review it and get back to you.",
  });
});

export default router;
