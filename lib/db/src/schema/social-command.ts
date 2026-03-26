import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const socialPostsTable = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  status: text("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  externalPostId: text("external_post_id"),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  reach: integer("reach").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSocialPostSchema = createInsertSchema(socialPostsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type SocialPost = typeof socialPostsTable.$inferSelect;

export const socialTokensTable = pgTable("social_tokens", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  platform: text("platform").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  userId: text("user_id"),
  pageId: text("page_id"),
  pageToken: text("page_token"),
  connected: boolean("connected").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSocialTokenSchema = createInsertSchema(socialTokensTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSocialToken = z.infer<typeof insertSocialTokenSchema>;
export type SocialToken = typeof socialTokensTable.$inferSelect;

export const contentTemplatesTable = pgTable("content_templates", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("general"),
  platform: text("platform"),
  content: text("content").notNull(),
  tags: text("tags"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertContentTemplateSchema = createInsertSchema(contentTemplatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContentTemplate = z.infer<typeof insertContentTemplateSchema>;
export type ContentTemplate = typeof contentTemplatesTable.$inferSelect;

export const brandAssetsTable = pgTable("brand_assets", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  value: text("value").notNull(),
  category: text("category").notNull().default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBrandAssetSchema = createInsertSchema(brandAssetsTable).omit({ id: true, createdAt: true });
export type InsertBrandAsset = z.infer<typeof insertBrandAssetSchema>;
export type BrandAsset = typeof brandAssetsTable.$inferSelect;
