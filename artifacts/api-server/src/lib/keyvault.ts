import type { SecretClient } from "@azure/keyvault-secrets";
import { logger } from "./logger";

let kvClient: SecretClient | null = null;
let kvInitialized = false;
const secretCache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function initKeyVault(): Promise<void> {
  if (kvInitialized) return;
  kvInitialized = true;

  const vaultUrl = process.env.AZURE_KEY_VAULT_URL;
  if (!vaultUrl) {
    logger.info("AZURE_KEY_VAULT_URL not set — using environment variables for secrets");
    return;
  }

  try {
    const { DefaultAzureCredential } = await import("@azure/identity");
    const { SecretClient: SC } = await import("@azure/keyvault-secrets");
    const credential = new DefaultAzureCredential();
    kvClient = new SC(vaultUrl, credential);
    logger.info({ vaultUrl }, "Azure Key Vault client initialized");
  } catch (err) {
    logger.error({ err }, "Failed to initialize Azure Key Vault client — falling back to env vars");
    kvClient = null;
  }
}

export async function getSecret(name: string, envFallback?: string): Promise<string | undefined> {
  await initKeyVault();

  if (kvClient) {
    const cached = secretCache.get(name);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    try {
      const secret = await kvClient.getSecret(name);
      if (secret.value) {
        secretCache.set(name, { value: secret.value, expiresAt: Date.now() + CACHE_TTL_MS });
        return secret.value;
      }
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode !== 404) {
        logger.warn({ err, secretName: name }, "Key Vault secret fetch failed — falling back to env");
      }
    }
  }

  const envKey = envFallback || name.replace(/-/g, "_").toUpperCase();
  return process.env[envKey];
}

export async function getRequiredSecret(name: string, envFallback?: string): Promise<string> {
  const value = await getSecret(name, envFallback);
  if (!value) {
    throw new Error(`Required secret '${name}' not found in Key Vault or environment`);
  }
  return value;
}

export function isKeyVaultConfigured(): boolean {
  return !!process.env.AZURE_KEY_VAULT_URL;
}
