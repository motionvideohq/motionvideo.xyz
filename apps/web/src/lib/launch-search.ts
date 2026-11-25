// Search and facets over the public Launch Videos data, shared by the
// /launch-videos page (in the browser), the MCP search endpoint and the
// checker. Public fields only: recipes are never searched. Node imports this
// file directly, hence the relative `.ts` imports.
//
// Facets follow the gallery's rule: values within one facet are
// alternatives, every facet given must hold. On the films view a scene facet
// (role, style) matches when any of the film's scenes matches.

import { hexDistance, normalizeHex } from "./color.ts";
import {
  FILM_DURATIONS,
  SCENE_DURATIONS,
  aspectOf,
  filmSeconds,
  sceneSeconds,
} from "./launch-videos.ts";
import type {
  Aspect,
  FilmKind,
  LaunchFilm,
  LaunchScene,
  SceneRole,
  SceneStyle,
} from "./launch-videos.ts";
import { MOTION_COLORS } from "./motion-catalog.ts";

export const LAUNCH_VIEWS = ["films", "scenes"] as const;
export type LaunchView = (typeof LAUNCH_VIEWS)[number];

export const LAUNCH_SORTS = ["featured", "newest", "shortest"] as const;
export type LaunchSort = (typeof LAUNCH_SORTS)[number];

export interface LaunchQuery {
  view: LaunchView;
  q?: string;
  kinds?: readonly FilmKind[];
  categories?: readonly string[];
  /** Brand or credited name, compared ignoring case. */
  creators?: readonly string[];
  /** MOTION_COLORS slugs. */
  colors?: readonly string[];
  styles?: readonly SceneStyle[];
  roles?: readonly SceneRole[];
  /** FILM_DURATIONS or SCENE_DURATIONS ids, per view. */
  durations?: readonly string[];
  aspects?: readonly Aspect[];
  minSeconds?: number;
  maxSeconds?: number;
  sort?: LaunchSort;
}

// Same threshold as the gallery's colour filter (motion-catalog.ts).
const COLOR_MATCH_DISTANCE = 0.11;

/** The named colours a film contains, in MOTION_COLORS order. */
export const filmColorNames = (film: LaunchFilm): string[] => {
  const own = film.colors.flatMap((value) => normalizeHex(value) ?? []);
  return MOTION_COLORS.filter((color) =>
    own.some((hex) => hexDistance(color.hex, hex) < COLOR_MATCH_DISTANCE)
  ).map((color) => color.slug);
};

const folded = (value: string) =>
  value.toLocaleLowerCase("en").normalize("NFKD");

const filmCreators = (film: LaunchFilm) => [
  film.brand,
  ...film.credits.map((credit) => credit.name),
];

/** Every word of `q` appears in one of the public texts. */
const matchesText = (q: string | undefined, texts: string[]) => {
  const words = folded(q ?? "")
    .split(/\s+/u)
    .filter(Boolean);
  if (words.length === 0) {
    return true;
  }
  const haystack = folded(texts.join(" \n "));
  return words.every((word) => haystack.includes(word));
};

const inFacet = <T>(
  values: readonly T[] | undefined,
  has: (value: T) => boolean
) => values === undefined || values.some(has);

const inDuration = (
  ids: readonly string[] | undefined,
  table: typeof FILM_DURATIONS | typeof SCENE_DURATIONS,
  seconds: number
) =>
  inFacet(ids, (id) => {
    const range = table.find((entry) => entry.id === id);
    return range !== undefined && seconds >= range.min && seconds < range.max;
  });

const inBounds = (query: LaunchQuery, seconds: number) =>
  (query.minSeconds === undefined || seconds >= query.minSeconds) &&
  (query.maxSeconds === undefined || seconds <= query.maxSeconds);

const sceneTexts = (scene: LaunchScene) => [
  scene.title,
  scene.device,
  scene.description,
  scene.role,
  ...scene.secondaryRoles,
  scene.style,
];

const filmTexts = (film: LaunchFilm, scenes: LaunchScene[]) => [
  film.title,
  film.brand,
  film.summary,
  film.kind,
  ...film.categories,
  ...filmCreators(film),
  ...scenes.flatMap(sceneTexts),
];

