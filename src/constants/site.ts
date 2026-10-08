import { SITE_ORIGIN } from "./url.ts";
import { NAME, USER } from "./user.ts";

export const SITE = {
  AUTHOR: {
    FIRST_NAME: USER.firstName,
    NAME,
    TWITTER: USER.twitter,
  },
  DESCRIPTION: {
    LONG: "Agent skills that teach your coding agent motion design: timing, easing, and choreography, rendered from code. Make showreels, intros, launch films, and feature updates from a prompt.",
    SHORT:
      "Agent skills that teach your coding agent motion design, rendered from code.",
  },
  DOMAIN: new URL(SITE_ORIGIN).hostname,
  KEYWORDS: [
    "motion design",
    "motion graphics",
    "agent skills",
    "Claude Code skill",
    "Codex",
    "Cursor",
    "Remotion",
    "HyperFrames",
    "showreel",
    "launch video",
  ],
  // Seller identity and governing law used on the legal pages.
  LEGAL: {
    JURISDICTION: USER.address.country,
    OPERATOR: NAME,
    UPDATED_AT: "2026-10-02",
  },
  NAME: "MotionVideo",
  TAGLINE: "Motion design, written in code.",
  URL: SITE_ORIGIN,
} as const;

export const META_THEME_COLORS = {
  dark: "#0a0a0a",
  light: "#ffffff",
} as const;

export const UTM_PARAMS = {
  utm_medium: "referral",
  utm_source: SITE.DOMAIN,
} as const;
