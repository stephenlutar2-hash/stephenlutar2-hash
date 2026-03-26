import type { PlaidProvider } from "./index";

export class LivePlaidProvider implements PlaidProvider {
  private client: any = null;

  private getClient(): any {
    if (this.client) return this.client;
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    if (!clientId || !secret) return null;
    try {
      const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
      const env = process.env.PLAID_ENV || "sandbox";
      const configuration = new Configuration({
        basePath: PlaidEnvironments[env],
        baseOptions: {
          headers: {
            "PLAID-CLIENT-ID": clientId,
            "PLAID-SECRET": secret,
          },
        },
      });
      this.client = new PlaidApi(configuration);
      return this.client;
    } catch {
      return null;
    }
  }

  isConfigured(): boolean {
    return !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
  }

  async createLinkToken(userId: string): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;
    const { CountryCode, Products } = require("plaid");
    const response = await client.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "SZL Holdings - Lutar",
      products: [Products.Transactions, Products.Auth],
      country_codes: [CountryCode.Us],
      language: "en",
    });
    return response.data.link_token;
  }

  async exchangePublicToken(publicToken: string): Promise<{ accessToken: string; itemId: string } | null> {
    const client = this.getClient();
    if (!client) return null;
    const response = await client.itemPublicTokenExchange({ public_token: publicToken });
    return { accessToken: response.data.access_token, itemId: response.data.item_id };
  }

  async getAccounts(accessToken: string): Promise<any[]> {
    const client = this.getClient();
    if (!client) return [];
    const response = await client.accountsGet({ access_token: accessToken });
    return response.data.accounts.map((a: any) => ({
      id: a.account_id,
      name: a.name,
      officialName: a.official_name,
      type: a.type,
      subtype: a.subtype,
      balanceCurrent: a.balances?.current,
      balanceAvailable: a.balances?.available,
      currency: a.balances?.iso_currency_code || "USD",
      mask: a.mask,
    }));
  }

  async getTransactions(accessToken: string, startDate: string, endDate: string, count: number): Promise<any[]> {
    const client = this.getClient();
    if (!client) return [];
    const response = await client.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: { count },
    });
    return response.data.transactions.map((t: any) => ({
      id: t.transaction_id,
      name: t.name,
      amount: t.amount,
      date: t.date,
      category: t.category?.join(", ") || "Uncategorized",
      merchantName: t.merchant_name,
      pending: t.pending,
      accountId: t.account_id,
    }));
  }
}

export class MockPlaidProvider implements PlaidProvider {
  isConfigured(): boolean {
    return true;
  }

  async createLinkToken(_userId: string): Promise<string | null> {
    return "mock-link-token-" + Date.now();
  }

  async exchangePublicToken(_publicToken: string): Promise<{ accessToken: string; itemId: string } | null> {
    return { accessToken: "mock-access-token", itemId: "mock-item-id" };
  }

  async getAccounts(_accessToken: string): Promise<any[]> {
    return [
      { id: "mock-acc-1", name: "Mock Checking", officialName: "Mock Checking Account", type: "depository", subtype: "checking", balanceCurrent: 5420.50, balanceAvailable: 5120.00, currency: "USD", mask: "1234" },
      { id: "mock-acc-2", name: "Mock Savings", officialName: "Mock Savings Account", type: "depository", subtype: "savings", balanceCurrent: 28750.00, balanceAvailable: 28750.00, currency: "USD", mask: "5678" },
    ];
  }

  async getTransactions(_accessToken: string, _startDate: string, _endDate: string, _count: number): Promise<any[]> {
    return [
      { id: "mock-txn-1", name: "Mock Coffee Shop", amount: -4.50, date: new Date().toISOString().split("T")[0], category: "Food and Drink", merchantName: "Mock Coffee", pending: false, accountId: "mock-acc-1" },
      { id: "mock-txn-2", name: "Mock Grocery", amount: -67.23, date: new Date().toISOString().split("T")[0], category: "Shops", merchantName: "Mock Grocery", pending: false, accountId: "mock-acc-1" },
    ];
  }
}
