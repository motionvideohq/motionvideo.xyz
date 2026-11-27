import { useEffect, useState } from "react";
import { useIntlayer } from "react-intlayer";

import { ExternalLinkChip } from "@/components/external-link-chip";
import { SponsorDetailRow } from "@/components/sponsor-detail-row";
import { FOUNDING_SPONSORS } from "@/constants/sponsors";
import { useSponsors } from "@/lib/sponsorships";
import { cn } from "@/lib/utils";
import { withUtm } from "@/lib/utm";

// How long each sponsor stays on the card before fading to the next.
const ROTATE_MS = 6000;

// UTM content and analytics name per placement. The feed keeps its original
// names ("grid", "card") so earlier click data stays comparable.
const TRACKING = {
  feed: { utm: "grid", track: "card" },
  sidebar: { utm: "sidebar", track: "sidebar" },
} as const;

/**
 * A paid sponsor placement: every Diamond sponsor first, then Gold and Silver
 * in the feed, as a cover card that fades to the next on a timer with a
 * progress hairline along its bottom edge. No tier is tied to a category page.
 * The detail sidebar shows only live Diamond sponsors, as the "Sponsored by"
 * row of its details list (render it inside that `<dl>`). Both placements
 * render nothing until a sponsor is live. Founding sponsors are credited on
 * /sponsor and only stand in as examples in that page's `demo` previews.
 */
export const SponsoredCard = ({
  placement,
  demo = false,
  rowClassName,
}: {
  /** The video grid feed, or a detail view's sidebar. */
  placement: keyof typeof TRACKING;
  /**
   * The /sponsor placement previews: founding sponsors stand in as examples
   * while no paid sponsor is live, so the preview is never empty. Clicks
   * track as "preview".
   */
  demo?: boolean;
  /** Sidebar only: spacing/type overrides for the row (compact previews). */
  rowClassName?: string;
}) => {
  const content = useIntlayer("motion-gallery");
  const live = useSponsors();
  const diamond = live.filter((entry) => entry.tier === "diamond");
  const gold = live.filter((entry) => entry.tier === "gold");
  const silver = live.filter((entry) => entry.tier === "silver");
  // Live pages show paid sponsors only — no card until one goes live. Only
  // the /sponsor previews borrow the founding sponsors as examples.
  const featured = demo && diamond.length === 0 ? FOUNDING_SPONSORS : diamond;
  const sponsors =
    placement === "sidebar"
      ? [...featured]
      : [...featured, ...gold, ...silver].flatMap((entry) =>
          entry.cover ? [{ ...entry, cover: entry.cover }] : []
        );
  const track = demo ? "preview" : TRACKING[placement].track;
  const [active, setActive] = useState(0);
  // The list changes between pages; stay within it.
  const showing = active % Math.max(sponsors.length, 1);
  const sponsor = sponsors[showing];

  useEffect(() => {
    if (sponsors.length < 2) {
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % sponsors.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [sponsors.length]);

  if (!sponsor) {
    return null;
  }

  if (placement === "sidebar") {
    // A "Sponsored by" row in the details list. With several Diamond
    // sponsors, its hairline counts down each turn and the value fades to
    // the next; the row itself (and its label) stays mounted.
    return (
      <SponsorDetailRow
        label={content.sponsoredBy}
        logo={sponsor.logo}
        name={sponsor.name}
        tagline={sponsor.tagline}
        darkInvert={sponsor.darkInvert}
        rotation={sponsors.length > 1 ? { key: active } : undefined}
        className={rowClassName}
        link={{
          href: withUtm(sponsor.url, TRACKING.sidebar.utm),
          target: "_blank",
          rel: "sponsored noopener",
          "data-track": "sponsor_click",
          "data-track-placement": track,
          "data-track-name": sponsor.name,
          "aria-label": `${sponsor.name} (${content.sponsored.value})`,
        }}
      />
    );
  }

  return (
    <a
      href={withUtm(sponsor.url, TRACKING[placement].utm)}
      target="_blank"
      rel="sponsored noopener"
      data-track="sponsor_click"
      data-track-placement={track}
      data-track-name={sponsor.name}
      aria-label={`${sponsor.name} (${content.sponsored.value})`}
      className="group focus-visible:ring-ring shadow-outline relative block aspect-video overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {sponsors.map((entry, index) => (
        <img
          key={`${entry.name}:${entry.url}`}
          src={entry.cover ?? undefined}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          aria-hidden={index === showing ? undefined : true}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none",
            index === showing ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100"
      />
      <span className="absolute inset-x-0 top-0 flex items-start p-2.5">
        <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {content.sponsored}
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-black/70 to-transparent p-2.5 pt-6">
        {/* Same chip as the slots and sidebar: white in light, inverse in
            dark, with dark-on-transparent marks inverted to match. */}
        <span
          key={`${sponsor.name}:${sponsor.url}`}
          className="bg-background dark:bg-popover flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full p-1 shadow-sm"
        >
          <img
            src={sponsor.logo}
            alt=""
            width={28}
            height={28}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className={cn(
              "size-full object-contain",
              sponsor.darkInvert && "dark:invert"
            )}
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium tracking-tight text-white">
            {sponsor.name}
          </span>
          {sponsor.tagline && (
            <span className="truncate text-xs text-white/75">
              {sponsor.tagline}
            </span>
          )}
        </span>
        <ExternalLinkChip className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100" />
      </span>
      {sponsors.length > 1 && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 bg-white/15 motion-reduce:hidden"
        >
          <span
            key={active}
            className="animate-mv-rotate bg-primary block h-full"
          />
        </span>
      )}
    </a>
  );
};

/**
 * Whether a live sponsor has a cover, i.e. whether the feed card will render.
 * Masonry pages call this before inserting the tile so no empty card (and no
 * gap) is left in the grid; the card itself still renders nothing on its own.
 */
export const useHasSponsorCard = (): boolean =>
  useSponsors().some((sponsor) => Boolean(sponsor.cover));

/** One-lane phones: the sponsored tile comes after the intro and this many. */
const PHONE_OFFSET = 3;

/**
 * Where the sponsored tile goes among a grid's items (intro first): the first
 * row's rightmost lane, or right after the last tile when that row isn't
 * full; on one-lane phones a few items in, so it isn't in the first view.
 */
export const sponsoredTileIndex = (lanes: number, cardCount: number) =>
  lanes < 2
    ? 1 + Math.min(PHONE_OFFSET, cardCount)
    : Math.min(1 + cardCount, lanes - 1);
