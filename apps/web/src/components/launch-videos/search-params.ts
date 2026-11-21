import { z } from "zod";

import { LAUNCH_FILMS } from "@/lib/launch-catalog";
import type { LaunchQuery, LaunchSort } from "@/lib/launch-search";
import {
  ASPECTS,
  FILM_DURATIONS,
  FILM_KINDS,
  SCENE_DURATIONS,
  SCENE_ROLES,
  SCENE_STYLES,
} from "@/lib/launch-videos";
import { MOTION_COLORS } from "@/lib/motion-catalog";

// The /launch-videos URL: every facet lives in the search params, so a share
// link or Back restores the view and its filters. Lists are comma-joined
// (`role=hook,cta`), like the gallery's colours. Videos is the default view
// and is left out of the URL.

/** The facets a visitor can pick, in toolbar order. */
export const LAUNCH_FACETS = [
  "kind",
  "category",
  "creator",
  "color",
  "style",
  "role",
  "duration",
  "aspect",
] as const;
export type LaunchFacet = (typeof LAUNCH_FACETS)[number];

export interface LaunchVideosSearch {
  view?: "scenes";
  q?: string;
  kind?: string;
  category?: string;
  creator?: string;
  color?: string;
  style?: string;
  role?: string;
  duration?: string;
  aspect?: string;
  sort?: Exclude<LaunchSort, "featured">;
  /** 1-based; how many pages of cards are shown. */
  page?: number;
}

/** Every category and creator in the catalog, for their facets. */
export const LAUNCH_CATEGORIES = [
  ...new Set(LAUNCH_FILMS.flatMap((film) => film.categories)),
].toSorted();
export const LAUNCH_CREATORS = [
  ...new Set(
    LAUNCH_FILMS.flatMap((film) => [
      film.brand,
      ...film.credits.map((credit) => credit.name),
    ])
  ),
].toSorted((a, b) => a.localeCompare(b, "en"));

// Every facet's vocabulary but duration's, whose ranges differ per view.
const FIXED_VALUES: Record<
  Exclude<LaunchFacet, "duration">,
  readonly string[]
> = {
  kind: FILM_KINDS,
  category: LAUNCH_CATEGORIES,
  creator: LAUNCH_CREATORS,
  color: MOTION_COLORS.map((color) => color.slug),
  style: SCENE_STYLES,
  role: SCENE_ROLES,
  aspect: ASPECTS,
};

/** The values each facet accepts on a view. */
export const facetValues = (
  facet: LaunchFacet,
  view: "videos" | "scenes"
): readonly string[] =>
  facet === "duration"
    ? (view === "scenes" ? SCENE_DURATIONS : FILM_DURATIONS).map(
        (duration) => duration.id
      )
    : FIXED_VALUES[facet];

/** The known values of a comma-joined param, deduplicated, in facet order. */
export const listOf = (
  value: string | undefined,
  allowed: readonly string[]
): string[] => {
  if (!value) {
    return [];
  }
  const picked = new Set(value.split(","));
  return allowed.filter((entry) => picked.has(entry));
};

const joined = (values: string[]) =>
  values.length > 0 ? values.join(",") : undefined;

// The router hands over whatever the URL held (numbers, too); each param
// falls back to unset unless it parses.
const lenient = <T extends z.ZodType>(schema: T) =>
  z.unknown().transform((value): z.output<T> | undefined => {
    const parsed = schema.safeParse(value);
    return parsed.success ? parsed.data : undefined;
  });
const param = lenient(z.coerce.string().max(200).optional());
export const RAW_LAUNCH_SEARCH = z.object({
  view: param,
  q: param,
  kind: param,
  category: param,
  creator: param,
  color: param,
  style: param,
  role: param,
  duration: param,
  aspect: param,
  sort: param,
  page: lenient(z.coerce.number().int().min(2).max(100).optional()),
});

/** The URL's params, each value checked against its facet's vocabulary. */
export const parseLaunchSearch = (
  raw: z.output<typeof RAW_LAUNCH_SEARCH>
): LaunchVideosSearch => {
  const view = raw.view === "scenes" ? "scenes" : undefined;
  const facets = Object.fromEntries(
    LAUNCH_FACETS.map((facet) => [
      facet,
      joined(listOf(raw[facet], facetValues(facet, view ?? "videos"))),
    ])
  );
  const q = raw.q?.trim().slice(0, 100);
  return {
    view,
    q: q || undefined,
    ...facets,
    sort: z.enum(["newest", "shortest"]).safeParse(raw.sort).data,
    page: raw.page,
  };
};

/** The search for `searchLaunch`: the URL's videos view is its films view. */
export const launchQueryOf = (search: LaunchVideosSearch): LaunchQuery => {
  const view = search.view ?? "videos";
  const list = <T extends string>(facet: LaunchFacet) => {
    const values = listOf(search[facet], facetValues(facet, view));
    // SAFETY: listOf keeps only values from the facet's own vocabulary.
    return values.length > 0 ? (values as T[]) : undefined;
  };
  return {
    view: search.view === "scenes" ? "scenes" : "films",
    q: search.q,
    kinds: list("kind"),
    categories: list("category"),
    creators: list("creator"),
    colors: list("color"),
    styles: list("style"),
    roles: list("role"),
    durations: list("duration"),
    aspects: list("aspect"),
    sort: search.sort ?? "featured",
  };
};

/** Toggles one value of a facet, dropping the page (the results change). */
export const toggleFacet = (
  search: LaunchVideosSearch,
  facet: LaunchFacet,
  value: string
): LaunchVideosSearch => {
  const view = search.view ?? "videos";
  const current = listOf(search[facet], facetValues(facet, view));
  const next = current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];
  return {
    ...search,
    [facet]: joined(listOf(next.join(","), facetValues(facet, view))),
    page: undefined,
  };
};

/** True when any facet or the text search narrows the results. */
export const hasFilters = (search: LaunchVideosSearch) =>
  Boolean(search.q) || LAUNCH_FACETS.some((facet) => search[facet]);

/** Same view and order, nothing else. */
export const clearedSearch = (
  search: LaunchVideosSearch
): LaunchVideosSearch => ({ view: search.view, sort: search.sort });
