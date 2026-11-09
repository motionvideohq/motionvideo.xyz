import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./schema";

// One row per Create single export: one Dodo payment unlocking every export
// setting for one browser project until `expiresAt`. Rows are written only
// from payments re-read from the Dodo API, never from the client.
export const createPasses = sqliteTable(
  "create_pass",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Matches CreateTool in src/constants/create.ts.
    tool: text("tool", { enum: ["showcase"] }).notNull(),
    // Projects live in the buyer's browser; this is their local id and name.
    projectId: text("project_id").notNull(),
    projectName: text("project_name").notNull(),
    paymentId: text("payment_id").notNull().unique(),
    status: text("status", { enum: ["pending", "paid", "refunded"] })
      .notNull()
      .default("pending"),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("create_pass_user_idx").on(table.userId),
    index("create_pass_project_idx").on(
      table.userId,
      table.tool,
      table.projectId
    ),
  ]
);
