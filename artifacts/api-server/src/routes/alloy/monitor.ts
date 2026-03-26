import { db } from "@szl-holdings/db";
import {
  rosieThreatsTable,
  rosieIncidentsTable,
  zeusModulesTable,
  nimbusPredictionsTable,
  beaconProjectsTable,
  dreameraCampaignsTable,
} from "@szl-holdings/db/schema";
import { openai } from "@szl-holdings/integrations-openai-ai-server";

interface PlatformHealth {
  platform: string;
  status: "healthy" | "warning" | "critical";
  issues: string[];
  metrics: Record<string, number>;
}

export interface HealthReport {
  timestamp: string;
  overallStatus: "healthy" | "warning" | "critical";
  platforms: PlatformHealth[];
  aiAnalysis: string;
}

export async function runHealthSweep(): Promise<HealthReport> {
  const [threats, incidents, modules, predictions, projects, campaigns] =
    await Promise.all([
      db.select().from(rosieThreatsTable),
      db.select().from(rosieIncidentsTable),
      db.select().from(zeusModulesTable),
      db.select().from(nimbusPredictionsTable),
      db.select().from(beaconProjectsTable),
      db.select().from(dreameraCampaignsTable),
    ]);

  const criticalThreats = threats.filter(
    (t) =>
      (t.severity === "critical" || t.severity === "high") &&
      t.status !== "resolved" &&
      t.status !== "blocked",
  );
  const openIncidents = incidents.filter((i) => !i.resolved);
  const failingModules = modules.filter(
    (m) => m.status === "error" || Number(m.uptime) < 95,
  );
  const lowConfidencePredictions = predictions.filter(
    (p) => Number(p.confidence) < 50 && p.status === "pending",
  );
  const staleProjects = projects.filter(
    (p) => p.status === "paused" || p.progress === 0,
  );

  const now = new Date();
  const overdueCampaigns = campaigns.filter((c) => {
    const endDate = new Date(c.endDate);
    return (
      endDate < now &&
      c.status !== "completed"
    );
  });

  const platformResults: PlatformHealth[] = [];

  const rosieIssues: string[] = [];
  if (criticalThreats.length > 0)
    rosieIssues.push(
      `${criticalThreats.length} critical/high severity unresolved threats`,
    );
  if (openIncidents.length > 0)
    rosieIssues.push(`${openIncidents.length} open incidents`);
  platformResults.push({
    platform: "Rosie Security",
    status:
      criticalThreats.length > 0
        ? "critical"
        : openIncidents.length > 0
          ? "warning"
          : "healthy",
    issues: rosieIssues,
    metrics: {
      totalThreats: threats.length,
      criticalUnresolved: criticalThreats.length,
      openIncidents: openIncidents.length,
    },
  });

  const zeusIssues: string[] = [];
  if (failingModules.length > 0)
    zeusIssues.push(
      `${failingModules.length} modules failing or below 95% uptime`,
    );
  platformResults.push({
    platform: "Zeus Core",
    status: failingModules.length > 0 ? "critical" : "healthy",
    issues: zeusIssues,
    metrics: {
      totalModules: modules.length,
      failingModules: failingModules.length,
      averageUptime: modules.length
        ? modules.reduce((sum, m) => sum + Number(m.uptime), 0) /
          modules.length
        : 0,
    },
  });

  const nimbusIssues: string[] = [];
  if (lowConfidencePredictions.length > 0)
    nimbusIssues.push(
      `${lowConfidencePredictions.length} pending predictions below 50% confidence`,
    );
  platformResults.push({
    platform: "Nimbus AI",
    status: lowConfidencePredictions.length > 3 ? "warning" : "healthy",
    issues: nimbusIssues,
    metrics: {
      totalPredictions: predictions.length,
      lowConfidence: lowConfidencePredictions.length,
    },
  });

  const beaconIssues: string[] = [];
  if (staleProjects.length > 0)
    beaconIssues.push(
      `${staleProjects.length} stale or paused projects with no progress`,
    );
  platformResults.push({
    platform: "Beacon",
    status: staleProjects.length > 2 ? "warning" : "healthy",
    issues: beaconIssues,
    metrics: {
      totalProjects: projects.length,
      staleProjects: staleProjects.length,
    },
  });

  const dreameraIssues: string[] = [];
  if (overdueCampaigns.length > 0)
    dreameraIssues.push(
      `${overdueCampaigns.length} overdue campaigns past end date`,
    );
  platformResults.push({
    platform: "DreamEra",
    status: overdueCampaigns.length > 0 ? "warning" : "healthy",
    issues: dreameraIssues,
    metrics: {
      totalCampaigns: campaigns.length,
      overdueCampaigns: overdueCampaigns.length,
    },
  });

  const overallStatus = platformResults.some((p) => p.status === "critical")
    ? "critical"
    : platformResults.some((p) => p.status === "warning")
      ? "warning"
      : "healthy";

  const healthSummary = JSON.stringify(
    { overallStatus, platforms: platformResults },
    null,
    2,
  );

  const aiResponse = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: [
      {
        role: "system",
        content:
          "You are Alloy, the AI operations analyst for SZL Holdings. Analyze the platform health data and provide a concise executive summary with prioritized actionable recommendations. Be specific about what needs attention and what actions to take.",
      },
      {
        role: "user",
        content: `Analyze this platform health sweep and provide recommendations:\n\n${healthSummary}`,
      },
    ],
  });

  const aiAnalysis =
    aiResponse.choices[0]?.message?.content || "Analysis unavailable";

  return {
    timestamp: new Date().toISOString(),
    overallStatus,
    platforms: platformResults,
    aiAnalysis,
  };
}
