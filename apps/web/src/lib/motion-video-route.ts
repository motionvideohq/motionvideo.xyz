import { notFound, redirect } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import catalog from "@/data/motion-catalog.json";
import { MOTION_COLORS, filterMotionVideos } from "@/lib/motion-catalog";
import type { MotionFilters, MotionVideo } from "@/lib/motion-catalog";
import { videoJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

// The canonical video route's loader/head and named colour collection pages.
const videos: MotionVideo[] = catalog.videos;

// A colour page with only a handful of videos is too thin to be worth a URL.
const MIN_COLOR_PAGE_VIDEOS = 6;

/** The named colours with enough videos for a page, `/color/$color`. */
export const COLOR_PAGES = MOTION_COLORS.filter(
  (color) =>
    filterMotionVideos(videos, { color: color.hex }).length >=
    MIN_COLOR_PAGE_VIDEOS
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
/** Old scoped video URLs are redirects, never separate video pages. */
export const redirectMotionVideo = ({
  params,
}: {
  params: { locale: string; slug: string };
}) => {
  throw redirect({
    to: "/$locale/videos/$slug",
    params: { locale: params.locale, slug: params.slug },
    search: {},
    statusCode: 301,
  });
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

// Structured data identifies the video at its canonical `/$locale/videos/$slug`.
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
