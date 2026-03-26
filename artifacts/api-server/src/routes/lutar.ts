import { Router } from "express";
import { requireAuth } from "./auth";
import { asyncHandler } from "../middleware/errorHandler";
import { lutarService } from "../services/lutar";

const router = Router();

router.get("/lutar/health", (_req, res) => {
  res.json({ ok: true, group: "lutar", timestamp: new Date().toISOString() });
});

router.get("/lutar/dashboard", requireAuth, asyncHandler(async (_req, res) => {
  const summary = await lutarService.getDashboardSummary();
  res.json(summary);
}));

router.get("/lutar/research", requireAuth, asyncHandler(async (_req, res) => {
  const items = await lutarService.listResearchItems();
  res.json(items);
}));

router.get("/lutar/sustainability", requireAuth, asyncHandler(async (_req, res) => {
  const metrics = await lutarService.listSustainabilityMetrics();
  res.json(metrics);
}));

router.get("/lutar/financial", requireAuth, asyncHandler(async (_req, res) => {
  const data = await lutarService.listFinancialData();
  res.json(data);
}));

router.get("/lutar/divisions", requireAuth, asyncHandler(async (_req, res) => {
  const data = await lutarService.listDivisionData();
  res.json(data);
}));

router.get("/lutar/insights", requireAuth, asyncHandler(async (_req, res) => {
  const insights = await lutarService.listInsights();
  res.json(insights);
}));

export default router;
