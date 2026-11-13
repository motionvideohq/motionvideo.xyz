import { useEffect } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { LocalizedLink as Link } from "@/components/localized-link";
import { hasPro } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { useSession } from "@/lib/auth-client";
import { fillTemplate } from "@/lib/motion-video-route";
import { OFFER_RULES, upcomingOffers } from "@/lib/offers";
import type { OfferPhase } from "@/lib/offers";
import { cn } from "@/lib/utils";
import { getMyPlan } from "@/server/plan-functions";

// The offer banner above every page. The worker marks the page with the offer
// running and its phase (`<html data-offer=
// "black-friday-2026" data-offer-phase="teaser">`, see src/server.ts),
// prerendered pages included, so the banner can't be decided in the render.
// Instead every offer's bar for every phase is rendered hidden, and
// `offerScript`, before first paint, adds a style that shows the running one.
// No flash, no layout jump. During the sale the whole bar links to /pro. Its
// background is the /pro hero's flowing amber gradient (`bg-pro-gradient`).

const PHASES = ["teaser", "sale", "last-call"] as const satisfies OfferPhase[];
const STYLE_ID = "offer-banner-style";

/** Head script: shows the running bar (`data-offer` minus its year, and the phase). */
export const offerScript = `(() => {
  const { offer, offerPhase } = document.documentElement.dataset;
  if (!offer || !offerPhase || document.getElementById("${STYLE_ID}")) return;
  const style = document.createElement("style");
  style.id = "${STYLE_ID}";
  style.textContent = 'html [data-offer-banner="' + offer.replace(/-\\d+$/, "") + '"][data-offer-phase="' + offerPhase + '"]{display:flex}';
  document.head.append(style);
})()`;

const BAR =
  "bg-pro-gradient text-cta-foreground hidden min-h-9 items-center justify-center px-4 py-2 text-sm print:hidden";

const MESSAGE_KEY = {
  teaser: "teaser",
  sale: "sale",
  "last-call": "lastCall",
} as const satisfies Record<OfferPhase, string>;

// Each rule's current or next run, for the date in its teaser. Read when the
// module loads: a page view (or a prerender) never spans a run's end and the
// next teaser.
const UPCOMING = upcomingOffers(Date.now());

export const OfferBanner = () => {
  const content = useIntlayer("offer-banner");
  const { locale } = useLocale();
  const session = useSession();
  const signedIn = Boolean(session.data?.user);

  // Accounts with a plan aren't offered it (the code is for first purchases):
  // once the session says so, the bar goes for this page view.
  useEffect(() => {
    if (!signedIn || !document.querySelector(`#${STYLE_ID}`)) {
      return;
    }
    let current = true;
    const hideForPlanHolders = async () => {
      try {
        const access = await getMyPlan();
        if (current && access && hasPro(access)) {
          document.querySelector(`#${STYLE_ID}`)?.remove();
        }
      } catch {
        // Unknown plan: the bar stays; the code's own eligibility still holds.
      }
    };
    void hideForPlanHolders();
    return () => {
      current = false;
    };
  }, [signedIn]);

  // The teaser names the day the sale starts, in Pacific time like the sale.
  const startDay = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone: "America/Los_Angeles",
  });

  return OFFER_RULES.flatMap((rule) => {
    const offer = UPCOMING.find((candidate) => candidate.rule === rule.id);
    return PHASES.map((phase) => {
      const message = fillTemplate(content[rule.id][MESSAGE_KEY[phase]].value, {
        date: offer ? startDay.format(offer.startsAt) : "",
        percent: String(rule.percentOff),
      });
      const bar = {
        "data-offer-banner": rule.id,
        "data-offer-phase": phase,
      };
      // The teaser only gives notice: no prices to see yet, so no link.
      if (phase === "teaser") {
        return (
          <div key={`${rule.id}-${phase}`} {...bar} className={BAR}>
            <p className="text-center text-pretty">{message}</p>
          </div>
        );
      }
      return (
        <Link
          key={`${rule.id}-${phase}`}
          {...bar}
          to={ROUTES.PRO}
          search={{ billing: "annual" }}
          data-track="offer_banner"
          data-track-offer={rule.id}
          data-track-phase={phase}
          className={cn(
            BAR,
            "group/offer focus-visible:ring-foreground/40 transition-[filter] duration-150 outline-none hover:brightness-105 focus-visible:ring-2 focus-visible:ring-inset motion-reduce:transition-none"
          )}
        >
          <p className="text-center text-pretty">
            {message}
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-black/[0.08] px-2.5 py-0.5 font-semibold transition-colors duration-150 group-hover/offer:bg-black/85 group-hover/offer:text-white group-focus-visible/offer:bg-black/85 group-focus-visible/offer:text-white motion-reduce:transition-none">
              {content.cta}
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-150 group-hover/offer:translate-x-0.5 motion-reduce:transition-none"
              />
            </span>
          </p>
        </Link>
      );
    });
  });
};
