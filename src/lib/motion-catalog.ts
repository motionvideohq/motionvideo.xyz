export interface MotionVideo {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  contentTags: string[];
  promptShared: boolean;
  handle: string;
  avatar: string;
  poster: string;
  preview: string;
  video: string;
  width: number;
  height: number;
  prompt?: string;
  skillUrl?: string;
  tweetUrl?: string;
  description?: string;
}

export const MOTION_CATEGORIES = [
  "product-ui",
  "phone",
  "charts",
  "diagrams",
  "kinetic-type",
  "shapes",
  "particles",
  "characters",
  "photos",
  "music",
  "code",
] as const;

export type MotionCategory = (typeof MOTION_CATEGORIES)[number];

export const findMotionCategory = (value: string | undefined) =>
  MOTION_CATEGORIES.find((category) => category === value);

// The category is a path segment (`/category/$category`), not a search param.
export interface GallerySearch {
  type?: "prompt" | "skill";
  sort?: "newest" | "oldest";
}

export interface MotionFilters extends GallerySearch {
  category?: MotionCategory;
  q?: string;
}

export const filterMotionVideos = (
  videos: MotionVideo[],
  search: MotionFilters
): MotionVideo[] => {
  const words = search.q?.trim().toLowerCase().split(/\s+/u) ?? [];
  const filtered = videos.filter((video) => {
    if (search.type && !video.tags.includes(search.type)) {
      return false;
    }
    if (search.category && !video.contentTags.includes(search.category)) {
      return false;
    }
    const text = [
      video.title,
      video.handle,
      video.prompt ?? "",
      ...video.contentTags,
    ]
      .join(" ")
      .toLowerCase();
    return words.every((word) => text.includes(word));
  });
  if (search.sort) {
    const direction = search.sort === "newest" ? -1 : 1;
    filtered.sort((a, b) => direction * a.date.localeCompare(b.date));
  }
  return filtered;
};
