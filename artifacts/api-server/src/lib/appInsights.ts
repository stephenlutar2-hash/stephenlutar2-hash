let client: any = null;
let initialized = false;

export function initAppInsights(): void {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connectionString) {
    console.log("[AppInsights] No connection string configured — telemetry disabled");
    return;
  }

  try {
    const appInsights = require("applicationinsights");
    appInsights
      .setup(connectionString)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(false)
      .setUseDiskRetryCaching(true)
      .start();

    client = appInsights.defaultClient;
    initialized = true;
    console.log("[AppInsights] Telemetry initialized successfully");
  } catch (err) {
    console.error("[AppInsights] Failed to initialize:", err);
  }
}

export function isAppInsightsConfigured(): boolean {
  return initialized && client !== null;
}

export function getClient(): any {
  return client;
}

export function trackEvent(name: string, properties?: Record<string, string>): void {
  client?.trackEvent({ name, properties });
}

export function trackException(error: Error): void {
  client?.trackException({ exception: error });
}

export function getHealthSummary(): Record<string, any> {
  if (!initialized || !client) {
    return {
      configured: false,
      message: "Application Insights is not configured. Set APPLICATIONINSIGHTS_CONNECTION_STRING to enable telemetry.",
    };
  }

  return {
    configured: true,
    status: "active",
    autoCollection: {
      requests: true,
      performance: true,
      exceptions: true,
      dependencies: true,
    },
    connectionStringSet: true,
  };
}
