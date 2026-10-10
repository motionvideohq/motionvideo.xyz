import { env } from "cloudflare:workers";
import DodoPayments, { APIError, NotFoundError } from "dodopayments";
import type { CheckoutSessionCreateParams } from "dodopayments/resources/checkout-sessions";

import {
  BASE_PRICE_CENTS,
  LAUNCH_LIMIT,
  LAUNCH_PRICE_CENTS,
} from "@/constants/pricing";
import type { Offer } from "@/constants/pricing";
import { ROUTES } from "@/constants/routes";

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

/** Public `?product=` values for /checkout, mapped to Dodo product IDs. */
const PRODUCT_IDS = {
  diamond: env.DODO_PRODUCT_SPONSOR_DIAMOND,
  gold: env.DODO_PRODUCT_SPONSOR_GOLD,
  silver: env.DODO_PRODUCT_SPONSOR_SILVER,
  skill: env.DODO_PRODUCT_SKILL,
} as const;

export type CheckoutProduct = keyof typeof PRODUCT_IDS;

export const isCheckoutProduct = (value: string): value is CheckoutProduct =>
  Object.hasOwn(PRODUCT_IDS, value);

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

const hasPaidSkill = async (customerId: string): Promise<boolean> => {
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

const launchDiscount = async (): Promise<{ code: string; offer: Offer }> => {
  const discount = await getDodo().discounts.retrieve(env.DODO_LAUNCH_DISCOUNT_ID);
  const usd = discount.currency_options?.find(
    (option) => option.currency === "USD"
  );
  if (
    discount.type !== "flat" ||
    usd?.max_amount_possible !== BASE_PRICE_CENTS - LAUNCH_PRICE_CENTS ||
    discount.usage_limit !== LAUNCH_LIMIT ||
    discount.restricted_to.length !== 1 ||
    discount.restricted_to[0] !== env.DODO_PRODUCT_SKILL
  ) {
    throw new Error(
      "Dodo launch discount must be $20 off the skill bundle, capped at 100"
    );
  }
  const now = Date.now();
  return {
    code: discount.code,
    offer: {
      active:
        discount.times_used < LAUNCH_LIMIT &&
        (!discount.starts_at || Date.parse(discount.starts_at) <= now) &&
        (!discount.expires_at || Date.parse(discount.expires_at) > now),
      limit: LAUNCH_LIMIT,
      sold: discount.times_used,
    },
  };
};

export const launchOffer = async (): Promise<Offer> => {
  const { offer } = await launchDiscount();
  return offer;
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

export const createCheckoutUrl = async (
  product: CheckoutProduct,
  email: string | null
): Promise<string> => {
  const base = env.BETTER_AUTH_URL;
  const skill = product === "skill";
  const params: CheckoutSessionCreateParams = {
    cancel_url: `${base}${skill ? ROUTES.PRICING : ROUTES.SPONSOR}`,
    customer: email ? { email } : undefined,
    // No code field at checkout: only the server applies the launch code.
    feature_flags: { allow_discount_code: false },
    metadata: { product },
    product_cart: [{ product_id: PRODUCT_IDS[product], quantity: 1 }],
    // Dodo appends `payment_id` (one-time) or `subscription_id` and `status`.
    return_url: skill
      ? `${base}${ROUTES.WELCOME}`
      : `${base}${ROUTES.SPONSOR}?thanks=${product}`,
  };
  if (!skill) {
    return checkoutUrl(params);
  }
  const { code, offer } = await launchDiscount();
  if (!offer.active) {
    return checkoutUrl(params);
  }
  try {
    // Dodo rejects preset codes unless the code field is enabled, so the
    // discounted session shows it with the launch code already applied.
    return await checkoutUrl({
      ...params,
      discount_codes: [code],
      feature_flags: { allow_discount_code: true },
    });
  } catch (error) {
    // The code can run out between reading the offer and creating the
    // session. Only then does a rejected session fall back to full price.
    if (
      !(error instanceof APIError) ||
      error.status === undefined ||
      error.status >= 500
    ) {
      throw error;
    }
    const current = await launchOffer();
    if (current.active) {
      throw error;
    }
    return checkoutUrl(params);
  }
};

export interface CompletedCheckout {
  /** False while Dodo is still confirming the payment. */
  succeeded: boolean;
  email: string | null;
}

/**
 * Null when Dodo has no skill bundle payment with this id (bad or tampered
 * link, or a payment for another product).
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

export const customerPortalUrl = async (email: string): Promise<string> => {
  const customer = await skillCustomer(email);
  if (!customer) {
    throw new Error("No Dodo customer with a purchase for this email");
  }
  const session = await getDodo().customers.customerPortal.create(
    customer.customer_id,
    { return_url: `${env.BETTER_AUTH_URL}${ROUTES.DASHBOARD}` }
  );
  return session.link;
};
