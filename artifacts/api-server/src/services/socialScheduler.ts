import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { socialPostsTable, socialTokensTable } from "@szl-holdings/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
const POLL_INTERVAL_MS = 60_000;

async function getValidTokenForPost(username: string, platform: string): Promise<string | null> {
  if (!isDatabaseAvailable || !db) return null;
  try {
    const [row] = await db
      .select()
      .from(socialTokensTable)
      .where(and(eq(socialTokensTable.username, username), eq(socialTokensTable.platform, platform)));
    if (!row?.tokenData) return null;
    const tokens = row.tokenData as any;
    if (tokens.expiresAt && tokens.expiresAt < Date.now()) return null;
    return tokens.accessToken || null;
  } catch {
    return null;
  }
}

async function publishPost(post: any, token: string): Promise<{ success: boolean; externalPostId?: string; error?: string }> {
  const content = post.content || "";
  const platform = post.platform;

  try {
    if (platform === "twitter") {
      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: content.slice(0, 280) }),
      });
      const data: any = await response.json();
      if (!response.ok) return { success: false, error: data.detail || "Twitter API error" };
      return { success: true, externalPostId: data.data?.id };
    }

    if (platform === "meta") {
      const [tokenRow] = await db!
        .select()
        .from(socialTokensTable)
        .where(and(eq(socialTokensTable.username, post.username), eq(socialTokensTable.platform, "meta")));
      const tokens = (tokenRow?.tokenData as any) || {};
      const pageToken = tokens.pageToken || tokens.accessToken;
      const pageId = tokens.pageId;
      if (!pageId || !pageToken) return { success: false, error: "No Meta page configured" };

      const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, access_token: pageToken }),
      });
      const data: any = await response.json();
      if (!response.ok) return { success: false, error: data.error?.message || "Meta API error" };
      return { success: true, externalPostId: data.id };
    }

    if (platform === "linkedin") {
      const [tokenRow] = await db!
        .select()
        .from(socialTokensTable)
        .where(and(eq(socialTokensTable.username, post.username), eq(socialTokensTable.platform, "linkedin")));
      const tokens = (tokenRow?.tokenData as any) || {};
      const personUrn = `urn:li:person:${tokens.userId}`;

      const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      });
      const data: any = await response.json();
      if (!response.ok) return { success: false, error: data.message || "LinkedIn API error" };
      return { success: true, externalPostId: data.id };
    }

    if (platform === "medium") {
      const [tokenRow] = await db!
        .select()
        .from(socialTokensTable)
        .where(and(eq(socialTokensTable.username, post.username), eq(socialTokensTable.platform, "medium")));
      const tokens = (tokenRow?.tokenData as any) || {};
      const userId = tokens.userId;
      if (!userId) return { success: false, error: "Medium user not found" };

      const title = content.split("\n")[0].replace(/^#\s*/, "").trim() || "SZL Holdings Update";
      const response = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          contentFormat: "markdown",
          content,
          publishStatus: "public",
          tags: ["SZLHoldings", "Innovation", "Technology"],
        }),
      });
      const data: any = await response.json();
      if (!response.ok) return { success: false, error: data.errors?.[0]?.message || "Medium API error" };
      return { success: true, externalPostId: data.data?.id };
    }

    return { success: false, error: `Automated publishing not supported for ${platform}` };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function processDuePosts() {
  if (!isDatabaseAvailable || !db) return;

  try {
    const now = new Date();
    const duePosts = await db
      .select()
      .from(socialPostsTable)
      .where(
        and(
          eq(socialPostsTable.status, "scheduled"),
          lte(socialPostsTable.scheduledAt, now)
        )
      )
      .limit(20);

    for (const post of duePosts) {
      const token = await getValidTokenForPost(post.username, post.platform);
      if (!token) {
        await db
          .update(socialPostsTable)
          .set({ status: "failed" })
          .where(eq(socialPostsTable.id, post.id));
        console.log(`[Scheduler] Post ${post.id} failed: no valid token for ${post.platform}`);
        continue;
      }

      const result = await publishPost(post, token);
      if (result.success) {
        await db
          .update(socialPostsTable)
          .set({
            status: "published",
            publishedAt: new Date(),
            externalPostId: result.externalPostId || null,
          })
          .where(eq(socialPostsTable.id, post.id));
        console.log(`[Scheduler] Post ${post.id} published to ${post.platform}`);
      } else {
        await db
          .update(socialPostsTable)
          .set({ status: "failed" })
          .where(eq(socialPostsTable.id, post.id));
        console.log(`[Scheduler] Post ${post.id} failed on ${post.platform}: ${result.error}`);
      }
    }
  } catch (e: any) {
    console.error("[Scheduler] Error processing due posts:", e.message);
  }
}

export function startScheduler() {
  if (schedulerInterval) return;
  console.log("[Scheduler] Starting social media scheduler (polling every 60s)");
  schedulerInterval = setInterval(processDuePosts, POLL_INTERVAL_MS);
  processDuePosts();
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[Scheduler] Stopped social media scheduler");
  }
}
