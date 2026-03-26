import { Router, type IRouter } from "express";
import { getFullRegistryStatus, checkFreshness } from "../lib/model-registry";
import { requireAuth } from "./auth";
import { requireAdmin } from "../middleware/rbac";

const router: IRouter = Router();

router.get("/agents/status", requireAuth, requireAdmin(), (_req, res) => {
  const status = getFullRegistryStatus();
  res.json({
    ok: true,
    ...status,
    timestamp: new Date().toISOString(),
  });
});

router.get("/agents/freshness", (_req, res) => {
  const freshness = checkFreshness();
  res.json({
    ok: !freshness.reviewDue,
    ...freshness,
    timestamp: new Date().toISOString(),
  });
});

export default router;
