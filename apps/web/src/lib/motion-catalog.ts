// Relative with its extension: the catalog scripts import this file in Node.
import { hexDistance, normalizeHex } from "./color.ts";

export interface MotionVideo {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  contentTags: string[];
  promptShared: boolean;
  handle: string;
  /** The creator's display name on X, when known. */
  creatorName?: string;
  avatar: string;
  poster: string;
  preview: string;
  video: string;
  width: number;
  height: number;
  prompt?: string;
  skillUrl?: string;
  /** The skills CLI command that installs it (`npx skills add …`). */
  skillInstall?: string;
  tweetUrl?: string;
  description?: string;
  /** How it was made, as the creator reported it. One of MOTION_MODELS. */
  model?: string;
  stack?: string;
  /** One of EFFORTS. */
  effort?: string;
  /** One of ITERATIONS. */
  iterations?: string;
  /**
   * Dominant colours as hexes without `#`, most of the frame first, from
   * `pnpm catalog:refresh:colors`.
   */
  colors?: string[];
}

// Reasoning effort the model ran at, and how many rounds of feedback the
// video took, as the creator reported them. Labels live in the gallery
// dictionary.
export const EFFORTS = ["medium", "high", "max"] as const;
export type Effort = (typeof EFFORTS)[number];
export const findEffort = (value: string | undefined) =>
  EFFORTS.find((effort) => effort === value);

export const ITERATIONS = ["one-shot", "few-rounds", "many-rounds"] as const;
export type Iterations = (typeof ITERATIONS)[number];
export const findIterations = (value: string | undefined) =>
  ITERATIONS.find((iterations) => iterations === value);

// Models creators reported making their videos with, as shown in the gallery.
// The URL carries a slug: `?model=opus-5-5` on Discover, or the
// `/model/opus-5-5` page. Kept grouped by MOTION_MODEL_FAMILY.
export const MOTION_MODELS = [
  "Opus 5.5",
  "Fable 5",
  "Fable 5.1",
  "Fable 5.2",
  "Fable 5.5",
  "Mythos 5",
  "Mythos 5.2",
  "GPT-6 Astra",
  "Gemini 4 Argon",
  "Gemini 4 Carbon",
  "Gemini 4 Hydrogen",
  "Gemini 4 Neon",
] as const;
export type MotionModel = (typeof MOTION_MODELS)[number];
/** Each model's full name, for page titles and copy. */
export const MOTION_MODEL_NAMES: Record<MotionModel, string> = {
  "Opus 5.5": "Claude Opus 5.5",
  "Fable 5": "Claude Fable 5",
  "Fable 5.1": "Claude Fable 5.1",
  "Fable 5.2": "Claude Fable 5.2",
  "Fable 5.5": "Claude Fable 5.5",
  "Mythos 5": "Claude Mythos 5",
  "Mythos 5.2": "Claude Mythos 5.2",
  "GPT-6 Astra": "GPT-6 Astra",
  "Gemini 4 Argon": "Gemini 4 Argon",
  "Gemini 4 Carbon": "Gemini 4 Carbon",
  "Gemini 4 Hydrogen": "Gemini 4 Hydrogen",
  "Gemini 4 Neon": "Gemini 4 Neon",
};
// Model families, named like the models (Claude, GPT, Gemini) rather than the
// labs, so the gallery's model filter can nest each family's models.
export const MOTION_MODEL_FAMILIES = ["Claude", "GPT", "Gemini"] as const;
export type MotionModelFamily = (typeof MOTION_MODEL_FAMILIES)[number];
export const MOTION_MODEL_FAMILY: Record<MotionModel, MotionModelFamily> = {
  "Opus 5.5": "Claude",
  "Fable 5": "Claude",
  "Fable 5.1": "Claude",
  "Fable 5.2": "Claude",
  "Fable 5.5": "Claude",
  "Mythos 5": "Claude",
  "Mythos 5.2": "Claude",
  "GPT-6 Astra": "GPT",
  "Gemini 4 Argon": "Gemini",
  "Gemini 4 Carbon": "Gemini",
  "Gemini 4 Hydrogen": "Gemini",
  "Gemini 4 Neon": "Gemini",
};
export const motionModelSlug = (model: string) =>
  model.toLowerCase().replaceAll(/[^a-z\d]+/gu, "-");
export const findMotionModel = (slug: string | undefined) =>
  MOTION_MODELS.find((model) => motionModelSlug(model) === slug);

/** What a video shares to remake it: its prompt, or an agent skill. */
export const MOTION_TYPES = ["prompt", "skill"] as const;
export type MotionType = (typeof MOTION_TYPES)[number];
export const findMotionType = (value: string | undefined) =>
  MOTION_TYPES.find((type) => type === value);

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

