export const ROUTES = {
  ABOUT: "/about",
  BOOKMARKS: "/bookmarks",
  BRAND: "/brand",
  CHECKOUT: "/checkout",
  CONTACT: "/contact",
  CREATIVES: "/creatives",
  DASHBOARD: "/dashboard",
  DPA: "/dpa",
  EXTRAS: "/extras",
  FAQ: "/motionvideo-skill#faq",
  FEATURES: "/motionvideo-skill#features",
  HOME: "/",
  HOW_IT_WORKS: "/motionvideo-skill#how-it-works",
  MOTIONVIDEO_SKILL: "/motionvideo-skill",
  PRICING: "/motionvideo-skill#pricing",
  PRIVACY: "/privacy",
  REFUNDS: "/refunds",
  SIGN_IN: "/sign-in",
  SKILLS: "/skills",
  SPONSOR: "/sponsor",
  SUBMIT: "/submit",
  TERMS: "/terms",
  TOOLS: "/tools",
  WELCOME: "/welcome",
} as const;

// Content pages with no per-request data: rendered to HTML at build time
// (vite.config.ts) and served by the Worker from static assets (src/server.ts).
// Keep in sync with `assets.run_worker_first` in wrangler.jsonc.
export const STATIC_PAGES: readonly string[] = [
  ROUTES.ABOUT,
  ROUTES.BRAND,
  ROUTES.CONTACT,
  ROUTES.DPA,
  ROUTES.PRIVACY,
  ROUTES.REFUNDS,
  ROUTES.TERMS,
];
