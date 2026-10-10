export type SponsorTier = "diamond" | "gold" | "silver";

export interface Sponsor {
  name: string;
  tier: SponsorTier;
  url: string;
  /** Square mark, served from our domain (`public/sponsors/`). */
  logo: string;
}

// Active sponsors. Placements read from here: the header shows Diamond marks.
export const SPONSORS: readonly Sponsor[] = [
  {
    name: "Shadcn Labs",
    tier: "diamond",
    url: "https://www.shadcn-labs.com",
    logo: "/sponsors/shadcn-labs.svg",
  },
];

/** Diamond marks in the header; empty slots invite a sponsor. */
export const HEADER_SPONSOR_SLOTS = 2;
