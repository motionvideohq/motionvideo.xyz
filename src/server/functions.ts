import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { z } from "zod";

import { LINK } from "@/constants/links";
import { SITE } from "@/constants/site";
import { contactSchema } from "@/lib/contact";

import { getCurrentSession } from "./auth";
import {
  completedCheckout,
  customerPortalUrl,
  launchOffer,
  purchaseStatus,
} from "./dodo";
import { sendEmail } from "./email";

export const getLandingData = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getCurrentSession();
    return { signedIn: session !== null };
  }
);

export const getOffer = createServerFn({ method: "GET" }).handler(() =>
  launchOffer()
);

export const getAccount = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getCurrentSession();
    if (!session) {
      return null;
    }
    const purchase = await purchaseStatus(session.user.email);
    return { email: session.user.email, ...purchase };
  }
);

export const getPortalUrl = createServerFn({ method: "POST" }).handler(
  async () => {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error("Unauthorized");
    }
    return customerPortalUrl(session.user.email);
  }
);

// Dodo's return redirect lands on /welcome with the payment id; the email on
// that payment is where the buyer's sign-in link goes.
export const getCheckoutResult = createServerFn({ method: "GET" })
  .validator(z.object({ paymentId: z.string().min(1) }))
  .handler(({ data }) => completedCheckout(data.paymentId));

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
