import { Router } from "express";
import { requireAuth } from "./auth";

const router = Router();

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  try {
    const Stripe = require("stripe");
    return new Stripe(key);
  } catch {
    return null;
  }
}

router.get("/stripe/status", (_req, res) => {
  const configured = !!process.env.STRIPE_SECRET_KEY;
  return res.json({
    configured,
    message: configured
      ? "Stripe is connected"
      : "Stripe is not configured. Set STRIPE_SECRET_KEY to enable payment tracking.",
  });
});

router.get("/stripe/revenue", requireAuth, async (_req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.json({
        configured: false,
        totalRevenue: 0,
        mrr: 0,
        transactionCount: 0,
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    const [balance, charges, subscriptions] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.charges.list({ limit: 100, created: { gte: thirtyDaysAgo } }),
      stripe.subscriptions.list({ status: "active", limit: 100 }),
    ]);

    const totalRevenue = charges.data.reduce(
      (sum: number, c: any) => sum + (c.status === "succeeded" ? c.amount : 0),
      0
    );
    const mrr = subscriptions.data.reduce(
      (sum: number, s: any) =>
        sum + (s.items?.data?.[0]?.price?.unit_amount || 0),
      0
    );

    return res.json({
      configured: true,
      totalRevenue: totalRevenue / 100,
      mrr: mrr / 100,
      transactionCount: charges.data.length,
      balanceAvailable:
        (balance.available?.reduce(
          (s: number, b: any) => s + b.amount,
          0
        ) || 0) / 100,
      balancePending:
        (balance.pending?.reduce(
          (s: number, b: any) => s + b.amount,
          0
        ) || 0) / 100,
      currency: balance.available?.[0]?.currency || "usd",
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to fetch Stripe revenue" });
  }
});

router.get("/stripe/transactions", requireAuth, async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.json({ configured: false, transactions: [] });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 25, 100);
    const charges = await stripe.charges.list({ limit });

    return res.json({
      configured: true,
      transactions: charges.data.map((c: any) => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency,
        status: c.status,
        description: c.description || "Payment",
        customer: c.billing_details?.name || c.customer || "Unknown",
        created: new Date(c.created * 1000).toISOString(),
        receiptUrl: c.receipt_url,
      })),
      hasMore: charges.has_more,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to fetch transactions" });
  }
});

router.post("/stripe/webhook", async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(400).json({ error: "Stripe not configured" });
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!sig) {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }
      try {
        const rawBody = Buffer.isBuffer(req.body) ? req.body : (typeof req.body === "string" ? req.body : JSON.stringify(req.body));
        const event = stripe.webhooks.constructEvent(
          rawBody,
          sig,
          webhookSecret
        );
        console.log(`[Stripe] Webhook event: ${event.type}`);
      } catch (err: any) {
        console.error("[Stripe] Webhook signature verification failed:", err.message);
        return res.status(400).json({ error: "Invalid signature" });
      }
    } else {
      console.warn("[Stripe] Webhook received without STRIPE_WEBHOOK_SECRET configured — skipping signature verification");
    }

    return res.json({ received: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

const CONSULTATION_PRICES: Record<string, { name: string; amount: number }> = {
  strategy: { name: "Strategy Session", amount: 250000 },
  portfolio: { name: "Portfolio Review", amount: 850000 },
  retainer: { name: "Advisory Retainer", amount: 2500000 },
};

router.post("/stripe/checkout", async (req, res) => {
  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(503).json({ error: "Stripe is not configured" });
  }
  try {
    const { session: sessionType } = req.body;
    const sessionConfig = CONSULTATION_PRICES[sessionType];
    if (!sessionConfig) {
      return res.status(400).json({ error: "Invalid session type" });
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Carlota Jo Consultation: ${sessionConfig.name}` },
          unit_amount: sessionConfig.amount,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${req.headers.origin || ""}/carlota-jo/consultation?success=true`,
      cancel_url: `${req.headers.origin || ""}/carlota-jo/consultation?canceled=true`,
    });
    return res.json({ url: checkoutSession.url });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
