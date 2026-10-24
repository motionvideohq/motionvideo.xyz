// Checks src/data/moves.json and src/server/data/move-prompts.json against
// each other and the catalog: run `pnpm moves:check` after editing either.
import { readFile } from "node:fs/promises";

import { z } from "zod";

const read = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf-8");

const [movesText, promptsText, catalogText, source] = await Promise.all([
  read("src/data/moves.json"),
  read("src/server/data/move-prompts.json"),
  read("src/data/motion-catalog.json"),
  read("src/lib/move-families.ts"),
]);

const families = [
  ...source
    .match(/MOVE_FAMILIES = \[(?<list>[^\]]+)\]/u)
    .groups.list.matchAll(/"(?<id>[a-z-]+)"/gu),
].map((match) => match.groups.id);

const text = z.string().trim().min(1);
const movesFile = z.object({
  moves: z.array(
    z.object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
      name: text,
      family: z.enum(families),
      aka: z.array(text),
      summary: text.max(200),
      body: text,
      goodFor: z.array(text),
      examples: z.array(text),
      related: z.array(text),
    })
  ),
});
const promptsFile = z.object({
  prompts: z.array(
    z.object({ slug: text, prompt: text, parameters: z.array(text) })
  ),
});
const catalogFile = z.object({ videos: z.array(z.object({ slug: text })) });

const { moves } = movesFile.parse(JSON.parse(movesText));
const { prompts } = promptsFile.parse(JSON.parse(promptsText));
const { videos } = catalogFile.parse(JSON.parse(catalogText));

const videoSlugs = new Set(videos.map((video) => video.slug));
const moveSlugs = new Set(moves.map((move) => move.slug));
const promptSlugs = new Set(prompts.map((prompt) => prompt.slug));
const errors = [];

if (moveSlugs.size !== moves.length) {
  errors.push("duplicate move slugs");
}
// `/moves/<x>` is a family page, or an old move link that redirects.
for (const family of families.filter((name) => moveSlugs.has(name))) {
  errors.push(`move slug "${family}" is also a family name`);
}
if (promptSlugs.size !== prompts.length) {
  errors.push("duplicate prompt slugs");
}
for (const move of moves) {
  const at = `moves.json ${move.slug}`;
  for (const slug of move.examples) {
    if (!videoSlugs.has(slug)) {
      errors.push(`${at}: example "${slug}" is not in the catalog`);
    }
  }
  for (const slug of move.related) {
    if (slug === move.slug || !moveSlugs.has(slug)) {
      errors.push(`${at}: related "${slug}" is not another move`);
    }
  }
  if (!promptSlugs.has(move.slug)) {
    errors.push(`${at}: no prompt`);
  }
}
for (const prompt of prompts) {
  if (!moveSlugs.has(prompt.slug)) {
    errors.push(`move-prompts.json ${prompt.slug}: no move`);
  }
}
const unused = families.filter(
  (family) => !moves.some((move) => move.family === family)
);
if (unused.length > 0) {
  errors.push(`families without moves: ${unused.join(", ")}`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`${moves.length} moves, ${families.length} families: OK`);
