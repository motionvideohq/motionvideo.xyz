import type { MotionVideo } from "@/lib/motion-catalog";

/** The fields a card or an embedded video needs, nothing else. */
export type VideoPick = Pick<
  MotionVideo,
  "slug" | "title" | "handle" | "poster" | "width" | "height"
>;

/**
 * The catalog videos with these slugs, by slug, trimmed to `VideoPick`.
 * Takes the catalog as an argument so callers decide where it is bundled
 * (route loaders), and pages ship only the few videos they show.
 */
export const pickVideos = (slugs: Iterable<string>, videos: MotionVideo[]) => {
  const wanted = new Set(slugs);
  return Object.fromEntries(
    videos
      .filter((video) => wanted.has(video.slug))
      .map(
        ({
          slug,
          title,
          handle,
          poster,
          width,
          height,
        }): [string, VideoPick] => [
          slug,
          { slug, title, handle, poster, width, height },
        ]
      )
  );
};
