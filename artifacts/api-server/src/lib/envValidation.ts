import { logger } from "./logger";

interface EnvVarSpec {
  name: string;
  required: boolean;
  description: string;
}

const REQUIRED_VARS: EnvVarSpec[] = [
  { name: "DATABASE_URL", required: true, description: "PostgreSQL connection string" },
];

const OPTIONAL_VARS: EnvVarSpec[] = [
  { name: "PORT", required: false, description: "HTTP server port" },
  { name: "NODE_ENV", required: false, description: "Runtime environment" },
  { name: "DEMO_ADMIN_USERNAME", required: false, description: "Demo admin username" },
  { name: "DEMO_ADMIN_PASSWORD", required: false, description: "Demo admin password" },
  { name: "STRIPE_SECRET_KEY", required: false, description: "Stripe API key" },
  { name: "OPENAI_API_KEY", required: false, description: "OpenAI API key" },
  { name: "AZURE_KEY_VAULT_URL", required: false, description: "Azure Key Vault URL" },
  { name: "AZURE_REDIS_URL", required: false, description: "Azure Redis connection string" },
];

export function validateEnvironment(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const spec of REQUIRED_VARS) {
    if (!process.env[spec.name]) {
      missing.push(`${spec.name} — ${spec.description}`);
    }
  }

  for (const spec of OPTIONAL_VARS) {
    if (!process.env[spec.name]) {
      warnings.push(`${spec.name} — ${spec.description}`);
    }
  }

  if (missing.length > 0) {
    logger.fatal(
      { missing },
      `Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }

  if (warnings.length > 0) {
    logger.warn(
      { count: warnings.length },
      `Optional environment variables not set: ${warnings.map((w) => w.split(" — ")[0]).join(", ")}`,
    );
  }

  const port = process.env.PORT;
  if (port) {
    const portNum = Number(port);
    if (Number.isNaN(portNum) || portNum <= 0 || portNum > 65535) {
      logger.fatal({ port }, "PORT must be a valid port number (1-65535)");
      process.exit(1);
    }
  }

  logger.info("Environment validation passed");
}
