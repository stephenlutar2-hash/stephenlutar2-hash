import { Router, type IRouter } from "express";

const router: IRouter = Router();

const healthResponse = () => ({
  ok: true,
  project: "SZL Holdings",
  timestamp: new Date().toISOString(),
});

router.get("/healthz", (_req, res) => {
  res.json(healthResponse());
});

router.get("/health", (_req, res) => {
  res.json(healthResponse());
});

export default router;
