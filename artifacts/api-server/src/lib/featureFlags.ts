import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { featureFlagsTable } from "@szl-holdings/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const flagCache = new Map<string, { enabled: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 30_000;

function envKey(feature: string): string {
  return `FEATURE_${feature.toUpperCase().replace(/-/g, "_")}`;
}

function isEnvEnabled(feature: string): boolean | null {
  const value = process.env[envKey(feature)];
  if (value === undefined) return null;
  return value === "true" || value === "1";
}

export async function isFeatureEnabled(feature: string): Promise<boolean> {
  const cacheKey = feature.toLowerCase();
  const cached = flagCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.enabled;
  }

  const envResult = isEnvEnabled(feature);
  if (envResult !== null) {
    flagCache.set(cacheKey, { enabled: envResult, expiresAt: Date.now() + CACHE_TTL_MS });
    return envResult;
  }

  if (isDatabaseAvailable()) {
    try {
      const [row] = await db
        .select()
        .from(featureFlagsTable)
        .where(eq(featureFlagsTable.key, cacheKey))
        .limit(1);
      const enabled = row?.enabled ?? false;
      flagCache.set(cacheKey, { enabled, expiresAt: Date.now() + CACHE_TTL_MS });
      return enabled;
    } catch (err) {
      logger.error({ err, feature }, "Failed to check feature flag from database");
    }
  }

  return false;
}

export function isFeatureEnabledSync(feature: string): boolean {
  const cacheKey = feature.toLowerCase();
  const cached = flagCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.enabled;
  }

  const envResult = isEnvEnabled(feature);
  if (envResult !== null) {
    flagCache.set(cacheKey, { enabled: envResult, expiresAt: Date.now() + CACHE_TTL_MS });
    return envResult;
  }

  return false;
}

export function getEnabledFeatures(): string[] {
  const features: string[] = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("FEATURE_") && (value === "true" || value === "1")) {
      features.push(key.replace("FEATURE_", "").toLowerCase().replace(/_/g, "-"));
    }
  }
  return features;
}

export function clearFlagCache(): void {
  flagCache.clear();
}

export async function getAllFlags(): Promise<
  Array<{ key: string; enabled: boolean; description: string | null }>
> {
  if (!isDatabaseAvailable()) {
    return getEnabledFeatures().map((f) => ({
      key: f,
      enabled: true,
      description: "Environment variable flag",
    }));
  }

  try {
    const rows = await db.select().from(featureFlagsTable).orderBy(featureFlagsTable.key);
    const dbFlags = rows.map((r) => ({
      key: r.key,
      enabled: r.enabled,
      description: r.description,
    }));

    const envFlags = getEnabledFeatures();
    const dbKeys = new Set(dbFlags.map((f) => f.key));
    for (const envFlag of envFlags) {
      if (!dbKeys.has(envFlag)) {
        dbFlags.push({ key: envFlag, enabled: true, description: "Environment variable flag" });
      }
    }

    return dbFlags;
  } catch {
    return getEnabledFeatures().map((f) => ({
      key: f,
      enabled: true,
      description: "Environment variable flag",
    }));
  }
}

export async function setFlag(
  key: string,
  enabled: boolean,
  description?: string,
): Promise<void> {
  if (!isDatabaseAvailable()) {
    throw new Error("Database unavailable");
  }

  const normalizedKey = key.toLowerCase().replace(/_/g, "-");

  await db
    .insert(featureFlagsTable)
    .values({
      key: normalizedKey,
      enabled,
      description: description || null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: featureFlagsTable.key,
      set: {
        enabled,
        description: description || undefined,
        updatedAt: new Date(),
      },
    });

  flagCache.delete(normalizedKey);
}
