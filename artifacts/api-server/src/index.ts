import { initAppInsights } from "./lib/appInsights";

initAppInsights();

import { loadSecretsFromKeyVault } from "./lib/config";
import { logger } from "./lib/logger";
import { initRedis, isRedisConfigured } from "./lib/redis";
import { isKeyVaultConfigured } from "./lib/keyvault";
import { isBlobStorageConfigured } from "./lib/blobStorage";
import { getEnabledFeatures } from "./lib/featureFlags";

const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  await loadSecretsFromKeyVault();
  await initRedis();

  const { default: app } = await import("./app");

  app.listen(port, "0.0.0.0", (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    const features = getEnabledFeatures();
    logger.info({
      project: "SZL Holdings",
      mode: process.env.NODE_ENV || "development",
      port,
      host: "0.0.0.0",
      services: {
        database: !!process.env.DATABASE_URL,
        keyVault: isKeyVaultConfigured(),
        redis: isRedisConfigured(),
        blobStorage: isBlobStorageConfigured(),
        stripe: !!process.env.STRIPE_SECRET_KEY,
        plaid: !!process.env.PLAID_CLIENT_ID,
        openai: !!process.env.OPENAI_API_KEY,
      },
      featureFlags: features.length > 0 ? features : "none",
    }, "SZL Holdings API Server started");
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
