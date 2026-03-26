import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "./auth";
import { requireOperator } from "../middleware/rbac";
import { writeRateLimit } from "../middleware/rateLimit";
import { extensionsService } from "../services/extensions";
import { appExtensionsService } from "../services/app-extensions";
import { AppError } from "../lib/errors";

const router = Router();

router.get("/extensions/health", (_req, res) => {
  res.json({ ok: true, group: "extensions", timestamp: new Date().toISOString() });
});

router.get("/extensions/automation/rules", requireAuth, asyncHandler(async (req, res) => {
  const appDomain = req.query.appDomain as string | undefined;
  const rules = extensionsService.listAutomationRules(appDomain);
  res.json({ rules, total: rules.length });
}));

router.get("/extensions/automation/rules/:id", requireAuth, asyncHandler(async (req, res) => {
  const rule = extensionsService.getAutomationRule(req.params.id as string);
  if (!rule) throw AppError.notFound("Automation rule not found");
  res.json(rule);
}));

router.post("/extensions/automation/rules", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const { appDomain, name, description, trigger, conditions, actions, schedule, enabled } = req.body;
  if (!appDomain || !name || !trigger || !actions) {
    throw AppError.badRequest("Required: appDomain, name, trigger, actions");
  }
  const rule = extensionsService.createAutomationRule({
    appDomain, name, description: description || "", trigger, conditions: conditions || [],
    actions, schedule, enabled: enabled !== false,
  });
  res.status(201).json(rule);
}));

router.put("/extensions/automation/rules/:id", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const updated = extensionsService.updateAutomationRule(req.params.id as string, req.body);
  if (!updated) throw AppError.notFound("Automation rule not found");
  res.json(updated);
}));

router.delete("/extensions/automation/rules/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const deleted = extensionsService.deleteAutomationRule(req.params.id as string);
  if (!deleted) throw AppError.notFound("Automation rule not found");
  res.status(204).send();
}));

router.post("/extensions/automation/rules/:id/execute", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const result = extensionsService.executeAutomationRule(req.params.id as string);
  if (!result.success) throw AppError.notFound("Automation rule not found");
  res.json(result);
}));

router.get("/extensions/webhooks", requireAuth, asyncHandler(async (req, res) => {
  const appDomain = req.query.appDomain as string | undefined;
  const webhooks = extensionsService.listWebhooks(appDomain);
  res.json({ webhooks, total: webhooks.length });
}));

router.get("/extensions/webhooks/:id", requireAuth, asyncHandler(async (req, res) => {
  const webhook = extensionsService.getWebhook(req.params.id as string);
  if (!webhook) throw AppError.notFound("Webhook not found");
  res.json(webhook);
}));

router.post("/extensions/webhooks", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const { appDomain, url, name, events, secret } = req.body;
  if (!appDomain || !url || !name || !events || !Array.isArray(events)) {
    throw AppError.badRequest("Required: appDomain, url, name, events");
  }
  const webhook = extensionsService.createWebhook({ appDomain, url, name, events, secret, active: true });
  res.status(201).json(webhook);
}));

router.put("/extensions/webhooks/:id", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const updated = extensionsService.updateWebhook(req.params.id as string, req.body);
  if (!updated) throw AppError.notFound("Webhook not found");
  res.json(updated);
}));

router.delete("/extensions/webhooks/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const deleted = extensionsService.deleteWebhook(req.params.id as string);
  if (!deleted) throw AppError.notFound("Webhook not found");
  res.status(204).send();
}));

router.post("/extensions/webhooks/:id/test", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const result = extensionsService.testWebhook(req.params.id as string);
  if (!result.success) throw AppError.notFound("Webhook not found");
  res.json(result);
}));

router.get("/extensions/notifications", requireAuth, asyncHandler(async (req, res) => {
  const appDomain = req.query.appDomain as string | undefined;
  const unreadOnly = req.query.unreadOnly === "true";
  const notifications = extensionsService.listNotifications(appDomain, unreadOnly);
  res.json({ notifications, total: notifications.length });
}));

router.get("/extensions/notifications/stats", requireAuth, asyncHandler(async (req, res) => {
  const appDomain = req.query.appDomain as string | undefined;
  const stats = extensionsService.getNotificationStats(appDomain);
  res.json(stats);
}));

