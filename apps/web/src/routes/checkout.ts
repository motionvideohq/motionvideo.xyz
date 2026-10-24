import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { PLAN_BILLINGS, PLANS, planOffers } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { auth } from "@/server/auth";
import { createPlanCheckoutUrl } from "@/server/dodo";
import { liveOwnedRow } from "@/server/plans";

const redirect = (location: string): Response =>
  new Response(null, { headers: { Location: location }, status: 303 });

// `/checkout?plan=pro&billing=annual`: the Pro page's buttons. Signs in
// first (coming back here), sends accounts that already pay for a plan to
// /dashboard/billing (changes go through Dodo's portal), and otherwise
// redirects to Dodo. The retired `?product=skill` and anything invalid go to
// /pro.
export const Route = createFileRoute("/checkout")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const plan = z.enum(PLANS).safeParse(url.searchParams.get("plan")).data;
        const billing = z
          .enum(PLAN_BILLINGS)
          .safeParse(url.searchParams.get("billing")).data;
        if (!plan || !billing || !planOffers(plan).includes(billing)) {
          return redirect(ROUTES.PRO);
        }
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          const back = `${url.pathname}${url.search}`;
          return redirect(
            `${ROUTES.SIGN_IN}?redirect=${encodeURIComponent(back)}`
          );
        }
        if (await liveOwnedRow(session.user)) {
          return redirect(ROUTES.DASHBOARD_BILLING);
        }
        return redirect(
          await createPlanCheckoutUrl(plan, billing, {
            email: session.user.email,
            userId: session.user.id,
          })
        );
      },
    },
  },
});
