export function validateEnv(required: string[]): void {
  const missing = required.filter((key) => !import.meta.env[key] && !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

export function getEnv(key: string, fallback?: string): string {
  const value = import.meta.env?.[key] ?? process.env?.[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}
