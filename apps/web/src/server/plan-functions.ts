import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { z } from "zod";

import { DEFAULT_LOCALE, isLocale, localizedPath } from "@/constants/locales";
import {
  BUSINESS_SEATS,
  PLAN_BILLINGS,
  PLANS,
  planOffers,
} from "@/constants/plans";
import type { ParityOffer, PlanAccess } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

import { getCurrentSession } from "./auth";
import {
  createPlanCheckoutUrl,
  legacySkillPortalUrl,
  parityPercentOff,
  planPortalUrl,
} from "./dodo";
import { sendEmail } from "./email";
import {
  addSeat,
  deleteSeat,
  liveOwnedRow,
  planAccessFor,
  seatsOf,
  syncPlanPayment,
  syncPlanSubscription,
} from "./plans";

const requireSession = async () => {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
};

/**
 * The signed-in account's plan access; `null` when signed out. The
 * `subscriptionId` or `paymentId` Dodo appends to the checkout return URL is
 * synced first, so a new plan shows without waiting for the webhook.
 */
export const getMyPlan = createServerFn({ method: "GET" })
  .validator(
    z
      .object({
        subscriptionId: z.string().min(1).max(100).optional(),
        paymentId: z.string().min(1).max(100).optional(),
      })
      .optional()
  )
  .handler(async ({ data }): Promise<PlanAccess | null> => {
    const session = await getCurrentSession();
    if (!session) {
      return null;
    }
    try {
      if (data?.subscriptionId) {
        await syncPlanSubscription(data.subscriptionId);
      }
      if (data?.paymentId) {
        await syncPlanPayment(data.paymentId);
      }
    } catch (error) {
      // The webhook syncs it too; the page shows the state it has.
      console.error("Plan return sync failed", error);
    }
    return planAccessFor(session.user);
  });

// Percent off by country. Dodo's percentages change only when edited in its
// dashboard, so one preview per country per isolate every few hours is plenty.
const PARITY_TTL_MS = 6 * 60 * 60 * 1000;
const parityCache = new Map<string, { at: number; percentOff: number }>();

/**
 * The visitor's purchasing power parity discount, for the banner under the
 * plans: their country from Cloudflare (`cf-ipcountry`), the percent from a
 * Dodo checkout preview. Null when nothing applies or anything fails; the
 * banner then stays hidden and checkout prices are unaffected either way.
 */
export const getParityOffer = createServerFn({ method: "GET" }).handler(
  async (): Promise<ParityOffer | null> => {
    const country = getRequest().headers.get("cf-ipcountry")?.toUpperCase();
    // XX is "unknown"; Tor's T1 already fails the letters-only pattern.
    if (!country || !/^[A-Z]{2}$/u.test(country) || country === "XX") {
      return null;
    }
    const cached = parityCache.get(country);
    let percentOff = cached?.percentOff;
    if (!cached || Date.now() - cached.at > PARITY_TTL_MS) {
      try {
        percentOff = await parityPercentOff(country);
      } catch (error) {
        console.error("Parity preview failed", country, error);
        return null;
      }
      parityCache.set(country, { at: Date.now(), percentOff });
    }
    return percentOff ? { country, percentOff } : null;
  }
);

/** A Dodo checkout URL for a plan; signed-in only (/checkout signs in first). */
export const startPlanCheckout = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        plan: z.enum(PLANS),
        billing: z.enum(PLAN_BILLINGS),
        locale: z.string().optional(),
      })
      .refine(({ plan, billing }) => planOffers(plan).includes(billing))
  )
  .handler(async ({ data }) => {
    const session = await requireSession();
    return createPlanCheckoutUrl(
      data.plan,
      data.billing,
      { email: session.user.email, userId: session.user.id },
      data.locale
    );
  });

/**
 * Dodo's billing portal: the owner's plan (cancel, change card, invoices),
 * or, for a retired Skill Bundle buyer, their receipts and GitHub link.
 */
export const getPlanPortalUrl = createServerFn({ method: "POST" })
  .validator(z.object({ locale: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    const session = await requireSession();
    const row = await liveOwnedRow(session.user);
    if (row) {
      return planPortalUrl(row.customerId, data?.locale);
    }
    return legacySkillPortalUrl(session.user.email, data?.locale);
  });

// The owner's live Business row, or an error for anyone else.
const requireBusinessOwner = async () => {
  const session = await requireSession();
  const row = await liveOwnedRow(session.user);
  if (row?.plan !== "business") {
    throw new Error("Only a Business plan owner can manage seats");
  }
  return { session, row };
};

export interface Seat {
  id: string;
  email: string;
  accepted: boolean;
}

/** Seats on the owner's Business plan (the owner holds one more). */
export const listSeats = createServerFn({ method: "GET" }).handler(
  async (): Promise<Seat[]> => {
    const { row } = await requireBusinessOwner();
    const seats = await seatsOf(row.id);
    return seats.map((seat) => ({
      id: seat.id,
      email: seat.email,
      accepted: seat.acceptedAt !== null,
    }));
  }
);

export type InviteSeatResult =
  | { ok: true }
  | { ok: false; error: "full" | "duplicate" | "self" };

/**
 * Invites an email to a seat and emails them. Signing in with that email
 * accepts it (see planAccessFor). The owner counts toward BUSINESS_SEATS.
 */
export const inviteSeat = createServerFn({ method: "POST" })
  .validator(
    z.object({ email: z.email().max(254), locale: z.string().optional() })
  )
  .handler(async ({ data }): Promise<InviteSeatResult> => {
    const { session, row } = await requireBusinessOwner();
    const email = data.email.toLowerCase();
    if (email === session.user.email.toLowerCase()) {
      return { ok: false, error: "self" };
    }
    const seats = await seatsOf(row.id);
    if (seats.some((seat) => seat.email === email)) {
      return { ok: false, error: "duplicate" };
    }
    if (seats.length + 1 >= BUSINESS_SEATS) {
      return { ok: false, error: "full" };
    }
    await addSeat(row.id, email);
    const locale = isLocale(data.locale) ? data.locale : DEFAULT_LOCALE;
    const signIn = `${env.BETTER_AUTH_URL}${localizedPath(ROUTES.SIGN_IN, locale)}?redirect=${encodeURIComponent(localizedPath(ROUTES.DASHBOARD_BILLING, locale))}`;
    try {
      await sendEmail({
        to: email,
        subject: `You have a seat on ${SITE.NAME} Business`,
        text: `${session.user.email} added you to their ${SITE.NAME} Business plan. It includes the Moves library, every prompt template, the Pro agent skill and every future update.\n\nSign in with this email to start: ${signIn}`,
      });
    } catch (error) {
      // The seat is saved; signing in with the email works without the mail.
      console.error("Seat invite email failed", error);
    }
    return { ok: true };
  });

export const removeSeat = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(100) }))
  .handler(async ({ data }) => {
    const { row } = await requireBusinessOwner();
    await deleteSeat(row.id, data.id);
  });
