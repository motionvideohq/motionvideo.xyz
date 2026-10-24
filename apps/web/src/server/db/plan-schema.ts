import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { user } from "./schema";

// One row per MotionVideo Pro or Business purchase: a Dodo subscription
// (monthly, annual) or a one-time payment (lifetime). Created by the first
// sync once Dodo has it; every field mirrors Dodo (re-read from the API on
// every webhook, so delivery order never matters). Access is derived from
// `status` and `periodEnd` at read time (src/server/plans.ts).
export const planSubscriptions = sqliteTable(
  "plan_subscription",
  {
    id: text("id").primaryKey(),
    // The account that checked out; null only if it is deleted after paying.
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    // The email Dodo charged, lowercased.
    email: text("email").notNull(),
    // Matches Plan and PlanBilling in src/constants/plans.ts.
    plan: text("plan", { enum: ["pro", "business"] }).notNull(),
    billing: text("billing", {
      enum: ["monthly", "annual", "lifetime"],
    }).notNull(),
    // Subscriptions: Dodo's SubscriptionStatus. Lifetime: "paid", then
    // "refunded" after a full refund.
    status: text("status", {
      enum: [
        "pending",
        "active",
        "on_hold",
        "paused",
        "cancelled",
        "failed",
        "expired",
        "past_due",
        "paid",
        "refunded",
      ],
    }).notNull(),
    // Monthly and annual: the Dodo subscription. Lifetime: the Dodo payment.
    subscriptionId: text("subscription_id"),
    paymentId: text("payment_id"),
    customerId: text("customer_id").notNull(),
    // Subscriptions: the next billing date, when access ends unless renewed.
    // Null for lifetime.
    periodEnd: integer("period_end", { mode: "timestamp_ms" }),
    cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("plan_subscription_user_idx").on(table.userId),
    index("plan_subscription_email_idx").on(table.email),
    uniqueIndex("plan_subscription_subscription_idx").on(table.subscriptionId),
    uniqueIndex("plan_subscription_payment_idx").on(table.paymentId),
  ]
);

// Business seats besides the owner, invited by email. Signing in with that
// email is what accepts the invite: `userId` and `acceptedAt` are filled in
// the first time the account's access is checked.
export const planSeats = sqliteTable(
  "plan_seat",
  {
    id: text("id").primaryKey(),
    subscriptionRowId: text("subscription_row_id")
      .notNull()
      .references(() => planSubscriptions.id, { onDelete: "cascade" }),
    // Lowercased.
    email: text("email").notNull(),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    invitedAt: integer("invited_at", { mode: "timestamp_ms" }).notNull(),
    acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    uniqueIndex("plan_seat_subscription_email_idx").on(
      table.subscriptionRowId,
      table.email
    ),
    index("plan_seat_email_idx").on(table.email),
    index("plan_seat_user_idx").on(table.userId),
  ]
);
