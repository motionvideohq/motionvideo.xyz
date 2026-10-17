export const ROUTES = {
  ABOUT: "/about",
  ADMIN: "/admin",
  ADMIN_FEEDBACK: "/admin/feedback",
  ADMIN_JOBS: "/admin/jobs",
  ADMIN_SPONSORSHIPS: "/admin/sponsorships",
  ADMIN_SUBMISSIONS: "/admin/submissions",
  BLOG: "/blog",
  BOOKMARKS: "/bookmarks",
  BRAND: "/brand",
  CHECKOUT: "/checkout",
  CONTACT: "/contact",
  CREATIVES: "/creatives",
  DASHBOARD: "/dashboard",
  EXTRAS: "/extras",
  FAQ: "/motionvideo-skill#faq",
  FEATURED: "/featured",
  FEATURES: "/motionvideo-skill#features",
  HOME: "/",
  JOBS: "/jobs",
  JOBS_POST: "/jobs/post",
  LISTINGS: "/listings",
  HOW_IT_WORKS: "/motionvideo-skill#how-it-works",
  MOTIONVIDEO_SKILL: "/motionvideo-skill",
  PRICING: "/motionvideo-skill#pricing",
  PRIVACY: "/privacy",
  REFUNDS: "/refunds",
  SIGN_IN: "/sign-in",
  SETTINGS: "/settings",
  SKILLS: "/skills",
  SPONSOR: "/sponsor",
  SPONSORSHIPS: "/sponsorships",
  SPONSORSHIPS_NEW: "/sponsorships/new",
  SUBMIT: "/submit",
  TERMS: "/terms",
  TOOLS: "/tools",
  WELCOME: "/welcome",
} as const;

/**
 * Pages that need an account. Signed out, links to them (and their keyboard
 * shortcuts) open the sign-in dialog instead of leaving the page; visiting
 * one directly still redirects to /sign-in. Signing out on one returns home.
 */
export const ACCOUNT_PAGES: ReadonlySet<string> = new Set([
  ROUTES.BOOKMARKS,
  ROUTES.DASHBOARD,
  ROUTES.FEATURED,
  ROUTES.JOBS_POST,
  ROUTES.LISTINGS,
  ROUTES.SETTINGS,
  ROUTES.SPONSORSHIPS,
  ROUTES.SPONSORSHIPS_NEW,
  ROUTES.SUBMIT,
]);

// Content pages with no per-request data: rendered to HTML at build time
// (vite.config.ts) and served by the Worker from static assets (src/server.ts).
// Keep in sync with `assets.run_worker_first` in wrangler.jsonc.
export const STATIC_PAGES: readonly string[] = [
  ROUTES.ABOUT,
  ROUTES.BRAND,
  ROUTES.CONTACT,
  ROUTES.PRIVACY,
  ROUTES.REFUNDS,
  ROUTES.TERMS,
];
