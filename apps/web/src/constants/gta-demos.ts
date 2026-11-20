import { ASSETS_URL } from "@/constants/links";

// The before/after demos on /gta-6-clipping: an existing vertical clip of a
// streamer's GTA 6 moment (the Before) next to the same moment cut from the
// stream and edited with the pack (the After), rendered in apps/videos
// (`out/gta/`) and uploaded to R2 under `gta/`. Each creator stands for the
// countries a Meta ad set targets; the page shows the visitor's
// (src/server/functions.ts `getGtaDemoPick`), and `?clip=<slug>` picks one
// directly. Keep the sources in sync with apps/videos/public/gta/in/<slug>.json.

export const GTA_DEMO_SLUGS = [
  "kai-cenat",
  "mythpat",
  "gaules",
  "montanablack",
  "squeezie",
] as const;
export type GtaDemoSlug = (typeof GTA_DEMO_SLUGS)[number];

/** Shown where the visitor's country has no creator of its own. */
export const DEFAULT_GTA_DEMO: GtaDemoSlug = "kai-cenat";

export interface GtaDemoMedia {
  video: string;
  poster: string;
}

/** The pack's looks (`style.preset` in the skill's overlay spec), in page order. */
export const GTA_STYLES = ["vice", "wasted", "neon", "clean"] as const;
export type GtaStyle = (typeof GTA_STYLES)[number];

export const GTA_STYLE_NAMES: Record<GtaStyle, string> = {
  vice: "Vice",
  wasted: "Wasted",
  neon: "Neon",
  clean: "Clean",
};

export interface GtaDemo {
  slug: GtaDemoSlug;
  creator: string;
  /** The stream the After is cut from. */
  sourceUrl: string;
  /** The channel that streamed it. */
  channel: string;
  /** The existing vertical clip of the same moment shown as the Before. */
  beforeUrl: string;
  /** Who posted the Before, as credited under the players. */
  beforeChannel: string;
  /** The pack style the After is rendered in. */
  style: GtaStyle;
  /** ISO 3166-1 alpha-2 codes of the visitors who see this demo first. */
  countries: readonly string[];
  before: GtaDemoMedia;
  after: GtaDemoMedia;
}

const media = (slug: GtaDemoSlug, side: "before" | "after"): GtaDemoMedia => ({
  video: `${ASSETS_URL}/gta/${slug}-${side}.mp4`,
  poster: `${ASSETS_URL}/gta/${slug}-${side}.jpg`,
});

const demo = (
  slug: GtaDemoSlug,
  fields: Omit<GtaDemo, "slug" | "before" | "after">
): GtaDemo => ({
  slug,
  ...fields,
  before: media(slug, "before"),
  after: media(slug, "after"),
});

export const GTA_DEMOS: readonly GtaDemo[] = [
  demo("kai-cenat", {
    creator: "Kai Cenat",
    sourceUrl: "https://www.youtube.com/watch?v=VZqAPdUvqnQ",
    channel: "Kai Cenat Live",
    beforeUrl: "https://www.youtube.com/shorts/47yk0jezeKY",
    beforeChannel: "Six Hype Daily",
    style: "vice",
    countries: ["US"],
  }),
  demo("mythpat", {
    creator: "Mythpat",
    sourceUrl: "https://www.youtube.com/watch?v=LMbea5SozeM",
    channel: "Mythpat",
    beforeUrl: "https://www.instagram.com/techbrunch/reel/Df4tWFbJCJ0/",
    beforeChannel: "@techbrunch",
    style: "neon",
    countries: ["IN"],
  }),
  demo("gaules", {
    creator: "Gaules",
    sourceUrl: "https://www.youtube.com/watch?v=HClaIGJSHU4",
    channel: "Gaules",
    beforeUrl: "https://www.youtube.com/shorts/7_QkWcVm48M",
    beforeChannel: "Gaules Shorts",
    style: "wasted",
    countries: ["BR", "PT"],
  }),
  demo("montanablack", {
    creator: "MontanaBlack",
    sourceUrl: "https://www.youtube.com/watch?v=LNcf9nRcl0w",
    channel: "MontanaBlack Uncut",
    beforeUrl: "https://www.youtube.com/shorts/bJ_AmZIkXrY",
    beforeChannel: "Sixsecgta",
    style: "vice",
    countries: ["DE", "AT", "CH"],
  }),
  demo("squeezie", {
    creator: "Squeezie",
    sourceUrl: "https://www.youtube.com/watch?v=aEG_HX6HfSQ",
    channel: "Squeezie - Rediffusions",
    beforeUrl: "https://www.youtube.com/shorts/qa7T-i07C8U",
    beforeChannel: "Vice6ix Clipz FR",
    style: "clean",
    countries: ["FR", "BE", "LU", "MC"],
  }),
];

export const gtaDemo = (slug: GtaDemoSlug): GtaDemo =>
  GTA_DEMOS.find((item) => item.slug === slug) ?? GTA_DEMOS[0];

/** The demo a visitor from `country` sees first; unmapped → the default. */
export const gtaDemoForCountry = (country: string | null): GtaDemoSlug =>
  GTA_DEMOS.find((item) => country && item.countries.includes(country))?.slug ??
  DEFAULT_GTA_DEMO;
