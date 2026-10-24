import { createFileRoute } from "@tanstack/react-router";

import { JOB_TYPES } from "@/constants/jobs";
import { ROUTES, STATIC_PAGES } from "@/constants/routes";
import { absoluteUrl } from "@/constants/url";
import catalog from "@/data/motion-catalog.json";
import { DIRECTORY_CATEGORIES } from "@/lib/directories";
import {
  MOTION_CATEGORIES,
  MOTION_MODELS,
  MOTION_TYPES,
  motionModelSlug,
} from "@/lib/motion-catalog";

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
  { path: ROUTES.CREATIVES },
  ...DIRECTORY_CATEGORIES.studio.map((category) => ({
    path: `${ROUTES.CREATIVES}/${category.slug}`,
  })),
  { path: ROUTES.SKILLS },
  ...DIRECTORY_CATEGORIES.skill.map((category) => ({
    path: `${ROUTES.SKILLS}/${category.slug}`,
  })),
  { path: ROUTES.EXTRAS },
  ...DIRECTORY_CATEGORIES.extra.map((category) => ({
    path: `${ROUTES.EXTRAS}/${category.slug}`,
  })),
  { path: ROUTES.JOBS },
  ...JOB_TYPES.map((type) => ({ path: `${ROUTES.JOBS}/${type}` })),
  { path: ROUTES.SPONSOR },
  { path: ROUTES.MOTIONVIDEO_SKILL },
  ...STATIC_PAGES.map((page) => ({ path: page })),
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...PAGES.map(({ lastmod, path }) => {
            const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
            return `  <url><loc>${absoluteUrl(path)}</loc>${lastmodTag}</url>`;
          }),
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