// Named colours, each with a page (`/color/red`) that is the colour filter
// set to its hex. The hexes sit near the middle of the catalog's own shades
// of that colour, so each page gathers as many of them as one hex can.
export const MOTION_COLORS = [
  { slug: "red", hex: "e5484d" },
  { slug: "orange", hex: "f2732a" },
  { slug: "yellow", hex: "e0c84a" },
  { slug: "green", hex: "34a853" },
  { slug: "teal", hex: "2a9d8f" },
  { slug: "blue", hex: "2563eb" },
  { slug: "purple", hex: "6e56cf" },
  { slug: "pink", hex: "f472b6" },
  { slug: "brown", hex: "7b4f2c" },
  { slug: "black", hex: "111111" },
  { slug: "white", hex: "f5f5f5" },
  { slug: "gray", hex: "8a8a8a" },
] as const;
export type MotionColor = (typeof MOTION_COLORS)[number];
export const findMotionColor = (slug: string | undefined) =>
  MOTION_COLORS.find((color) => color.slug === slug);

// Discover's filters are search params (`?type=prompt&model=opus-5-5`); each
// value also has its own page with that filter in the path.
export interface GallerySearch {
  category?: MotionCategory;
  type?: MotionType;
  /** A motionModelSlug. */
  model?: string;
  sort?: "newest" | "oldest";
  /**
   * Colours to match, as hexes without `#` joined by commas
   * (`?color=c0737f,1e3a8a`). A video matches when every one is close to one
   * of its own colours.
   */
  color?: string;
}

export interface MotionFilters extends GallerySearch {
  creator?: string;
  q?: string;
}

/**
 * The page a gallery grid shows: Discover (undefined), or one filter fixed by
 * the path: category, colour, model, type, or creator.
 */
export type GalleryScope =
  | { kind: "category"; category: MotionCategory }
  | { kind: "color"; color: MotionColor }
  | { kind: "model"; model: MotionModel }
  | { kind: "type"; type: MotionType }
  | { kind: "creator"; creator: string };

/** The filters a scope fixes, as MotionFilters. */
export const scopeFilters = (
  scope: GalleryScope | undefined
): MotionFilters => {
  switch (scope?.kind) {
    case "creator": {
      return { creator: scope.creator };
    }
    case "category": {
      return { category: scope.category };
    }
    case "color": {
      return { color: scope.color.hex };
    }
    case "model": {
      return { model: motionModelSlug(scope.model) };
    }
    case "type": {
      return { type: scope.type };
    }
    default: {
      return {};
    }
  }
};

/** At most this many colours to filter by at once. */
export const MAX_FILTER_COLORS = 3;

/** The `color` search param as normalized hexes, deduplicated and capped. */
export const parseFilterColors = (value: string | undefined): string[] =>
  [
    ...new Set(
      (value ?? "")
        .split(",")
        .map(normalizeHex)
        .filter((hex) => hex !== undefined)
    ),
  ].slice(0, MAX_FILTER_COLORS);

// OKLab distance under which a picked colour counts as one of a video's own:
// the same hue family and lightness, not just the exact shade.
const COLOR_MATCH_DISTANCE = 0.11;

const hasColor = (video: MotionVideo, hex: string) =>
  (video.colors ?? []).some(
    (own) => hexDistance(hex, own) < COLOR_MATCH_DISTANCE
  );

/** The named colours (MOTION_COLORS) a video contains, in that order. */
export const videoColorNames = (video: MotionVideo): MotionColor["slug"][] =>
  MOTION_COLORS.filter((color) => hasColor(video, color.hex)).map(
    (color) => color.slug
  );

/**
 * What to match, one facet per field. Several values in a facet are
 * alternatives (product-ui or charts); every facet given must hold. An
 * absent facet doesn't filter; an empty list matches nothing.
 */
export interface VideoCriteria {
  q?: string;
  categories?: readonly MotionCategory[];
  /** Exact MOTION_MODELS names. */
  models?: readonly string[];
  /** Normalized hexes. */
  colors?: readonly string[];
  /** `all` (the gallery's colour filter): every colour; `any`: one is enough. */
  colorMatch?: "any" | "all";
  /** X handles, compared ignoring case. */
  creators?: readonly string[];
  type?: MotionType;
}

export type VideoFacet =
  | "q"
  | "category"
  | "model"
  | "color"
  | "creator"
  | "type";

