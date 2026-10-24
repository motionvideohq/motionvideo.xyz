export const ROUTES = {
  ABOUT: "/about",
  ADMIN: "/admin",
  ADMIN_FEEDBACK: "/admin/feedback",
  ADMIN_JOBS: "/admin/jobs",
  ADMIN_SPONSORSHIPS: "/admin/sponsorships",
  ADMIN_SUBMISSIONS: "/admin/submissions",
  BRAND: "/brand",
  CHECKOUT: "/checkout",
  CONTACT: "/contact",
  CREATIVES: "/creatives",
  CUSTOMIZE: "/customize",
  DASHBOARD: "/dashboard",
  DASHBOARD_BOOKMARKS: "/dashboard/bookmarks",
  DASHBOARD_FEATURED: "/dashboard/featured",
  DASHBOARD_JOBS_POST: "/dashboard/jobs/post",
  DASHBOARD_LISTINGS: "/dashboard/listings",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  DASHBOARD_SKILL: "/dashboard/skill",
  DASHBOARD_SPONSORSHIPS: "/dashboard/sponsorships",
  DASHBOARD_SPONSORSHIPS_NEW: "/dashboard/sponsorships/new",
  DASHBOARD_SUBMIT: "/dashboard/submit",
  EXTRAS: "/extras",
  FAQ: "/motionvideo-skill#faq",
  FEATURES: "/motionvideo-skill#features",
  HOME: "/",
  JOBS: "/jobs",
  HOW_IT_WORKS: "/motionvideo-skill#how-it-works",
  MOTIONVIDEO_SKILL: "/motionvideo-skill",
  PRICING: "/motionvideo-skill#pricing",
  PRIVACY: "/privacy",
  REFUNDS: "/refunds",
  SIGN_IN: "/sign-in",
  SKILLS: "/skills",
  SPONSOR: "/sponsor",
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
  ROUTES.DASHBOARD,
  ROUTES.DASHBOARD_BOOKMARKS,
  ROUTES.DASHBOARD_FEATURED,
  ROUTES.DASHBOARD_JOBS_POST,
  ROUTES.DASHBOARD_LISTINGS,
  ROUTES.DASHBOARD_SETTINGS,
  ROUTES.DASHBOARD_SKILL,
  ROUTES.DASHBOARD_SPONSORSHIPS,
  ROUTES.DASHBOARD_SPONSORSHIPS_NEW,
  ROUTES.DASHBOARD_SUBMIT,
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
