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
}

/**
 * What a visitor's country pays, read from Dodo checkout previews: the
 * currency Adaptive Currency charges it in and each plan's price in it,
 * before tax. Dodo's purchasing power parity is already in these amounts, so
 * the cards match checkout; /pro carries null when Dodo has no price for the
 * country, and the cards then show the USD list prices.
 */
export interface LocalPrices {
  /** ISO 3166-1 alpha-2 code of the visitor's country, from their IP. */
  country: string;
  /** ISO 4217 code of the currency Dodo prices the country in. */
  currency: string;
  /** Minor units per plan and billing, like PLAN_PRICE_CENTS. */
  cents: Record<Plan, Partial<Record<PlanBilling, number>>>;
  /**
   * Whether Dodo's purchasing power parity lowers these prices: then they're
   * regional even when the currency is still USD, and a sale skips them.
   */
  parity: boolean;
}

/**
 * What a plan costs for a visitor: the price Dodo charges their country when
 * it has one, else the USD list price. `cents` are in `currency`'s minor
 * units; format them with `formatPrice` (src/constants/pricing.ts).
 */
export const planPrice = (
  prices: Pick<LocalPrices, "currency" | "cents"> | null | undefined,
  plan: Plan,
  billing: PlanBilling
): { cents: number; currency: string } => {
  const cents = prices?.cents[plan][billing];
  return prices && cents !== undefined
    ? { cents, currency: prices.currency }
    : { cents: PLAN_PRICE_CENTS[plan][billing] ?? 0, currency: "USD" };
};

export const NO_ACCESS: PlanAccess = {
  plan: null,
  billing: null,
  role: null,
  status: null,
  periodEnd: null,
  cancelAtPeriodEnd: false,
  legacySkill: false,
};

/** Pro and Business both unlock the library, the Pro skill and Pro MCP tools. */
export const hasPro = (access: PlanAccess): boolean => access.plan !== null;
