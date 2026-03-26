import { db } from "@szl-holdings/db";
import { dreameraContentTable, dreameraCampaignsTable } from "@szl-holdings/db/schema";
import { desc } from "drizzle-orm";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

const WORLD_ELEMENTS = {
  regions: [
    { name: "The Luminara Expanse", type: "celestial", description: "A vast realm of crystalline light where ideas take physical form", themes: ["creation", "innovation", "illumination"] },
    { name: "The Abyssal Forge", type: "subterranean", description: "Deep underground networks where raw materials are shaped into narrative elements", themes: ["transformation", "industry", "hidden power"] },
    { name: "The Verdant Nexus", type: "organic", description: "A living ecosystem of interconnected story threads that grow and evolve", themes: ["growth", "connection", "evolution"] },
    { name: "The Temporal Drift", type: "temporal", description: "A shifting landscape where past, present, and future narratives overlap", themes: ["time", "memory", "prophecy"] },
    { name: "The Ethereal Archive", type: "knowledge", description: "An infinite library of all stories ever conceived, accessible through dream navigation", themes: ["wisdom", "preservation", "discovery"] },
  ],
  archetypes: [
    { name: "The Weaver", role: "Creator who spins narrative threads into cohesive stories", strengths: ["world-building", "plot construction", "thematic depth"] },
    { name: "The Sentinel", role: "Guardian who maintains internal consistency and lore integrity", strengths: ["continuity", "fact-checking", "canon enforcement"] },
    { name: "The Wanderer", role: "Explorer who discovers unexpected connections between story elements", strengths: ["creativity", "serendipity", "lateral thinking"] },
    { name: "The Chronicler", role: "Historian who documents and organizes the evolving world state", strengths: ["documentation", "organization", "timeline management"] },
  ],
  storyElements: [
    { category: "Conflict Types", elements: ["Person vs. System", "Faction vs. Faction", "Nature vs. Technology", "Legacy vs. Innovation", "Individual vs. Collective"] },
    { category: "Narrative Devices", elements: ["Unreliable narrator", "Parallel timelines", "Prophecy and fulfillment", "Hidden identity", "Redemption arc"] },
    { category: "Tone Palettes", elements: ["Epic and grandiose", "Intimate and personal", "Dark and foreboding", "Whimsical and curious", "Tense and thriller-like"] },
  ],
};

export const dreamscapeTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "explore_world_regions",
      description: "Explore world regions by combining foundational lore with live creative content from DreamEra. Returns both static world-building regions and data-driven creative realms sourced from actual content.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_character_archetypes",
      description: "Get character archetypes enriched with live campaign data from DreamEra, mapping active campaigns to narrative universes and character types",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_story_elements",
      description: "Get narrative building blocks combining conflict types, narrative devices, and tone palettes with live content themes extracted from DreamEra content",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_world_seed",
      description: "Generate a creative world-building seed by combining foundational lore with a random live DreamEra content piece and campaign context",
      parameters: {
        type: "object",
        properties: {
          theme: { type: "string", description: "Optional theme to influence the seed generation (e.g., 'mystery', 'war', 'discovery')" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_narrative_connections",
      description: "Analyze potential narrative connections between specified world elements and live creative data, revealing thematic threads across content and campaigns",
      parameters: {
        type: "object",
        properties: {
          elements: {
            type: "array",
            items: { type: "string" },
            description: "List of world elements (region names, archetypes, themes) to find connections between",
          },
        },
        required: ["elements"],
      },
    },
  },
];

