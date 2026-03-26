import { Router, type Request, type Response } from "express";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { newsletterSubscribersTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/newsletter/subscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      res.status(400).json({ error: "A valid email address is required." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isDatabaseAvailable() || !db) {
      logger.info({ email: normalizedEmail }, "newsletter signup (no db)");
      res.json({ success: true, message: "Thank you for subscribing!" });
      return;
    }

    const existing = await db
      .select()
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      res.json({ success: true, message: "You're already subscribed!" });
      return;
    }

    await db.insert(newsletterSubscribersTable).values({
      email: normalizedEmail,
      source: req.headers.referer || "direct",
    });

    logger.info({ email: normalizedEmail }, "newsletter subscription");
    res.json({ success: true, message: "Thank you for subscribing!" });
  } catch (err) {
    logger.error({ err }, "newsletter subscribe error");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
