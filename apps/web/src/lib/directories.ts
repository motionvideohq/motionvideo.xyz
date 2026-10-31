import { z } from "zod";

import directories from "@/data/resource-directories.json";
import xArticles from "@/data/x-articles.json";

export interface DirectoryEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  cover: string | null;
  /** The day the entry joined the directory (YYYY-MM-DD), for "Recently added". */
  addedAt: string;
  /** Articles only: when the article was published (ISO). */
  publishedAt?: string;
  /** Skills only: GitHub stars, from `pnpm catalog:refresh:skills`. */
  stars?: number;
  /** Skills only: the repository's last push (ISO), from the same script. */
  updatedAt?: string;
  /** Tools only: one of DIRECTORY_FILTERS.tool. */
  pricing?: string;
  /** Skills only: what renders the video, most central first. */
  renderers?: string[];
  /** Creatives only: what they're known for, strongest first. */
  specialties?: string[];
  /** Resources (under /extras) only: one of DIRECTORY_FILTERS.extra. */
  resourceType?: string;
}

// Each kind is its own section: `tool` lists /tools, `studio` lists /creatives
// (studios and designers), `skill` lists /skills, and `extra` lists /extras.
export type DirectoryKind = "tool" | "studio" | "skill" | "extra";

// Orders each section can switch to with `?sort=`; without one it keeps the
// curated order (newest article first, on /extras).
export const DIRECTORY_SORTS = {
  tool: ["added"],
  studio: ["added"],
  skill: ["stars", "updated", "added"],
  extra: ["newest", "oldest", "added"],
} as const satisfies Record<DirectoryKind, readonly string[]>;
export type DirectorySort = (typeof DIRECTORY_SORTS)[DirectoryKind][number];

// Standalone facets have their own section paths; category + facet combinations
// keep the category path and use `?filter=`. Sorting always uses `?sort=`.
export const DIRECTORY_FILTERS = {
  tool: ["free", "freemium", "open-source", "paid"],
  studio: ["product-films", "explainers", "3d", "brand", "ui-motion"],
  skill: [
    "remotion",
    "hyperframes",
    "html",
    "manim",
    "adobe",
    "blender",
    "video-models",
    "ffmpeg",
  ],
  extra: ["library", "examples", "prompts", "directory", "archive"],
} as const satisfies Record<DirectoryKind, readonly string[]>;
export type DirectoryFilter = (typeof DIRECTORY_FILTERS)[DirectoryKind][number];

export interface DirectorySearch {
  sort?: DirectorySort;
  filter?: DirectoryFilter;
}

/**
 * `validateSearch` for a section's layout route: values outside the section's
 * own sorts and filters are dropped rather than rejected.
 */
export const directorySearch = (kind: DirectoryKind) =>
  z.object({
    sort: z
      .unknown()
      .optional()
      .transform((value) => DIRECTORY_SORTS[kind].find((id) => id === value)),
    filter: z
      .unknown()
      .optional()
      .transform((value) => DIRECTORY_FILTERS[kind].find((id) => id === value)),
  }) satisfies z.ZodType<DirectorySearch>;

/** The facet values an entry carries in `kind`'s section. */
export const filterValuesOf = (
  kind: DirectoryKind,
  entry: DirectoryEntry
): readonly string[] => {
  switch (kind) {
    case "tool": {
      return entry.pricing ? [entry.pricing] : [];
    }
    case "studio": {
      return entry.specialties ?? [];
    }
    case "skill": {
      return entry.renderers ?? [];
    }
    case "extra": {
      return entry.resourceType ? [entry.resourceType] : [];
    }
    default: {
      return [];
    }
  }
};

const byDateDescending =
  (date: (entry: DirectoryEntry) => string | undefined) =>
  (a: DirectoryEntry, b: DirectoryEntry) =>
    (date(b) ?? "").localeCompare(date(a) ?? "");

