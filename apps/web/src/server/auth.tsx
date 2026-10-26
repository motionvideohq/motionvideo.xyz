import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import { renderEmail } from "../emails/_render";
import SignInEmail, { signInSubject } from "../emails/sign-in";
import WelcomeEmail, { welcomeSubject } from "../emails/welcome";
import { hasSessionCookie } from "../lib/session-cookie";
import { createAuth } from "./auth-config";
import * as schema from "./db/schema";
import { purchaseStatus } from "./dodo";
import { sendEmail } from "./email";

// `env` from `cloudflare:workers` is readable at module scope; the D1 binding
// is only queried inside requests.
export const auth = createAuth(drizzle(env.DB, { schema }), {
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  turnstileSecret: env.TURNSTILE_SECRET_KEY || undefined,
  google:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        }
      : undefined,
  // Open sign-up: any email gets a code, and the account is created the first
  // time it is used. Purchases are matched by email on the dashboard. The
  // welcome flag comes from the client, so the thank-you template is only
  // used when the email really has a paid order.
  sendSignInCode: async (email, code, { welcome }) => {
    const purchase = welcome ? await purchaseStatus(email) : null;
    if (purchase?.purchased) {
      const firstName = purchase.name?.trim().split(/\s+/u)[0] || null;
      const props = { firstName, code };
      await sendEmail({
        subject: welcomeSubject(props),
        to: email,
        ...(await renderEmail(<WelcomeEmail {...props} />)),
      });
      return;
    }
    await sendEmail({
      subject: signInSubject(code),
      to: email,
      ...(await renderEmail(<SignInEmail code={code} />)),
    });
  },
});

/**
 * The signed-in session for the current request, or `null`. Visitors without
 * a session cookie (most of them) are answered without touching Better Auth.
 */
export const getCurrentSession = () => {
  const { headers } = getRequest();
  return hasSessionCookie(headers)
    ? auth.api.getSession({ headers })
    : Promise.resolve(null);
};
