import { Router } from "express";
import { insertDreameraContentSchema, insertDreameraCampaignSchema, dreameraContentTable, dreameraCampaignsTable } from "@szl-holdings/db/schema";
import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { count } from "drizzle-orm";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { validateAndSanitizeBody } from "../middleware/validate";
import { writeRateLimit } from "../middleware/rateLimit";
import { asyncHandler } from "../middleware/errorHandler";
import { dreameraService } from "../services/dreamera";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

const router = Router();

let seeded = false;
let seedingPromise: Promise<void> | null = null;

async function ensureSeeded() {
  if (seeded || !isDatabaseAvailable()) return;
  if (seedingPromise) return seedingPromise;
  seedingPromise = doSeed().finally(() => { seedingPromise = null; });
  return seedingPromise;
}

async function doSeed() {
  if (seeded) return;
  const [contentCount, campaignsCount] = await Promise.all([
    db.select({ cnt: count() }).from(dreameraContentTable),
    db.select({ cnt: count() }).from(dreameraCampaignsTable),
  ]);
  if (contentCount[0].cnt > 0 && campaignsCount[0].cnt > 0) { seeded = true; return; }

  if (contentCount[0].cnt === 0) await db.insert(dreameraContentTable).values([
    { title: "The Obsidian Chronicles — Season 1", body: "A multi-layered narrative exploring the boundaries between digital consciousness and reality. The series follows three intertwined storylines across digital and physical realms.", type: "series", status: "published", views: 245000, engagement: "94.2" },
    { title: "Nebula's Whisper — Teaser Trailer", body: "An interstellar journey through the memories of a dying star system. This teaser introduces audiences to the cosmic narrative universe.", type: "video", status: "published", views: 128000, engagement: "87.5" },
    { title: "Fractured Symmetry — Interactive Experience", body: "Parallel timelines converge in a city that exists in two dimensions simultaneously. Users navigate branching paths that reshape the narrative.", type: "interactive", status: "draft", views: 0, engagement: "0" },
    { title: "Behind the Obsidian: Making-of Documentary", body: "Deep dive into the creative process behind the Chronicles universe. Features interviews with the creative team and behind-the-scenes footage.", type: "documentary", status: "published", views: 89000, engagement: "91.3" },
    { title: "Echo Chambers — Audio Drama Pilot", body: "Stories within stories — an infinite regression of narrative consciousness. This pilot episode establishes the recursive storytelling format.", type: "audio", status: "review", views: 12000, engagement: "78.6" },
    { title: "The Artifact Protocol — Concept Art Collection", body: "When ancient maps begin rewriting themselves, a cartographer must decode the message. A curated gallery of concept art and world-building illustrations.", type: "gallery", status: "published", views: 67000, engagement: "82.1" },
  ]).onConflictDoNothing();

  if (campaignsCount[0].cnt === 0) await db.insert(dreameraCampaignsTable).values([
    { name: "Obsidian Chronicles Launch", description: "Multi-platform launch campaign for The Obsidian Chronicles Season 1", status: "active", budget: "125000", reach: 2400000, startDate: "2026-01-15", endDate: "2026-04-30" },
    { name: "DreamEra Brand Awareness", description: "Brand awareness campaign targeting creative professionals and storytelling enthusiasts", status: "active", budget: "45000", reach: 890000, startDate: "2026-02-01", endDate: "2026-06-30" },
    { name: "Nebula Pre-Release Hype", description: "Building anticipation for the Nebula's Whisper full release", status: "planning", budget: "78000", reach: 0, startDate: "2026-05-01", endDate: "2026-08-31" },
    { name: "Holiday Creator Bundle", description: "Seasonal promotion bundling DreamEra creative tools and content packs", status: "completed", budget: "35000", reach: 1200000, startDate: "2025-11-15", endDate: "2025-12-31" },
  ]).onConflictDoNothing();

  seeded = true;
  logger.info("DreamEra seed data loaded successfully");
}

router.get("/dreamera/health", (_req, res) => {
  res.json({ ok: true, group: "dreamera", timestamp: new Date().toISOString() });
});

router.get("/dreamera/content", requireAuth, asyncHandler(async (req, res) => {
  await ensureSeeded();
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
  await ensureSeeded();
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
  await ensureSeeded();
  const performance = await dreameraService.getContentPerformance();
  res.json(performance);
}));

router.get("/dreamera/analytics/campaign-roi", requireAuth, asyncHandler(async (_req, res) => {
  await ensureSeeded();
  const roi = await dreameraService.getCampaignROI();
  res.json(roi);
}));

router.get("/dreamera/analytics/pipeline-status", requireAuth, asyncHandler(async (_req, res) => {
  await ensureSeeded();
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
