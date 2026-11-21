// Launch Videos: launch films broken into scenes, each with a copy-ready
// recipe a coding agent can rebuild (docs/launch-videos-prd.md). This module
// is the public half: types, vocabularies and pure helpers shared by the
// browser, the server, the prompt compiler and scripts/check-launch-videos.mjs.
// The recipes themselves are Pro content; they live in
// src/server/data/launch-recipes.json and are only read by server code after
// an access check. Node runs this file directly (tests, the checker), hence
// no `@/` imports.

export const SCENE_ROLES = [
  "hook",
  "problem",
  "reveal",
  "demo",
  "proof",
  "feature",
  "bridge",
  "cta",
  "brand-outro",
] as const;
export type SceneRole = (typeof SCENE_ROLES)[number];

export const SCENE_STYLES = [
  "kinetic-type",
  "ui-motion",
  "abstract",
  "illustration",
  "3d",
  "data-motion",
  "mixed-graphics",
] as const;
export type SceneStyle = (typeof SCENE_STYLES)[number];

export const FILM_KINDS = ["company", "product", "feature", "teaser"] as const;
export type FilmKind = (typeof FILM_KINDS)[number];

export const ASPECTS = ["16:9", "9:16", "1:1", "4:5"] as const;
export type Aspect = (typeof ASPECTS)[number];

/** Canvas each aspect renders at when a prompt changes the source's. */
export const ASPECT_SIZE: Record<Aspect, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
};

/**
 * `adapt` keeps the choreography and swaps every source identity for the
 * user's brand; `exact` rebuilds the film 1:1, original copy and assets
 * included (docs/launch-videos-prd.md §0).
 */
export const PROMPT_MODES = ["adapt", "exact"] as const;
export type PromptMode = (typeof PROMPT_MODES)[number];

export const RENDERERS = [
  "remotion",
  "hyperframes",
  "editframe",
  "fframes",
] as const;
export type Renderer = (typeof RENDERERS)[number];

export const RENDERER_NAMES: Record<Renderer, string> = {
  remotion: "Remotion",
  hyperframes: "HyperFrames",
  editframe: "Editframe",
  fframes: "fframes",
};

/** Upper bound on scenes in one storyboard (web and MCP). */
export const MAX_STORYBOARD_SCENES = 16;

/** A rational frame rate, e.g. 30000/1001. */
export interface Fps {
  num: number;
  den: number;
}

export interface FilmCredit {
  role: string;
  name: string;
  url?: string;
}

/** Public record of one launch film (src/data/launch-videos.json). */
export interface LaunchFilm {
  /** URL slug: `/launch-videos/<slug>`. */
  slug: string;
  title: string;
  /** The brand the film launches. */
  brand: string;
  /** One or two sentences: what the film does and how. */
  summary: string;
  kind: FilmKind;
  categories: string[];
  /** Dominant colors, `#rrggbb`. */
  colors: string[];
  styles: SceneStyle[];
  /** Where the film was first published. */
  source: { url: string; label: string };
  credits: FilmCredit[];
  width: number;
  height: number;
  fpsNum: number;
  fpsDen: number;
  frameCount: number;
  poster: string;
  /** Full film, with sound. */
  video: string;
  /** Short silent loop for cards. */
  preview: string;
  /** Scene IDs in film order. */
  sceneIds: string[];
  /** ISO date. */
  publishedAt: string;
  /** Lower sorts first under "featured"; unset sorts after every featured film. */
  featured?: number;
}

/** Public record of one scene: a chapter of a film. */
export interface LaunchScene {
  /** Globally unique: `<filmSlug>/<slug>`. */
  id: string;
  /** Route slug within the film: `?scene=<slug>`. */
  slug: string;
  filmSlug: string;
  title: string;
  /** The reproducible creative device, one line. */
  device: string;
  /** Edit decisions and why the scene works; never the recipe. */
  description: string;
  /** Half-open range on the film's frame grid. */
  startFrame: number;
  endFrame: number;
  role: SceneRole;
  secondaryRoles: SceneRole[];
  style: SceneStyle;
  /** Related Moves (src/data/moves.json slugs). */
  moves: string[];
  poster: string;
}

export const filmFps = (film: Pick<LaunchFilm, "fpsNum" | "fpsDen">): Fps => ({
  num: film.fpsNum,
  den: film.fpsDen,
});

/** Seconds of `frames` frames at `fps`. */
export const framesToSeconds = (frames: number, fps: Fps) =>
  (frames * fps.den) / fps.num;

export const filmSeconds = (film: LaunchFilm) =>
  framesToSeconds(film.frameCount, filmFps(film));

export const sceneSeconds = (scene: LaunchScene, film: LaunchFilm) =>
  framesToSeconds(scene.endFrame - scene.startFrame, filmFps(film));

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** `16:9` for 1920×1080; the nearest listed aspect for anything else. */
export const aspectOf = (width: number, height: number): Aspect => {
  const ratio = width / height;
  let best: Aspect = ASPECTS[0];
  for (const aspect of ASPECTS) {
    const size = ASPECT_SIZE[aspect];
    if (
      Math.abs(size.width / size.height - ratio) <
      Math.abs(ASPECT_SIZE[best].width / ASPECT_SIZE[best].height - ratio)
    ) {
      best = aspect;
    }
  }
  return best;
};

