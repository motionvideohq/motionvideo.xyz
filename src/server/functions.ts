import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { z } from "zod";

import { LINK } from "@/constants/links";
import { SITE } from "@/constants/site";
import { contactSchema } from "@/lib/contact";

import { auth } from "./auth";
import { sendEmail } from "./email";
import {
  completedCheckout,
  customerPortalUrl,
  launchOffer,
  purchaseStatus,
} from "./polar";

const currentSession = () => {
  const request = getRequest();
  return auth.api.getSession({ headers: request.headers });
};

export const getLandingData = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await currentSession();
    return { signedIn: session !== null };
  }
);

export const getOffer = createServerFn({ method: "GET" }).handler(
  () => launchOffer()
);

export const getAccount = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await currentSession();
    if (!session) {
      return null;
    }
    const purchase = await purchaseStatus(session.user.email);
    return { email: session.user.email, ...purchase };
  }
);

export const getPortalUrl = createServerFn({ method: "POST" }).handler(
  async () => {
    const session = await currentSession();
    if (!session) {
      throw new Error("Unauthorized");
    }
    return customerPortalUrl(session.user.email);
  }
);

// Polar's success redirect lands on /welcome with the checkout id; the email
// on that checkout is where the buyer's sign-in link goes.
export const getCheckoutResult = createServerFn({ method: "GET" })
  .validator(z.object({ checkoutId: z.string().min(1) }))
  .handler(({ data }) => completedCheckout(data.checkoutId));

export type ContactResult = { ok: true } | { ok: false; error: string };

// Sends a contact-form message to the support inbox, with Reply-To set to
// the sender so answering from the inbox reaches them directly.
export const sendContactMessage = createServerFn({ method: "POST" })
  .validator(contactSchema)
  .handler(async ({ data }): Promise<ContactResult> => {
    const ip = getRequest().headers.get("cf-connecting-ip") ?? "unknown";
    const { success } = await env.CONTACT_LIMITER.limit({ key: ip });
    if (!success) {
      return { error: "Too many messages. Try again in a minute.", ok: false };
    }
    await sendEmail({
      replyTo: data.email,
      subject: `${SITE.NAME} [${data.inquiry}]: ${data.subject}`,
      text: `From: ${data.name} <${data.email}>\nInquiry: ${data.inquiry}\n\n${data.message}`,
      to: LINK.EMAIL,
    });
    return { ok: true };
  });
