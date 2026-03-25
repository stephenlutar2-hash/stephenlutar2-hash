import { getSecret } from "./keyvault";
import { logger } from "./logger";

let initialized = false;

export async function loadSecretsFromKeyVault(): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (!process.env.AZURE_KEY_VAULT_URL) {
    logger.info("Key Vault not configured — using environment variables directly");
    return;
  }

  logger.info("Loading secrets from Azure Key Vault...");

  const secretMappings: Array<{ kvName: string; envKey: string }> = [
    { kvName: "database-url", envKey: "DATABASE_URL" },
    { kvName: "stripe-secret-key", envKey: "STRIPE_SECRET_KEY" },
    { kvName: "stripe-webhook-secret", envKey: "STRIPE_WEBHOOK_SECRET" },
    { kvName: "plaid-client-id", envKey: "PLAID_CLIENT_ID" },
    { kvName: "plaid-secret", envKey: "PLAID_SECRET" },
    { kvName: "plaid-env", envKey: "PLAID_ENV" },
    { kvName: "meta-app-id", envKey: "META_APP_ID" },
    { kvName: "meta-app-secret", envKey: "META_APP_SECRET" },
    { kvName: "twitter-api-key", envKey: "TWITTER_API_KEY" },
    { kvName: "twitter-api-secret", envKey: "TWITTER_API_SECRET" },
    { kvName: "linkedin-client-id", envKey: "LINKEDIN_CLIENT_ID" },
    { kvName: "linkedin-client-secret", envKey: "LINKEDIN_CLIENT_SECRET" },
    { kvName: "demo-admin-username", envKey: "DEMO_ADMIN_USERNAME" },
    { kvName: "demo-admin-password", envKey: "DEMO_ADMIN_PASSWORD" },
    { kvName: "entra-tenant-id", envKey: "ENTRA_TENANT_ID" },
    { kvName: "entra-client-id", envKey: "ENTRA_CLIENT_ID" },
    { kvName: "session-ttl-hours", envKey: "SESSION_TTL_HOURS" },
    { kvName: "azure-redis-url", envKey: "AZURE_REDIS_URL" },
    { kvName: "azure-storage-connection-string", envKey: "AZURE_STORAGE_CONNECTION_STRING" },
  ];

  let loaded = 0;
  for (const { kvName, envKey } of secretMappings) {
    if (process.env[envKey]) continue;

    try {
      const value = await getSecret(kvName, envKey);
      if (value && value !== process.env[envKey]) {
        process.env[envKey] = value;
        loaded++;
      }
    } catch {
      // Secret not found in KV — will use env fallback or remain unset
    }
  }

  logger.info({ loaded, total: secretMappings.length }, "Key Vault secrets loaded");
}
