export * from "./models/auth";

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export const links = pgTable("links", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  tags: text("tags"),
  userId: uuid("user_id").notNull().references(() => users.id),
  resolvedTitle: text("resolved_title"),
  givenTitle: text("given_title"),
  displayUrl: text("display_url"),
  topImageUrl: text("top_image_url"),
  givenUrl: text("given_url"),
  resolvedUrl: text("resolved_url"),
  domain: text("domain"),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  userId: uuid("user_id").unique().references(() => users.id),
  startDate: text("start_date"),
  endDate: text("end_date"),
  period: text("period"),
  status: text("status"),
  plan: text("plan"),
});

export const insertLinkSchema = createInsertSchema(links).omit({
  id: true,
  createdAt: true,
});

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;

export type Subscription = typeof subscriptions.$inferSelect;
