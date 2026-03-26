/**
 * ============================================================================
 * CENTRALIZED MODEL REGISTRY — SZL Holdings Agent Platform
 * ============================================================================
 *
 * This registry defines which OpenAI model each agent uses, along with
 * per-agent parameters (temperature, max tokens, top_p). All agents in the
 * system read from this registry at request time, enabling hot-swap via
 * environment variables without code changes or redeployment.
 *
 * ── BI-WEEKLY REVIEW PROCESS ──
 *
 * Every two weeks, perform the following:
 *
 * 1. Check OpenAI's model page (https://platform.openai.com/docs/models)
 *    for newly released or deprecated models.
 *
 * 2. Update the DEFAULT model assignments below if better models are
 *    available (e.g. gpt-4o → gpt-4o-2024-XX-XX, or a new flagship).
 *
 * 3. Reset `LAST_REVIEWED` to today's date (ISO format: "YYYY-MM-DD").
 *
 * 4. Optionally set per-agent overrides via environment variables:
 *      AGENT_MODEL_DEFAULT=gpt-4o
 *      AGENT_MODEL_ALLOY=gpt-4o
 *      AGENT_MODEL_INCA=gpt-4o
 *      AGENT_MODEL_LYTE_AI=gpt-4o
 *      AGENT_TEMP_DEFAULT=0.7
 *      AGENT_MAX_TOKENS_DEFAULT=4096
 *
 * 5. Restart the server and verify via GET /api/agents/status that all
 *    agents reflect the updated models and freshness is "current".
 *
 * ============================================================================
 */

import { logger } from "./logger";

const LAST_REVIEWED = "2026-03-26";
const REVIEW_INTERVAL_DAYS = 14;

export type AgentCategory =
  | "domain"
  | "alloy"
  | "general"
  | "lyte-ai";

export interface ModelConfig {
  model: string;
  temperature: number;
  maxCompletionTokens: number;
  topP: number;
  lastReviewed: string;
  category: AgentCategory;
}

interface RegistryDefaults {
  model: string;
  temperature: number;
  maxCompletionTokens: number;
  topP: number;
}

const CATEGORY_DEFAULTS: Record<AgentCategory, RegistryDefaults> = {
  domain: {
    model: "gpt-4o",
    temperature: 0.7,
    maxCompletionTokens: 4096,
    topP: 1,
  },
  alloy: {
    model: "gpt-4o",
    temperature: 0.7,
    maxCompletionTokens: 8192,
    topP: 1,
  },
  general: {
    model: "gpt-4o",
    temperature: 0.7,
    maxCompletionTokens: 1024,
    topP: 1,
  },
  "lyte-ai": {
    model: "gpt-4o",
    temperature: 0.4,
    maxCompletionTokens: 500,
    topP: 1,
  },
};

const AGENT_OVERRIDES: Record<string, Partial<RegistryDefaults>> = {
  vessels: { maxCompletionTokens: 8192 },
  alloyscape: { maxCompletionTokens: 8192 },
  alloy: { maxCompletionTokens: 8192 },
  beacon: { maxCompletionTokens: 4096 },
  nimbus: { maxCompletionTokens: 4096 },
  aegis: { maxCompletionTokens: 4096 },
  firestorm: { maxCompletionTokens: 4096 },
  rosie: { maxCompletionTokens: 4096 },
  zeus: { maxCompletionTokens: 4096 },
  inca: { maxCompletionTokens: 4096 },
  lyte: { maxCompletionTokens: 4096 },
  dreamera: { maxCompletionTokens: 4096 },
  lutar: { maxCompletionTokens: 4096 },
  dreamscape: { maxCompletionTokens: 4096 },
  "szl-holdings": { maxCompletionTokens: 4096 },
  "carlota-jo": { maxCompletionTokens: 4096 },
  "readiness-report": { maxCompletionTokens: 2048 },
  career: { maxCompletionTokens: 2048 },
  "apps-showcase": { maxCompletionTokens: 2048 },
  atlas: { maxCompletionTokens: 1024 },
  concierge: { maxCompletionTokens: 1024 },
  "lyte-ai": { maxCompletionTokens: 500, temperature: 0.4 },
};

function resolveCategory(agentId: string): AgentCategory {
  if (agentId === "alloy") return "alloy";
  if (agentId === "lyte-ai") return "lyte-ai";
  if (agentId === "atlas" || agentId === "concierge") return "general";
  return "domain";
}

function readEnvOverride(agentId: string, field: "model" | "temp" | "max_tokens" | "top_p"): string | undefined {
  const key = `AGENT_${field.toUpperCase()}_${agentId.toUpperCase().replace(/-/g, "_")}`;
  return process.env[key] || undefined;
}

function readEnvDefault(field: "model" | "temp" | "max_tokens" | "top_p"): string | undefined {
  const key = `AGENT_${field.toUpperCase()}_DEFAULT`;
  return process.env[key] || undefined;
}

