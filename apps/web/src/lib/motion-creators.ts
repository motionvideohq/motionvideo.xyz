import catalog from "@/data/motion-catalog.json";
import type { MotionVideo } from "@/lib/motion-catalog";

// Handles, unlike display names, identify one creator even when names collide.
const creators = new Map<
  string,
  {
    handle: string;
    name: string;
    avatar: string;
    count: number;
    prompts: number;
  }
>();
const videos: MotionVideo[] = catalog.videos;
for (const video of videos) {
  const handle = video.handle.toLowerCase();
  const creator = creators.get(handle);
  if (creator) {
    creator.count += 1;
    creator.prompts += video.prompt ? 1 : 0;
  } else {
    creators.set(handle, {
      handle,
      name: video.creatorName ?? `@${video.handle}`,
      avatar: video.avatar,
      count: 1,
      prompts: video.prompt ? 1 : 0,
    });
  }
}

// Most videos first; ties in handle order.
export const MOTION_CREATORS = [...creators.values()].toSorted(
  (a, b) => b.count - a.count || a.handle.localeCompare(b.handle, "en")
);

/**
 * Creators with at least this many videos get indexed pages and sitemap
 * entries. Below it, the page is the video's card again with a name on top:
 * still reachable (the sidebar links every creator), but `noindex, follow`.
 */
export const MIN_INDEXED_CREATOR_VIDEOS = 3;
export const INDEXED_MOTION_CREATORS = MOTION_CREATORS.filter(
  (creator) => creator.count >= MIN_INDEXED_CREATOR_VIDEOS
);
export const findMotionCreator = (handle: string | undefined) =>
  handle ? creators.get(handle.toLowerCase()) : undefined;
