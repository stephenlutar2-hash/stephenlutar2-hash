import { initAppInsights } from "./lib/appInsights";

initAppInsights();

import { validateEnvironment } from "./lib/envValidation";
import { loadSecretsFromKeyVault } from "./lib/config";
import { logger } from "./lib/logger";
import { initRedis, isRedisConfigured } from "./lib/redis";
import { isKeyVaultConfigured } from "./lib/keyvault";
import { isBlobStorageConfigured } from "./lib/blobStorage";
import { getEnabledFeatures } from "./lib/featureFlags";
import { startFreshnessMonitor } from "./lib/model-registry";
import path from "path";
import type { Server } from "node:http";

const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

let server: Server | null = null;

async function start() {
  await loadSecretsFromKeyVault();
  validateEnvironment();
  await initRedis();

  const { default: app } = await import("./app");

  server = app.listen(port, "0.0.0.0", (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    startFreshnessMonitor();

    const features = getEnabledFeatures();
    const buildPath = path.resolve(__dirname, "..", "..");

    logger.info({
      project: "SZL Holdings",
      mode: process.env.NODE_ENV || "development",
      port,
      host: "0.0.0.0",
      buildPath,
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

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.requestTimeout = 30000;
  server.maxHeadersCount = 100;
}

function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Received shutdown signal, closing server gracefully");
  if (!server) {
    process.exit(0);
    return;
  }

  server.close((err) => {
    if (err) {
      logger.error({ err }, "Error during graceful shutdown");
      process.exit(1);
    }
    logger.info("Server closed gracefully");
    process.exit(0);
  });

  setTimeout(() => {
    logger.warn("Graceful shutdown timed out after 15s, forcing exit");
    process.exit(1);
  }, 15000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
