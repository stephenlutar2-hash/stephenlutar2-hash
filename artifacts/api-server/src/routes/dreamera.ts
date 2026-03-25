import { Router } from "express";
import { db } from "@workspace/db";
import { dreameraContentTable, dreameraCampaignsTable, insertDreameraContentSchema, insertDreameraCampaignSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Content
router.get("/dreamera/content", async (_req, res) => {
  try {
    const content = await db.select().from(dreameraContentTable).orderBy(dreameraContentTable.createdAt);
    res.json(content.map(c => ({ ...c, engagement: Number(c.engagement) })));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

router.post("/dreamera/content", async (req, res) => {
  try {
    const parsed = insertDreameraContentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(dreameraContentTable).values(parsed.data).returning();
    res.status(201).json({ ...created, engagement: Number(created.engagement) });
  } catch (e) {
    res.status(500).json({ error: "Failed to create content" });
  }
});

router.put("/dreamera/content/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertDreameraContentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [updated] = await db.update(dreameraContentTable).set(parsed.data).where(eq(dreameraContentTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ ...updated, engagement: Number(updated.engagement) });
  } catch (e) {
    res.status(500).json({ error: "Failed to update content" });
  }
});

router.delete("/dreamera/content/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(dreameraContentTable).where(eq(dreameraContentTable.id, id));
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete content" });
  }
});

// Campaigns
router.get("/dreamera/campaigns", async (_req, res) => {
  try {
    const campaigns = await db.select().from(dreameraCampaignsTable).orderBy(dreameraCampaignsTable.createdAt);
    res.json(campaigns.map(c => ({ ...c, budget: Number(c.budget) })));
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

router.post("/dreamera/campaigns", async (req, res) => {
  try {
    const parsed = insertDreameraCampaignSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const [created] = await db.insert(dreameraCampaignsTable).values(parsed.data).returning();
    res.status(201).json({ ...created, budget: Number(created.budget) });
  } catch (e) {
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

router.delete("/dreamera/campaigns/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(dreameraCampaignsTable).where(eq(dreameraCampaignsTable.id, id));
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

export default router;
