import { notFound } from "@tanstack/react-router";

import catalog from "@/data/motion-catalog.json";
import { filterMotionVideos } from "@/lib/motion-catalog";
import type { MotionFilters, MotionVideo } from "@/lib/motion-catalog";
import { createMetadata } from "@/seo/metadata";

// Loader and head shared by the video overlay routes: `/videos/$slug` over
// Discover and `/category/$category/videos/$slug` over a category page.
const videos: MotionVideo[] = catalog.videos;

export const loadMotionVideo = ({ params }: { params: { slug: string } }) => {
  const video = videos.find((entry) => entry.slug === params.slug);
  if (!video) {
    throw notFound();
  }
  return { video };
};

// Both overlay URLs show the same video, so both point at `/videos/$slug`.
export const motionVideoHead = ({
  loaderData,
  params,
}: {
  loaderData?: { video: MotionVideo };
  params: { slug: string };
}) =>
  createMetadata({
    canonical: `/videos/${params.slug}`,
    title: loaderData?.video.title ?? "Motion video",
    description: loaderData
      ? `${loaderData.video.title} by @${loaderData.video.handle}. Watch the motion video${loaderData.video.prompt ? " and copy the prompt behind it" : ""} on MotionVideo.`
      : "A motion video on MotionVideo.",
  });

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
