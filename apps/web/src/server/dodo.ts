import { env } from "cloudflare:workers";
import DodoPayments, { NotFoundError } from "dodopayments";
import type { CheckoutSessionCreateParams } from "dodopayments/resources/checkout-sessions";

import { JOB_PLANS } from "@/constants/jobs";
import type { JobPlan } from "@/constants/jobs";
import type { Plan, PlanBilling } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { SPONSOR_BILLINGS, SPONSOR_TIERS } from "@/constants/sponsors";
import type { SponsorBilling, SponsorTier } from "@/constants/sponsors";

let client: DodoPayments | undefined;

// Public pages can be prerendered without payment secrets. Initialize only
// when a payment operation needs the client, retaining SDK credential checks.
export const getDodo = (): DodoPayments => {
  client ??= new DodoPayments({
    bearerToken: env.DODO_PAYMENTS_API_KEY,
    // Anything but an explicit live_mode stays in test mode.
    environment:
      env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
    webhookKey: env.DODO_PAYMENTS_WEBHOOK_KEY,
  });
  return client;
};

/** Sponsorship products, by tier and billing. */
const SPONSOR_PRODUCT_IDS: Record<
  SponsorTier,
  Record<SponsorBilling, string>
> = {
  diamond: {
    monthly: env.DODO_PRODUCT_SPONSOR_DIAMOND,
    once: env.DODO_PRODUCT_SPONSOR_DIAMOND_ONCE,
  },
  gold: {
    monthly: env.DODO_PRODUCT_SPONSOR_GOLD,
    once: env.DODO_PRODUCT_SPONSOR_GOLD_ONCE,
  },
  silver: {
    monthly: env.DODO_PRODUCT_SPONSOR_SILVER,
    once: env.DODO_PRODUCT_SPONSOR_SILVER_ONCE,
  },
};

/** The sponsorship a Dodo product sells; `undefined` for any other product. */
export const sponsorProductOf = (
  productId: string
): { tier: SponsorTier; billing: SponsorBilling } | undefined => {
  for (const tier of SPONSOR_TIERS) {
    for (const billing of SPONSOR_BILLINGS) {
      if (SPONSOR_PRODUCT_IDS[tier][billing] === productId) {
        return { tier, billing };
      }
    }
  }
  return undefined;
};

/**
 * MotionVideo Pro and Business products, by plan and billing: subscriptions
 * for monthly and annual, a one-time payment for lifetime. Business has no
 * lifetime product (see PLAN_PRICE_CENTS).
 */
const PLAN_PRODUCT_IDS: Record<Plan, Partial<Record<PlanBilling, string>>> = {
  pro: {
    monthly: env.DODO_PRODUCT_PRO_MONTHLY,
    annual: env.DODO_PRODUCT_PRO_ANNUAL,
    lifetime: env.DODO_PRODUCT_PRO_LIFETIME,
  },
  business: {
    monthly: env.DODO_PRODUCT_BUSINESS_MONTHLY,
    annual: env.DODO_PRODUCT_BUSINESS_ANNUAL,
  },
};

/** The Dodo product for a plan and billing; empty until `pnpm dodo:setup`. */
export const planProductId = (plan: Plan, billing: PlanBilling): string =>
  PLAN_PRODUCT_IDS[plan][billing] ?? "";

/** One-time job listing products, by plan. */
const JOB_PRODUCT_IDS: Record<JobPlan, string> = {
  featured: env.DODO_PRODUCT_JOB_FEATURED,
  standard: env.DODO_PRODUCT_JOB_STANDARD,
};

/** The job plan a Dodo product sells; `undefined` for any other product. */
export const jobPlanOf = (productId: string): JobPlan | undefined =>
  JOB_PLANS.find((plan) => JOB_PRODUCT_IDS[plan] === productId);

// Dodo customers for an email. Buyers check out as guests, so the email they
// paid with is the only link between them and their payments.
const customersFor = async (email: string) => {
  const normalized = email.toLowerCase();
  const { items } = await getDodo().customers.list({
    email: normalized,
    page_size: 100,
  });
  return items.filter(
    (customer) => customer.email.toLowerCase() === normalized
  );
};

// The retired Skill Bundle: no longer sold, but its buyers keep their skill
// repository access (Dodo's GitHub entitlement) and are told apart by it.
const hasPaidSkill = async (customerId: string): Promise<boolean> => {
  // Without a product ID the filter would match every payment.
  if (!env.DODO_PRODUCT_SKILL) {
    return false;
  }
  const { items } = await getDodo().payments.list({
    customer_id: customerId,
    page_size: 100,
    product_id: env.DODO_PRODUCT_SKILL,
    status: "succeeded",
  });
  return items.some((payment) => payment.refund_status !== "full");
};

/** The customer behind a paid, unrefunded skill bundle purchase, if any. */
const skillCustomer = async (email: string) => {
  const customers = await customersFor(email);
  const paid = await Promise.all(
    customers.map((customer) => hasPaidSkill(customer.customer_id))
  );
  return customers.find((_, index) => paid[index]) ?? null;
};

export const purchaseStatus = async (
  email: string
): Promise<{ purchased: boolean; name: string | null }> => {
  const customer = await skillCustomer(email);
  return { name: customer?.name || null, purchased: customer !== null };
};

export const hasPurchased = async (email: string): Promise<boolean> => {
  const status = await purchaseStatus(email);
  return status.purchased;
};

