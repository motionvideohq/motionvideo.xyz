// Request validation and response shapes for Launch Videos, shared by the
// site's server functions (src/server/launch-functions.ts) and the MCP API
// (src/server/launch-api.ts). Pure: no Worker APIs and no recipes, so Node
// runs it directly in tests, hence the relative `.ts` imports.
//
// Every object is strict: an unknown key or a wrong type is refused, never
// dropped, so a typo in an agent's call can't silently change the prompt.

import { z } from "zod";

import { absoluteUrl } from "../constants/url.ts";
import { LAUNCH_VIEWS, pageOf, searchLaunch } from "../lib/launch-search.ts";
import type { LaunchQuery } from "../lib/launch-search.ts";
import {
  ASPECTS,
  MAX_STORYBOARD_SCENES,
  PROMPT_MODES,
  RENDERERS,
  SCENE_ROLES,
  SCENE_STYLES,
  aspectOf,
  filmFps,
  filmSeconds,
  framesToSeconds,
  sceneSeconds,
} from "../lib/launch-videos.ts";
import type {
  Aspect,
  FilmCredit,
  FilmKind,
  Fps,
  LaunchFilm,
  LaunchScene,
  SceneRole,
  SceneStyle,
} from "../lib/launch-videos.ts";

/** Upper bound on any list or record in a request. */
export const MAX_ENTRIES = 32;
/** Upper bound on a request body, in bytes. */
export const MAX_BODY_BYTES = 32 * 1024;

export const SEARCH_LIMIT_DEFAULT = 12;
export const SEARCH_LIMIT_MAX = 30;

const id = z.string().min(1).max(200);

const inputs = z
  .record(
    z.string().regex(/^[a-z0-9_]{1,64}$/u, "Input keys are snake_case."),
    z.string().max(4096)
  )
  .refine((record) => Object.keys(record).length <= MAX_ENTRIES, {
    message: `At most ${MAX_ENTRIES} inputs.`,
  });

const fps = z.strictObject({
  num: z.number().int().positive().max(1_000_000),
  den: z.number().int().positive().max(1_000_000),
});

const options = {
  mode: z.enum(PROMPT_MODES),
  renderer: z.enum(RENDERERS),
  inputs: inputs.optional(),
  aspect: z.enum(ASPECTS).optional(),
  fps: fps.optional(),
  targetSeconds: z.number().positive().max(3600).optional(),
};

const compose = {
  ...options,
  sceneIds: z.array(id).min(1).max(MAX_STORYBOARD_SCENES),
  versions: z
    .array(z.number().int().positive().nullable())
    .max(MAX_STORYBOARD_SCENES)
    .optional(),
  joins: z
    .array(
      z.strictObject({
        after: z.number().int().nonnegative(),
        kind: z.enum(["cut", "bridge"]),
        frames: z.number().int().positive().optional(),
      })
    )
    .max(MAX_ENTRIES)
    .optional(),
};

const filmPromptFields = { ...options, filmSlug: id, sceneId: id.optional() };

/** `getLaunchPrompt` input (web). */
export const filmPromptInput = z.strictObject(filmPromptFields);
/** `composeLaunchPrompt` input (web). */
export const composeInput = z.strictObject(compose);
/** `getLaunchSlots` input. */
export const slotsInput = z.strictObject({
  sceneIds: z.array(id).min(1).max(MAX_STORYBOARD_SCENES),
});

/** `POST /api/mcp/launch-videos/prompt` body: the web input plus `finalize`. */
export const filmPromptBody = z.strictObject({
  ...filmPromptFields,
  finalize: z.boolean().optional(),
});
/** `POST /api/mcp/launch-videos/compose` body. */
export const composeBody = z.strictObject({
  ...compose,
  finalize: z.boolean().optional(),
});

/** A refused request, in the API's error shape. */
export interface InvalidRequest {
  error: "invalid_request";
  message: string;
  details: { issues: { path: string; message: string }[] };
}

export const invalidRequest = (
  message: string,
  issues: { path: string; message: string }[] = []
): InvalidRequest => ({
  error: "invalid_request",
  message,
  details: { issues },
});

// Paths and messages only: zod's issues can echo the offending value.
const issuesOf = (error: z.ZodError) =>
  error.issues.slice(0, MAX_ENTRIES).map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));

export type Parsed<T> =
  | { ok: true; value: T }
  | { ok: false; error: InvalidRequest };

/** Parse a request body (bytes) against a strict schema. */
export const parseBody = <T>(
  schema: z.ZodType<T>,
  bytes: ArrayBuffer
): Parsed<T> => {
  if (bytes.byteLength > MAX_BODY_BYTES) {
    return {
      ok: false,
      error: invalidRequest(`The body is over ${MAX_BODY_BYTES} bytes.`),
    };
  }
  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return { ok: false, error: invalidRequest("The body is not valid JSON.") };
  }
  const result = schema.safeParse(json);
  return result.success
    ? { ok: true, value: result.data }
    : {
        ok: false,
        error: invalidRequest(
          "The body does not match the schema.",
          issuesOf(result.error)
        ),
      };
};

// ── Search ──────────────────────────────────────────────────────────────────

const csv = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.enum(values)).min(1).max(MAX_ENTRIES));

const seconds = z
  .string()
  .regex(/^\d{1,5}(?:\.\d{1,3})?$/u, "Seconds are a non-negative number.")
  .transform(Number);

