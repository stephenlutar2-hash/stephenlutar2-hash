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

export default router;
