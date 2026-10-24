import { env } from "cloudflare:workers";
import { and, eq, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { NO_ACCESS, PLAN_BILLINGS, PLANS } from "@/constants/plans";
import type { Plan, PlanAccess, PlanBilling } from "@/constants/plans";

import { planSeats, planSubscriptions } from "./db/plan-schema";
import { getDodo, hasPurchased, planProductId } from "./dodo";

// Server-only plan logic shared by the webhook, /checkout and the server
// functions. Kept out of plan-functions.ts: a module the client imports may
// export only server functions, or its server imports leak into the bundle.

type PlanRow = typeof planSubscriptions.$inferSelect;

/** The plan a Dodo product sells; `undefined` for any other product. */
export const planProductOf = (
  productId: string
): { plan: Plan; billing: PlanBilling } | undefined => {
  for (const plan of PLANS) {
    for (const billing of PLAN_BILLINGS) {
      const id = planProductId(plan, billing);
      if (id && id === productId) {
        return { plan, billing };
      }
    }
  }
  return undefined;
};

/**
 * Mirrors one Dodo subscription (Pro or Business, monthly or annual) into
 * `plan_subscription`, keyed by subscription id. State is re-read from the
 * API, so duplicate or out-of-order deliveries converge on Dodo's current
 * state. Other products (the webhook is business-wide) are ignored.
 */
export const syncPlanSubscription = async (subscriptionId: string) => {
  const subscription = await getDodo().subscriptions.retrieve(subscriptionId);
  const product = planProductOf(subscription.product_id);
  if (!product || product.billing === "lifetime") {
    return;
  }
  const now = new Date();
  const fields = {
    // The account our checkout put in the metadata, if any.
    userId: subscription.metadata.user_id?.toString() || null,
    email: subscription.customer.email.toLowerCase(),
    plan: product.plan,
    billing: product.billing,
    status: subscription.status,
    customerId: subscription.customer.customer_id,
    periodEnd: new Date(subscription.next_billing_date),
    cancelAtPeriodEnd: subscription.cancel_at_next_billing_date,
    updatedAt: now,
  };
  await drizzle(env.DB)
    .insert(planSubscriptions)
    .values({
      id: crypto.randomUUID(),
      subscriptionId,
      createdAt: now,
      ...fields,
    })
    .onConflictDoUpdate({
      target: planSubscriptions.subscriptionId,
      set: fields,
    })
    .run();
};

/**
 * Records one Dodo payment for Pro lifetime: "paid" once it succeeds,
 * "refunded" after a full refund. Subscription payments and other products
 * are ignored (subscriptions sync through their own events).
 */
export const syncPlanPayment = async (paymentId: string) => {
  const payment = await getDodo().payments.retrieve(paymentId);
  const product = payment.product_cart
    ?.map((item) => planProductOf(item.product_id))
    .find((match) => match?.billing === "lifetime");
  if (!product) {
    return;
  }
  let status: "paid" | "refunded" | null = null;
  if (payment.refund_status === "full") {
    status = "refunded";
  } else if (payment.status === "succeeded") {
    status = "paid";
  }
  if (!status) {
    return;
  }
  const now = new Date();
  const fields = {
    userId: payment.metadata.user_id?.toString() || null,
    email: payment.customer.email.toLowerCase(),
    plan: product.plan,
    billing: product.billing,
    status,
    customerId: payment.customer.customer_id,
    periodEnd: null,
    cancelAtPeriodEnd: false,
    updatedAt: now,
  };
  await drizzle(env.DB)
    .insert(planSubscriptions)
    .values({ id: crypto.randomUUID(), paymentId, createdAt: now, ...fields })
    .onConflictDoUpdate({ target: planSubscriptions.paymentId, set: fields })
    .run();
};

/**
 * Whether a row grants access now: a paid lifetime, or a subscription that
 * is active (or on hold while Dodo retries the payment) and not past the end
 * of the period it paid for.
 */
export const isLive = (row: PlanRow, now = Date.now()): boolean => {
  if (row.billing === "lifetime") {
    return row.status === "paid";
  }
  if (row.status !== "active" && row.status !== "on_hold") {
    return false;
  }
  return !row.periodEnd || row.periodEnd.getTime() > now;
};

// Business beats Pro; among equals, lifetime beats a renewing plan.
const rank = (row: PlanRow) =>
  (row.plan === "business" ? 2 : 0) + (row.billing === "lifetime" ? 1 : 0);

const accessOf = (row: PlanRow, role: "owner" | "seat"): PlanAccess => ({
  plan: row.plan,
  billing: row.billing,
  role,
  status: row.status,
  periodEnd: row.periodEnd?.getTime() ?? null,
  cancelAtPeriodEnd: row.cancelAtPeriodEnd,
  legacySkill: false,
});

/** Every plan row this account pays for: by account, or by its email. */
export const ownedPlanRows = (user: { id: string; email: string }) =>
  drizzle(env.DB)
    .select()
    .from(planSubscriptions)
    .where(
      or(
        eq(planSubscriptions.userId, user.id),
        and(
          isNull(planSubscriptions.userId),
          eq(planSubscriptions.email, user.email.toLowerCase())
        )
      )
    );

/** The account's best live plan row as owner, if any. */
export const liveOwnedRow = async (user: { id: string; email: string }) => {
  const owned = await ownedPlanRows(user);
  const rows = owned.filter((row) => isLive(row));
  return rows.toSorted((a, b) => rank(b) - rank(a))[0] ?? null;
};

/**
 * The live Business row an account holds a seat on, if any. Signing in with
 * an invited email accepts the invite.
 */
export const liveSeatRow = async (user: { id: string; email: string }) => {
  const db = drizzle(env.DB);
  const email = user.email.toLowerCase();
  const seats = await db
    .select({ seat: planSeats, row: planSubscriptions })
    .from(planSeats)
    .innerJoin(
      planSubscriptions,
      eq(planSeats.subscriptionRowId, planSubscriptions.id)
    )
    .where(or(eq(planSeats.userId, user.id), eq(planSeats.email, email)));
  const seat = seats.find(({ row }) => row.plan === "business" && isLive(row));
  if (!seat) {
    return null;
  }
  if (!seat.seat.userId) {
    await db
      .update(planSeats)
      .set({ userId: user.id, acceptedAt: new Date() })
      .where(eq(planSeats.id, seat.seat.id))
      .run();
  }
  return seat.row;
};

/**
 * What an account can use: its own live plan, else a seat on a live Business
 * plan, else nothing. `legacySkill` marks buyers of the retired Skill Bundle,
 * who keep the skill repository but not Pro.
 */
export const planAccessFor = async (user: {
  id: string;
  email: string;
}): Promise<PlanAccess> => {
  const legacySkill = await hasPurchased(user.email).catch(() => false);
  const owned = await liveOwnedRow(user);
  if (owned) {
    return { ...accessOf(owned, "owner"), legacySkill };
  }
  const seat = await liveSeatRow(user);
  if (!seat) {
    return { ...NO_ACCESS, legacySkill };
  }
  return { ...accessOf(seat, "seat"), legacySkill };
};

/**
 * Whether an account can use Pro right now: its own live plan or a seat on a
 * live Business plan. D1 only (no Dodo call), for per-request checks such as
 * the MCP server's Pro tools.
 */
export const hasLivePlan = async (user: { id: string; email: string }) =>
  (await liveOwnedRow(user)) !== null || (await liveSeatRow(user)) !== null;

/** Seats on a Business row, oldest first. */
export const seatsOf = (rowId: string) =>
  drizzle(env.DB)
    .select()
    .from(planSeats)
    .where(eq(planSeats.subscriptionRowId, rowId))
    .orderBy(planSeats.invitedAt);

export const addSeat = async (rowId: string, email: string) => {
  await drizzle(env.DB)
    .insert(planSeats)
    .values({
      id: crypto.randomUUID(),
      subscriptionRowId: rowId,
      email,
      invitedAt: new Date(),
    })
    .onConflictDoNothing()
    .run();
};

export const deleteSeat = async (rowId: string, seatId: string) => {
  await drizzle(env.DB)
    .delete(planSeats)
    .where(
      and(eq(planSeats.id, seatId), eq(planSeats.subscriptionRowId, rowId))
    )
    .run();
};
