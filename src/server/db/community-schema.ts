import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const newsletterSubscribers = sqliteTable("newsletter_subscriber", {
  email: text("email").primaryKey(),
  newsletterConsentAt: integer("newsletter_consent_at", {
    mode: "timestamp_ms",
  }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const communitySubmissions = sqliteTable("community_submission", {
  id: text("id").primaryKey(),
  // Matches SUBMISSION_KINDS in src/lib/community.ts.
  kind: text("kind", {
    enum: ["video", "tool", "studio", "skill", "extra"],
  }).notNull(),
  // Gallery or directory category slug, checked against the kind on submit.
  category: text("category"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt"),
  attributionConsentAt: integer("attribution_consent_at", {
    mode: "timestamp_ms",
  }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  status: text("status", { enum: ["pending"] })
    .notNull()
    .default("pending"),
});
