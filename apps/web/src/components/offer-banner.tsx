import { useEffect } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { Xmark } from "reicon-react/icons/Xmark";

import { LocalizedLink as Link } from "@/components/localized-link";
import { hasPro } from "@/constants/plans";
import { ROUTES } from "@/constants/routes";
import { useSession } from "@/lib/auth-client";
import { fillTemplate } from "@/lib/motion-video-route";
import { OFFER_RULES, upcomingOffers } from "@/lib/offers";
import type { OfferPhase } from "@/lib/offers";
import { getMyPlan } from "@/server/plan-functions";

// The offer banner above every page. The worker marks the page with the offer
// running for this visitor and its phase (`<html data-offer=
// "black-friday-2026" data-offer-phase="teaser">`, see src/server.ts),
// prerendered pages included, so the banner can't be decided in the render.
// Instead every offer's bar for every phase is rendered hidden, and
// `offerScript`, before first paint, adds a style that shows the running one,
// unless it was dismissed. No flash, no layout jump. A dismissal holds for
// that phase only: the sale and the last call still show after the teaser.

const PHASES = ["teaser", "sale", "last-call"] as const satisfies OfferPhase[];
const DISMISSED_KEY = "mv-offer-dismissed";
const STYLE_ID = "offer-banner-style";

/** Head script: shows the running bar (`data-offer` minus its year, and the phase). */
export const offerScript = `(() => {
  const { offer, offerPhase } = document.documentElement.dataset;
  if (!offer || !offerPhase || document.getElementById("${STYLE_ID}") || localStorage.getItem("${DISMISSED_KEY}") === offer + ":" + offerPhase) return;
  const style = document.createElement("style");
  style.id = "${STYLE_ID}";
  style.textContent = 'html [data-offer-banner="' + offer.replace(/-\\d+$/, "") + '"][data-offer-phase="' + offerPhase + '"]{display:flex}';
  document.head.append(style);
})()`;

/** Hides the bar and remembers it for the rest of this phase. */
const dismiss = () => {
  document.querySelector(`#${STYLE_ID}`)?.remove();
  const { offer, offerPhase } = document.documentElement.dataset;
  if (offer && offerPhase) {
    localStorage.setItem(DISMISSED_KEY, `${offer}:${offerPhase}`);
  }
};

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
  // once the session says so, the bar goes, as if dismissed.
  useEffect(() => {
    if (!signedIn || !document.querySelector(`#${STYLE_ID}`)) {
      return;
    }
    let current = true;
    const hideForPlanHolders = async () => {
      try {
        const access = await getMyPlan();
        if (current && access && hasPro(access)) {
          dismiss();
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
    return PHASES.map((phase) => (
      <div
        key={`${rule.id}-${phase}`}
        data-offer-banner={rule.id}
        data-offer-phase={phase}
        className="from-cta-from to-cta-to text-cta-foreground relative hidden min-h-9 items-center justify-center bg-linear-to-r py-2 pr-12 pl-4 text-sm print:hidden"
      >
        <p className="text-center text-pretty">
          {fillTemplate(content[rule.id][MESSAGE_KEY[phase]].value, {
            date: offer ? startDay.format(offer.startsAt) : "",
            percent: String(rule.percentOff),
          })}
          {/* The teaser only gives notice: no prices to see yet. */}
          {phase !== "teaser" && (
            <Link
              to={ROUTES.PRO}
              search={{ billing: "annual" }}
              data-track="offer_banner"
              data-track-offer={rule.id}
              data-track-phase={phase}
              className="ml-2 inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
            >
              {content.cta}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          )}
        </p>
        <button
          type="button"
          aria-label={content.dismiss.value}
          onClick={dismiss}
          className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full transition-colors hover:bg-black/10"
        >
          <Xmark aria-hidden="true" className="size-4" />
        </button>
      </div>
    ));
  });
};
