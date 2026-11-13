import type { Plan, PlanBilling } from "../constants/plans.ts";
import { thanksgivingDay } from "./seasons.ts";

// Time-limited sales on the plans, recurring every year. One definition feeds
// the site banner (src/server.ts marks the page with the offer and its phase),
// the sale prices on /pro, checkout (which applies the code), the email drafts
// (src/emails/black-friday-*.tsx), and the Dodo setup script, which creates
// each year's discount code for exactly the sale's window, so Dodo itself
// refuses the code outside it. Node runs this file directly in that script,
// hence the relative `.ts` imports.
//
// Each run has three phases:
//   teaser     the banner says the sale is coming and when, not how much
//              (naming the discount early makes buyers wait for it)
//   sale       the banner, the prices on /pro and the code at checkout
//   last-call  the same, with the banner saying it ends soon
// A sale skips visitors whose country already gets a purchasing power parity
// price (the two would stack), and the code only takes for a customer's first
// purchase (Dodo's `first_time` eligibility).

export type OfferPhase = "teaser" | "sale" | "last-call";

interface OfferRule {
  id: string;
  name: string;
  /** The year's code is the prefix and the year's last two digits. */
  codePrefix: string;
  percentOff: number;
  /** Plans and billing options the code takes off. */
  covers: readonly (readonly [Plan, PlanBilling])[];
  /** Renewals the discount lasts for: 1 is the first year of an annual plan. */
  subscriptionCycles: number;
  /** The run in `year`, in ms: when each phase starts, and when it ends. */
  schedule: (year: number) => {
    teaseAt: number;
    startsAt: number;
    lastCallAt: number;
    endsAt: number;
  };
}

/** One year's run of an offer. */
export interface Offer {
  /** The rule and its year, e.g. `black-friday-2026`; dismissals key on it. */
  id: string;
  rule: string;
  name: string;
  code: string;
  percentOff: number;
  covers: readonly (readonly [Plan, PlanBilling])[];
  subscriptionCycles: number;
  /** The teaser starts. */
  teaseAt: number;
  /** The sale starts: the code works from here. */
  startsAt: number;
  /** The last call starts. */
  lastCallAt: number;
  /** The sale ends: the code stops working. */
  endsAt: number;
}

/** Midnight at the start of `day` of `month` (from 0) in US Pacific Standard Time (UTC−8). */
const pstMidnight = (year: number, month: number, day: number) =>
  Date.UTC(year, month, day, 8);

/** Every offer, by rule; the banner (OfferBanner) renders one per rule. */
export const OFFER_RULES = [
  {
    id: "black-friday",
    name: "Black Friday",
    codePrefix: "BLACKFRIDAY",
    percentOff: 30,
    covers: [
      ["pro", "annual"],
      ["pro", "lifetime"],
      ["business", "annual"],
    ],
    subscriptionCycles: 1,
    // Black Friday week, Pacific time, around Thanksgiving (a Thursday): the
    // teaser from the Monday a week before, the sale from the Monday before,
    // the last call from Saturday, the end after Cyber Monday. Daylight saving
    // has ended by then, so it is always UTC−8. 2026 opened early, on Friday
    // November 13, with no teaser.
    schedule: (year) => {
      const thursday = thanksgivingDay(year);
      const startsAt =
        year === 2026
          ? pstMidnight(2026, 10, 13)
          : pstMidnight(year, 10, thursday - 3);
      return {
        teaseAt:
          year === 2026 ? startsAt : pstMidnight(year, 10, thursday - 10),
        startsAt,
        lastCallAt: pstMidnight(year, 10, thursday + 2),
        endsAt: pstMidnight(year, 10, thursday + 5),
      };
    },
  },
] as const satisfies readonly OfferRule[];

const occurrence = (rule: OfferRule, year: number): Offer => ({
  id: `${rule.id}-${year}`,
  rule: rule.id,
  name: rule.name,
  code: `${rule.codePrefix}${String(year % 100).padStart(2, "0")}`,
  percentOff: rule.percentOff,
  covers: rule.covers,
  subscriptionCycles: rule.subscriptionCycles,
  ...rule.schedule(year),
});

/** `offer`'s phase at `now` (ms), or null before its teaser and after its end. */
export const offerPhase = (offer: Offer, now: number): OfferPhase | null => {
  if (now < offer.teaseAt || now >= offer.endsAt) {
    return null;
  }
  if (now < offer.startsAt) {
    return "teaser";
  }
  return now < offer.lastCallAt ? "sale" : "last-call";
};

/** The offer at `now` (ms), from its teaser to its end, with its phase. */
export const currentOffer = (
  now: number
): { offer: Offer; phase: OfferPhase } | null => {
  const year = new Date(now).getUTCFullYear();
  for (const rule of OFFER_RULES) {
    const offer = occurrence(rule, year);
    const phase = offerPhase(offer, now);
    if (phase) {
      return { offer, phase };
    }
  }
  return null;
};

/** The offer on sale at `now` (ms): its sale or last call, not its teaser. */
export const activeOffer = (now: number): Offer | null => {
  const current = currentOffer(now);
  return current && current.phase !== "teaser" ? current.offer : null;
};

/**
 * Each offer's run that hasn't ended by `now`: this year's, or next year's
 * once this year's is over. The setup script keeps these codes in Dodo; the
 * banner and the email drafts take their dates from it.
 */
export const upcomingOffers = (now: number): Offer[] => {
  const year = new Date(now).getUTCFullYear();
  return OFFER_RULES.map((rule) => {
    const offer = occurrence(rule, year);
    return offer.endsAt > now ? offer : occurrence(rule, year + 1);
  });
};

/** An offer as the browser sees it: without its code, which checkout applies. */
export type SaleOffer = Omit<Offer, "code">;

/** Whether `offer` takes off this plan and billing option. */
export const offerCovers = (
  offer: SaleOffer,
  plan: Plan,
  billing: PlanBilling
): boolean =>
  offer.covers.some(
    ([coveredPlan, coveredBilling]) =>
      coveredPlan === plan && coveredBilling === billing
  );
