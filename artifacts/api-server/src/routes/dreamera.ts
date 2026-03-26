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

router.get("/dreamera/content", requireAuth, asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, status, type } = req.query;
  if (page || limit || sortBy || sortOrder || search || status || type) {
    const result = await dreameraService.listContentPaginated({
      page: page ? parseInt(String(page)) : undefined,
      limit: limit ? parseInt(String(limit)) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder === "desc" ? "desc" : sortOrder === "asc" ? "asc" : undefined,
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      type: type ? String(type) : undefined,
    });
    res.json(result);
    return;
  }
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

router.get("/dreamera/campaigns", requireAuth, asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search, status } = req.query;
  if (page || limit || sortBy || sortOrder || search || status) {
    const result = await dreameraService.listCampaignsPaginated({
      page: page ? parseInt(String(page)) : undefined,
      limit: limit ? parseInt(String(limit)) : undefined,
      sortBy: sortBy ? String(sortBy) : undefined,
      sortOrder: sortOrder === "desc" ? "desc" : sortOrder === "asc" ? "asc" : undefined,
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
    });
    res.json(result);
    return;
  }
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

router.get("/dreamera/analytics/content-performance", requireAuth, asyncHandler(async (_req, res) => {
  const performance = await dreameraService.getContentPerformance();
  res.json(performance);
}));

router.get("/dreamera/analytics/campaign-roi", requireAuth, asyncHandler(async (_req, res) => {
  const roi = await dreameraService.getCampaignROI();
  res.json(roi);
}));

router.get("/dreamera/analytics/pipeline-status", requireAuth, asyncHandler(async (_req, res) => {
  const pipeline = await dreameraService.getPipelineStatus();
  res.json(pipeline);
}));

router.get("/dreamera/export/content", requireAuth, asyncHandler(async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";
  const result = await dreameraService.exportContent(format);
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.data);
}));

router.get("/dreamera/export/campaigns", requireAuth, asyncHandler(async (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";
  const result = await dreameraService.exportCampaigns(format);
  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.data);
}));

export default router;
