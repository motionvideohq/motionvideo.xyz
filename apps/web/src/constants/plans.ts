// MotionVideo Pro and Business: the plans, their billing options and prices.
// Shared by the pricing page, checkout, the Dodo setup script (keep its
// PRODUCTS in sync) and the access checks.

export const PLANS = ["pro", "business"] as const;
export type Plan = (typeof PLANS)[number];

/** Monthly and annual renew (Dodo subscriptions); lifetime is paid once. */
export const PLAN_BILLINGS = ["monthly", "annual", "lifetime"] as const;
export type PlanBilling = (typeof PLAN_BILLINGS)[number];

/** Price in US cents per billing option; Business has no lifetime option. */
export const PLAN_PRICE_CENTS: Record<
  Plan,
  Partial<Record<PlanBilling, number>>
> = {
  pro: { monthly: 900, annual: 7900, lifetime: 14_900 },
  business: { monthly: 2900, annual: 24_900 },
};

/** Seats on a Business plan, the owner included. */
export const BUSINESS_SEATS = 3;

export const planOffers = (plan: Plan): PlanBilling[] =>
  PLAN_BILLINGS.filter(
    (billing) => PLAN_PRICE_CENTS[plan][billing] !== undefined
  );

/**
 * The MotionVideo GTA 6 Clip Pack (/gta-6-clipping): a one-time purchase of its
 * private skill repository, in US cents. Keep in sync with the product in
 * scripts/setup-dodo.mjs.
 */
export const GTA_PACK_PRICE_CENTS = 4900;

/** The pack's `?product=` at /checkout and `product` in Dodo's metadata. */
export const GTA_PACK_PRODUCT = "gta-pack";

/**
 * Plans whose owner also gets the GTA 6 Clip Pack repository; Business seats
 * don't (Dodo grants it to the payer's GitHub). Keep in sync with the GTA
 * entitlement in scripts/setup-dodo.mjs.
 */
export const GTA_PACK_PLANS: readonly (readonly [Plan, PlanBilling])[] = [
  ["pro", "annual"],
  ["pro", "lifetime"],
  ["business", "annual"],
];

export const planIncludesGtaPack = (plan: Plan, billing: PlanBilling) =>
  GTA_PACK_PLANS.some(
    ([packPlan, packBilling]) => packPlan === plan && packBilling === billing
  );

/**
 * What a signed-in account can use. `plan` is null without access; `role`
 * says whether the account pays (owner) or holds a Business seat.
 */
export interface PlanAccess {
  plan: Plan | null;
  billing: PlanBilling | null;
  role: "owner" | "seat" | null;
  /** Dodo status for subscriptions ("active", "on_hold", …); "paid" for lifetime. */
  status: string | null;
  /** Renewal or end date (ms) for subscriptions; null for lifetime. */
  periodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  /** Owned the retired Skill Bundle: keeps skill repo access, not Pro. */
  legacySkill: boolean;
  /**
   * Can install the GTA 6 Clip Pack: bought it, or owns a plan in
   * GTA_PACK_PLANS.
   */
  gtaPack: boolean;
}

/**
 * What a visitor's country gets off at checkout through Dodo's purchasing
 * power parity, read from a checkout preview; null when nothing applies.
 */
export interface ParityOffer {
  /** ISO 3166-1 alpha-2 code of the visitor's country, from their IP. */
  country: string;
  /** Whole percent off the list price (Dodo allows up to 70). */
  percentOff: number;
}

export const NO_ACCESS: PlanAccess = {
  plan: null,
  billing: null,
  role: null,
  status: null,
  periodEnd: null,
  cancelAtPeriodEnd: false,
  legacySkill: false,
  gtaPack: false,
};

/** Pro and Business both unlock the library, the Pro skill and Pro MCP tools. */
export const hasPro = (access: PlanAccess): boolean => access.plan !== null;
