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
export const FEATURED_MOTION_CREATORS = MOTION_CREATORS.slice(0, 6);
export const findMotionCreator = (handle: string | undefined) =>
  handle ? creators.get(handle.toLowerCase()) : undefined;
