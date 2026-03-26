import { Router } from "express";
import { requireAuth } from "./auth";
import { asyncHandler } from "../middleware/errorHandler";
import { dreamscapeService } from "../services/dreamscape";

const router = Router();

router.get("/dreamscape/health", (_req, res) => {
  res.json({ ok: true, group: "dreamscape", timestamp: new Date().toISOString() });
});

router.get("/dreamscape/worlds", requireAuth, asyncHandler(async (_req, res) => {
  const worlds = await dreamscapeService.listWorlds();
  res.json(worlds);
}));

router.get("/dreamscape/worlds/:worldId", requireAuth, asyncHandler(async (req, res) => {
  const world = await dreamscapeService.getWorld(req.params.worldId);
  if (!world) return res.status(404).json({ error: "World not found" });
  res.json(world);
}));

router.get("/dreamscape/projects", requireAuth, asyncHandler(async (req, res) => {
  const { worldId } = req.query;
  const projects = await dreamscapeService.listProjects(worldId ? String(worldId) : undefined);
  res.json(projects);
}));

router.get("/dreamscape/artifacts", requireAuth, asyncHandler(async (req, res) => {
  const { worldId, projectId } = req.query;
  const artifacts = await dreamscapeService.listArtifacts({
    worldId: worldId ? String(worldId) : undefined,
    projectId: projectId ? String(projectId) : undefined,
  });
  res.json(artifacts);
}));

router.get("/dreamscape/artifacts/:artifactId", requireAuth, asyncHandler(async (req, res) => {
  const artifact = await dreamscapeService.getArtifact(req.params.artifactId);
  if (!artifact) return res.status(404).json({ error: "Artifact not found" });
  res.json(artifact);
}));

router.post("/dreamscape/artifacts", requireAuth, asyncHandler(async (req, res) => {
  const created = await dreamscapeService.createArtifact(req.body);
  res.status(201).json(created);
}));

router.get("/dreamscape/generation-history", requireAuth, asyncHandler(async (_req, res) => {
  const history = await dreamscapeService.listGenerationHistory();
  res.json(history);
}));

router.post("/dreamscape/generate", requireAuth, asyncHandler(async (req, res) => {
  const { prompt, type, worldName, projectName, style, creativity, detail, stylization } = req.body;
  const genId = `gen-${Date.now()}`;

  const gen = await dreamscapeService.createGeneration({
    genId,
    prompt,
    type: type || "image",
    status: "completed",
    worldName: worldName || "Unknown",
    projectName: projectName || "Unknown",
    duration: Math.floor(Math.random() * 15 + 5),
    result: `https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop&t=${Date.now()}`,
  });

  res.json({
    success: true,
    generation: gen,
    images: [
      `https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&h=400&fit=crop&t=${Date.now()}`,
      `https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop&t=${Date.now()}`,
      `https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop&t=${Date.now()}`,
      `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop&t=${Date.now()}`,
    ],
  });
}));

router.get("/dreamscape/pipeline", requireAuth, asyncHandler(async (_req, res) => {
  const items = await dreamscapeService.listPipelineItems();
  res.json(items);
}));

router.patch("/dreamscape/pipeline/:id", requireAuth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const updated = await dreamscapeService.updatePipelineItem(id, req.body);
  if (!updated) return res.status(404).json({ error: "Pipeline item not found" });
  res.json(updated);
}));

export default router;