const searchParams = z.strictObject({
  query: z.string().max(200).optional(),
  view: z.enum(LAUNCH_VIEWS).optional(),
  roles: csv(SCENE_ROLES).optional(),
  styles: csv(SCENE_STYLES).optional(),
  aspect: z.enum(ASPECTS).optional(),
  minSeconds: seconds.optional(),
  maxSeconds: seconds.optional(),
  category: z.string().max(100).optional(),
  limit: z
    .string()
    .regex(/^\d{1,2}$/u, "The limit is a whole number.")
    .transform(Number)
    .pipe(z.number().int().min(1).max(SEARCH_LIMIT_MAX))
    .optional(),
  cursor: z
    .string()
    .regex(/^\d{1,6}$/u, "Use the nextCursor of the previous page.")
    .optional(),
});

export interface LaunchSearch {
  query: LaunchQuery;
  limit: number;
  cursor: string | undefined;
}

/**
 * `GET /search` parameters as a LaunchQuery. Empty values count as unset;
 * an unknown or repeated parameter, or a value outside its vocabulary, is
 * refused. Without `view` the search lists scenes.
 */
export const parseSearchParams = (
  params: URLSearchParams
): Parsed<LaunchSearch> => {
  const record: Record<string, string> = {};
  for (const [key, value] of params) {
    if (Object.hasOwn(record, key)) {
      return { ok: false, error: invalidRequest(`Give "${key}" once.`) };
    }
    record[key] = value;
  }
  const given = Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== "")
  );
  const result = searchParams.safeParse(given);
  if (!result.success) {
    return {
      ok: false,
      error: invalidRequest(
        "Invalid search parameters.",
        issuesOf(result.error)
      ),
    };
  }
  const p = result.data;
  return {
    ok: true,
    value: {
      query: {
        view: p.view ?? "scenes",
        q: p.query,
        roles: p.roles,
        styles: p.styles,
        aspects: p.aspect ? [p.aspect] : undefined,
        categories: p.category ? [p.category] : undefined,
        minSeconds: p.minSeconds,
        maxSeconds: p.maxSeconds,
      },
      limit: p.limit ?? SEARCH_LIMIT_DEFAULT,
      cursor: p.cursor,
    },
  };
};

export interface LaunchFilmItem {
  slug: string;
  title: string;
  brand: string;
  summary: string;
  kind: FilmKind;
  categories: string[];
  styles: SceneStyle[];
  seconds: number;
  aspect: Aspect;
  width: number;
  height: number;
  fps: Fps;
  url: string;
  source: { url: string; label: string };
  credits: FilmCredit[];
  sceneIds: string[];
}

export interface LaunchSceneItem {
  id: string;
  filmSlug: string;
  title: string;
  device: string;
  role: SceneRole;
  secondaryRoles: SceneRole[];
  style: SceneStyle;
  seconds: number;
  startFrame: number;
  endFrame: number;
  startSeconds: number;
  endSeconds: number;
  url: string;
  film: { title: string; brand: string; credits: FilmCredit[] };
  moves: string[];
}

export type LaunchSearchBody =
  | { view: "films"; items: LaunchFilmItem[]; nextCursor: string | null }
  | { view: "scenes"; items: LaunchSceneItem[]; nextCursor: string | null };

const round = (value: number) => Math.round(value * 1000) / 1000;

const filmUrl = (film: LaunchFilm) =>
  absoluteUrl(`/launch-videos/${film.slug}`);

/** A film's public summary: fields listed one by one, so nothing else leaks. */
export const filmItem = (film: LaunchFilm): LaunchFilmItem => ({
  slug: film.slug,
  title: film.title,
  brand: film.brand,
  summary: film.summary,
  kind: film.kind,
  categories: film.categories,
  styles: film.styles,
  seconds: round(filmSeconds(film)),
  aspect: aspectOf(film.width, film.height),
  width: film.width,
  height: film.height,
  fps: filmFps(film),
  url: filmUrl(film),
  source: { url: film.source.url, label: film.source.label },
  credits: film.credits,
  sceneIds: film.sceneIds,
});

export const sceneItem = (
  scene: LaunchScene,
  film: LaunchFilm
): LaunchSceneItem => ({
  id: scene.id,
  filmSlug: scene.filmSlug,
  title: scene.title,
  device: scene.device,
  role: scene.role,
  secondaryRoles: scene.secondaryRoles,
  style: scene.style,
  seconds: round(sceneSeconds(scene, film)),
  startFrame: scene.startFrame,
  endFrame: scene.endFrame,
  startSeconds: round(framesToSeconds(scene.startFrame, filmFps(film))),
  endSeconds: round(framesToSeconds(scene.endFrame, filmFps(film))),
  url: `${filmUrl(film)}?scene=${encodeURIComponent(scene.slug)}`,
  film: { title: film.title, brand: film.brand, credits: film.credits },
  moves: scene.moves,
});

/** One page of search results over the public data. */
export const searchBody = (
  films: LaunchFilm[],
  scenes: LaunchScene[],
  { query, limit, cursor }: LaunchSearch
): LaunchSearchBody => {
  const results = searchLaunch(films, scenes, query);
  if (results.view === "films") {
    const page = pageOf(results.films, cursor, limit);
    return {
      view: "films",
      items: page.items.map(filmItem),
      nextCursor: page.nextCursor,
    };
  }
  const bySlug = new Map(films.map((entry) => [entry.slug, entry]));
  const page = pageOf(results.scenes, cursor, limit);
  return {
    view: "scenes",
    // SAFETY: searchLaunch only returns scenes whose film is listed.
    items: page.items.map((scene) =>
      sceneItem(scene, bySlug.get(scene.filmSlug) as LaunchFilm)
    ),
    nextCursor: page.nextCursor,
  };
};