router.post("/extensions/notifications", requireAuth, writeRateLimit, asyncHandler(async (req, res) => {
  const { appDomain, title, message, type, source, actionUrl } = req.body;
  if (!appDomain || !title || !message || !type || !source) {
    throw AppError.badRequest("Required: appDomain, title, message, type, source");
  }
  const notif = extensionsService.createNotification({ appDomain, title, message, type, source, actionUrl });
  res.status(201).json(notif);
}));

router.patch("/extensions/notifications/:id/read", requireAuth, asyncHandler(async (req, res) => {
  const success = extensionsService.markNotificationRead(req.params.id as string);
  if (!success) throw AppError.notFound("Notification not found");
  res.json({ success: true });
}));

router.patch("/extensions/notifications/read-all", requireAuth, asyncHandler(async (req, res) => {
  const appDomain = req.query.appDomain as string;
  if (!appDomain) throw AppError.badRequest("appDomain query parameter required");
  const count = extensionsService.markAllNotificationsRead(appDomain);
  res.json({ success: true, markedRead: count });
}));

router.get("/extensions/reports", requireAuth, asyncHandler(async (req, res) => {
  const appDomain = req.query.appDomain as string | undefined;
  const configs = extensionsService.listReportConfigs(appDomain);
  res.json({ reports: configs, total: configs.length });
}));

router.post("/extensions/reports", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const { appDomain, name, type, sections, schedule } = req.body;
  if (!appDomain || !name || !type || !sections) {
    throw AppError.badRequest("Required: appDomain, name, type, sections");
  }
  const config = extensionsService.createReportConfig({ appDomain, name, type, sections, schedule });
  res.status(201).json(config);
}));

router.post("/extensions/reports/:id/generate", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const result = extensionsService.generateReport(req.params.id as string);
  if (!result.success) throw AppError.notFound("Report config not found");
  res.json(result);
}));

router.get("/extensions/developer/api-keys", requireAuth, requireOperator(), asyncHandler(async (_req, res) => {
  const keys = extensionsService.listApiKeys();
  res.json({ keys, total: keys.length });
}));

router.post("/extensions/developer/api-keys", requireAuth, writeRateLimit, requireOperator(), asyncHandler(async (req, res) => {
  const { name, permissions, rateLimitTier } = req.body;
  if (!name || !permissions || !rateLimitTier) {
    throw AppError.badRequest("Required: name, permissions, rateLimitTier");
  }
  const result = extensionsService.createApiKey({ name, permissions, rateLimitTier });
  res.status(201).json(result);
}));

router.delete("/extensions/developer/api-keys/:id", requireAuth, requireOperator(), asyncHandler(async (req, res) => {
  const success = extensionsService.revokeApiKey(req.params.id as string);
  if (!success) throw AppError.notFound("API key not found");
  res.json({ success: true, message: "API key revoked" });
}));

router.get("/extensions/developer/usage", requireAuth, asyncHandler(async (_req, res) => {
  const stats = extensionsService.getApiUsageStats();
  res.json(stats);
}));

router.get("/extensions/developer/rate-limits", requireAuth, asyncHandler(async (_req, res) => {
  const tiers = extensionsService.getRateLimitTiers();
  res.json({ tiers });
}));

router.get("/extensions/rosie/threat-hunting-rules", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ rules: appExtensionsService.getRosieThreatHuntingRules() });
}));

router.get("/extensions/rosie/security-posture", requireAuth, asyncHandler(async (_req, res) => {
  res.json(appExtensionsService.getRosieSecurityPostureScore());
}));

router.get("/extensions/rosie/playbooks", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ playbooks: appExtensionsService.getRosieIncidentPlaybooks() });
}));

router.get("/extensions/aegis/compliance", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ checklists: appExtensionsService.getAegisComplianceChecklists() });
}));

router.get("/extensions/aegis/zero-trust-policies", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ policies: appExtensionsService.getAegisZeroTrustPolicies() });
}));

router.get("/extensions/firestorm/scenarios", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ scenarios: appExtensionsService.getFirestormScenarios() });
}));

router.get("/extensions/firestorm/team-scores", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ scores: appExtensionsService.getFirestormTeamScores() });
}));

router.get("/extensions/inca/research-papers", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ papers: appExtensionsService.getIncaResearchPapers() });
}));

router.get("/extensions/inca/experiment-comparison", requireAuth, asyncHandler(async (_req, res) => {
  res.json(appExtensionsService.getIncaExperimentComparison());
}));

router.get("/extensions/nimbus/what-if", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ scenarios: appExtensionsService.getNimbusWhatIfScenarios() });
}));