/** `entries` in `sort` order (stable); entries missing the value go last. */
export const sortDirectoryEntries = (
  entries: DirectoryEntry[],
  sort: DirectorySort | undefined
): DirectoryEntry[] => {
  switch (sort) {
    case "stars": {
      return entries.toSorted((a, b) => (b.stars ?? -1) - (a.stars ?? -1));
    }
    case "updated": {
      return entries.toSorted(byDateDescending((entry) => entry.updatedAt));
    }
    case "added": {
      return entries.toSorted(byDateDescending((entry) => entry.addedAt));
    }
    case "newest": {
      return entries.toSorted(byDateDescending((entry) => entry.publishedAt));
    }
    case "oldest": {
      return entries.toSorted((a, b) =>
        (a.publishedAt ?? "\uFFFF").localeCompare(b.publishedAt ?? "\uFFFF")
      );
    }
    default: {
      return entries;
    }
  }
};

// The data file lists skills, web articles and resources under tools; they
// get their own sections here.
const KIND_BY_TOOL_CATEGORY = {
  Skills: "skill",
  Articles: "extra",
  Resources: "extra",
} as const satisfies Record<string, DirectoryKind>;

const toolsOfKind = (kind: DirectoryKind) =>
  directories.tools.entries.filter(
    (entry) =>
      (Object.entries(KIND_BY_TOOL_CATEGORY).find(
        ([name]) => name === entry.category
      )?.[1] ?? "tool") === kind
  );

