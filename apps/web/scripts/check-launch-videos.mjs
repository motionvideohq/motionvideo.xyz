// Checks src/data/launch-videos.json and src/server/data/launch-recipes.json
// against each other, the Moves library and the prompt compiler: run
// `pnpm launch:check` after editing either. Fails on broken relationships,
// chapters that don't tile their film, events off the scene's frames,
// undeclared {{slots}}, and any film the compiler can't turn into a prompt.
import { readFile } from "node:fs/promises";

import { z } from "zod";

import {
  ASPECTS,
  BRAND_INPUTS,
  FILM_KINDS,
  INPUT_TYPES,
  RENDERERS,
  SCENE_ROLES,
  SCENE_STYLES,
  aspectOf,
} from "../src/lib/launch-videos.ts";
import {
  compileFilmPrompt,
  indexLaunchData,
  recipeTexts,
} from "../src/server/launch-compiler.ts";

const read = async (path) =>
  JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf-8"));

const [publicData, recipes, movesFile] = await Promise.all([
  read("src/data/launch-videos.json"),
  read("src/server/data/launch-recipes.json"),
  read("src/data/moves.json"),
]);

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
const text = z.string().trim().min(1);
const url = z.url({ protocol: /^https$/u });
const hex = z.string().regex(/^#[0-9a-f]{6}$/u);
const frame = z.number().int().nonnegative();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u);

// `.strict()` on public records: a recipe field there would ship to browsers.
const filmSchema = z
  .object({
    slug,
    title: text,
    brand: text,
    summary: text.max(300),
    kind: z.enum(FILM_KINDS),
    categories: z.array(slug),
    colors: z.array(hex).min(1),
    styles: z.array(z.enum(SCENE_STYLES)).min(1),
    source: z.object({ url, label: text }).strict(),
    credits: z.array(
      z.object({ role: text, name: text, url: url.optional() }).strict()
    ),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    fpsNum: z.number().int().positive(),
    fpsDen: z.number().int().positive(),
    frameCount: z.number().int().positive(),
    poster: url,
    video: url,
    preview: url,
    sceneIds: z.array(text).min(1),
    publishedAt: date,
    featured: z.number().int().positive().optional(),
  })
  .strict();

const sceneSchema = z
  .object({
    id: text,
    slug,
    filmSlug: slug,
    title: text,
    device: text.max(160),
    description: text,
    startFrame: frame,
    endFrame: frame,
    role: z.enum(SCENE_ROLES),
    secondaryRoles: z.array(z.enum(SCENE_ROLES)),
    style: z.enum(SCENE_STYLES),
    moves: z.array(slug),
    poster: url,
  })
  .strict();

const joinSchema = z
  .object({
    kind: text,
    frames: frame,
    provides: z.array(slug).optional(),
    requires: z.array(slug).optional(),
    description: text,
  })
  .strict();

const recipeSchema = z
  .object({
    sceneId: text,
    version: z.number().int().positive(),
    minFrames: z.number().int().positive(),
    maxFrames: z.number().int().positive(),
    aspects: z.array(z.enum(ASPECTS)).min(1),
    inputs: z.array(
      z
        .object({
          key: z.string().regex(/^[a-z0-9_]+$/u),
          type: z.enum(INPUT_TYPES),
          label: text,
          required: z.boolean(),
          maxLength: z.number().int().positive().optional(),
          sourceValue: z.string().optional(),
          hint: text.optional(),
        })
        .strict()
    ),
    layers: z
      .array(z.object({ id: text, kind: text, description: text }).strict())
      .min(1),
    events: z
      .array(
        z
          .object({
            start: frame,
            end: frame.optional(),
            layer: text,
            action: text,
            easing: text.optional(),
          })
          .strict()
      )
      .min(1),
    entry: joinSchema,
    exit: joinSchema,
    assets: z.array(
      z
        .object({
          id: text,
          kind: text,
          description: text,
          source: text.optional(),
          slot: text.optional(),
        })
        .strict()
    ),
    substitutions: z.array(text),
    rendererNotes: z.partialRecord(z.enum(RENDERERS), text).optional(),
    qa: z.array(z.enum(RENDERERS)),
  })
  .strict();

const filmRecipeSchema = z
  .object({
    filmSlug: slug,
    version: z.number().int().positive(),
    brief: z
      .object({ type: text, palette: text, layout: text, audio: text })
      .strict(),
    brandSource: z.partialRecord(
      z.enum(BRAND_INPUTS.map((input) => input.key)),
      z.string()
    ),
    scenes: z
      .array(
        z
          .object({ sceneId: text, version: z.number().int().positive() })
          .strict()
      )
      .min(1),
  })
  .strict();

const { films, scenes } = z
  .object({ films: z.array(filmSchema), scenes: z.array(sceneSchema) })
  .strict()
  .parse(publicData);
const recipeData = z
  .object({ scenes: z.array(recipeSchema), films: z.array(filmRecipeSchema) })
  .strict()
  .parse(recipes);

