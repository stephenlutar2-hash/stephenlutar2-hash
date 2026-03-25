import { ConfidentialClientApplication } from "@azure/msal-node";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const TENANT_ID = process.env.ENTRA_TENANT_ID || "";
const CLIENT_ID = process.env.ENTRA_CLIENT_ID || "";
const CLIENT_SECRET = process.env.ENTRA_CLIENT_SECRET || "";

export function isEntraConfigured(): boolean {
  return !!(TENANT_ID && CLIENT_ID);
}

export function getEntraPublicConfig() {
  if (!isEntraConfigured()) return null;
  return {
    tenantId: TENANT_ID,
    clientId: CLIENT_ID,
    authority: `https://${TENANT_ID}.ciamlogin.com/${TENANT_ID}`,
    scopes: ["openid", "profile", "email"],
  };
}

let msalInstance: ConfidentialClientApplication | null = null;

export function getMsalInstance(): ConfidentialClientApplication | null {
  if (!isEntraConfigured() || !CLIENT_SECRET) return null;
  if (!msalInstance) {
    msalInstance = new ConfidentialClientApplication({
      auth: {
        clientId: CLIENT_ID,
        authority: `https://${TENANT_ID}.ciamlogin.com/${TENANT_ID}`,
        clientSecret: CLIENT_SECRET,
      },
    });
  }
  return msalInstance;
}

const jwksClients = new Map<string, jwksClient.JwksClient>();

function getJwksClient(): jwksClient.JwksClient | null {
  if (!TENANT_ID) return null;
  const jwksUri = `https://${TENANT_ID}.ciamlogin.com/${TENANT_ID}/discovery/v2.0/keys`;
  if (!jwksClients.has(jwksUri)) {
    jwksClients.set(
      jwksUri,
      jwksClient({
        jwksUri,
        cache: true,
        cacheMaxAge: 86400000,
        rateLimit: true,
      }),
    );
  }
  return jwksClients.get(jwksUri)!;
}

export async function validateEntraToken(
  token: string,
): Promise<{ valid: true; claims: jwt.JwtPayload } | { valid: false; error: string }> {
  if (!isEntraConfigured()) {
    return { valid: false, error: "Entra External ID is not configured" };
  }

  const client = getJwksClient();
  if (!client) {
    return { valid: false, error: "JWKS client unavailable" };
  }

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header.kid) {
      return { valid: false, error: "Invalid token format" };
    }

    const key = await client.getSigningKey(decoded.header.kid);
    const publicKey = key.getPublicKey();

    const claims = jwt.verify(token, publicKey, {
      audience: CLIENT_ID,
      issuer: `https://${TENANT_ID}.ciamlogin.com/${TENANT_ID}/v2.0`,
      algorithms: ["RS256"],
    }) as jwt.JwtPayload;

    return { valid: true, claims };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Token validation failed";
    return { valid: false, error: message };
  }
}
