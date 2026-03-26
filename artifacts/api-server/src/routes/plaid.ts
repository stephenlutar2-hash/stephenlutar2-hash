import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "./auth";
import { validateBody } from "../middleware/validate";
import type { AuthenticatedRequest } from "../types";

const exchangeTokenSchema = z.object({
  publicToken: z.string().min(1),
});

const router = Router();

router.get("/plaid/health", (_req, res) => {
  res.json({ ok: true, group: "plaid", configured: !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET), timestamp: new Date().toISOString() });
});

function getPlaidClient() {
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
    return new PlaidApi(configuration);
  } catch {
    return null;
  }
}

const accessTokensByUser: Map<string, Map<string, string>> = new Map();

function getUserTokens(username: string): Map<string, string> {
  if (!accessTokensByUser.has(username)) {
    accessTokensByUser.set(username, new Map());
  }
  return accessTokensByUser.get(username)!;
}

router.get("/plaid/status", requireAuth, (req, res) => {
  const configured = !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
  const username = (req as AuthenticatedRequest).user?.username || "unknown";
  const userTokens = getUserTokens(username);
  return res.json({
    configured,
    environment: process.env.PLAID_ENV || "sandbox",
    connectedAccounts: userTokens.size,
    message: configured
      ? "Plaid is connected"
      : "Plaid is not configured. Set PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV to enable banking.",
  });
});

router.post("/plaid/create-link-token", requireAuth, async (req, res) => {
  try {
    const client = getPlaidClient();
    if (!client) {
      return res.status(400).json({
        configured: false,
        error: "Plaid is not configured",
      });
    }

    const { CountryCode, Products } = require("plaid");
    const response = await client.linkTokenCreate({
      user: { client_user_id: (req as AuthenticatedRequest).user?.username || "szl-user" },
      client_name: "SZL Holdings - Lutar",
      products: [Products.Transactions, Products.Auth],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return res.json({ linkToken: response.data.link_token });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to create link token" });
  }
});

router.post("/plaid/exchange-token", requireAuth, validateBody(exchangeTokenSchema), async (req, res) => {
  try {
    const client = getPlaidClient();
    if (!client) {
      return res.status(400).json({ configured: false, error: "Plaid is not configured" });
    }

    const { publicToken } = req.body;

    const response = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    const username = (req as AuthenticatedRequest).user?.username || "unknown";
    const userTokens = getUserTokens(username);
    userTokens.set(itemId, accessToken);

    return res.json({ itemId, connected: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to exchange token" });
  }
});

router.get("/plaid/accounts", requireAuth, async (req, res) => {
  try {
    const client = getPlaidClient();
    if (!client) {
      return res.json({ configured: false, accounts: [] });
    }

    const username = (req as AuthenticatedRequest).user?.username || "unknown";
    const userTokens = getUserTokens(username);
    const allAccounts: any[] = [];
    for (const [itemId, accessToken] of userTokens.entries()) {
      try {
        const response = await client.accountsGet({ access_token: accessToken });
        allAccounts.push(
          ...response.data.accounts.map((a: any) => ({
            id: a.account_id,
            itemId,
            name: a.name,
            officialName: a.official_name,
            type: a.type,
            subtype: a.subtype,
            balanceCurrent: a.balances?.current,
            balanceAvailable: a.balances?.available,
            currency: a.balances?.iso_currency_code || "USD",
            mask: a.mask,
          }))
        );
      } catch (err: any) {
        console.error(`[Plaid] Failed to fetch accounts for item ${itemId}:`, err.message);
      }
    }

    return res.json({
      configured: true,
      accounts: allAccounts,
      connectedInstitutions: userTokens.size,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to fetch accounts" });
  }
});

router.get("/plaid/transactions", requireAuth, async (req, res) => {
  try {
    const client = getPlaidClient();
    if (!client) {
      return res.json({ configured: false, transactions: [] });
    }

    const username = (req as AuthenticatedRequest).user?.username || "unknown";
    const userTokens = getUserTokens(username);
    const allTransactions: any[] = [];
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    for (const [, accessToken] of userTokens.entries()) {
      try {
        const response = await client.transactionsGet({
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
          options: { count: 50 },
        });
        allTransactions.push(
          ...response.data.transactions.map((t: any) => ({
            id: t.transaction_id,
            name: t.name,
            amount: t.amount,
            date: t.date,
            category: t.category?.join(", ") || "Uncategorized",
            merchantName: t.merchant_name,
            pending: t.pending,
            accountId: t.account_id,
          }))
        );
      } catch (err: any) {
        console.error("[Plaid] Failed to fetch transactions:", err.message);
      }
    }

    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.json({
      configured: true,
      transactions: allTransactions.slice(0, 50),
      totalCount: allTransactions.length,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to fetch transactions" });
  }
});

export default router;
