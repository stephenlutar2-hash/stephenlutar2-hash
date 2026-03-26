import { z } from "zod";
import { logger } from "./logger";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "PostgreSQL connection string is required"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DEMO_ADMIN_USERNAME: z.string().min(1).optional(),
  DEMO_ADMIN_PASSWORD: z.string().min(1).optional(),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).default(24),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  AZURE_KEY_VAULT_URL: z.string().url().optional(),
  AZURE_REDIS_URL: z.string().min(1).optional(),
  AZURE_STORAGE_CONNECTION_STRING: z.string().min(1).optional(),
  AZURE_STORAGE_ACCOUNT_NAME: z.string().min(1).optional(),
  PLAID_CLIENT_ID: z.string().min(1).optional(),
  PLAID_SECRET: z.string().min(1).optional(),
  PLAID_ENV: z.enum(["sandbox", "development", "production"]).default("sandbox"),
  META_APP_ID: z.string().min(1).optional(),
  META_APP_SECRET: z.string().min(1).optional(),
  TWITTER_API_KEY: z.string().min(1).optional(),
  TWITTER_API_SECRET: z.string().min(1).optional(),
  LINKEDIN_CLIENT_ID: z.string().min(1).optional(),
  LINKEDIN_CLIENT_SECRET: z.string().min(1).optional(),
  ENTRA_TENANT_ID: z.string().min(1).optional(),
  ENTRA_CLIENT_ID: z.string().min(1).optional(),
  MOCK_PROVIDERS: z.string().optional(),
  LYTE_MODE: z.enum(["live", "demo"]).default("demo"),
  LOG_LEVEL: z.string().default("info"),
  APPLICATIONINSIGHTS_CONNECTION_STRING: z.string().min(1).optional(),
});

export type AppConfig = z.infer<typeof envSchema>;

let _config: AppConfig | null = null;

export function validateEnvironment(): void {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    );
    logger.fatal({ issues }, `Environment validation failed: ${issues.join(", ")}`);
    process.exit(1);
  }

  _config = result.data;

  const optionalKeys: (keyof AppConfig)[] = [
    "DEMO_ADMIN_USERNAME",
    "DEMO_ADMIN_PASSWORD",
    "STRIPE_SECRET_KEY",
    "OPENAI_API_KEY",
    "AZURE_KEY_VAULT_URL",
    "AZURE_REDIS_URL",
    "PLAID_CLIENT_ID",
  ];

  const missing = optionalKeys.filter((k) => !result.data[k]);
  if (missing.length > 0) {
    logger.warn(
      { count: missing.length },
      `Optional environment variables not set: ${missing.join(", ")}`,
    );
  }

  logger.info("Environment validation passed");
}

export function getConfig(): AppConfig {
  if (!_config) {
    throw new Error("Configuration not initialized — call validateEnvironment() first");
  }
  return _config;
}