const errors = [];
const moveSlugs = new Set(movesFile.moves.map((move) => move.slug));
const brandKeys = new Set(BRAND_INPUTS.map((input) => input.key));
const filmsBySlug = new Map(films.map((film) => [film.slug, film]));
const scenesById = new Map(scenes.map((scene) => [scene.id, scene]));

if (filmsBySlug.size !== films.length) {
  errors.push("duplicate film slugs");
}
if (scenesById.size !== scenes.length) {
  errors.push("duplicate scene ids");
}

for (const scene of scenes) {
  const at = `scene ${scene.id}`;
  if (scene.id !== `${scene.filmSlug}/${scene.slug}`) {
    errors.push(`${at}: id must be "<filmSlug>/<slug>"`);
  }
  const film = filmsBySlug.get(scene.filmSlug);
  if (!film) {
    errors.push(`${at}: unknown film "${scene.filmSlug}"`);
  } else if (!film.sceneIds.includes(scene.id)) {
    errors.push(`${at}: not listed in its film's sceneIds`);
  }
  if (scene.endFrame <= scene.startFrame) {
    errors.push(`${at}: endFrame must be after startFrame`);
  }
  if (scene.secondaryRoles.includes(scene.role)) {
    errors.push(`${at}: primary role repeated as secondary`);
  }
  for (const move of scene.moves) {
    if (!moveSlugs.has(move)) {
      errors.push(`${at}: move "${move}" is not in moves.json`);
    }
  }
}

for (const film of films) {
  const at = `film ${film.slug}`;
  if (new Set(film.sceneIds).size !== film.sceneIds.length) {
    errors.push(`${at}: repeated scene in sceneIds`);
  }
  // Chapters tile [0, frameCount) in order: no gap, no overlap.
  let cursor = 0;
  for (const id of film.sceneIds) {
    const scene = scenesById.get(id);
    if (!scene) {
      errors.push(`${at}: unknown scene "${id}"`);
      continue;
    }
    if (scene.filmSlug !== film.slug) {
      errors.push(`${at}: scene "${id}" belongs to "${scene.filmSlug}"`);
    }
    if (scene.startFrame !== cursor) {
      errors.push(
        `${at}: "${id}" starts at ${scene.startFrame}, expected ${cursor}`
      );
    }
    cursor = scene.endFrame;
  }
  if (cursor !== film.frameCount) {
    errors.push(
      `${at}: chapters end at ${cursor}, film has ${film.frameCount} frames`
    );
  }
}

const recipeKeys = new Set();
const slotTypes = new Map();
for (const recipe of recipeData.scenes) {
  const at = `recipe ${recipe.sceneId} v${recipe.version}`;
  const key = `${recipe.sceneId}@${recipe.version}`;
  if (recipeKeys.has(key)) {
    errors.push(`${at}: duplicate version`);
  }
  recipeKeys.add(key);
  const scene = scenesById.get(recipe.sceneId);
  if (!scene) {
    errors.push(`${at}: unknown scene`);
    continue;
  }
  const film = filmsBySlug.get(scene.filmSlug);
  const length = scene.endFrame - scene.startFrame;
  if (!(recipe.minFrames <= length && length <= recipe.maxFrames)) {
    errors.push(`${at}: ${length} frames outside minFrames–maxFrames`);
  }
  if (film && recipe.aspects[0] !== aspectOf(film.width, film.height)) {
    errors.push(`${at}: first aspect must be the film's own`);
  }
  if (recipe.entry.frames > length) {
    errors.push(`${at}: entry longer than the scene`);
  }
  const layers = new Set(recipe.layers.map((layer) => layer.id));
  if (layers.size !== recipe.layers.length) {
    errors.push(`${at}: duplicate layer ids`);
  }
  for (const event of recipe.events) {
    if (!layers.has(event.layer)) {
      errors.push(`${at}: event on unknown layer "${event.layer}"`);
    }
    if (
      event.start >= length ||
      (event.end !== undefined &&
        (event.end <= event.start || event.end > length))
    ) {
      errors.push(
        `${at}: event [${event.start}, ${event.end ?? ""}) outside [0, ${length})`
      );
    }
  }
  const declared = new Set(recipe.inputs.map((input) => input.key));
  if (declared.size !== recipe.inputs.length) {
    errors.push(`${at}: duplicate input keys`);
  }
  for (const input of recipe.inputs) {
    if (brandKeys.has(input.key)) {
      errors.push(
        `${at}: "${input.key}" is a brand key; use it without declaring`
      );
    }
    const seen = slotTypes.get(input.key);
    if (seen && seen !== input.type) {
      errors.push(
        `${at}: "${input.key}" is ${input.type} here, ${seen} elsewhere`
      );
    }
    slotTypes.set(input.key, input.type);
  }
  const used = new Set();
  for (const value of recipeTexts(recipe)) {
    for (const { groups } of value.matchAll(/\{\{(?<key>[^}]*)\}\}/gu)) {
      used.add(groups.key);
      if (!declared.has(groups.key) && !brandKeys.has(groups.key)) {
        errors.push(`${at}: undeclared slot {{${groups.key}}}`);
      }
    }
  }
  for (const asset of recipe.assets) {
    if (asset.slot && !declared.has(asset.slot) && !brandKeys.has(asset.slot)) {
      errors.push(
        `${at}: asset "${asset.id}" uses undeclared slot "${asset.slot}"`
      );
    }
    if (asset.slot) {
      used.add(asset.slot);
    }
  }
  for (const input of recipe.inputs) {
    if (!used.has(input.key)) {
      errors.push(`${at}: input "${input.key}" is never used`);
    }
  }
}

