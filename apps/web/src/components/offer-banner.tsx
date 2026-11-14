import { useEffect } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { BadgePercent } from "reicon-react/icons/BadgePercent";

import { LocalizedLink as Link } from "@/components/localized-link";
import {
  CountdownPills,
  shortTimeLeft,
  useNowSecond,
} from "@/components/offer-countdown";
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
// No flash, no layout jump. During the sale the whole bar links to /pro, on
// one line at every width:
//   phones   30% off Pro · 3d 10h left  [Claim 30%]
//   md       % Black Friday  30% off Pro  Ends in 17d 00h 09m 35s  Claim 30% →
//   xl       the same with the full deal (Pro annual and lifetime, Business annual)
// Its background is the /pro hero's flowing amber gradient (`bg-pro-gradient`).

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
  "bg-pro-gradient text-cta-foreground hidden min-h-9 items-center justify-center px-3 py-1.5 text-sm whitespace-nowrap print:hidden sm:px-4";

// Each rule's current or next run, for the date in its teaser and the end of
// its countdown. Read when the module loads: a page view (or a prerender)
// never spans a run's end and the next teaser.
const UPCOMING = upcomingOffers(Date.now());

export const OfferBanner = () => {
  const content = useIntlayer("offer-banner");
  const { locale } = useLocale();
  const session = useSession();
  const signedIn = Boolean(session.data?.user);
  const now = useNowSecond();

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
    const copy = content[rule.id];
    const values = {
      date: offer ? startDay.format(offer.startsAt) : "",
      percent: String(rule.percentOff),
    };
    return PHASES.map((phase) => {
      const bar = {
        "data-offer-banner": rule.id,
        "data-offer-phase": phase,
      };
      // The teaser only gives notice: no prices to see yet, so no link.
      if (phase === "teaser") {
        return (
          <div key={`${rule.id}-${phase}`} {...bar} className={BAR}>
            <p className="truncate">
              {fillTemplate(copy.teaser.value, values)}
            </p>
          </div>
        );
      }
      const left = offer ? shortTimeLeft(offer.endsAt, now, locale) : "";
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
            "group/offer focus-visible:ring-foreground/40 gap-3 transition-[filter] duration-150 outline-none hover:brightness-105 focus-visible:ring-2 focus-visible:ring-inset motion-reduce:transition-none md:gap-4"
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <BadgePercent
              aria-hidden="true"
              className="hidden size-4.5 shrink-0 md:block"
            />
            <strong className="hidden font-bold md:inline">
              {phase === "last-call" ? content.lastChance : copy.name}
            </strong>
            <span className="truncate font-semibold md:font-normal md:opacity-80">
              <span className="xl:hidden">
                {fillTemplate(copy.dealShort.value, values)}
              </span>
              <span className="hidden xl:inline">
                {fillTemplate(copy.deal.value, values)}
              </span>
            </span>
            {offer && (
              <span
                className={cn("opacity-75 md:hidden", !left && "invisible")}
              >
                · {fillTemplate(content.left.value, { time: left })}
              </span>
            )}
          </span>
          {offer && (
            <span className="hidden items-center gap-2 md:inline-flex">
              <span className="opacity-75">{content.endsIn}</span>
              <CountdownPills
                endsAt={offer.endsAt}
                now={now}
                locale={locale}
                pillClassName="bg-black/[0.08]"
              />
            </span>
          )}
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-black/[0.08] px-2.5 py-0.5 font-semibold transition-colors duration-150 group-hover/offer:bg-black/85 group-hover/offer:text-white group-focus-visible/offer:bg-black/85 group-focus-visible/offer:text-white motion-reduce:transition-none">
            {fillTemplate(content.cta.value, values)}
            <ArrowRight
              aria-hidden="true"
              className="hidden size-3.5 transition-transform duration-150 group-hover/offer:translate-x-0.5 motion-reduce:transition-none md:block"
            />
          </span>
        </Link>
      );
    });
  });
};