const matchesFilm = (query: LaunchQuery, film: LaunchFilm) =>
  inFacet(query.kinds, (kind) => film.kind === kind) &&
  inFacet(query.categories, (category) => film.categories.includes(category)) &&
  inFacet(query.creators, (creator) =>
    filmCreators(film).some((name) => folded(name) === folded(creator))
  ) &&
  inFacet(query.colors, (color) => filmColorNames(film).includes(color)) &&
  inFacet(
    query.aspects,
    (aspect) => aspectOf(film.width, film.height) === aspect
  );

/** How two films order under a sort, before the slug tie-break. */
const filmOrder = (
  sort: LaunchSort,
  fa: LaunchFilm,
  fb: LaunchFilm,
  secondsDiff: () => number
) => {
  if (sort === "newest") {
    return fb.publishedAt.localeCompare(fa.publishedAt);
  }
  if (sort === "shortest") {
    return secondsDiff();
  }
  return (
    (fa.featured ?? Number.POSITIVE_INFINITY) -
      (fb.featured ?? Number.POSITIVE_INFINITY) ||
    fb.publishedAt.localeCompare(fa.publishedAt)
  );
};

const sortBy = <T>(
  list: T[],
  sort: LaunchSort,
  film: (item: T) => LaunchFilm,
  seconds: (item: T) => number,
  slug: (item: T) => string
) =>
  list.toSorted((a, b) => {
    const order = filmOrder(
      sort,
      film(a),
      film(b),
      () => seconds(a) - seconds(b)
    );
    // Ties break by slug, so pages never reshuffle.
    return order || slug(a).localeCompare(slug(b));
  });

export type LaunchResults =
  | { view: "films"; films: LaunchFilm[] }
  | { view: "scenes"; scenes: LaunchScene[] };

export const searchLaunch = (
  films: LaunchFilm[],
  scenes: LaunchScene[],
  query: LaunchQuery
): LaunchResults => {
  const filmsBySlug = new Map(films.map((film) => [film.slug, film]));
  const scenesOf = new Map(
    films.map((film) => [
      film.slug,
      scenes.filter((scene) => scene.filmSlug === film.slug),
    ])
  );
  const sort = query.sort ?? "featured";

  const sceneMatches = (scene: LaunchScene) =>
    inFacet(
      query.roles,
      (role) => scene.role === role || scene.secondaryRoles.includes(role)
    ) && inFacet(query.styles, (style) => scene.style === style);

  if (query.view === "films") {
    const matched = films.filter((film) => {
      const own = scenesOf.get(film.slug) ?? [];
      const seconds = filmSeconds(film);
      return (
        matchesFilm(query, film) &&
        (query.roles === undefined && query.styles === undefined
          ? true
          : own.some(sceneMatches)) &&
        inDuration(query.durations, FILM_DURATIONS, seconds) &&
        inBounds(query, seconds) &&
        matchesText(query.q, filmTexts(film, own))
      );
    });
    return {
      view: "films",
      films: sortBy(
        matched,
        sort,
        (film) => film,
        filmSeconds,
        (film) => film.slug
      ),
    };
  }

  const matched = scenes.filter((scene) => {
    const film = filmsBySlug.get(scene.filmSlug);
    if (!film) {
      return false;
    }
    const seconds = sceneSeconds(scene, film);
    return (
      matchesFilm(query, film) &&
      sceneMatches(scene) &&
      inDuration(query.durations, SCENE_DURATIONS, seconds) &&
      inBounds(query, seconds) &&
      matchesText(query.q, [
        ...sceneTexts(scene),
        film.title,
        film.brand,
        ...filmCreators(film),
      ])
    );
  });
  return {
    view: "scenes",
    scenes: sortBy(
      matched,
      sort,
      // SAFETY: `matched` keeps only scenes whose film is in filmsBySlug.
      (scene) => filmsBySlug.get(scene.filmSlug) as LaunchFilm,
      // SAFETY: as above, every matched scene's film is in filmsBySlug.
      (scene) =>
        sceneSeconds(scene, filmsBySlug.get(scene.filmSlug) as LaunchFilm),
      (scene) => scene.id
    ),
  };
};

/** One page of a sorted list; the cursor is the next offset. */
export const pageOf = <T>(
  list: T[],
  cursor: string | undefined,
  limit: number
) => {
  const offset = Math.max(0, Math.trunc(Number(cursor ?? "0")) || 0);
  const items = list.slice(offset, offset + limit);
  const next = offset + limit;
  return { items, nextCursor: next < list.length ? String(next) : null };
};