const checkoutUrl = async (
  params: CheckoutSessionCreateParams
): Promise<string> => {
  const session = await getDodo().checkoutSessions.create(params);
  if (!session.checkout_url) {
    throw new Error("Dodo returned no checkout URL");
  }
  return session.checkout_url;
};

/** The signed-in account a checkout is for. */
export interface Buyer {
  email: string;
  userId: string;
}

/**
 * Checkout for MotionVideo Pro or Business. The metadata ties the
 * subscription or lifetime payment to the account (src/server/plans.ts); Dodo
 * returns to /dashboard/billing, appending `subscription_id` or `payment_id`.
 */
export const createPlanCheckoutUrl = (
  plan: Plan,
  billing: PlanBilling,
  buyer: Buyer
): Promise<string> => {
  const productId = planProductId(plan, billing);
  if (!productId) {
    throw new Error("Plan products are not set up; run pnpm dodo:setup");
  }
  return checkoutUrl({
    cancel_url: `${env.BETTER_AUTH_URL}${ROUTES.PRO}`,
    customer: { email: buyer.email },
    feature_flags: { allow_discount_code: false },
    metadata: { plan, billing, user_id: buyer.userId },
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: `${env.BETTER_AUTH_URL}${ROUTES.DASHBOARD_BILLING}?checkout=success`,
  });
};

/**
 * Checkout for one sponsorship draft: a monthly subscription or a one-off
 * 30-day run. `sponsorship_id` in the metadata ties the subscription or
 * payment back to the draft; Dodo returns to /sponsorships, appending
 * `subscription_id` or `payment_id`.
 */
export const createSponsorCheckoutUrl = (
  tier: SponsorTier,
  billing: SponsorBilling,
  sponsorshipId: string,
  buyer: Buyer
): Promise<string> => {
  const productId = SPONSOR_PRODUCT_IDS[tier][billing];
  if (!productId) {
    throw new Error("Sponsor products are not set up; run pnpm dodo:setup");
  }
  const query = `?sponsorship=${encodeURIComponent(sponsorshipId)}`;
  return checkoutUrl({
    cancel_url: `${env.BETTER_AUTH_URL}${ROUTES.DASHBOARD_SPONSORSHIPS_NEW}${query}`,
    customer: { email: buyer.email },
    feature_flags: { allow_discount_code: false },
    metadata: {
      product: `sponsor-${tier}-${billing}`,
      sponsorship_id: sponsorshipId,
      user_id: buyer.userId,
    },
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: `${env.BETTER_AUTH_URL}${ROUTES.DASHBOARD_SPONSORSHIPS}${query}`,
  });
};

export interface CompletedCheckout {
  /** False while Dodo is still confirming the payment. */
  succeeded: boolean;
  email: string | null;
}

/**
 * Null when Dodo has no skill bundle payment with this id (bad or tampered
 * link, or a payment for another product). Only old /welcome return links
 * carry one now that the bundle is retired.
 */
export const completedCheckout = async (
  paymentId: string
): Promise<CompletedCheckout | null> => {
  let payment;
  try {
    payment = await getDodo().payments.retrieve(paymentId);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
    }
    throw error;
  }
  if (
    !payment.product_cart?.some(
      (item) => item.product_id === env.DODO_PRODUCT_SKILL
    )
  ) {
    return null;
  }
  return {
    email: payment.customer.email,
    succeeded: payment.status === "succeeded",
  };
};

/** Dodo's billing portal for a plan owner, returning to /dashboard/billing. */
export const planPortalUrl = async (customerId: string): Promise<string> => {
  const session = await getDodo().customers.customerPortal.create(customerId, {
    return_url: `${env.BETTER_AUTH_URL}${ROUTES.DASHBOARD_BILLING}`,
  });
  return session.link;
};

/**
 * The portal for a retired Skill Bundle buyer (receipts, the GitHub
 * connection for the repository invite), found by email.
 */
export const legacySkillPortalUrl = async (email: string): Promise<string> => {
  const customer = await skillCustomer(email);
  if (!customer) {
    throw new Error("No Dodo customer with a purchase for this email");
  }
  return planPortalUrl(customer.customer_id);
};

/** Dodo's billing portal for one sponsor, returning to /sponsorships. */
export const sponsorPortalUrl = async (customerId: string): Promise<string> => {
  const session = await getDodo().customers.customerPortal.create(customerId, {
    return_url: `${env.BETTER_AUTH_URL}${ROUTES.DASHBOARD_SPONSORSHIPS}`,
  });
  return session.link;
};

/**
 * Checkout for one job listing. `job_id` in the metadata is what ties the
 * payment back to the post; Dodo returns to /listings with `payment_id`.
 */
export const createJobCheckoutUrl = (
  plan: JobPlan,
  jobId: string,
  buyer: Buyer
): Promise<string> => {
  const productId = JOB_PRODUCT_IDS[plan];
  if (!productId) {
    throw new Error("Job products are not set up; run pnpm dodo:setup");
  }
  const query = `?job=${encodeURIComponent(jobId)}`;
  return checkoutUrl({
    cancel_url: `${env.BETTER_AUTH_URL}${ROUTES.DASHBOARD_JOBS_POST}${query}`,
    customer: { email: buyer.email },
    feature_flags: { allow_discount_code: false },
    metadata: { product: `job-${plan}`, job_id: jobId, user_id: buyer.userId },
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: `${env.BETTER_AUTH_URL}${ROUTES.DASHBOARD_LISTINGS}${query}`,
  });
};
