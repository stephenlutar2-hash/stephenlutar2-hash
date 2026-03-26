import { Router } from "express";
import { requireAuth } from "./auth";
import { asyncHandler } from "../middleware/errorHandler";
import { logger } from "../lib/logger";

const router = Router();

router.get("/integrations/status", requireAuth, asyncHandler(async (_req, res) => {
  const hasConnectors = !!process.env.REPLIT_CONNECTORS_HOSTNAME;

  const integrations = {
    google: {
      gmail: {
        connected: hasConnectors,
        service: "Email automation & notifications",
        endpoints: ["/api/google/gmail/inbox", "/api/google/gmail/send"],
      },
      calendar: {
        connected: hasConnectors,
        service: "Campaign scheduling & event management",
        endpoints: ["/api/google/calendar/events"],
      },
      drive: {
        connected: hasConnectors,
        service: "Document storage & asset management",
        endpoints: ["/api/google/drive/files"],
      },
    },
    payments: {
      stripe: {
        connected: hasConnectors,
        service: "Payment processing & revenue tracking",
        endpoints: ["/api/stripe/revenue", "/api/stripe/transactions", "/api/stripe/checkout"],
      },
    },
    social: {
      linkedin: {
        configured: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
        service: "Professional content publishing & automation",
        oauthUrl: process.env.LINKEDIN_CLIENT_ID ? "/api/social/oauth/linkedin/authorize" : null,
      },
      twitter: {
        configured: !!(process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET),
        service: "Real-time content publishing",
        oauthUrl: process.env.TWITTER_API_KEY ? "/api/social/oauth/twitter/authorize" : null,
      },
      meta: {
        configured: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
        service: "Facebook & Instagram publishing",
        oauthUrl: process.env.META_APP_ID ? "/api/social/oauth/meta/authorize" : null,
      },
    },
    automation: {
      scheduler: {
        active: true,
        interval: "60 seconds",
        service: "Automated social media post scheduling",
        endpoints: ["/api/social-command/scheduler/status"],
      },
      contentCalendar: {
        active: true,
        service: "8-week LinkedIn + X content campaign",
        endpoints: ["/api/social-command/seed-campaign"],
      },
    },
    database: {
      postgres: {
        connected: true,
        service: "Primary data store for all 18 platforms",
      },
    },
  };

  res.json({
    timestamp: new Date().toISOString(),
    owner: "SZL Holdings",
    integrations,
    summary: {
      googleServicesConnected: 3,
      paymentsConnected: hasConnectors ? 1 : 0,
      socialPlatformsConfigured: [
        process.env.LINKEDIN_CLIENT_ID,
        process.env.TWITTER_API_KEY,
        process.env.META_APP_ID,
      ].filter(Boolean).length,
      automationActive: true,
      totalEndpoints: 12,
    },
  });
}));

router.post("/integrations/test/gmail", requireAuth, asyncHandler(async (_req, res) => {
  try {
    const { getUncachableGmailClient } = await import("../services/google-gmail");
    const gmail = await getUncachableGmailClient();
    const profile = await gmail.users.getProfile({ userId: "me" });
    res.json({
      ok: true,
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.json({ ok: false, error: msg });
  }
}));

router.post("/integrations/test/calendar", requireAuth, asyncHandler(async (_req, res) => {
  try {
    const { listUpcomingEvents } = await import("../services/google-calendar");
    const events = await listUpcomingEvents(3);
    res.json({ ok: true, upcomingEvents: events.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.json({ ok: false, error: msg });
  }
}));

router.post("/integrations/test/drive", requireAuth, asyncHandler(async (_req, res) => {
  try {
    const { listFiles } = await import("../services/google-drive");
    const files = await listFiles(3);
    res.json({ ok: true, filesAccessible: files.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.json({ ok: false, error: msg });
  }
}));

router.post("/integrations/test/stripe", requireAuth, asyncHandler(async (_req, res) => {
  try {
    const { stripeService } = await import("../services/stripe");
    const revenue = await stripeService.getRevenue();
    res.json({ ok: true, configured: revenue.configured });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.json({ ok: false, error: msg });
  }
}));

export default router;
