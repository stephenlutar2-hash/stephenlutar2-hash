const flagCache = new Map<string, boolean>();

export function isFeatureEnabled(feature: string): boolean {
  const cacheKey = feature.toLowerCase();
  if (flagCache.has(cacheKey)) {
    return flagCache.get(cacheKey)!;
  }

  const envKey = `FEATURE_${feature.toUpperCase().replace(/-/g, "_")}`;
  const value = process.env[envKey];
  const enabled = value === "true" || value === "1";
  flagCache.set(cacheKey, enabled);
  return enabled;
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
