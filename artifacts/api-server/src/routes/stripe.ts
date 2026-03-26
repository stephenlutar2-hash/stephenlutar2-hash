import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "./auth";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";
import { stripeService } from "../services/stripe";
import { getStripeProvider } from "../providers/factory";

const checkoutSchema = z.object({
  session: z.string().min(1),
});

const router = Router();

router.get("/stripe/health", (_req, res) => {
  res.json({ ok: true, group: "stripe", configured: stripeService.isConfigured(), timestamp: new Date().toISOString() });
});

router.get("/stripe/status", (_req, res) => {
  const configured = stripeService.isConfigured();
  return res.json({
    configured,
    message: configured
      ? "Stripe is connected"
      : "Stripe is not configured. Set STRIPE_SECRET_KEY to enable payment tracking.",
  });
});

router.get("/stripe/revenue", requireAuth, asyncHandler(async (_req, res) => {
  const revenue = await stripeService.getRevenue();
  res.json(revenue);
}));

router.get("/stripe/transactions", requireAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
  const result = await stripeService.getTransactions(limit);
  res.json(result);
}));

router.post("/stripe/webhook", asyncHandler(async (req, res) => {
  const provider = getStripeProvider();
  if (!provider.isConfigured()) {
    throw AppError.badRequest("Stripe not configured");
  }

  if (!req.body || (Buffer.isBuffer(req.body) && req.body.length === 0)) {
    throw AppError.badRequest("Empty webhook payload");
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret) {
    if (!sig) {
      throw AppError.badRequest("Missing stripe-signature header");
    }
    try {
      const rawBody = Buffer.isBuffer(req.body) ? req.body : (typeof req.body === "string" ? req.body : JSON.stringify(req.body));
      const event = provider.constructWebhookEvent(rawBody, sig as string, webhookSecret);
      logger.info({ eventType: event.type }, "Stripe webhook event received");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      logger.error({ err: errMsg }, "Stripe webhook signature verification failed");
      throw AppError.badRequest("Invalid signature");
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      throw AppError.internal("Webhook signature verification not configured in production");
    }
    logger.warn("Webhook received without STRIPE_WEBHOOK_SECRET configured — skipping signature verification (dev only)");
  }

  res.json({ received: true });
}));

router.post("/stripe/checkout", validateBody(checkoutSchema), asyncHandler(async (req, res) => {
  if (!stripeService.isConfigured()) {
    throw AppError.serviceUnavailable("Stripe is not configured");
  }

  const { session: sessionType } = req.body;
  const result = await stripeService.createCheckoutSession(sessionType, req.headers.origin || "");
  if (!result) {
    throw AppError.badRequest("Invalid session type");
  }
  res.json({ url: result.url });
}));

export default router;