// The data file lists every skill under "Skills"; their sub-category is picked
// here by id. A skill missing from this list stays under "All" only.
const SKILL_CATEGORY_BY_ID = {
  "oil-motion": "Motion graphics",
  "remotion-skills": "Motion graphics",
  "jacky-motion": "Motion graphics",
  "lemo-opuscar": "Motion graphics",
  "codex-whiteboard-video": "Motion graphics",
  cinetic: "Product films",
  "guizang-product-video": "Product films",
  "video-demo": "Product films",
  "video-production-skills": "AI video",
  "diffusion-studio-skills": "AI video",
  "shuohao-skills": "AI video",
  director: "AI video",
  "one-prompt-video": "AI video",
  "minimax-h3-video-reverse": "AI video",
  "huashu-art-motion": "Motion graphics",
  motionmaxxing: "Motion graphics",
  "product-launch-motion": "Product films",
  "motion-graphics-skills": "Motion graphics",
  "claude-motion-design": "Motion graphics",
  "herk-edit-kit": "AI video",
  "barty-motion-graphics": "Motion graphics",
  animate: "Motion graphics",
  "claude-motion": "Motion graphics",
  "claude-remotion-skill": "Motion graphics",
  "lottie-motion-design-skill": "Motion graphics",
  "gsap-skills": "Motion graphics",
  "hyperframes-community-skills": "Motion graphics",
  "awesome-ai-motion": "Motion graphics",
  "video-skills": "Product films",
  "motion-design-skills": "Motion graphics",
  "bang-motion": "Motion graphics",
  "opus-video-skills": "Motion graphics",
  "claude-animation": "Motion graphics",
  "remotion-workflow-skills": "Motion graphics",
  "remotion-brand-motion": "Motion graphics",
  "apple-motion-study": "Motion graphics",
  "kinetic-typography-skills": "Motion graphics",
  "motion-anything": "Motion graphics",
  "data-animation-skills": "Motion graphics",
  "explainer-video-skills": "Motion graphics",
  "javascript-animation-skills": "Motion graphics",
  "manim-animation-skills": "Motion graphics",
  "map-animation-skills": "Motion graphics",
  "webgl-animation-skills": "Motion graphics",
  "anything-to-explainer": "Motion graphics",
  "video-talkcraft": "Motion graphics",
  anidoodle: "Motion graphics",
  "motion-graphics-music-video": "Motion graphics",
  "claude-video-kit": "Motion graphics",
  "persian-motion-director": "Motion graphics",
  "mort1d-motion-graphics": "Motion graphics",
  "lemo-wake": "Motion graphics",
  "hyperframes-motion-reel": "Motion graphics",
  "papercut-explainer": "Motion graphics",
  "extreme-motion-design": "Motion graphics",
  mashhad: "Motion graphics",
  "video-shotcraft": "Product films",
  "agentic-product-demo": "Product films",
  "saas-motion-kit": "Product films",
  "brand-motion-design": "Product films",
  appshot: "Product films",
  "ai-promo-video-maker": "Product films",
  "ad-video-skills": "Product films",
  "e-commerce-video-skills": "Product films",
  "claude-youtube-editor": "AI video",
  "claude-faceless-shorts-creator": "AI video",
  "take-one": "AI video",
  openvideoharness: "AI video",
  "motion-design-for-agents": "AI video",
  "aiev-video-skills": "AI video",
  cutdirector: "AI video",
  "remotion-koubo-workflow": "AI video",
  "short-form-video-skills": "AI video",
  openmontage: "AI video",
  brag: "Product films",
  "diffusion-studio-lottie": "Motion graphics",
  "firered-openstoryline": "AI video",
  "chengfeng-videocut": "AI video",
  "narrator-ai": "AI video",
  pixel2motion: "Motion graphics",
  "claude-code-video-toolkit": "Motion graphics",
  "story-to-hand-drawn-video": "Motion graphics",
  "vox-director": "Motion graphics",
  "lanshu-ai-presenter": "AI video",
  "gbro-collage-b-roll": "Motion graphics",
  "vibe-motion-skills": "Motion graphics",
  "manim-skill": "Motion graphics",
  onetake: "Product films",
  cartcut: "AI video",
  "premiere-pro-mcp": "AI video",
  "live-panel": "Motion graphics",
  "video-recap-skills": "AI video",
  baocut: "AI video",
  "heygen-skills": "AI video",
  "hyperframes-motion-director": "Product films",
  "claude-animation-base": "Motion graphics",
  mathlens: "Motion graphics",
  explainroo: "Motion graphics",
  "agent-storyboard": "AI video",
  "image-story-video-wizard": "AI video",
  "hand-drawn-explainer": "Motion graphics",
  "xianxia-cinematic-director": "AI video",
  "vox-ai-motion-graphics": "Motion graphics",
  "claude-shorts": "AI video",
  "auto-video-agent": "AI video",
  "vox-collage-b-roll": "Motion graphics",
  "motion-video-kit": "Product films",
  "erduo-b-roll-engine": "AI video",
  "oh-my-cassette": "AI video",
  "director-skills": "AI video",
  "hbg-life-simulation": "AI video",
  "ai-video-editing-skill": "AI video",
  "naive-video-skill": "AI video",
  "avatar-mix": "AI video",
  easyedit: "AI video",
  "videodb-skills": "AI video",
  "claude-remotion-kickstart": "Motion graphics",
  seecut: "AI video",
  monet: "AI video",
  "remotion-ad-video": "Product films",
  "book-video-factory": "AI video",
  "promo-creator-skills": "Product films",
  "cut-video": "AI video",
  "adu-motion-video": "AI video",
  vex: "AI video",
  "motion-video-skill": "Product films",
  "after-effects-mcp": "Motion graphics",
  "remotion-motion-graphics-skill": "Motion graphics",
  "30x-video": "Product films",
  "ghost-editor": "AI video",
  brewreel: "Product films",
  "remotion-ads": "Product films",
  "unclejobs-motion-video": "Motion graphics",
  "gbro-collage-info": "Motion graphics",
  "remotion-claude-video": "Motion graphics",
  "vlog-cut": "AI video",
  "story-hand-drawn-video": "AI video",
  "code-video": "Product films",
  "blender-education-video": "Motion graphics",
  "knowledge-explainer": "Motion graphics",
  "typewriter-video": "Motion graphics",
  "remotion-video-director": "Product films",
  "video-clipforge": "AI video",
  reelmimic: "AI video",
  "zack-d-films-generator": "AI video",
  "vidmuse-video-creator": "AI video",
  "3brown1blue": "Motion graphics",
  "codex-video-short-maker": "AI video",
  "story-hand-drawn-remotion": "Motion graphics",
  "self-media-video-packaging": "AI video",
  "remotion-director": "Motion graphics",
  "paper-algorithm": "AI video",
  "video-vox": "Motion graphics",
  "jj-koubo": "AI video",
  "onboarding-video-generator": "Product films",
  "remotion-code-motion-explainer": "Motion graphics",
  "hbg-code-explainer": "Motion graphics",
  "paint-mv-skills": "Motion graphics",
  "product-demo-director": "Product films",
  ultrademo: "Product films",
  "react-bits-video": "Motion graphics",
  "reel-video": "AI video",
  "claude-gif": "Motion graphics",
  "remotion-guofeng-starter": "Motion graphics",
  voxstylehub: "Motion graphics",
  "ruic-motion-reel": "Motion graphics",
  montara: "AI video",
  aftr: "Motion graphics",
  lipnardo: "AI video",
  framewright: "Motion graphics",
  "purffle-shorts": "AI video",
  ccvideo: "Product films",
  "personal-ip-brand-intro": "Motion graphics",
} as const satisfies Record<string, string>;