export async function dreamscapeExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "explore_world_regions": {
        const content = await db.select().from(dreameraContentTable).orderBy(desc(dreameraContentTable.createdAt));
        const liveRealms = content.map(c => ({
          name: c.title,
          type: c.type,
          realm: c.type === "story" ? "Narrative Realm" : c.type === "image" ? "Visual Realm" : c.type === "video" ? "Cinematic Realm" : "Archive Realm",
          excerpt: c.body?.slice(0, 120),
          status: c.status,
          source: "live_data",
        }));
        return JSON.stringify({
          foundationalRegions: WORLD_ELEMENTS.regions,
          liveCreativeRealms: liveRealms,
          totalFoundational: WORLD_ELEMENTS.regions.length,
          totalLive: liveRealms.length,
        });
      }
      case "get_character_archetypes": {
        const campaigns = await db.select().from(dreameraCampaignsTable).orderBy(desc(dreameraCampaignsTable.createdAt));
        const liveArchetypes = campaigns.map(c => ({
          name: c.name,
          archetype: c.status === "active" ? "The Creator" : c.status === "completed" ? "The Sage" : c.status === "draft" ? "The Dreamer" : "The Explorer",
          universe: c.name,
          lore: c.description,
          reach: c.reach,
          source: "live_data",
        }));
        return JSON.stringify({
          foundationalArchetypes: WORLD_ELEMENTS.archetypes,
          liveCampaignArchetypes: liveArchetypes,
          totalFoundational: WORLD_ELEMENTS.archetypes.length,
          totalLive: liveArchetypes.length,
        });
      }
      case "get_story_elements": {
        const content = await db.select().from(dreameraContentTable);
        const liveThemes = content.map(c => ({
          title: c.title,
          elementType: c.type,
          theme: c.type === "story" ? "narrative" : c.type === "image" ? "visual" : c.type === "video" ? "cinematic" : "abstract",
          status: c.status,
          source: "live_data",
        }));
        return JSON.stringify({
          foundationalElements: WORLD_ELEMENTS.storyElements,
          liveContentThemes: liveThemes,
          totalLiveContent: liveThemes.length,
        });
      }
      case "generate_world_seed": {
        const [content, campaigns] = await Promise.all([
          db.select().from(dreameraContentTable),
          db.select().from(dreameraCampaignsTable),
        ]);
        const region = WORLD_ELEMENTS.regions[Math.floor(Math.random() * WORLD_ELEMENTS.regions.length)];
        const archetype = WORLD_ELEMENTS.archetypes[Math.floor(Math.random() * WORLD_ELEMENTS.archetypes.length)];
        const conflictCategory = WORLD_ELEMENTS.storyElements[0];
        const conflict = conflictCategory.elements[Math.floor(Math.random() * conflictCategory.elements.length)];
        const toneCategory = WORLD_ELEMENTS.storyElements[2];
        const tone = toneCategory.elements[Math.floor(Math.random() * toneCategory.elements.length)];
        const liveContent = content.length > 0 ? content[Math.floor(Math.random() * content.length)] : null;
        const liveCampaign = campaigns.length > 0 ? campaigns[Math.floor(Math.random() * campaigns.length)] : null;
        let selectedRegion = region;
        if (args.theme) {
          const matchingRegions = WORLD_ELEMENTS.regions.filter(r =>
            r.themes.some(t => t.toLowerCase().includes(args.theme.toLowerCase())) ||
            r.description.toLowerCase().includes(args.theme.toLowerCase())
          );
          if (matchingRegions.length > 0) {
            selectedRegion = matchingRegions[Math.floor(Math.random() * matchingRegions.length)];
          }
        }
        const seed = {
          foundationalSeed: {
            region: { name: selectedRegion.name, type: selectedRegion.type },
            protagonist: { archetype: archetype.name, role: archetype.role },
            centralConflict: conflict,
            tone,
            suggestedThemes: selectedRegion.themes,
          },
          liveSpark: liveContent ? { title: liveContent.title, type: liveContent.type, excerpt: liveContent.body?.slice(0, 120) } : null,
          liveUniverse: liveCampaign ? { name: liveCampaign.name, description: liveCampaign.description } : null,
          prompt: liveContent && liveCampaign
            ? `In ${selectedRegion.name}, ${archetype.name} discovers "${liveContent.title}" from the universe of "${liveCampaign.name}". The ${conflict.toLowerCase()} conflict unfolds with a ${tone.toLowerCase()} tone, exploring ${selectedRegion.themes.join(", ")}.`
            : `In ${selectedRegion.name}, ${archetype.name} faces a ${conflict.toLowerCase()} conflict. The tone is ${tone.toLowerCase()}, exploring themes of ${selectedRegion.themes.join(", ")}.`,
          dataSourced: content.length > 0 || campaigns.length > 0,
        };
        return JSON.stringify(seed);
      }
      case "analyze_narrative_connections": {
        const elements = args.elements || [];
        const [content, campaigns] = await Promise.all([
          db.select().from(dreameraContentTable),
          db.select().from(dreameraCampaignsTable),
        ]);
        const connections: string[] = [];
        const foundRegions = WORLD_ELEMENTS.regions.filter(r =>
          elements.some((e: string) => r.name.toLowerCase().includes(e.toLowerCase()) || r.themes.some(t => t.toLowerCase().includes(e.toLowerCase())))
        );
        const foundArchetypes = WORLD_ELEMENTS.archetypes.filter(a =>
          elements.some((e: string) => a.name.toLowerCase().includes(e.toLowerCase()))
        );
        const matchedContent = content.filter(c =>
          elements.some((e: string) =>
            (c.title || "").toLowerCase().includes(e.toLowerCase()) ||
            (c.body || "").toLowerCase().includes(e.toLowerCase()) ||
            (c.type || "").toLowerCase().includes(e.toLowerCase())
          )
        );
        const matchedCampaigns = campaigns.filter(c =>
          elements.some((e: string) =>
            (c.name || "").toLowerCase().includes(e.toLowerCase()) ||
            (c.description || "").toLowerCase().includes(e.toLowerCase())
          )
        );
        if (foundRegions.length >= 2) {
          connections.push(`${foundRegions[0].name} and ${foundRegions[1].name} share thematic resonance`);
        }
        if (foundRegions.length > 0 && foundArchetypes.length > 0) {
          connections.push(`${foundArchetypes[0].name} would thrive in ${foundRegions[0].name} (${foundRegions[0].themes.join(", ")})`);
        }
        if (matchedContent.length > 0 && foundRegions.length > 0) {
          connections.push(`Live content "${matchedContent[0].title}" resonates with ${foundRegions[0].name}`);
        }
        if (matchedCampaigns.length > 0) {
          connections.push(`Campaign "${matchedCampaigns[0].name}" provides a narrative universe context`);
        }
        const typeGroups: Record<string, number> = {};
        for (const c of content) {
          typeGroups[c.type || "unknown"] = (typeGroups[c.type || "unknown"] || 0) + 1;
        }
        return JSON.stringify({
          analyzedElements: elements,
          matchedRegions: foundRegions.map(r => r.name),
          matchedArchetypes: foundArchetypes.map(a => a.name),
          matchedLiveContent: matchedContent.map(c => ({ title: c.title, type: c.type })),
          matchedCampaigns: matchedCampaigns.map(c => ({ name: c.name })),
          connections,
          contentDistribution: typeGroups,
          totalContent: content.length,
          totalCampaigns: campaigns.length,
        });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
