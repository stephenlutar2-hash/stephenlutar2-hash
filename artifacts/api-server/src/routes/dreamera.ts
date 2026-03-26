import { Router } from "express";
import { insertDreameraContentSchema, insertDreameraCampaignSchema } from "@szl-holdings/db/schema";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";
import { asyncHandler } from "../middleware/errorHandler";
import { dreameraService } from "../services/dreamera";
import { AppError } from "../lib/errors";

const router = Router();

router.get("/dreamera/health", (_req, res) => {
  res.json({ ok: true, group: "dreamera", timestamp: new Date().toISOString() });
});

router.get("/dreamera/content", requireAuth, asyncHandler(async (_req, res) => {
  const content = await dreameraService.listContent();
  res.json(content);
}));

router.post("/dreamera/content", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertDreameraContentSchema), asyncHandler(async (req, res) => {
  const created = await dreameraService.createContent(req.body);
  res.status(201).json(created);
}));

router.put("/dreamera/content/:id", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertDreameraContentSchema), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const updated = await dreameraService.updateContent(id, req.body);
  if (!updated) throw AppError.notFound("Content not found");
  res.json(updated);
}));

router.delete("/dreamera/content/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await dreameraService.deleteContent(id);
  res.status(204).send();
}));

router.get("/dreamera/campaigns", requireAuth, asyncHandler(async (_req, res) => {
  const campaigns = await dreameraService.listCampaigns();
  res.json(campaigns);
}));

router.post("/dreamera/campaigns", requireAuth, writeRateLimit, requireOperator(), validateAndSanitizeBody(insertDreameraCampaignSchema), asyncHandler(async (req, res) => {
  const created = await dreameraService.createCampaign(req.body);
  res.status(201).json(created);
}));

router.delete("/dreamera/campaigns/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await dreameraService.deleteCampaign(id);
  res.status(204).send();
}));

export default router;
