import launchVideos from "@/data/launch-videos.json";
import type { LaunchFilm, LaunchScene } from "@/lib/launch-videos";

// The published Launch Videos: public metadata only, safe for the browser
// and indexing. Recipes stay in src/server/data/launch-recipes.json.

// SAFETY: launch-videos.json is ours and checked by
// scripts/check-launch-videos.mjs (enums, chapters tile each film, known
// moves); JSON imports widen the enums to string.
export const LAUNCH_FILMS = launchVideos.films as LaunchFilm[];
// SAFETY: as above, checked by scripts/check-launch-videos.mjs.
export const LAUNCH_SCENES = launchVideos.scenes as LaunchScene[];

const FILMS_BY_SLUG = new Map(LAUNCH_FILMS.map((film) => [film.slug, film]));
const SCENES_BY_ID = new Map(LAUNCH_SCENES.map((scene) => [scene.id, scene]));

export const findLaunchFilm = (slug: string | undefined) =>
  slug === undefined ? undefined : FILMS_BY_SLUG.get(slug);

export const findLaunchScene = (id: string | undefined) =>
  id === undefined ? undefined : SCENES_BY_ID.get(id);

/** A film's scenes in film order. */
export const scenesOfFilm = (film: LaunchFilm): LaunchScene[] =>
  film.sceneIds.flatMap((id) => SCENES_BY_ID.get(id) ?? []);
