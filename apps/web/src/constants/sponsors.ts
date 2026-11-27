import { ASSETS_URL } from "@/constants/links";

export const SPONSOR_TIERS = ["diamond", "gold", "silver"] as const;

export type SponsorTier = (typeof SPONSOR_TIERS)[number];

/** Monthly: a renewing subscription. Once: one paid 30-day run. */
export const SPONSOR_BILLINGS = ["monthly", "once"] as const;

export type SponsorBilling = (typeof SPONSOR_BILLINGS)[number];

/** Price per month (monthly) or per 30-day run (once), in USD. */
export const SPONSOR_PRICE_USD: Record<SponsorTier, number> = {
  diamond: 250,
  gold: 150,
  silver: 100,
};

/** Days a one-off sponsorship stays live, counted from approval. */
export const SPONSOR_ONCE_DAYS = 30;

export interface Sponsor {
  name: string;
  tier: SponsorTier;
  url: string;
  /** Square mark: our domain (`public/sponsors/`) or the sponsor's HTTPS URL. */
  logo: string;
  /** Cover of the sponsored grid card (every tier). */
  cover: string | null;
  tagline?: string;
  /** Dark-on-transparent mark: invert it so it reads on dark backgrounds. */
  darkInvert?: boolean;
}

/**
 * A founding sponsor: credited on /sponsor and used as an example in that
 * page's placement previews. Never in a live card, slot or sidebar — those
 * show paid sponsors only.
 */
export type FoundingSponsor = Pick<
  Sponsor,
  "name" | "url" | "logo" | "cover" | "tagline" | "darkInvert"
>;

// Partners from the start. They are thanked on /sponsor and take no paid
// seat; live placements stay empty until an actual sponsor goes live.
export const FOUNDING_SPONSORS: readonly FoundingSponsor[] = [
  {
    name: "Rare UI",
    url: "https://www.rareui.com/",
    logo: "https://raw.githubusercontent.com/swamimalode07/rare-ui/HEAD/public/logos/Rareui.svg",
    cover:
      "https://raw.githubusercontent.com/swamimalode07/rare-ui/HEAD/public/ogimage.webp",
  },
  {
    name: "Kobra",
    url: "https://kobra.systems/",
    logo: "/sponsors/kobra.png",
    cover: `${ASSETS_URL}/sponsors/kobra-49303ab0dc.png`,
    darkInvert: true,
  },
  {
    name: "beUI",
    url: "https://beui.dev/",
    logo: "/sponsors/beui.png",
    cover: "https://beui.dev/api/og",
  },
  {
    name: "Illos",
    url: "https://illos.dev/",
    logo: "/sponsors/illos.svg",
    cover: "https://illos.dev/og/home.jpg",
    darkInvert: true,
  },
];

/**
 * Seats per tier (Diamond, Gold and Silver each): a tier sells out at this
 * many paid runs. Also the number of slots under each page intro.
 */
export const SPONSOR_SLOTS = 3;
