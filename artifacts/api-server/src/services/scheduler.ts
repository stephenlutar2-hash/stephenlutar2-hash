import { db, isDatabaseAvailable } from "@szl-holdings/db";
import { socialPostsTable } from "@szl-holdings/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { getTokensFromDb, publishToplatform } from "./social-publish";

interface SchedulerState {
  running: boolean;
  paused: boolean;
  checking: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
  lastCheck: Date | null;
  nextCheck: Date | null;
  publishedCount: number;
  failedCount: number;
  checksCount: number;
}

const state: SchedulerState = {
  running: false,
  paused: false,
  checking: false,
  intervalId: null,
  lastCheck: null,
  nextCheck: null,
  publishedCount: 0,
  failedCount: 0,
  checksCount: 0,
};

const CHECK_INTERVAL_MS = 60_000;

export function startScheduler(): void {
  if (state.running) {
    logger.info("[Scheduler] Already running");
    return;
  }

  if (!isDatabaseAvailable()) {
    logger.warn("[Scheduler] Database not available, skipping start");
    return;
  }

  state.running = true;
  state.paused = false;
  state.nextCheck = new Date(Date.now() + CHECK_INTERVAL_MS);

  logger.info("[Scheduler] Started — checking every 60 seconds");

  state.intervalId = setInterval(async () => {
    if (state.paused) {
      state.nextCheck = new Date(Date.now() + CHECK_INTERVAL_MS);
      return;
    }
    await checkAndPublish();
    state.nextCheck = new Date(Date.now() + CHECK_INTERVAL_MS);
  }, CHECK_INTERVAL_MS);
}

export function stopScheduler(): void {
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.running = false;
  state.paused = false;
  state.nextCheck = null;
  logger.info("[Scheduler] Stopped");
}

export function pauseScheduler(): void {
  state.paused = true;
  logger.info("[Scheduler] Paused");
}

export function resumeScheduler(): void {
  state.paused = false;
  logger.info("[Scheduler] Resumed");
}

export async function getSchedulerStatus() {
  const counts = { pending: 0, published: 0, failed: 0 };

  try {
    const rows = await db
      .select({
        status: socialPostsTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(socialPostsTable)
      .where(
        sql`${socialPostsTable.status} IN ('scheduled', 'published', 'failed')`,
      )
      .groupBy(socialPostsTable.status);

    for (const row of rows) {
      if (row.status === "scheduled") counts.pending = row.count;
      else if (row.status === "published") counts.published = row.count;
      else if (row.status === "failed") counts.failed = row.count;
    }
  } catch {
    // fallback to in-memory counts if DB query fails
  }

  return {
    running: state.running,
    paused: state.paused,
    lastCheck: state.lastCheck?.toISOString() || null,
    nextCheck: state.nextCheck?.toISOString() || null,
    postsPending: counts.pending,
    postsPublished: counts.published,
    postsFailed: counts.failed,
    checksCount: state.checksCount,
  };
}

export async function checkAndPublish(): Promise<{
  checked: number;
  published: number;
  failed: number;
}> {
  const result = { checked: 0, published: 0, failed: 0 };

  if (state.checking) {
    logger.debug("[Scheduler] Check already in progress, skipping");
    return result;
  }

  state.checking = true;
  try {
    state.lastCheck = new Date();
    state.checksCount++;

    const now = new Date();
    const duePosts = await db
      .select()
      .from(socialPostsTable)
      .where(
        and(
          eq(socialPostsTable.status, "scheduled"),
          lte(socialPostsTable.scheduledAt, now),
        ),
      );

    result.checked = duePosts.length;

    if (duePosts.length === 0) {
      logger.debug("[Scheduler] No due posts found");
      return result;
    }

    logger.info(
      `[Scheduler] Found ${duePosts.length} due post(s) to publish`,
    );

    for (const post of duePosts) {
      try {
        const token = await getTokensFromDb(post.username, post.platform);

        if (!token) {
          await db
            .update(socialPostsTable)
            .set({
              status: "failed",
              errorMessage: `No connected ${post.platform} account found for user ${post.username}`,
              updatedAt: new Date(),
            })
            .where(eq(socialPostsTable.id, post.id));

          result.failed++;
          state.failedCount++;
          logger.error(
            `[Scheduler] No token for post #${post.id} on ${post.platform}`,
          );
          continue;
        }

        if (token.expiresAt && new Date(token.expiresAt).getTime() < Date.now()) {
          await db
            .update(socialPostsTable)
            .set({
              status: "failed",
              errorMessage: `${post.platform} token expired for user ${post.username}`,
              updatedAt: new Date(),
            })
            .where(eq(socialPostsTable.id, post.id));

          result.failed++;
          state.failedCount++;
          logger.error(
            `[Scheduler] Expired token for post #${post.id} on ${post.platform}`,
          );
          continue;
        }

        const publishResult = await publishToplatform(
          post.platform,
          token,
          post.content,
          post.mediaUrl,
        );

        if (publishResult.success) {
          await db
            .update(socialPostsTable)
            .set({
              status: "published",
              publishedAt: new Date(),
              externalPostId: publishResult.postId || null,
              errorMessage: null,
              updatedAt: new Date(),
            })
            .where(eq(socialPostsTable.id, post.id));

          result.published++;
          state.publishedCount++;
          logger.info(
            `[Scheduler] Published post #${post.id} on ${post.platform} (externalId: ${publishResult.postId})`,
          );
        } else {
          await db
            .update(socialPostsTable)
            .set({
              status: "failed",
              errorMessage: publishResult.error || "Unknown error",
              updatedAt: new Date(),
            })
            .where(eq(socialPostsTable.id, post.id));

          result.failed++;
          state.failedCount++;
          logger.error(
            `[Scheduler] Failed to publish post #${post.id} on ${post.platform}: ${publishResult.error}`,
          );
        }
      } catch (err: any) {
        await db
          .update(socialPostsTable)
          .set({
            status: "failed",
            errorMessage: err.message || "Unexpected error during publish",
            updatedAt: new Date(),
          })
          .where(eq(socialPostsTable.id, post.id));

        result.failed++;
        state.failedCount++;
        logger.error(
          `[Scheduler] Exception publishing post #${post.id}: ${err.message}`,
        );
      }
    }
  } catch (err: any) {
    logger.error(`[Scheduler] Check cycle error: ${err.message}`);
  } finally {
    state.checking = false;
  }

  return result;
}
