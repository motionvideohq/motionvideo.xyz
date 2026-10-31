import { createFileRoute } from "@tanstack/react-router";

import { JOB_TYPES } from "@/constants/jobs";
import { DEFAULT_LOCALE, LOCALES, localizedPath } from "@/constants/locales";
import { ROUTES, STATIC_PAGES } from "@/constants/routes";
import { absoluteUrl } from "@/constants/url";
import catalog from "@/data/motion-catalog.json";
import { CHANGELOG_ENTRIES } from "@/lib/changelog";
import { DIRECTORY_CATEGORIES } from "@/lib/directories";
import { INDEXABLE_DIRECTORY_FILTERS } from "@/lib/directory-discovery";
import {
  MOTION_CATEGORIES,
  MOTION_MODELS,
  MOTION_TYPES,
  motionModelSlug,
} from "@/lib/motion-catalog";
import { MOTION_CREATORS } from "@/lib/motion-creators";
import { COLOR_PAGES } from "@/lib/motion-video-route";
import { MOVE_FAMILIES } from "@/lib/move-families";
import { MOVES, movePath } from "@/lib/moves";
import { PROMPT_TEMPLATES, templatePath } from "@/lib/prompt-templates";

// Public, canonical pages only: signed-in pages (/dashboard/…), redirects
// (/studios, /tools/skills), and utility pages (/checkout, /welcome) stay out.
// Videos carry their publish date as `lastmod`; the rest change with deploys.
const PAGES: { lastmod?: string; path: string }[] = [
  { path: ROUTES.HOME },
  ...MOTION_CATEGORIES.map((category) => ({
    path: `${ROUTES.HOME}category/${category}`,
  })),
  // One page per model and per type, for those with videos.
  ...MOTION_MODELS.filter((model) =>
    catalog.videos.some((video) => video.model === model)
  ).map((model) => ({
    path: `${ROUTES.HOME}model/${motionModelSlug(model)}`,
  })),
  ...MOTION_TYPES.filter((type) =>
    catalog.videos.some((video) => video.tags.includes(type))
  ).map((type) => ({ path: `${ROUTES.HOME}type/${type}` })),
  // Colour pages already leave out colours too rare to have one.
  ...COLOR_PAGES.map((color) => ({
    path: `${ROUTES.HOME}color/${color.slug}`,
  })),
  { path: "/creators" },
  ...MOTION_CREATORS.map((creator) => ({
    path: `${ROUTES.HOME}creators/${creator.handle}`,
  })),
  ...catalog.videos.map((video) => ({
    lastmod: video.date,
    path: `${ROUTES.HOME}videos/${video.slug}`,
  })),
  // The customizer, and one page per video with a prompt.
  { path: ROUTES.CUSTOMIZE },
  ...catalog.videos
    .filter((video) => video.prompt)
    .map((video) => ({ path: `${ROUTES.CUSTOMIZE}/${video.slug}` })),
  { path: ROUTES.TOOLS },
  ...DIRECTORY_CATEGORIES.tool.map((category) => ({
    path: `${ROUTES.TOOLS}/${category.slug}`,
  })),
  ...INDEXABLE_DIRECTORY_FILTERS.tool.map((facet) => ({
    path: `${ROUTES.TOOLS}/${facet}`,
  })),
  { path: ROUTES.CREATIVES },
  ...DIRECTORY_CATEGORIES.studio.map((category) => ({
    path: `${ROUTES.CREATIVES}/${category.slug}`,
  })),
  ...INDEXABLE_DIRECTORY_FILTERS.studio.map((facet) => ({
    path: `${ROUTES.CREATIVES}/${facet}`,
  })),
  { path: ROUTES.SKILLS },
  ...DIRECTORY_CATEGORIES.skill.map((category) => ({
    path: `${ROUTES.SKILLS}/${category.slug}`,
  })),
  ...INDEXABLE_DIRECTORY_FILTERS.skill.map((facet) => ({
    path: `${ROUTES.SKILLS}/${facet}`,
  })),
  { path: ROUTES.EXTRAS },
  ...DIRECTORY_CATEGORIES.extra.map((category) => ({
    path: `${ROUTES.EXTRAS}/${category.slug}`,
  })),
  ...INDEXABLE_DIRECTORY_FILTERS.extra.map((facet) => ({
    path: `${ROUTES.EXTRAS}/${facet}`,
  })),
  { path: ROUTES.JOBS },
  ...JOB_TYPES.map((type) => ({ path: `${ROUTES.JOBS}/${type}` })),
  { path: ROUTES.SPONSOR },
  { path: ROUTES.PRO },
  { path: ROUTES.MOTIONVIDEO_SKILL },
  { path: ROUTES.MOTIONVIDEO_MCP },
  { path: ROUTES.MOVES },
  ...MOVE_FAMILIES.map((family) => ({
    path: `${ROUTES.MOVES}/${family}`,
  })),
  ...MOVES.map((move) => ({ path: movePath(move) })),
  { path: ROUTES.TEMPLATES },
  ...PROMPT_TEMPLATES.map((template) => ({ path: templatePath(template) })),
  // Docs pages (content/docs/*.mdx).
  ...[
    ROUTES.DOCS,
    ROUTES.DOCS_MCP,
    ROUTES.DOCS_SKILL,
    ROUTES.DOCS_MOVES,
    ROUTES.DOCS_TEMPLATES,
    ROUTES.DOCS_PLANS,
    ROUTES.DOCS_API,
  ].map((path) => ({ path })),
  ...STATIC_PAGES.map((page) => ({ path: page })),
  ...CHANGELOG_ENTRIES.map((entry) => ({
    lastmod: entry.data.date,
    path: entry.url,
  })),
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        // Every page is listed once per locale, and each entry advertises all
        // its translations plus an x-default.
        const urls = LOCALES.flatMap((locale) =>
          PAGES.map(({ lastmod, path }) => {
            const localized = localizedPath(path, locale);
            const alternates = [
              ...LOCALES.map((alternate) => {
                const href = absoluteUrl(localizedPath(path, alternate));
                return `    <xhtml:link rel="alternate" hreflang="${alternate}" href="${href}" />`;
              }),
              `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(localizedPath(path, DEFAULT_LOCALE))}" />`,
            ];
            return [
              "  <url>",
              `    <loc>${absoluteUrl(localized)}</loc>`,
              ...alternates,
              ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
              "  </url>",
            ].join("\n");
          })
        );
        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...urls,
          "</urlset>",
          "",
        ].join("\n");
        return new Response(body, {
          headers: {
            "Cache-Control": "public, max-age=3600",
            "Content-Type": "application/xml; charset=utf-8",
          },
        });
      },
    },
  },
});
