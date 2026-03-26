import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const newsletterSubscribersTable = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("website"),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribersTable.$inferSelect;
