import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { BadgePercent } from "reicon-react/icons/BadgePercent";

import { CountdownPills, useNowSecond } from "@/components/offer-countdown";
import { fillTemplate } from "@/lib/motion-video-route";
import { OFFER_RULES, activeOffer } from "@/lib/offers";
import type { OfferPageTheme } from "@/lib/offers";
import { cn } from "@/lib/utils";

// /pro while a sale runs, for every visitor (prices still follow the
// visitor: parity countries skip the sale). The page takes the offer's look,
// whatever the site's light or dark mode: its rule's `pageTheme` base under
// its `[data-offer-page]` palette (src/styles/globals.css), with a glow of
// the offer's colour behind the hero. The hero names the offer and counts
// down to its end. A new offer's look is one palette block.

/** What /pro shows of the running offer; its code stays on the server. */
export interface OfferSeason {
  rule: (typeof OFFER_RULES)[number]["id"];
  pageTheme: OfferPageTheme;
  percentOff: number;
  endsAt: number;
  lastCall: boolean;
}

/** The offer on sale at `now` (ms), as /pro shows it, or null. */
export const offerSeason = (now: number): OfferSeason | null => {
  const offer = activeOffer(now);
  const rule = OFFER_RULES.find((candidate) => candidate.id === offer?.rule);
  if (!offer || !rule) {
    return null;
  }
  return {
    rule: rule.id,
    pageTheme: offer.pageTheme,
    percentOff: offer.percentOff,
    endsAt: offer.endsAt,
    lastCall: now >= offer.lastCallAt,
  };
};

export const OfferPage = ({
  season,
  children,
}: {
  season: OfferSeason | null;
  children: ReactNode;
}) =>
  season ? (
    <div
      data-offer-page={season.rule}
      className={cn(
        season.pageTheme === "dark" && "dark",
        "bg-background text-foreground flex flex-1 flex-col bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)] bg-[length:100%_40rem] bg-no-repeat"
      )}
    >
      {children}
    </div>
  ) : (
    children
  );

/** "% Black Friday  30% off Pro · Ends in 17d 00h 09m 35s", above the hero title. */
export const OfferHeroBadge = ({ season }: { season: OfferSeason }) => {
  const content = useIntlayer("offer-banner");
  const { locale } = useLocale();
  const now = useNowSecond();
  const copy = content[season.rule];
  return (
    <p className="border-primary/30 bg-primary/10 text-primary inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl border px-3 py-1.5 text-sm sm:rounded-full">
      <BadgePercent aria-hidden="true" className="size-4 shrink-0" />
      <strong className="font-semibold">
        {season.lastCall ? content.lastChance : copy.name}
      </strong>
      <span className="opacity-80">
        {fillTemplate(copy.dealShort.value, {
          percent: String(season.percentOff),
        })}
      </span>
      <span aria-hidden="true" className="opacity-40">
        ·
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="opacity-80">{content.endsIn}</span>
        <CountdownPills
          endsAt={season.endsAt}
          now={now}
          locale={locale}
          pillClassName="bg-primary/15"
        />
      </span>
    </p>
  );
};
