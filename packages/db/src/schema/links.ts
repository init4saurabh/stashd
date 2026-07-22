import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { collectionsTable } from "./collections";
import { user } from "./auth";

export const linksTable = pgTable("links", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull().default(""),
  description: text("description"),
  imageUrl: text("image_url"),
  siteName: text("site_name"),
  favicon: text("favicon"),
  aiSummary: text("ai_summary"),
  readingTimeMinutes: integer("reading_time_minutes"),
  status: text("status").notNull().default("to_read"),
  tags: text("tags").array().notNull().default([]),
  collectionId: integer("collection_id").references(() => collectionsTable.id, {
    onDelete: "set null",
  }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertLinkSchema = createInsertSchema(linksTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof linksTable.$inferSelect;