function safeParseFloat(value: string, min: number, max: number, fallback: number): number {
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

function safeParseInt(value: string, min: number, max: number, fallback: number): number {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

export function getModelConfig(agentId: string): ModelConfig {
  const category = resolveCategory(agentId);
  const defaults = CATEGORY_DEFAULTS[category];
  const overrides = AGENT_OVERRIDES[agentId] || {};

  const envModel = readEnvOverride(agentId, "model") || readEnvDefault("model");
  const envTemp = readEnvOverride(agentId, "temp") || readEnvDefault("temp");
  const envMaxTokens = readEnvOverride(agentId, "max_tokens") || readEnvDefault("max_tokens");
  const envTopP = readEnvOverride(agentId, "top_p") || readEnvDefault("top_p");

  const baseTemp = overrides.temperature ?? defaults.temperature;
  const baseMaxTokens = overrides.maxCompletionTokens ?? defaults.maxCompletionTokens;
  const baseTopP = overrides.topP ?? defaults.topP;

  return {
    model: envModel || overrides.model || defaults.model,
    temperature: envTemp ? safeParseFloat(envTemp, 0, 2, baseTemp) : baseTemp,
    maxCompletionTokens: envMaxTokens ? safeParseInt(envMaxTokens, 1, 128000, baseMaxTokens) : baseMaxTokens,
    topP: envTopP ? safeParseFloat(envTopP, 0, 1, baseTopP) : baseTopP,
    lastReviewed: LAST_REVIEWED,
    category,
  };
}

export function getAllAgentIds(): string[] {
  return [
    "inca", "vessels", "szl-holdings", "carlota-jo",
    "rosie", "aegis", "beacon", "nimbus", "zeus",
    "dreamera", "firestorm", "lyte", "lutar",
    "alloyscape", "dreamscape",
    "readiness-report", "career", "apps-showcase",
    "alloy",
    "atlas", "concierge",
    "lyte-ai",
  ];
}

export interface FreshnessStatus {
  lastReviewed: string;
  daysSinceReview: number;
  reviewDue: boolean;
  status: "current" | "review-due" | "stale";
}

export function checkFreshness(): FreshnessStatus {
  const lastDate = new Date(LAST_REVIEWED);
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const daysSinceReview = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const reviewDue = daysSinceReview >= REVIEW_INTERVAL_DAYS;

  return {
    lastReviewed: LAST_REVIEWED,
    daysSinceReview,
    reviewDue,
    status: daysSinceReview >= REVIEW_INTERVAL_DAYS * 2 ? "stale" : reviewDue ? "review-due" : "current",
  };
}

export function getFullRegistryStatus(): {
  agents: Record<string, ModelConfig & { freshnessStatus: FreshnessStatus }>;
  freshness: FreshnessStatus;
  reviewIntervalDays: number;
} {
  const freshness = checkFreshness();
  const agents: Record<string, ModelConfig & { freshnessStatus: FreshnessStatus }> = {};

  for (const agentId of getAllAgentIds()) {
    const config = getModelConfig(agentId);
    agents[agentId] = { ...config, freshnessStatus: freshness };
  }

  return { agents, freshness, reviewIntervalDays: REVIEW_INTERVAL_DAYS };
}

let freshnessInterval: ReturnType<typeof setInterval> | null = null;

export function startFreshnessMonitor(): void {
  const logStatus = () => {
    const freshness = checkFreshness();
    const allAgents = getAllAgentIds();
    const models = new Set(allAgents.map(id => getModelConfig(id).model));

    if (freshness.reviewDue) {
      logger.warn(
        {
          daysSinceReview: freshness.daysSinceReview,
          lastReviewed: freshness.lastReviewed,
          models: Array.from(models),
          agentCount: allAgents.length,
        },
        `[Model Registry] Models have not been reviewed in ${freshness.daysSinceReview} days (threshold: ${REVIEW_INTERVAL_DAYS}). Review recommended.`,
      );
    } else {
      logger.info(
        {
          daysSinceReview: freshness.daysSinceReview,
          lastReviewed: freshness.lastReviewed,
          models: Array.from(models),
          agentCount: allAgents.length,
        },
        `[Model Registry] ${allAgents.length} agents configured. Models last reviewed ${freshness.daysSinceReview} day(s) ago. Status: ${freshness.status}`,
      );
    }
  };

  logStatus();

  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  freshnessInterval = setInterval(logStatus, TWENTY_FOUR_HOURS);

  if (freshnessInterval && typeof freshnessInterval === "object" && "unref" in freshnessInterval) {
    freshnessInterval.unref();
  }
}

export function stopFreshnessMonitor(): void {
  if (freshnessInterval) {
    clearInterval(freshnessInterval);
    freshnessInterval = null;
  }
}
