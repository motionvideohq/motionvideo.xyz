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
