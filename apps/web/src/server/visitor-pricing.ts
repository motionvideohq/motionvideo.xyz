import type { Plan, PlanBilling } from "@/constants/plans";
import { activeOffer, currentOffer, offerCovers } from "@/lib/offers";
import type { Offer, OfferPhase } from "@/lib/offers";

import { parityPercentOff } from "./dodo";
import type { CheckoutDiscounts } from "./dodo";

// What a visitor pays depends on where they are: Dodo's purchasing power
// parity lowers the price in some countries, and a running sale (src/lib/
// offers.ts) skips those countries, since the two would stack.

// Percent off by country. Dodo's percentages change only when edited in its
// dashboard, so one preview per country per isolate every few hours is plenty.
const PARITY_TTL_MS = 6 * 60 * 60 * 1000;
const parityCache = new Map<string, { at: number; percentOff: number }>();

/** The visitor's country from Cloudflare (`cf-ipcountry`); null when unknown. */
export const visitorCountry = (request: Request): string | null => {
  const country = request.headers.get("cf-ipcountry")?.toUpperCase();
  // XX is "unknown"; Tor's T1 already fails the letters-only pattern.
  if (!country || !/^[A-Z]{2}$/u.test(country) || country === "XX") {
    return null;
  }
  return country;
};

/** Percent off `country` gets through parity, cached; throws when Dodo's preview fails. */
export const parityFor = async (country: string): Promise<number> => {
  const cached = parityCache.get(country);
  if (cached && Date.now() - cached.at <= PARITY_TTL_MS) {
    return cached.percentOff;
  }
  const percentOff = await parityPercentOff(country);
  parityCache.set(country, { at: Date.now(), percentOff });
  return percentOff;
};

/**
 * The offer for this visitor right now, teaser included, with its phase:
 * none when their country has a parity price, or when that can't be checked
 * (rather than risk stacking). The worker marks pages with it (banner).
 */
export const visitorOffer = async (
  request: Request
): Promise<{ offer: Offer; phase: OfferPhase } | null> => {
  const current = currentOffer(Date.now());
  const country = visitorCountry(request);
  if (!current || !country) {
    return current;
  }
  try {
    return (await parityFor(country)) > 0 ? null : current;
  } catch (error) {
    console.error("Parity preview failed", country, error);
    return null;
  }
};

/** The sale on for this visitor right now (not a teaser), or null. */
export const offerForVisitor = async (
  request: Request
): Promise<Offer | null> => {
  const current = await visitorOffer(request);
  return current && current.phase !== "teaser" ? current.offer : null;
};

/**
 * Codes for this visitor's plan checkout: the sale's code when it runs for
 * them and covers the plan. Any running sale locks the code field, also for
 * visitors it skips, so no other code can be entered or stacked.
 */
export const checkoutDiscounts = async (
  request: Request,
  plan: Plan,
  billing: PlanBilling
): Promise<CheckoutDiscounts> => {
  const offer = await offerForVisitor(request);
  return {
    codes: offer && offerCovers(offer, plan, billing) ? [offer.code] : [],
    locked: activeOffer(Date.now()) !== null,
  };
};
