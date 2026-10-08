import { PolarCore } from "@polar-sh/sdk/core.js";
import { checkoutsCreate } from "@polar-sh/sdk/funcs/checkoutsCreate.js";
import { checkoutsGet } from "@polar-sh/sdk/funcs/checkoutsGet.js";
import { customerSessionsCreate } from "@polar-sh/sdk/funcs/customerSessionsCreate.js";
import { customersList } from "@polar-sh/sdk/funcs/customersList.js";
import { discountsGet } from "@polar-sh/sdk/funcs/discountsGet.js";
import { ordersList } from "@polar-sh/sdk/funcs/ordersList.js";
import { HTTPValidationError } from "@polar-sh/sdk/models/errors/httpvalidationerror.js";
import { ResourceNotFound } from "@polar-sh/sdk/models/errors/resourcenotfound.js";
import type { Result } from "@polar-sh/sdk/types/fp.js";
import { env } from "cloudflare:workers";

import { BASE_PRICE_CENTS, LAUNCH_LIMIT, LAUNCH_PRICE_CENTS } from '@/constants/pricing';
import type { Offer } from '@/constants/pricing';

// Standalone functions keep the Worker bundle small (the full `Polar` class
// pulls in every endpoint).
const polar = new PolarCore({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_SERVER === "sandbox" ? "sandbox" : "production",
});

const unwrap = <T>(result: Result<T, Error>): T => {
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
};
// Polar customer ids for an email. Buyers check out as guests, so the email
// they paid with is the only link between them and their orders.
const customerIdsFor = async (email: string): Promise<string[]> => {
  const { result } = unwrap(
    await customersList(polar, { email: email.toLowerCase(), limit: 100 })
  );
  return result.items.map((customer) => customer.id);
};

export const purchaseStatus = async (
  email: string
): Promise<{ purchased: boolean; name: string | null }> => {
  const customerIds = await customerIdsFor(email);
  if (customerIds.length === 0) {
    return { name: null, purchased: false };
  }
  const { result } = unwrap(
    await ordersList(polar, {
      customerId: customerIds,
      limit: 100,
      productId: [env.POLAR_PRODUCT_ID, env.POLAR_LEGACY_PRODUCT_ID],
    })
  );
  const paid = result.items.filter(
    (order) => order.paid && order.status !== "refunded"
  );
  const [order] = paid;
  return {
    name: order?.customer.name ?? order?.billingName ?? null,
    purchased: paid.length > 0,
  };
};

export const hasPurchased = async (email: string): Promise<boolean> => {
  const status = await purchaseStatus(email);
  return status.purchased;
};

export const launchOffer = async (): Promise<Offer> => {
  const discount = unwrap(
    await discountsGet(polar, { id: env.POLAR_LAUNCH_DISCOUNT_ID })
  );
  if (
    discount.type !== "fixed" ||
    !("amounts" in discount) ||
    discount.amounts.usd !== BASE_PRICE_CENTS - LAUNCH_PRICE_CENTS ||
    discount.maxRedemptions !== LAUNCH_LIMIT ||
    discount.products.length !== 1 ||
    discount.products[0]?.id !== env.POLAR_PRODUCT_ID
  ) {
    throw new Error("Polar launch discount must be $20 off this product, capped at 100");
  }
  const now = Date.now();
  return {
    active:
      discount.redemptionsCount < LAUNCH_LIMIT &&
      (discount.startsAt === null || discount.startsAt.getTime() <= now) &&
      (discount.endsAt === null || discount.endsAt.getTime() > now),
    limit: LAUNCH_LIMIT,
    // Polar reserves a redemption at payment confirmation, freeing failed payments.
    sold: discount.redemptionsCount,
  };
};

export const createCheckoutUrl = async (
  request: Request,
  email: string | null
): Promise<string> => {
  const offer = await launchOffer();
  const checkoutRequest = {
    allowDiscountCodes: false,
    currency: "usd" as const,
    customerEmail: email,
    customerIpAddress: request.headers.get("cf-connecting-ip"),
    products: [env.POLAR_PRODUCT_ID],
    returnUrl: `${env.BETTER_AUTH_URL}/`,
    successUrl: `${env.BETTER_AUTH_URL}/welcome?checkout_id={CHECKOUT_ID}`,
  };
  const result = await checkoutsCreate(polar, {
    ...checkoutRequest,
    discountId: offer.active ? env.POLAR_LAUNCH_DISCOUNT_ID : undefined,
  });
  if (
    !result.ok &&
    offer.active &&
    result.error instanceof HTTPValidationError &&
    result.error.detail?.some(
      (error) =>
        error.loc[0] === "body" &&
        error.loc[1] === "discount_id" &&
        error.type === "value_error" &&
        error.msg === "Discount does not exist."
    )
  ) {
    const currentOffer = await launchOffer();
    if (!currentOffer.active) {
      // Exhaustion between reading the offer and creating the session. Only this
      // documented Polar validation error permits a fresh regular-price checkout.
      const regularCheckout = unwrap(
        await checkoutsCreate(polar, checkoutRequest)
      );
      return regularCheckout.url;
    }
  }
  return unwrap(result).url;
};

export interface CompletedCheckout {
  /** False while Polar is still confirming the payment. */
  succeeded: boolean;
  email: string | null;
}

/** Null when Polar has no checkout with this id (bad or tampered link). */
export const completedCheckout = async (
  checkoutId: string
): Promise<CompletedCheckout | null> => {
  const result = await checkoutsGet(polar, { id: checkoutId });
  if (!result.ok) {
    if (result.error instanceof ResourceNotFound) {
      return null;
    }
    throw result.error;
  }
  return {
    email: result.value.customerEmail,
    succeeded: result.value.status === "succeeded",
  };
};

export const customerPortalUrl = async (email: string): Promise<string> => {
  const [customerId] = await customerIdsFor(email);
  if (!customerId) {
    throw new Error("No Polar customer for this email");
  }
  const session = unwrap(
    await customerSessionsCreate(polar, {
      customerId,
      returnUrl: `${env.BETTER_AUTH_URL}/dashboard`,
    })
  );
  return session.customerPortalUrl;
};
