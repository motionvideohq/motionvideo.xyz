import { createFileRoute } from "@tanstack/react-router";

import { DEFAULT_LOCALE, localizedPath } from "@/constants/locales";
import {
  BUSINESS_SEATS,
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

Prices in US dollars, before tax. Some countries see a purchasing power discount at checkout.

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
            "Cache-Control": "public, max-age=3600",
            "Content-Type": "text/markdown; charset=utf-8",
          },
        }),
    },
  },
});
