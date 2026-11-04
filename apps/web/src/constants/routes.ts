// Every app path, unprefixed; links add the `/$locale` prefix. `$name`
// segments are router params (`to={ROUTES.VIDEO} params={{ slug }}`).
export const ROUTES = {
  ABOUT: "/about",
  ADMIN: "/admin",
  ADMIN_FEEDBACK: "/admin/feedback",
  ADMIN_JOBS: "/admin/jobs",
  ADMIN_SPONSORSHIPS: "/admin/sponsorships",
  ADMIN_SUBMISSIONS: "/admin/submissions",
  BLOG: "/blog",
  // The blog's and changelog's feeds. Unprefixed; the file extension keeps
  // the server from redirecting them to a locale.
  BLOG_ATOM: "/blog/atom.xml",
  BLOG_JSON_FEED: "/blog/feed.json",
  BLOG_RSS: "/blog/rss.xml",
  BLOG_POST: "/blog/$slug",
  BRAND: "/brand",
  CATEGORY: "/category/$category",
  CHANGELOG: "/changelog",
  CHANGELOG_ATOM: "/changelog/atom.xml",
  CHANGELOG_JSON_FEED: "/changelog/feed.json",
  CHANGELOG_RSS: "/changelog/rss.xml",
  CHANGELOG_ENTRY: "/changelog/$slug",
  COLOR: "/color/$color",
  CHECKOUT: "/checkout",
  CONSENT: "/consent",
  CONTACT: "/contact",
  CREATIVES: "/creatives",
  CREATOR: "/creators/$creator",
  CREATORS: "/creators",
  CUSTOMIZE: "/customize",
  CUSTOMIZE_PROMPT: "/customize/$slug",
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
  /** Any docs page: `params={{ _splat: "mcp" }}`. */
  DOCS_PAGE: "/docs/$",
  DOCS_MCP: "/docs/mcp",
  DOCS_MOVES: "/docs/moves",
  DOCS_PLANS: "/docs/plans",
  DOCS_SKILL: "/docs/skill",
  DOCS_TEMPLATES: "/docs/templates",
  EXTRAS: "/extras",
  HOME: "/",
  JOBS: "/jobs",
  JOBS_TYPE: "/jobs/$type",
  MODEL: "/model/$model",
  MOTIONVIDEO_MCP: "/motionvideo-mcp",
  MOTIONVIDEO_SKILL: "/motionvideo-skill",
  MOVES: "/moves",
  MOVE: "/moves/$family/$slug",
  MOVE_FAMILY: "/moves/$family",
  PRO: "/pro",
  PRIVACY: "/privacy",
  REFUNDS: "/refunds",
  SIGN_IN: "/sign-in",
  // Dev only (vite.config.ts drops it from production builds).
  SHOWCASE: "/showcase",
  LLMS_FULL_TXT: "/llms-full.txt",
  LLMS_TXT: "/llms.txt",
  // The public API's OpenAPI document, at a fixed unprefixed URL.
  OPENAPI_JSON: "/openapi.json",
  PRICING_MD: "/pricing.md",
  SKILL_MD: "/skill.md",
  SKILLS: "/skills",
  SPONSOR: "/sponsor",
  TEMPLATES: "/templates",
  TEMPLATE: "/templates/$templateId",
  TEMPLATE_CUSTOMIZE: "/templates/$templateId/customize",
  TERMS: "/terms",
  TOOLS: "/tools",
  TYPE: "/type/$type",
  VIDEO: "/videos/$slug",
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
  ROUTES.CHANGELOG,
  ROUTES.CONTACT,
  ROUTES.PRIVACY,
  ROUTES.REFUNDS,
  ROUTES.TERMS,
];

/**
 * A docs page's Markdown (for agents and "Copy as Markdown"): /docs →
 * /docs.md, /docs/mcp → /docs/mcp.md. Unprefixed, and the file extension
 * keeps the server from redirecting it to a locale.
 */
export const docsMarkdownPath = (docsPath: string) => `${docsPath}.md`;

/** A gallery video's page, e.g. for feeds, JSON-LD and the sitemap. */
export const videoPath = (slug: string) => `/videos/${slug}`;
export const categoryPath = (category: string) => `/category/${category}`;
export const modelPath = (model: string) => `/model/${model}`;
export const typePath = (type: string) => `/type/${type}`;
export const colorPath = (color: string) => `/color/${color}`;
export const creatorPath = (handle: string) => `/creators/${handle}`;