const skillCategoryOf = (id: string): string | undefined =>
  Object.entries(SKILL_CATEGORY_BY_ID).find(([key]) => key === id)?.[1];

export const DIRECTORY_ENTRIES: Record<DirectoryKind, DirectoryEntry[]> = {
  tool: toolsOfKind("tool"),
  studio: directories.studios.entries,
  skill: toolsOfKind("skill").map((entry) => ({
    ...entry,
    category: skillCategoryOf(entry.id) ?? entry.category,
  })),
  // Articles first, newest first: X articles (`pnpm catalog:import:articles`)
  // and web articles (category "Articles" in the data file) together, then
  // the resources.
  extra: [
    ...[
      ...xArticles.entries,
      ...toolsOfKind("extra").filter((entry) => entry.category === "Articles"),
    ].toSorted((a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")
    ),
    ...toolsOfKind("extra").filter((entry) => entry.category !== "Articles"),
  ],
};

// URL slugs for each section's category names; they match the chip labels.
// A new category stays under "All" until it gets a slug here.
const SLUG_BY_CATEGORY = {
  tool: { AI: "ai", Editor: "editors", Mockup: "mockups", Motion: "motion" },
  studio: { Studio: "studios", Designers: "designers" },
  skill: {
    "Motion graphics": "motion",
    "Product films": "product-films",
    "AI video": "ai-video",
  },
  extra: { Articles: "articles", Resources: "resources" },
} as const satisfies Record<DirectoryKind, Record<string, string>>;

type SlugMap = typeof SLUG_BY_CATEGORY;

/** A category's path segment in `kind`'s section, e.g. `ai` in `/tools/ai`. */
export type DirectorySlug<Kind extends DirectoryKind = DirectoryKind> = {
  [K in DirectoryKind]: SlugMap[K][keyof SlugMap[K]];
}[Kind];

export interface DirectoryCategory<Kind extends DirectoryKind = DirectoryKind> {
  /** Category name as imported, e.g. `Editor`. */
  id: string;
  /** Path segment, e.g. `editors` in `/tools/editors`. */
  slug: DirectorySlug<Kind>;
}

const toCategories = <Kind extends DirectoryKind>(
  kind: Kind
): DirectoryCategory<Kind>[] => {
  const slugs = new Map<string, string>(Object.entries(SLUG_BY_CATEGORY[kind]));
  return [
    ...new Set(DIRECTORY_ENTRIES[kind].map((entry) => entry.category)),
  ].flatMap((id) => {
    const slug = slugs.get(id);
    // SAFETY: `slugs` holds exactly SLUG_BY_CATEGORY[kind]'s values, which are
    // DirectorySlug<Kind> by definition.
    return slug ? [{ id, slug: slug as DirectorySlug<Kind> }] : [];
  });
};

// Chip order follows the first appearance of each category in the entries.
export const DIRECTORY_CATEGORIES = {
  tool: toCategories("tool"),
  studio: toCategories("studio"),
  skill: toCategories("skill"),
  extra: toCategories("extra"),
} satisfies {
  [K in DirectoryKind]: DirectoryCategory<K>[];
};

export const findDirectoryCategory = <Kind extends DirectoryKind>(
  kind: Kind,
  slug: string | undefined
): DirectoryCategory<Kind> | undefined =>
  // SAFETY: DIRECTORY_CATEGORIES is keyed by every DirectoryKind with that
  // kind's own category array, so indexing by `kind` yields exactly
  // DirectoryCategory<Kind>[].
  (DIRECTORY_CATEGORIES[kind] as DirectoryCategory<Kind>[]).find(
    (category) => category.slug === slug
  );

/** Category slugs take precedence; facets are resolved within their own section. */
export const findDirectoryFilter = (
  kind: DirectoryKind,
  slug: string | undefined
): DirectoryFilter | undefined =>
  findDirectoryCategory(kind, slug)
    ? undefined
    : DIRECTORY_FILTERS[kind].find((filter) => filter === slug);
