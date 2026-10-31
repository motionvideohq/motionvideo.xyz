import { notFound, redirect } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import catalog from "@/data/motion-catalog.json";
import { MOTION_COLORS, filterMotionVideos } from "@/lib/motion-catalog";
import type { MotionFilters, MotionVideo } from "@/lib/motion-catalog";
import { videoJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

// Shared by the gallery routes: the video overlays' loader and head
// (`/videos/$slug` over Discover, `/category/$category/videos/$slug` over a
// category page…) and which colours have a page of their own.
const videos: MotionVideo[] = catalog.videos;

/**
 * The named colours with enough videos for a page, `/color/$color`, as
 * precomputed by `pnpm catalog:derive` (counting them here cost more CPU
 * than a Workers Free request gets).
 */
export const COLOR_PAGES = MOTION_COLORS.filter((color) =>
  catalog.colorPages.includes(color.slug)
);

// Duplicates removed by `pnpm catalog:remove`, each pointing at the video it
// copied (which may itself have been removed later, hence the loop below).
const duplicateOf = new Map(
  catalog.removed.map((entry) => [entry.slug, entry.duplicateOf])
);

export const loadMotionVideo = ({
  params,
}: {
  params: { locale: string; slug: string };
}) => {
  const video = videos.find((entry) => entry.slug === params.slug);
  if (video) {
    return { video };
  }
  // A removed duplicate's old URL (shared, indexed) moves to the original.
  let target = duplicateOf.get(params.slug);
  while (target && duplicateOf.has(target)) {
    target = duplicateOf.get(target);
  }
  if (target) {
    throw redirect({
      to: "/$locale/videos/$slug",
      params: { locale: params.locale, slug: target },
      statusCode: 301,
    });
  }
  throw notFound();
};

/** Fills a translated template's `{key}` placeholders. */
export const fillTemplate = (
  template: string,
  values: Record<string, string>
) =>
  template.replaceAll(
    /\{(?<key>\w+)\}/gu,
    (match, key: string) => values[key] ?? match
  );

// Every overlay URL of a video shares the canonical `/$locale/videos/$slug`
// (set on the locale layout); structured data makes the video one citable
// entity per page.
export const motionVideoHead = ({
  loaderData,
  params,
}: {
  loaderData?: { video: MotionVideo };
  params: { locale: string; slug: string };
}) => {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const meta = getIntlayer("gallery-meta", locale).video;
  const video = loaderData?.video;
  const description = video
    ? fillTemplate(
        video.prompt ? meta.descriptionWithPrompt : meta.description,
        { title: video.title, handle: video.handle }
      )
    : meta.fallbackDescription;
  return {
    ...createMetadata({
      title: video?.title ?? meta.fallbackTitle,
      description,
    }),
    scripts: video ? [videoJsonLd(video, description, locale)] : [],
  };
};

/**
 * The videos before and after `slug` in the grid behind the overlay (same
 * category, type and sort), so the overlay can step through it.
 */
export interface VideoNeighbours {
  previous?: string;
  next?: string;
}

export const videoNeighbours = (
  slug: string,
  filters: MotionFilters
): VideoNeighbours => {
  const list = filterMotionVideos(videos, filters);
  const index = list.findIndex((entry) => entry.slug === slug);
  if (index === -1) {
    return {};
  }
  return { previous: list[index - 1]?.slug, next: list[index + 1]?.slug };
};
