import type { StripeProvider } from "../providers";
import { getStripeProvider } from "../providers/factory";
import { logger } from "../lib/logger";

export interface RevenueData {
  configured: boolean;
  totalRevenue: number;
  mrr: number;
  transactionCount: number;
  balanceAvailable?: number;
  balancePending?: number;
  currency?: string;
}

export interface TransactionData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  customer: string;
  created: string;
  receiptUrl: string | null;
}

export interface CheckoutResult {
  id: string;
  url: string;
}

const CONSULTATION_PRICES: Record<string, { name: string; amount: number }> = {
  strategy: { name: "Strategy Session", amount: 250000 },
  portfolio: { name: "Portfolio Review", amount: 850000 },
  retainer: { name: "Advisory Retainer", amount: 2500000 },
};

export class StripeService {
  private provider: StripeProvider;

  constructor(provider?: StripeProvider) {
    this.provider = provider || getStripeProvider();
  }

  isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  async getRevenue(): Promise<RevenueData> {
    if (!this.provider.isConfigured()) {
      return { configured: false, totalRevenue: 0, mrr: 0, transactionCount: 0 };
    }

    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    const [balance, charges, subscriptions] = await Promise.all([
      this.provider.getBalance(),
      this.provider.listCharges({ limit: 100, created: { gte: thirtyDaysAgo } }),
      this.provider.listSubscriptions({ status: "active", limit: 100 }),
    ]);

    const totalRevenue = charges.data.reduce(
      (sum: number, c: any) => sum + (c.status === "succeeded" ? c.amount : 0),
      0,
    );
    const mrr = subscriptions.data.reduce(
      (sum: number, s: any) => sum + (s.items?.data?.[0]?.price?.unit_amount || 0),
      0,
    );

    return {
      configured: true,
      totalRevenue: totalRevenue / 100,
      mrr: mrr / 100,
      transactionCount: charges.data.length,
      balanceAvailable: (balance?.available?.reduce((s: number, b: any) => s + b.amount, 0) || 0) / 100,
      balancePending: (balance?.pending?.reduce((s: number, b: any) => s + b.amount, 0) || 0) / 100,
      currency: balance?.available?.[0]?.currency || "usd",
    };
  }

  async getTransactions(limit: number): Promise<{ configured: boolean; transactions: TransactionData[]; hasMore: boolean }> {
    if (!this.provider.isConfigured()) {
      return { configured: false, transactions: [], hasMore: false };
    }

    const charges = await this.provider.listCharges({ limit: Math.min(limit, 100) });

    return {
      configured: true,
      transactions: charges.data.map((c: any) => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency,
        status: c.status,
        description: c.description || "Payment",
        customer: c.billing_details?.name || c.customer || "Unknown",
        created: new Date(c.created * 1000).toISOString(),
        receiptUrl: c.receipt_url,
      })),
      hasMore: charges.has_more,
    };
  }

  async createCheckoutSession(sessionType: string, origin: string): Promise<CheckoutResult | null> {
    const sessionConfig = CONSULTATION_PRICES[sessionType];
    if (!sessionConfig) return null;

    const result = await this.provider.createCheckoutSession({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Carlota Jo Consultation: ${sessionConfig.name}` },
            unit_amount: sessionConfig.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/carlota-jo/consultation?success=true`,
      cancel_url: `${origin}/carlota-jo/consultation?canceled=true`,
    });

    if (!result) return null;
    return { id: result.id, url: result.url };
  }

  processWebhook(payload: string | Buffer, signature: string, secret: string): { type: string; data: any } {
    return this.provider.constructWebhookEvent(payload, signature, secret);
  }
}

export const stripeService = new StripeService();
