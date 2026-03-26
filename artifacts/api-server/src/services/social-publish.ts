import { db } from "@szl-holdings/db";
import { socialTokensTable } from "@szl-holdings/db/schema";
import { eq, and } from "drizzle-orm";

export interface PublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  userId?: string | null;
  pageId?: string | null;
  pageToken?: string | null;
}

export async function getTokensFromDb(
  username: string,
  platform: string,
): Promise<TokenInfo | null> {
  const rows = await db
    .select()
    .from(socialTokensTable)
    .where(
      and(
        eq(socialTokensTable.username, username),
        eq(socialTokensTable.platform, platform),
        eq(socialTokensTable.connected, true),
      ),
    )
    .limit(1);

  if (!rows[0]) return null;

  const row = rows[0];
  return {
    accessToken: row.accessToken,
    refreshToken: row.refreshToken,
    expiresAt: row.expiresAt,
    userId: row.userId,
    pageId: row.pageId,
    pageToken: row.pageToken,
  };
}

export async function saveTokensToDb(
  username: string,
  platform: string,
  tokens: TokenInfo,
): Promise<void> {
  const existing = await db
    .select()
    .from(socialTokensTable)
    .where(
      and(
        eq(socialTokensTable.username, username),
        eq(socialTokensTable.platform, platform),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(socialTokensTable)
      .set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || null,
        expiresAt: tokens.expiresAt || null,
        userId: tokens.userId || null,
        pageId: tokens.pageId || null,
        pageToken: tokens.pageToken || null,
        connected: true,
        updatedAt: new Date(),
      })
      .where(eq(socialTokensTable.id, existing[0].id));
  } else {
    await db.insert(socialTokensTable).values({
      username,
      platform,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || null,
      expiresAt: tokens.expiresAt || null,
      userId: tokens.userId || null,
      pageId: tokens.pageId || null,
      pageToken: tokens.pageToken || null,
      connected: true,
    });
  }
}

export async function publishToplatform(
  platform: string,
  token: TokenInfo,
  content: string,
  mediaUrl?: string | null,
): Promise<PublishResult> {
  switch (platform) {
    case "meta":
      return publishToMeta(token, content, mediaUrl);
    case "twitter":
      return publishToTwitter(token, content);
    case "linkedin":
      return publishToLinkedIn(token, content);
    default:
      return { success: false, error: `Unsupported platform: ${platform}` };
  }
}

async function publishToMeta(
  token: TokenInfo,
  content: string,
  mediaUrl?: string | null,
): Promise<PublishResult> {
  const pageToken = token.pageToken || token.accessToken;
  const pageId = token.pageId;

  if (!pageId) {
    return { success: false, error: "No Facebook Page ID found" };
  }

  const url = mediaUrl
    ? `https://graph.facebook.com/v18.0/${pageId}/photos`
    : `https://graph.facebook.com/v18.0/${pageId}/feed`;

  const body: Record<string, string> = { access_token: pageToken };
  if (mediaUrl) {
    body.url = mediaUrl;
    body.caption = content;
  } else {
    body.message = content;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data.error?.message || "Meta API error" };
  }

  return { success: true, postId: data.id };
}

async function publishToTwitter(
  token: TokenInfo,
  content: string,
): Promise<PublishResult> {
  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: content }),
  });
  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.detail || data.title || "Twitter API error",
    };
  }

  return { success: true, postId: data.data?.id };
}

async function publishToLinkedIn(
  token: TokenInfo,
  content: string,
): Promise<PublishResult> {
  if (!token.userId) {
    return { success: false, error: "No LinkedIn user ID found" };
  }

  const personUrn = `urn:li:person:${token.userId}`;

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data.message || "LinkedIn API error" };
  }

  return { success: true, postId: data.id };
}
