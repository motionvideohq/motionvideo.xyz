import { createFileRoute } from "@tanstack/react-router";

import { CACHE_CONTROL } from "@/constants/cache-control";
import { DEFAULT_LOCALE, localizedPath } from "@/constants/locales";
import {
  BUSINESS_SEATS,
  GTA_PACK_PLANS,
  GTA_PACK_PRICE_CENTS,
  PLAN_PRICE_CENTS,
  PLANS,
  planOffers,
} from "@/constants/plans";
import type { Plan, PlanBilling } from "@/constants/plans";
import { formatUsd } from "@/constants/pricing";
import { ROUTES, docsMarkdownPath } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/constants/url";

// MotionVideo's plans and prices as Markdown, for agents comparing tools.
// Prices come from PLAN_PRICE_CENTS, the same source as /pro and checkout.

const PLAN_NAMES: Record<Plan, string> = { pro: "Pro", business: "Business" };
const BILLING_NAMES: Record<PlanBilling, string> = {
  monthly: "per month",
  annual: "per year",
  lifetime: "once, lifetime",
};

const body = `# ${SITE.NAME} pricing

> The gallery, its prompts, the MCP server's catalog tools and the onboarding skill are free. Pro and Business unlock the paid library.

Prices in US dollars, before tax; taxes are added at checkout where they apply. Many countries pay in their own currency, and some get regional pricing: ${absoluteUrl(localizedPath(ROUTES.PRO, DEFAULT_LOCALE))} shows the visitor's own prices.

## What a plan includes

Pro and Business unlock the same things:

- Every move's copy-ready prompt (${absoluteUrl(localizedPath(ROUTES.MOVES, DEFAULT_LOCALE))})
- Every template's full prompt, with Copy and Customize (${absoluteUrl(localizedPath(ROUTES.TEMPLATES, DEFAULT_LOCALE))})
- The Pro agent skill, installed from a private GitHub repository
- The Pro MCP tools: \`search-moves\` and \`get-move-prompt\`
- Every future update, including new moves and templates

${PLANS.map(
  (plan) => `## ${PLAN_NAMES[plan]}

${plan === "pro" ? "For one person." : `For teams: ${BUSINESS_SEATS} seats, the owner included.`}

${planOffers(plan)
  .map(
    (billing) =>
      `- ${formatUsd(PLAN_PRICE_CENTS[plan][billing] ?? 0)} ${BILLING_NAMES[billing]}`
  )
  .join("\n")}`
).join("\n\n")}

## GTA 6 Clip Pack

Six agent skills that add a GTA-flavored motion-graphics layer to gameplay clips (wanted meter, mission cards, kinetic captions, HUD callouts, impact effects), rendered by any renderer skill. Installed from a private GitHub repository.

- ${formatUsd(GTA_PACK_PRICE_CENTS)} once
- Included with ${GTA_PACK_PLANS.map(([plan, billing]) => `${PLAN_NAMES[plan]} ${billing}`).join(", ")} (the plan owner's GitHub account; not Business seats)

Details: ${absoluteUrl(docsMarkdownPath(ROUTES.DOCS_GTA))}. Checkout: ${absoluteUrl(localizedPath(ROUTES.GTA_CLIPPING, DEFAULT_LOCALE))}

## Billing

Monthly and annual plans renew until canceled; a canceled plan stays active until the end of the paid period. Lifetime is paid once and never expires. Details: ${absoluteUrl(docsMarkdownPath(ROUTES.DOCS_PLANS))}

Checkout: ${absoluteUrl(localizedPath(ROUTES.PRO, DEFAULT_LOCALE))}
`;

export const Route = createFileRoute("/pricing.md")({
  server: {
    handlers: {
      GET: () =>
        new Response(body, {
          headers: {
            "Cache-Control": CACHE_CONTROL.PUBLIC_HOUR,
            "Content-Type": "text/markdown; charset=utf-8",
          },
        }),
    },
  },
});