/** One test per facet in `criteria`, so callers can also count each alone. */
export const videoMatchers = (
  criteria: VideoCriteria
): { facet: VideoFacet; test: (video: MotionVideo) => boolean }[] => {
  const matchers: {
    facet: VideoFacet;
    test: (video: MotionVideo) => boolean;
  }[] = [];
  const { categories, models, colors, creators, type } = criteria;
  if (creators) {
    const handles = new Set(creators.map((handle) => handle.toLowerCase()));
    matchers.push({
      facet: "creator",
      test: (video) => handles.has(video.handle.toLowerCase()),
    });
  }
  if (type) {
    matchers.push({
      facet: "type",
      test: (video) => video.tags.includes(type),
    });
  }
  if (models) {
    matchers.push({
      facet: "model",
      test: (video) =>
        video.model !== undefined && models.includes(video.model),
    });
  }
  if (categories) {
    matchers.push({
      facet: "category",
      test: (video) =>
        categories.some((category) => video.contentTags.includes(category)),
    });
  }
  if (colors) {
    matchers.push({
      facet: "color",
      test: (video) =>
        criteria.colorMatch === "any"
          ? colors.some((hex) => hasColor(video, hex))
          : colors.every((hex) => hasColor(video, hex)),
    });
  }
  const words = criteria.q?.trim().toLowerCase().split(/\s+/u).filter(Boolean);
  if (words?.length) {
    matchers.push({
      facet: "q",
      test: (video) => {
        const text = [
          video.title,
          video.handle,
          video.prompt ?? "",
          ...video.contentTags,
        ]
          .join(" ")
          .toLowerCase();
        return words.every((word) => text.includes(word));
      },
    });
  }
  return matchers;
};

/** Videos matching every facet of `criteria`, newest or oldest first if set. */
export const matchMotionVideos = (
  videos: MotionVideo[],
  criteria: VideoCriteria,
  sort?: "newest" | "oldest"
): MotionVideo[] => {
  const matchers = videoMatchers(criteria);
  const filtered = videos.filter((video) =>
    matchers.every((matcher) => matcher.test(video))
  );
  if (sort) {
    const direction = sort === "newest" ? -1 : 1;
    filtered.sort((a, b) => direction * a.date.localeCompare(b.date));
  }
  return filtered;
};

export const filterMotionVideos = (
  videos: MotionVideo[],
  search: MotionFilters
): MotionVideo[] => {
  const model = findMotionModel(search.model);
  const colors = parseFilterColors(search.color);
  // An unknown model slug matches nothing.
  let models: string[] | undefined;
  if (search.model) {
    models = model ? [model] : [];
  }
  return matchMotionVideos(
    videos,
    {
      categories: search.category ? [search.category] : undefined,
      colorMatch: "all",
      colors: colors.length > 0 ? colors : undefined,
      creators: search.creator ? [search.creator] : undefined,
      models,
      q: search.q,
      type: search.type,
    },
    search.sort
  );
};

// How far, on average, each colour of `from` is from its nearest in `to`.
const meanNearestDistance = (from: string[], to: string[]) =>
  from.reduce(
    (sum, hex) => sum + Math.min(...to.map((other) => hexDistance(hex, other))),
    0
  ) / from.length;

// How far apart two palettes look: the nearest-colour distance averaged both
// ways, so a palette inside a bigger one still differs. 0 for the same one.
const paletteDistance = (a: string[], b: string[]) =>
  (meanNearestDistance(a, b) + meanNearestDistance(b, a)) / 2;

/**
 * The videos most like `video`, best first: shared categories weigh most,
 * then a similar palette, the same model, type and creator. Ties keep the
 * catalog (featured) order.
 */
export const similarMotionVideos = (
  video: MotionVideo,
  videos: MotionVideo[],
  count: number
): MotionVideo[] => {
  const score = (other: MotionVideo) => {
    const shared = other.contentTags.filter((tag) =>
      video.contentTags.includes(tag)
    ).length;
    const categories =
      shared /
      Math.max(1, new Set([...video.contentTags, ...other.contentTags]).size);
    const palette =
      video.colors?.length && other.colors?.length
        ? Math.max(0, 1 - paletteDistance(video.colors, other.colors) / 0.25)
        : 0;
    return (
      3 * categories +
      2 * palette +
      (video.model && other.model === video.model ? 0.75 : 0) +
      (other.tags.some((tag) => video.tags.includes(tag)) ? 0.5 : 0) +
      (other.handle === video.handle ? 0.5 : 0)
    );
  };
  return videos
    .filter((other) => other.slug !== video.slug)
    .map((other) => ({ other, score: score(other) }))
    .toSorted((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ other }) => other);
};
