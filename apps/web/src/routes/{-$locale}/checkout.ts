import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { localeFromPath, localizedPath } from "@/constants/locales";
import {
  GTA_PACK_PRODUCT,
  PLAN_BILLINGS,
  PLANS,
  planOffers,
} from "@/constants/plans";
import type { Plan, PlanBilling } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { getAuth } from "@/server/auth";
import { createGtaCheckoutUrl, createPlanCheckoutUrl } from "@/server/dodo";
import { liveOwnedRow, planAccessFor } from "@/server/plans";
import { checkoutDiscounts } from "@/server/visitor-pricing";

const redirect = (location: string): Response =>
  new Response(null, { headers: { Location: location }, status: 303 });

type Order =
  | { kind: "gta-pack" }
  | { kind: "plan"; plan: Plan; billing: PlanBilling };

// What the query asks for; null when it's invalid.
const orderOf = (params: URLSearchParams): Order | null => {
  if (params.get("product") === GTA_PACK_PRODUCT) {
    return { kind: "gta-pack" };
  }
  const plan = z.enum(PLANS).safeParse(params.get("plan")).data;
  const billing = z.enum(PLAN_BILLINGS).safeParse(params.get("billing")).data;
  if (!plan || !billing || !planOffers(plan).includes(billing)) {
    return null;
  }
  return { kind: "plan", plan, billing };
};

// `/checkout?plan=pro&billing=annual`: the Pro page's buttons, and
// `/checkout?product=gta-pack`: the GTA 6 Clip Pack page's. Signs in first
// (coming back here), sends accounts that already pay for a plan (or already
// have the pack) to /dashboard/billing (changes go through Dodo's portal),
// and otherwise redirects to Dodo. The retired `?product=skill` and anything
// invalid go to /pro.
export const Route = createFileRoute("/{-$locale}/checkout")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const locale = localeFromPath(url.pathname);
        const order = orderOf(url.searchParams);
        if (!order) {
          return redirect(localizedPath(ROUTES.PRO, locale));
        }
        const session = await getAuth().api.getSession({
          headers: request.headers,
        });
        if (!session) {
          const back = `${url.pathname}${url.search}`;
          return redirect(
            `${localizedPath(ROUTES.SIGN_IN, locale)}?redirect=${encodeURIComponent(back)}`
          );
        }
        const buyer = { email: session.user.email, userId: session.user.id };
        if (order.kind === "gta-pack") {
          // Bought already, or included in the account's plan.
          const access = await planAccessFor(session.user);
          if (access.gtaPack) {
            return redirect(localizedPath(ROUTES.DASHBOARD_BILLING, locale));
          }
          return redirect(await createGtaCheckoutUrl(buyer, locale));
        }
        if (await liveOwnedRow(session.user)) {
          return redirect(localizedPath(ROUTES.DASHBOARD_BILLING, locale));
        }
        return redirect(
          await createPlanCheckoutUrl(
            order.plan,
            order.billing,
            buyer,
            locale,
            await checkoutDiscounts(request, order.plan, order.billing)
          )
        );
      },
    },
  },
});