for (const scene of scenes) {
  if (!recipeData.scenes.some((recipe) => recipe.sceneId === scene.id)) {
    errors.push(`scene ${scene.id}: no recipe`);
  }
}

for (const filmRecipe of recipeData.films) {
  const at = `film recipe ${filmRecipe.filmSlug} v${filmRecipe.version}`;
  const film = filmsBySlug.get(filmRecipe.filmSlug);
  if (!film) {
    errors.push(`${at}: unknown film`);
    continue;
  }
  const pinned = filmRecipe.scenes.map((pin) => pin.sceneId);
  if (pinned.join(",") !== film.sceneIds.join(",")) {
    errors.push(`${at}: scenes must pin the film's sceneIds in order`);
  }
  for (const pin of filmRecipe.scenes) {
    if (!recipeKeys.has(`${pin.sceneId}@${pin.version}`)) {
      errors.push(`${at}: pins missing recipe ${pin.sceneId} v${pin.version}`);
    }
  }
  for (const value of Object.values(filmRecipe.brief)) {
    for (const { groups } of value.matchAll(/\{\{(?<key>[^}]*)\}\}/gu)) {
      if (!brandKeys.has(groups.key)) {
        errors.push(
          `${at}: brief may only use brand slots, not {{${groups.key}}}`
        );
      }
    }
  }
}
for (const film of films) {
  if (!recipeData.films.some((recipe) => recipe.filmSlug === film.slug)) {
    errors.push(`film ${film.slug}: no film recipe`);
  }
}

// Every film must compile in both modes. Exact mode must be complete (a 1:1
// rebuild can't ask the user for the original's own values), and adapt mode
// must not leak any of them: source values belong in sourceValue,
// brandSource and asset sources only, never in recipe or brief text.
const sourceStrings = (film) => {
  const filmRecipe = recipeData.films.find(
    (recipe) => recipe.filmSlug === film.slug
  );
  const own = recipeData.scenes.filter((recipe) =>
    film.sceneIds.includes(recipe.sceneId)
  );
  return [
    ...Object.values(filmRecipe?.brandSource ?? {}),
    ...own.flatMap((recipe) => [
      ...recipe.inputs.flatMap((input) => input.sourceValue ?? []),
      ...recipe.assets.flatMap((asset) => asset.source ?? []),
    ]),
  ].filter((value) => value.trim().length >= 4);
};

if (errors.length === 0) {
  const index = indexLaunchData({ films, scenes, recipes: recipeData });
  for (const film of films) {
    const secrets = sourceStrings(film);
    for (const mode of ["adapt", "exact"]) {
      for (const sceneId of [undefined, ...film.sceneIds]) {
        const at = `${sceneId ?? `film ${film.slug}`} (${mode})`;
        try {
          const result = compileFilmPrompt(index, {
            filmSlug: film.slug,
            sceneId,
            mode,
            renderer: "remotion",
          });
          if (sceneId === undefined && result.totalFrames !== film.frameCount) {
            errors.push(
              `${at}: compiles to ${result.totalFrames} frames, not ${film.frameCount}`
            );
          }
          if (mode === "exact" && result.missing.length > 0) {
            errors.push(
              `${at}: no source value for ${result.missing.join(", ")}`
            );
          }
        } catch (error) {
          errors.push(`${at}: ${error.message}`);
        }
      }
    }
    // Adapt prints recipe and brief text with only the user's values filled
    // in, so any source value written into that text would leak.
    const filmRecipe = recipeData.films.find(
      (recipe) => recipe.filmSlug === film.slug
    );
    const texts = [
      ...Object.values(filmRecipe?.brief ?? {}).map((value) => [
        "brief",
        value,
      ]),
      ...recipeData.scenes
        .filter((recipe) => film.sceneIds.includes(recipe.sceneId))
        .flatMap((recipe) =>
          recipeTexts(recipe).map((value) => [recipe.sceneId, value])
        ),
    ];
    for (const secret of secrets) {
      const escaped = secret.replaceAll(/[.*+?^${}()|[\]\\]/gu, "\\$&");
      // Hexes, paths and URLs anywhere, any case; words as whole words.
      const pattern = /^[\w\s'-]+$/u.test(secret)
        ? new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "u")
        : new RegExp(escaped, "iu");
      for (const [where, value] of texts) {
        if (pattern.test(value)) {
          errors.push(
            `${where}: text leaks source value ${JSON.stringify(secret.slice(0, 60))}; use its {{slot}}`
          );
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `✗ ${error}`).join("\n"));
  process.exit(1);
}
console.log(
  `✓ ${films.length} films, ${scenes.length} scenes, ${recipeData.scenes.length} scene recipes`
);
