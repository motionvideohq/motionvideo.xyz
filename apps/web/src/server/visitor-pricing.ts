import type { LocalPrices, Plan, PlanBilling } from "@/constants/plans";
import { SITE } from "@/constants/site";
import { activeOffer, offerCovers } from "@/lib/offers";
import type { Offer } from "@/lib/offers";

import { countryPlanPrices, hasParityPrice } from "./dodo";
import type { CheckoutDiscounts } from "./dodo";

// What a visitor pays depends on where they are: Dodo charges them in their
// own currency, with its purchasing power parity taking a share of the price
// in some countries, and a running sale (src/lib/offers.ts) doesn't take off
// there too, since the two would stack. Those visitors still see the sale's
// banner; /pro and checkout give them the regional price.

/** A country's plan prices and parity, from one batch of Dodo previews. */
interface CountryPricing {
  /** Null when Dodo prices nothing (the cards then show the USD list prices). */
  prices: Pick<LocalPrices, "cents" | "currency"> | null;
  parity: boolean;
}

// Exchange rates move, so a country's pricing lasts an hour in the colo's
// cache: long enough to spare Dodo a batch per visitor, short enough that the
// cards keep up with checkout. Prices and parity share the entry, so the
// cards and the sale check always read the same answer.
const PRICING_CACHE_SECONDS = 3600;
const pricingCacheKey = (country: string) =>
  `https://${SITE.DOMAIN}/__cache/country-pricing/${country}`;

// Each isolate also keeps the lookup itself for a few minutes: concurrent
// visitors from one country share a single batch, and when Dodo fails the
// next visitors fall back straight away instead of waiting on it again.
const LOOKUP_TTL_MS = 5 * 60 * 1000;
const lookups = new Map<
  string,
  { at: number; pricing: Promise<CountryPricing | null> }
>();

const fetchCountryPricing = async (
  country: string
): Promise<CountryPricing | null> => {
  try {
    const cache = await caches.open("country-pricing");
    const cached = await cache.match(pricingCacheKey(country));
    if (cached) {
      // SAFETY: only this function writes these keys, always a CountryPricing.
      return (await cached.json()) as CountryPricing;
    }
    const [prices, parity] = await Promise.all([
      countryPlanPrices(country),
      hasParityPrice(country),
    ]);
    const pricing: CountryPricing = { parity, prices };
    await cache.put(
      pricingCacheKey(country),
      Response.json(pricing, {
        headers: {
          "Cache-Control": `public, max-age=${PRICING_CACHE_SECONDS}`,
        },
      })
    );
    return pricing;
  } catch (error) {
    console.error("Dodo price preview failed", country, error);
    return null;
  }
};

/**
 * The country's plan prices and parity, cached; null when Dodo's previews
 * fail (the caller falls back to the USD list prices and no sale). Never
 * throws.
 */
export const countryPricing = (
  country: string
): Promise<CountryPricing | null> => {
  const lookup = lookups.get(country);
  if (lookup && Date.now() - lookup.at <= LOOKUP_TTL_MS) {
    return lookup.pricing;
  }
  const pricing = fetchCountryPricing(country);
  lookups.set(country, { at: Date.now(), pricing });
  return pricing;
};

/** The visitor's country from Cloudflare (`cf-ipcountry`); null when unknown. */
export const visitorCountry = (request: Request): string | null => {
  const country = request.headers.get("cf-ipcountry")?.toUpperCase();
  // XX is "unknown"; Tor's T1 already fails the letters-only pattern.
  if (!country || !/^[A-Z]{2}$/u.test(country) || country === "XX") {
    return null;
  }
  return country;
};

/**
 * The sale on for this visitor right now (not a teaser), or null: none when
 * their country already pays a parity price, or when that can't be checked
 * (rather than risk stacking). Feeds the prices on /pro and the code at
 * checkout.
 */
export const offerForVisitor = async (
  request: Request
): Promise<Offer | null> => {
  const offer = activeOffer(Date.now());
  const country = visitorCountry(request);
  if (!offer || !country) {
    return offer;
  }
  const pricing = await countryPricing(country);
  return pricing === null || pricing.parity ? null : offer;
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
