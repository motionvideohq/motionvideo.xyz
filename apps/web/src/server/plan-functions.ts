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
import type { LocalPrices, PlanAccess } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import type { SaleOffer } from "@/lib/offers";

import { getCurrentSession } from "./auth";
import {
  createPlanCheckoutUrl,
  planPortalUrl,
  purchasePortalUrl,
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
import {
  checkoutDiscounts,
  countryPricing,
  offerForVisitor,
  visitorCountry,
} from "./visitor-pricing";

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

/**
 * What the visitor's country pays, for the prices on the plans: their country
 * from Cloudflare (`cf-ipcountry`), the currency and amounts from Dodo's
 * checkout previews. Null when Dodo prices nothing or anything fails; the
 * cards then show the USD list prices, and checkout prices are unaffected
 * either way.
 */
export const getLocalPrices = createServerFn({ method: "GET" }).handler(
  async (): Promise<LocalPrices | null> => {
    const country = visitorCountry(getRequest());
    if (!country) {
      return null;
    }
    const pricing = await countryPricing(country);
    return pricing?.prices
      ? { country, ...pricing.prices, parity: pricing.parity }
      : null;
  }
);

/**
 * The sale running for this visitor (src/lib/offers.ts), for the prices on
 * /pro; null outside one or in countries that already get a regional price.
 * Without its code: checkout applies that itself.
 */
export const getSaleOffer = createServerFn({ method: "GET" }).handler(
  async (): Promise<SaleOffer | null> => {
    const offer = await offerForVisitor(getRequest());
    if (!offer) {
      return null;
    }
    const { code: _code, ...shown } = offer;
    return shown;
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
      data.locale,
      await checkoutDiscounts(getRequest(), data.plan, data.billing)
    );
  });

/**
 * Dodo's billing portal: the owner's plan (cancel, change card, invoices),
 * or, for a buyer of the retired Skill Bundle or the GTA 6 Clip Pack without
 * a plan, their receipts and GitHub link.
 */
export const getPlanPortalUrl = createServerFn({ method: "POST" })
  .validator(z.object({ locale: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    const session = await requireSession();
    const row = await liveOwnedRow(session.user);
    if (row) {
      return planPortalUrl(row.customerId, data?.locale);
    }
    return purchasePortalUrl(session.user.email, data?.locale);
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
