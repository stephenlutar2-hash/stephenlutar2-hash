import type { StripeProvider } from "./index";

export class LiveStripeProvider implements StripeProvider {
  private client: any = null;

  private getClient(): any {
    if (this.client) return this.client;
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return null;
    try {
      const Stripe = require("stripe");
      this.client = new Stripe(key);
      return this.client;
    } catch {
      return null;
    }
  }

  isConfigured(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
  }

  async getBalance(): Promise<any> {
    const client = this.getClient();
    if (!client) return null;
    return client.balance.retrieve();
  }

  async listCharges(options: { limit: number; created?: { gte: number } }): Promise<any> {
    const client = this.getClient();
    if (!client) return { data: [], has_more: false };
    return client.charges.list(options);
  }

  async listSubscriptions(options: { status: string; limit: number }): Promise<any> {
    const client = this.getClient();
    if (!client) return { data: [] };
    return client.subscriptions.list(options);
  }

  async createCheckoutSession(params: any): Promise<any> {
    const client = this.getClient();
    if (!client) return null;
    return client.checkout.sessions.create(params);
  }

  constructWebhookEvent(payload: string | Buffer, sig: string, secret: string): any {
    const client = this.getClient();
    if (!client) throw new Error("Stripe not configured");
    return client.webhooks.constructEvent(payload, sig, secret);
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
