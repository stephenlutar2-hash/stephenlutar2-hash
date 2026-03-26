import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const router = Router();

router.post("/analytics/pageview", (req: Request, res: Response) => {
  try {
    const { p, r, t, w } = req.body || {};
    logger.info({ path: p, referrer: r, title: t, viewport: w, ip: req.ip, ua: req.headers["user-agent"] }, "pageview");
    res.status(204).end();
  } catch {
    res.status(204).end();
  }
});

router.post("/analytics/event", (req: Request, res: Response) => {
  try {
    const { category, action, label, path, value } = req.body || {};
    if (!category || !action) {
      res.status(400).json({ error: "category and action required" });
      return;
    }
    logger.info({
      category,
      action,
      label,
      path,
      value,
      ip: req.ip,
      ua: req.headers["user-agent"],
    }, "analytics_event");
    res.status(204).end();
  } catch {
    res.status(204).end();
  }
});

export default router;
