export interface CacheProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

export interface BlobStorageProvider {
  upload(container: string, blob: string, content: Buffer | string, contentType?: string): Promise<string | null>;
  download(container: string, blob: string): Promise<Buffer | null>;
  remove(container: string, blob: string): Promise<boolean>;
  list(container: string, prefix?: string): Promise<string[]>;
  getUrl(container: string, blob: string, expiresInMinutes?: number): Promise<string | null>;
}

export interface StripeProvider {
  isConfigured(): boolean;
  getBalance(): Promise<any>;
  listCharges(options: { limit: number; created?: { gte: number } }): Promise<any>;
  listSubscriptions(options: { status: string; limit: number }): Promise<any>;
  createCheckoutSession(params: any): Promise<any>;
  constructWebhookEvent(payload: string | Buffer, sig: string, secret: string): any;
}

export interface PlaidProvider {
  isConfigured(): boolean;
  createLinkToken(userId: string): Promise<string | null>;
  exchangePublicToken(publicToken: string): Promise<{ accessToken: string; itemId: string } | null>;
  getAccounts(accessToken: string): Promise<any[]>;
  getTransactions(accessToken: string, startDate: string, endDate: string, count: number): Promise<any[]>;
}

export type MockProviderName = "redis" | "stripe" | "plaid" | "blob";

export function getMockedProviders(): Set<MockProviderName> {
  const raw = process.env.MOCK_PROVIDERS || "";
  if (!raw) return new Set();
  return new Set(
    raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) as MockProviderName[],
  );
}