/** `1920×1080 → 16:9`, exact even when no listed aspect matches. */
export const ratioLabel = (width: number, height: number) => {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

/** `30`, or `29.97` for 30000/1001. */
export const fpsLabel = (fps: Fps) => {
  const value = fps.num / fps.den;
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

/** Duration facets on the Videos view, in seconds, half-open. */
export const FILM_DURATIONS = [
  { id: "under-30", min: 0, max: 30 },
  { id: "30-60", min: 30, max: 60 },
  { id: "60-120", min: 60, max: 120 },
  { id: "120-plus", min: 120, max: Number.POSITIVE_INFINITY },
] as const;

/** Duration facets on the Scenes view, in seconds, half-open. */
export const SCENE_DURATIONS = [
  { id: "under-3", min: 0, max: 3 },
  { id: "3-6", min: 3, max: 6 },
  { id: "6-12", min: 6, max: 12 },
  { id: "12-plus", min: 12, max: Number.POSITIVE_INFINITY },
] as const;

// ── Recipes (server-only data; the types are shared with the compiler) ─────

/** Keys of the brand brief a storyboard shares across all its scenes. */
export const BRAND_INPUTS = [
  { key: "product_name", type: "text", label: "Product name", maxLength: 60 },
  { key: "tagline", type: "text", label: "Tagline", maxLength: 120 },
  { key: "accent", type: "color", label: "Accent color" },
  { key: "background", type: "color", label: "Background color" },
  { key: "foreground", type: "color", label: "Text color" },
  { key: "font", type: "text", label: "Typeface", maxLength: 60 },
  { key: "logo_url", type: "url", label: "Logo file (SVG or PNG)" },
  { key: "cta_text", type: "text", label: "Call to action", maxLength: 40 },
  { key: "cta_url", type: "url", label: "Call-to-action link" },
] as const satisfies readonly InputSlotBase[];
export type BrandInputKey = (typeof BRAND_INPUTS)[number]["key"];

export const INPUT_TYPES = ["text", "color", "url", "number"] as const;
export type InputType = (typeof INPUT_TYPES)[number];

interface InputSlotBase {
  key: string;
  type: InputType;
  label: string;
  maxLength?: number;
}

/** A value the prompt needs from the user, referenced as `{{key}}`. */
export interface InputSlot extends InputSlotBase {
  /** A required slot left empty is listed for the agent to ask about. */
  required: boolean;
  /** What the original film uses; `exact` mode fills it in, `adapt` never does. */
  sourceValue?: string;
  /** Guidance for the agent when the user leaves it empty. */
  hint?: string;
}

/**
 * The visual state at a scene's first or last frame. A join is clean when
 * every tag the incoming scene `requires` is one the outgoing scene `provides`.
 */
export interface JoinState {
  /** How the scene enters or leaves: `cut`, `slide-left`, `push-up`, `flash`… */
  kind: string;
  /** Frames the entrance or exit takes; 0 for a cut. */
  frames: number;
  /** Exit only: what the last frame is (`dark-field`, `solid-field`, `panel`…). */
  provides?: string[];
  /** Entry only: what the previous scene's last frame must be. */
  requires?: string[];
  description: string;
}

export interface RecipeLayer {
  id: string;
  /** `text`, `shape`, `image`, `ui`, `video`, `group`, `camera`, `audio`. */
  kind: string;
  description: string;
}

/** One animation beat, on the scene's own frame grid starting at 0. */
export interface RecipeEvent {
  /** Half-open `[start, end)`; a single frame when `end` is unset. */
  start: number;
  end?: number;
  layer: string;
  /** What happens, may reference `{{slots}}`. */
  action: string;
  /** `linear`, `ease-out`, `spring(damping 200)`, `cubic-bezier(…)`… */
  easing?: string;
}

export interface RecipeAsset {
  id: string;
  /** `image`, `video`, `font`, `audio`, `svg`, `ui-capture`. */
  kind: string;
  description: string;
  /** Original file or URL; listed in `exact` mode only. */
  source?: string;
  /** Slot that replaces it in `adapt` mode. */
  slot?: string;
}

export interface SceneRecipe {
  sceneId: string;
  version: number;
  /** Frame range limits for retiming, on the source film's frame grid. */
  minFrames: number;
  maxFrames: number;
  /** Aspects the layout is tested in; the source's first. */
  aspects: Aspect[];
  inputs: InputSlot[];
  layers: RecipeLayer[];
  events: RecipeEvent[];
  entry: JoinState;
  exit: JoinState;
  assets: RecipeAsset[];
  /** How to swap source material in `adapt` mode. */
  substitutions: string[];
  /** Renderer-specific notes, if any. */
  rendererNotes?: Partial<Record<Renderer, string>>;
  /** Renderers a cold paste of this recipe was checked on. */
  qa: Renderer[];
}

export interface FilmRecipe {
  filmSlug: string;
  version: number;
  /** Type, palette, layout and sound direction for the whole film. */
  brief: { type: string; palette: string; layout: string; audio: string };
  /**
   * The film's own brand values (product name, colors, font, logo, CTA).
   * `exact` mode fills brand slots with them; `adapt` never shows them.
   */
  brandSource: Partial<Record<BrandInputKey, string>>;
  /** Scene versions the full-film prompt pins, in film order. */
  scenes: { sceneId: string; version: number }[];
}

export interface LaunchRecipes {
  scenes: SceneRecipe[];
  films: FilmRecipe[];
}

/** Public input metadata for a scene: what it needs, never the values. */
export type PublicSlot = Pick<InputSlot, "key" | "type" | "label" | "required">;
