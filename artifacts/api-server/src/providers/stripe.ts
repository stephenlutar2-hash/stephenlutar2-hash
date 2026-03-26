import Stripe from "stripe";
import type { StripeProvider } from "./index";
import { logger } from "../lib/logger";

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found for repl/depl");
  }

  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", "stripe");
  url.searchParams.set("environment", targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-Replit-Token": xReplitToken,
    },
  });

  const data = await response.json();
  connectionSettings = data.items?.[0];

  if (
    !connectionSettings ||
    !connectionSettings.settings.publishable ||
    !connectionSettings.settings.secret
  ) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }

  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret,
  };
}

async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, {
    apiVersion: "2025-04-30.basil" as any,
  });
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export class LiveStripeProvider implements StripeProvider {
  isConfigured(): boolean {
    return !!process.env.REPLIT_CONNECTORS_HOSTNAME;
  }

  async getBalance(): Promise<any> {
    try {
      const client = await getUncachableStripeClient();
      return client.balance.retrieve();
    } catch (err) {
      logger.warn({ err }, "Stripe getBalance failed");
      return null;
    }
  }

  async listCharges(options: { limit: number; created?: { gte: number } }): Promise<any> {
    try {
      const client = await getUncachableStripeClient();
      return client.charges.list(options);
    } catch (err) {
      logger.warn({ err }, "Stripe listCharges failed");
      return { data: [], has_more: false };
    }
  }

  async listSubscriptions(options: { status: string; limit: number }): Promise<any> {
    try {
      const client = await getUncachableStripeClient();
      return client.subscriptions.list(options as any);
    } catch (err) {
      logger.warn({ err }, "Stripe listSubscriptions failed");
      return { data: [] };
    }
  }

  async createCheckoutSession(params: any): Promise<any> {
    try {
      const client = await getUncachableStripeClient();
      return client.checkout.sessions.create(params);
    } catch (err) {
      logger.warn({ err }, "Stripe createCheckoutSession failed");
      return null;
    }
  }

  constructWebhookEvent(payload: string | Buffer, sig: string, secret: string): any {
    const stripe = new Stripe(secret, { apiVersion: "2025-04-30.basil" as any });
    return stripe.webhooks.constructEvent(payload, sig, secret);
  }
}

export class MockStripeProvider implements StripeProvider {
  isConfigured(): boolean {
    return true;
  }

  async getBalance(): Promise<any> {
    return {
      available: [{ amount: 250000, currency: "usd" }],
      pending: [{ amount: 45000, currency: "usd" }],
    };
  }

  async listCharges(options: { limit: number; created?: { gte: number } }): Promise<any> {
    return {
      data: [
        { id: "ch_mock_1", amount: 250000, currency: "usd", status: "succeeded", description: "Mock charge", billing_details: { name: "Demo User" }, created: Math.floor(Date.now() / 1000), receipt_url: null },
        { id: "ch_mock_2", amount: 85000, currency: "usd", status: "succeeded", description: "Mock charge", billing_details: { name: "Test User" }, created: Math.floor(Date.now() / 1000) - 86400, receipt_url: null },
      ].slice(0, options.limit),
      has_more: false,
    };
  }

  async listSubscriptions(_options: { status: string; limit: number }): Promise<any> {
    return {
      data: [
        { id: "sub_mock_1", items: { data: [{ price: { unit_amount: 2500 } }] } },
      ],
    };
  }

  async createCheckoutSession(params: any): Promise<any> {
    return {
      id: "cs_mock_" + Date.now(),
      url: params.success_url || "https://example.com/success",
    };
  }

  constructWebhookEvent(payload: string | Buffer, _sig: string, _secret: string): any {
    const body = typeof payload === "string" ? JSON.parse(payload) : JSON.parse(payload.toString());
    return { type: body.type || "mock.event", data: body.data || {} };
  }
}
