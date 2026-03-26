import { db } from "@szl-holdings/db";
import { beaconMetricsTable, beaconProjectsTable } from "@szl-holdings/db/schema";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

const PRACTICE_AREAS = [
  { id: "digital-transformation", name: "Digital Transformation", description: "End-to-end digital transformation strategy and implementation. Cloud migration, process automation, digital customer experience, and organizational change management.", idealFor: "Enterprises modernizing legacy systems or building digital-first operations." },
  { id: "ai-automation", name: "AI & Automation Strategy", description: "Strategic AI adoption roadmaps, ML pipeline design, intelligent automation, and AI governance frameworks.", idealFor: "Organizations seeking to leverage AI for competitive advantage." },
  { id: "cybersecurity", name: "Cybersecurity Advisory", description: "Security posture assessment, zero-trust architecture design, incident response planning, compliance frameworks (SOC 2, ISO 27001, GDPR).", idealFor: "Any organization handling sensitive data." },
  { id: "data-intelligence", name: "Data Intelligence", description: "Data strategy, analytics architecture, business intelligence, data governance, and insight-driven decision making.", idealFor: "Organizations drowning in data but starving for insights." },
  { id: "executive-coaching", name: "Executive Coaching", description: "Leadership development for technology executives. Strategic thinking, team building, stakeholder management.", idealFor: "Technology leaders seeking growth." },
  { id: "custom-solutions", name: "Custom Technology Solutions", description: "Bespoke software development, platform architecture, API design, and technical debt remediation.", idealFor: "When off-the-shelf doesn't cut it." },
];

export const carlotaJoTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "submit_inquiry",
      description: "Submit a consultation inquiry or lead from a qualified prospect. Use when a visitor wants to book a consultation, request information, or express interest in services.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The prospect's full name" },
          email: { type: "string", description: "The prospect's email address" },
          service: { type: "string", description: "The practice area or service they're interested in" },
          company: { type: "string", description: "The prospect's company name (if provided)" },
          message: { type: "string", description: "Summary of the prospect's needs and interest" },
        },
        required: ["name", "email", "service", "message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_practice_areas",
      description: "Get detailed information about all Carlota Jo consulting practice areas, including descriptions, ideal client profiles, and service details",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "match_services",
      description: "Match a prospect's described needs to the most relevant practice area(s) based on keyword and context analysis",
      parameters: {
        type: "object",
        properties: {
          needs: { type: "string", description: "Description of the prospect's business challenges or needs" },
        },
        required: ["needs"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_portfolio_insights",
      description: "Get real-time business metrics and project data from the SZL Holdings portfolio to demonstrate Carlota Jo's data-driven consulting approach and ecosystem capabilities",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

export async function carlotaJoExecuteTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case "submit_inquiry": {
        const baseUrl = process.env.REPLIT_DEV_DOMAIN
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/carlota-jo/inquiries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: args.name,
            email: args.email,
            service: args.service || "General Inquiry",
            company: args.company,
            message: args.message,
            type: "agent_referral",
          }),
        });
        if (!res.ok) {
          return JSON.stringify({ error: "Failed to submit inquiry" });
        }
        const data = await res.json() as { id: string };
        return JSON.stringify({ success: true, inquiryId: data.id, message: "Inquiry submitted successfully. The Carlota Jo team will be in touch." });
      }
      case "get_practice_areas": {
        return JSON.stringify({
          practiceAreas: PRACTICE_AREAS,
          totalAreas: PRACTICE_AREAS.length,
          consultationTiers: [
            { name: "Discovery Call", duration: "30 minutes", cost: "Complimentary" },
            { name: "Strategic Assessment", duration: "Half-day", cost: "Contact for pricing" },
            { name: "Full Engagement", duration: "Multi-week/month", cost: "Scope-dependent" },
          ],
        });
      }
      case "match_services": {
        const needs = (args.needs || "").toLowerCase();
        const matches = PRACTICE_AREAS.filter(pa =>
          pa.description.toLowerCase().includes(needs) ||
          pa.name.toLowerCase().includes(needs) ||
          pa.idealFor.toLowerCase().includes(needs) ||
          needs.split(/\s+/).some((word: string) =>
            word.length > 3 && (pa.description.toLowerCase().includes(word) || pa.name.toLowerCase().includes(word))
          )
        );
        return JSON.stringify({
          matchedServices: matches.length > 0 ? matches : PRACTICE_AREAS.slice(0, 2),
          matchCount: matches.length,
          recommendation: matches.length > 0
            ? `Based on your needs, we recommend exploring ${matches.map(m => m.name).join(" and ")}.`
            : "We'd recommend a Discovery Call to better understand your specific needs.",
        });
      }
      case "get_portfolio_insights": {
        const [metrics, projects] = await Promise.all([
          db.select().from(beaconMetricsTable),
          db.select().from(beaconProjectsTable),
        ]);
        return JSON.stringify({
          ecosystemMetrics: {
            totalKPIs: metrics.length,
            improvingMetrics: metrics.filter(m => Number(m.change) > 0).length,
            activeProjects: projects.filter(p => p.status === "active" || p.status === "in-progress").length,
            totalProjects: projects.length,
          },
          insight: "Carlota Jo leverages data from across the SZL Holdings ecosystem to deliver evidence-based consulting recommendations.",
        });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error: any) {
    return JSON.stringify({ error: error.message || "Tool execution failed" });
  }
}
