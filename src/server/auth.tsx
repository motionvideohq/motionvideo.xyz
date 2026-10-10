import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import { renderEmail } from "../emails/_render";
import SignInEmail, { signInSubject } from "../emails/sign-in";
import WelcomeEmail, { welcomeSubject } from "../emails/welcome";
import { createAuth } from "./auth-config";
import * as schema from "./db/schema";
import { purchaseStatus } from "./dodo";
import { sendEmail } from "./email";

// `env` from `cloudflare:workers` is readable at module scope; the D1 binding
// is only queried inside requests.
export const auth = createAuth(drizzle(env.DB, { schema }), {
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  // Open sign-up: any email gets a link, and the account is created the first
  // time the link is used. Purchases are matched by email on the dashboard.
  // The welcome flag comes from the client, so the thank-you template is only
  // used when the email really has a paid order.
  sendMagicLink: async (email, url, { welcome }) => {
    const purchase = welcome ? await purchaseStatus(email) : null;
    if (purchase?.purchased) {
      const firstName = purchase.name?.trim().split(/\s+/u)[0] || null;
      const props = { firstName, url };
      await sendEmail({
        subject: welcomeSubject(props),
        to: email,
        ...(await renderEmail(<WelcomeEmail {...props} />)),
      });
      return;
    }
    await sendEmail({
      subject: signInSubject,
      to: email,
      ...(await renderEmail(<SignInEmail url={url} />)),
    });
  },
});

/** The signed-in session for the current request, or `null`. */
export const getCurrentSession = () =>
  auth.api.getSession({ headers: getRequest().headers });