router.get("/extensions/nimbus/forecast-accuracy", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ records: appExtensionsService.getNimbusForecastAccuracy() });
}));

router.get("/extensions/beacon/custom-kpis", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ kpis: appExtensionsService.getBeaconCustomKPIs() });
}));

router.get("/extensions/beacon/goals", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ goals: appExtensionsService.getBeaconGoalTracker() });
}));

router.get("/extensions/vessels/weather", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ overlays: appExtensionsService.getVesselsWeatherOverlay() });
}));

router.get("/extensions/vessels/fuel-optimization", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ optimizations: appExtensionsService.getVesselsFuelOptimization() });
}));

router.get("/extensions/vessels/regulatory", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ deadlines: appExtensionsService.getVesselsRegulatoryDeadlines() });
}));

router.get("/extensions/vessels/voyage-pnl", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ voyages: appExtensionsService.getVesselsVoyagePnL() });
}));

router.get("/extensions/zeus/dependencies", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ dependencies: appExtensionsService.getZeusModuleDependencies() });
}));

router.get("/extensions/zeus/auto-scaling", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ rules: appExtensionsService.getZeusAutoScalingRules() });
}));

router.get("/extensions/lyte/log-patterns", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ patterns: appExtensionsService.getLyteLogPatterns() });
}));

router.get("/extensions/lyte/sla", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ definitions: appExtensionsService.getLyteSLADefinitions() });
}));

router.get("/extensions/lyte/cost-attribution", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ attributions: appExtensionsService.getLyteCostAttribution() });
}));

router.get("/extensions/dreamera/brand-kit", requireAuth, asyncHandler(async (_req, res) => {
  res.json(appExtensionsService.getDreameraBrandKit());
}));

router.get("/extensions/dreamera/campaign-calendar", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ entries: appExtensionsService.getDreameraCampaignCalendar() });
}));

router.get("/extensions/dreamscape/templates", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ templates: appExtensionsService.getDreamscapeTemplates() });
}));

router.get("/extensions/dreamscape/asset-library", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ assets: appExtensionsService.getDreamscapeAssetLibrary() });
}));

router.get("/extensions/alloyscape/prompt-lab", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ results: appExtensionsService.getAlloyscapePromptLab() });
}));

router.get("/extensions/alloyscape/conversation-analytics", requireAuth, asyncHandler(async (_req, res) => {
  res.json(appExtensionsService.getAlloyscapeConversationAnalytics());
}));

router.get("/extensions/szl-holdings/investor-dashboard", requireAuth, asyncHandler(async (_req, res) => {
  res.json(appExtensionsService.getSzlInvestorDashboard());
}));

router.get("/extensions/szl-holdings/portfolio-heatmap", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ entries: appExtensionsService.getPortfolioHeatMap() });
}));

router.get("/extensions/carlota-jo/pipeline", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ entries: appExtensionsService.getCarlotaJoClientPipeline() });
}));

router.get("/extensions/carlota-jo/roi-calculator", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ calculations: appExtensionsService.getCarlotaJoROICalculator() });
}));

router.get("/extensions/lutar/personal-kpis", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ kpis: appExtensionsService.getLutarPersonalKPIs() });
}));

router.get("/extensions/lutar/daily-briefing", requireAuth, asyncHandler(async (_req, res) => {
  res.json(appExtensionsService.getLutarDailyBriefing());
}));

router.get("/extensions/lutar/decision-journal", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ entries: appExtensionsService.getLutarDecisionJournal() });
}));

router.get("/extensions/career/visitor-analytics", requireAuth, asyncHandler(async (_req, res) => {
  res.json(appExtensionsService.getCareerVisitorAnalytics());
}));

router.get("/extensions/career/contact-pipeline", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ contacts: appExtensionsService.getCareerContactPipeline() });
}));

router.get("/extensions/apps-showcase/feature-comparison", requireAuth, asyncHandler(async (_req, res) => {
  res.json(appExtensionsService.getAppsShowcaseFeatureComparison());
}));

router.get("/extensions/readiness-report/deployment-triggers", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ triggers: appExtensionsService.getReadinessDeploymentTriggers() });
}));

router.get("/extensions/readiness-report/health-trends", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ trends: appExtensionsService.getReadinessHealthTrends() });
}));

router.get("/extensions/readiness-report/status-pages", requireAuth, asyncHandler(async (_req, res) => {
  res.json({ pages: appExtensionsService.getReadinessStatusPages() });
}));

export default router;
