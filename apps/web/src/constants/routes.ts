export const ROUTES = {
  ABOUT: "/about",
  ADMIN: "/admin",
  ADMIN_FEEDBACK: "/admin/feedback",
  ADMIN_JOBS: "/admin/jobs",
  ADMIN_SPONSORSHIPS: "/admin/sponsorships",
  ADMIN_SUBMISSIONS: "/admin/submissions",
  BRAND: "/brand",
  CHECKOUT: "/checkout",
  CONSENT: "/consent",
  CONTACT: "/contact",
  CREATIVES: "/creatives",
  DASHBOARD: "/dashboard",
  DASHBOARD_BILLING: "/dashboard/billing",
  DASHBOARD_BOOKMARKS: "/dashboard/bookmarks",
  DASHBOARD_FEATURED: "/dashboard/featured",
  DASHBOARD_JOBS_POST: "/dashboard/jobs/post",
  DASHBOARD_LISTINGS: "/dashboard/listings",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  DASHBOARD_SPONSORSHIPS: "/dashboard/sponsorships",
  DASHBOARD_SPONSORSHIPS_NEW: "/dashboard/sponsorships/new",
  DASHBOARD_SUBMIT: "/dashboard/submit",
  DOCS: "/docs",
  DOCS_API: "/docs/api",
  DOCS_MCP: "/docs/mcp",
  DOCS_MOVES: "/docs/moves",
  DOCS_PLANS: "/docs/plans",
  DOCS_SKILL: "/docs/skill",
  EXTRAS: "/extras",
  HOME: "/",
  JOBS: "/jobs",
  MOTIONVIDEO_MCP: "/motionvideo-mcp",
  MOTIONVIDEO_SKILL: "/motionvideo-skill",
  MOVES: "/moves",
  PRO: "/pro",
  PRIVACY: "/privacy",
  REFUNDS: "/refunds",
  SIGN_IN: "/sign-in",
  SKILL_MD: "/skill.md",
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
  ROUTES.DASHBOARD_BILLING,
  ROUTES.DASHBOARD_BOOKMARKS,
  ROUTES.DASHBOARD_FEATURED,
  ROUTES.DASHBOARD_JOBS_POST,
  ROUTES.DASHBOARD_LISTINGS,
  ROUTES.DASHBOARD_SETTINGS,
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
