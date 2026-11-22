import { env } from "cloudflare:workers";
import DodoPayments, {
  NotFoundError,
  UnprocessableEntityError,
} from "dodopayments";
import type { CheckoutSessionCreateParams } from "dodopayments/resources/checkout-sessions";
import type { Customer } from "dodopayments/resources/customers";
import type { CountryCode } from "dodopayments/resources/misc";

import { JOB_PLANS } from "@/constants/jobs";
import type { JobPlan } from "@/constants/jobs";
import { DEFAULT_LOCALE, isLocale, localizedPath } from "@/constants/locales";
import {
  GTA_PACK_PRODUCT,
  PLAN_PRICE_CENTS,
  PLANS,
  planOffers,
} from "@/constants/plans";
import type { LocalPrices, Plan, PlanBilling } from "@/constants/plans";
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

/** Absolute app URL for the browser redirects Dodo sends buyers back to. */
const appUrl = (path: string, locale?: string): string => {
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return `${env.BETTER_AUTH_URL}${localizedPath(path, resolved)}`;
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

// Previews price public pages, so a slow Dodo must not hold them up: one
// short try, after which the caller falls back to the USD list prices.
const PREVIEW_OPTIONS = { maxRetries: 0, timeout: 3000 };

/**
 * One plan's line in a checkout preview for a billing country. Without
 * `currency`, Adaptive Currency picks the country's own. Countries Dodo
 * doesn't know throw (an API error).
 */
const previewPlan = async (
  country: string,
  productId: string,
  currency?: "USD"
) => {
  const preview = await getDodo().checkoutSessions.preview(
    {
      // SAFETY: a two-letter code from Cloudflare's `cf-ipcountry`; Dodo
      // validates it and rejects codes outside its list.
      billing_address: { country: country as CountryCode },
      ...(currency && { billing_currency: currency }),
      product_cart: [{ product_id: productId, quantity: 1 }],
    },
    PREVIEW_OPTIONS
  );
  const [item] = preview.product_cart;
  if (!item) {
    throw new Error(`Dodo previewed no line for ${productId}`);
  }
  return item;
};

/**
 * Whether Dodo's purchasing power parity already lowers a billing country's
 * prices, read from a checkout preview of Pro (annual). PPP is one
 * business-wide percentage per country, the same for every opted-in product,
 * so one plan stands for all. Dodo applies it to the product's price itself
 * (`og_price` already comes back reduced), so the preview's price is compared
 * with our list price, not with `og_price`. The preview is pinned to USD so
 * the two compare directly; a preview in another currency reads as no parity
 * rather than a wrong answer.
 */
export const hasParityPrice = async (country: string): Promise<boolean> => {
  const productId = planProductId("pro", "annual");
  const listCents = PLAN_PRICE_CENTS.pro.annual;
  if (!productId || !listCents) {
    return false;
  }
  const item = await previewPlan(country, productId, "USD");
  return item.currency === "USD" && item.discounted_price < listCents;
};

/**
 * What each plan costs a billing country, in the currency Dodo charges there,
 * read from one checkout preview per product. The previews leave the
 * currency to Dodo, so Adaptive Currency picks the country's own and
 * converts the list price into it, after purchasing power parity takes its
 * share. Each line's `discounted_price` is the per-unit price before tax
 * (these previews pass no discount codes), whatever trial a plan may get.
 * Null when a product isn't set up yet, or when the lines don't share a
 * currency: mixed currencies side by side would read as a mistake.
 */
export const countryPlanPrices = async (
  country: string
): Promise<Pick<LocalPrices, "cents" | "currency"> | null> => {
  const offers = PLANS.flatMap((plan) =>
    planOffers(plan).map((billing) => ({
      billing,
      plan,
      productId: planProductId(plan, billing),
    }))
  );
  if (offers.some(({ productId }) => !productId)) {
    return null;
  }
  const lines = await Promise.all(
    offers.map(async (offer) => ({
      ...offer,
      item: await previewPlan(country, offer.productId),
    }))
  );
  const currency = lines[0]?.item.currency;
  if (!currency || lines.some(({ item }) => item.currency !== currency)) {
    return null;
  }
  const cents: LocalPrices["cents"] = { business: {}, pro: {} };
  for (const { billing, plan, item } of lines) {
    cents[plan][billing] = item.discounted_price;
  }
  return { cents, currency };
};

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
const customersFor = async (email: string): Promise<Customer[]> => {
  const normalized = email.toLowerCase();
  const { items } = await getDodo().customers.list({
    email: normalized,
    page_size: 100,
  });
  return items.filter(
    (customer) => customer.email.toLowerCase() === normalized
  );
};

/**
 * Whether a customer has a paid, unrefunded purchase of a product. A product
 * that isn't set up yet (no ID in the env) has no purchases.
 */
const hasPaid = async (
  customerId: string,
  productId: string | undefined
): Promise<boolean> => {
  // Without a product ID the filter would match every payment.
  if (!productId) {
    return false;
  }
  const { items } = await getDodo().payments.list({
    customer_id: customerId,
    page_size: 100,
    product_id: productId,
    status: "succeeded",
  });
  return items.some((payment) => payment.refund_status !== "full");
};

/** The first of the customers with a paid, unrefunded purchase of a product. */
const payingCustomer = async (
  customers: Customer[],
  productId: string | undefined
): Promise<Customer | null> => {
  const paid = await Promise.all(
    customers.map((customer) => hasPaid(customer.customer_id, productId))
  );
  return customers.find((_, index) => paid[index]) ?? null;
};

// The retired Skill Bundle: no longer sold, but its buyers keep their skill
// repository access (Dodo's GitHub entitlement) and are told apart by it.
export const purchaseStatus = async (
  email: string
): Promise<{ purchased: boolean; name: string | null }> => {
  const customer = await payingCustomer(
    await customersFor(email),
    env.DODO_PRODUCT_SKILL
  );
  return { name: customer?.name || null, purchased: customer !== null };
};

/**
 * The one-time repository purchases an email paid for and kept: the retired
 * Skill Bundle and the GTA 6 Clip Pack, each granting its repository through
 * Dodo's GitHub entitlement.
 */
export const repoPurchases = async (
  email: string
): Promise<{ legacySkill: boolean; gtaPack: boolean }> => {
  const customers = await customersFor(email);
  const [skill, gtaPack] = await Promise.all([
    payingCustomer(customers, env.DODO_PRODUCT_SKILL),
    payingCustomer(customers, env.DODO_PRODUCT_GTA_PACK),
  ]);
  return { legacySkill: skill !== null, gtaPack: gtaPack !== null };
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
 * Codes for a plan checkout. `codes` are applied for the buyer; `locked`
 * hides the code field, so nothing else can be entered (or stacked on them).
 */
export interface CheckoutDiscounts {
  codes: string[];
  locked: boolean;
}

/**
 * Checkout for MotionVideo Pro or Business. The metadata ties the
 * subscription or lifetime payment to the account (src/server/plans.ts); Dodo
 * returns to /dashboard/billing, appending `subscription_id` or `payment_id`.
 * Outside a sale the code field shows (e.g. MOTIONVIDEOLAUNCH, 20% off every
 * plan); during one, `discounts` locks it and applies the sale's code.
 */
export const createPlanCheckoutUrl = async (
  plan: Plan,
  billing: PlanBilling,
  buyer: Buyer,
  locale: string | undefined,
  discounts: CheckoutDiscounts
): Promise<string> => {
  const productId = planProductId(plan, billing);
  if (!productId) {
    throw new Error("Plan products are not set up; run pnpm dodo:setup");
  }
  const params: CheckoutSessionCreateParams = {
    cancel_url: appUrl(ROUTES.PRO, locale),
    customer: { email: buyer.email },
    feature_flags: { allow_discount_code: !discounts.locked },
    metadata: { plan, billing, user_id: buyer.userId },
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: `${appUrl(ROUTES.DASHBOARD_BILLING, locale)}?checkout=success`,
  };
  if (discounts.codes.length === 0) {
    return checkoutUrl(params);
  }
  try {
    return await checkoutUrl({ ...params, discount_codes: discounts.codes });
  } catch (error) {
    // Dodo refuses a code it doesn't take right now (a second off at the
    // sale's edges, say: "not yet active"). Check out at the full price
    // rather than not at all.
    if (!(error instanceof UnprocessableEntityError)) {
      throw error;
    }
    console.error("Checkout code refused", discounts.codes, error.message);
    return checkoutUrl(params);
  }
};

/**
 * Checkout for the GTA 6 Clip Pack, one payment. Dodo's GitHub entitlement
 * grants the repository; the metadata ties the payment to the account. Dodo
 * returns to /dashboard/billing, where the repository card shows once the
 * payment is in.
 */
export const createGtaCheckoutUrl = (
  buyer: Buyer,
  locale?: string
): Promise<string> => {
  const productId = env.DODO_PRODUCT_GTA_PACK;
  if (!productId) {
    throw new Error("The GTA pack product is not set up; run pnpm dodo:setup");
  }
  return checkoutUrl({
    cancel_url: appUrl(ROUTES.GTA_CLIPPING, locale),
    customer: { email: buyer.email },
    feature_flags: { allow_discount_code: false },
    metadata: { product: GTA_PACK_PRODUCT, user_id: buyer.userId },
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: `${appUrl(ROUTES.DASHBOARD_BILLING, locale)}?checkout=${GTA_PACK_PRODUCT}`,
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
  buyer: Buyer,
  locale?: string
): Promise<string> => {
  const productId = SPONSOR_PRODUCT_IDS[tier][billing];
  if (!productId) {
    throw new Error("Sponsor products are not set up; run pnpm dodo:setup");
  }
  const query = `?sponsorship=${encodeURIComponent(sponsorshipId)}`;
  return checkoutUrl({
    cancel_url: `${appUrl(ROUTES.DASHBOARD_SPONSORSHIPS_NEW, locale)}${query}`,
    customer: { email: buyer.email },
    feature_flags: { allow_discount_code: false },
    metadata: {
      product: `sponsor-${tier}-${billing}`,
      sponsorship_id: sponsorshipId,
      user_id: buyer.userId,
    },
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: `${appUrl(ROUTES.DASHBOARD_SPONSORSHIPS, locale)}${query}`,
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
export const planPortalUrl = async (
  customerId: string,
  locale?: string
): Promise<string> => {
  const session = await getDodo().customers.customerPortal.create(customerId, {
    return_url: appUrl(ROUTES.DASHBOARD_BILLING, locale),
  });
  return session.link;
};

/**
 * The portal for a buyer without a plan, found by email: a retired Skill
 * Bundle or GTA 6 Clip Pack purchase (receipts, the GitHub connection for
 * the repository invite).
 */
export const purchasePortalUrl = async (
  email: string,
  locale?: string
): Promise<string> => {
  const customers = await customersFor(email);
  const customer =
    (await payingCustomer(customers, env.DODO_PRODUCT_SKILL)) ??
    (await payingCustomer(customers, env.DODO_PRODUCT_GTA_PACK));
  if (!customer) {
    throw new Error("No Dodo customer with a purchase for this email");
  }
  return planPortalUrl(customer.customer_id, locale);
};

/** Dodo's billing portal for one sponsor, returning to /sponsorships. */
export const sponsorPortalUrl = async (
  customerId: string,
  locale?: string
): Promise<string> => {
  const session = await getDodo().customers.customerPortal.create(customerId, {
    return_url: appUrl(ROUTES.DASHBOARD_SPONSORSHIPS, locale),
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
  buyer: Buyer,
  locale?: string
): Promise<string> => {
  const productId = JOB_PRODUCT_IDS[plan];
  if (!productId) {
    throw new Error("Job products are not set up; run pnpm dodo:setup");
  }
  const query = `?job=${encodeURIComponent(jobId)}`;
  return checkoutUrl({
    cancel_url: `${appUrl(ROUTES.DASHBOARD_JOBS_POST, locale)}${query}`,
    customer: { email: buyer.email },
    feature_flags: { allow_discount_code: false },
    metadata: { product: `job-${plan}`, job_id: jobId, user_id: buyer.userId },
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: `${appUrl(ROUTES.DASHBOARD_LISTINGS, locale)}${query}`,
  });
};
