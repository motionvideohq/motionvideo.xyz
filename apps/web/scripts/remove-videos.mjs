// Remove duplicate videos from the catalog and their media from R2.
//
//   pnpm catalog:duplicates --json > duplicates.json
//   (review it: drop any group that isn't really the same footage)
//   pnpm catalog:remove duplicates.json --dry-run   list what would go
//   pnpm catalog:remove duplicates.json             remove for real
//
// The file lists groups as `{ keep, remove: [slug…] }`. Each removed video:
// - leaves src/data/motion-catalog.json `videos` and is recorded under
//   `removed` with the slug it duplicates, so its old URL redirects there
//   and catalog:discover / catalog:import:videos never bring its post back;
// - loses its prompt translation;
// - has its video, preview and poster deleted from the R2 bucket behind
//   assets.motionvideo.xyz (and its creator's avatar, when no other video
//   uses it), through `wrangler r2 object delete --remote`, so run
//   `wrangler login` first.
import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { deriveCatalog } from "./derive-catalog.mjs";

const run = promisify(execFile);
const root = fileURLToPath(new URL("..", import.meta.url));
const BUCKET = "motionvideo-assets";
const ORIGIN = "https://assets.motionvideo.xyz";
const CONCURRENCY = 6;
const catalogPath = path.join(root, "src/data/motion-catalog.json");
const translationsPath = path.join(root, "src/data/prompt-translations.json");
const wrangler = path.join(root, "node_modules/.bin/wrangler");

const file = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const dryRun = process.argv.includes("--dry-run");
if (!file) {
  console.error("Usage: pnpm catalog:remove <duplicates.json> [--dry-run]");
  process.exit(1);
}

const groups = JSON.parse(await readFile(file, "utf-8"));
const catalog = JSON.parse(await readFile(catalogPath, "utf-8"));
const translations = JSON.parse(await readFile(translationsPath, "utf-8"));
const bySlug = new Map(catalog.videos.map((video) => [video.slug, video]));

const duplicateOf = new Map();
for (const { keep, remove } of groups) {
  if (!bySlug.has(keep)) {
    throw new Error(`Kept video ${keep} is not in the catalog`);
  }
  for (const slug of remove) {
    if (!bySlug.has(slug)) {
      throw new Error(`Video ${slug} is not in the catalog`);
    }
    if (slug === keep || duplicateOf.has(slug)) {
      throw new Error(`Video ${slug} is listed twice`);
    }
    duplicateOf.set(slug, keep);
  }
}
for (const keep of groups.map((group) => group.keep)) {
  if (duplicateOf.has(keep)) {
    throw new Error(`Video ${keep} is both kept and removed`);
  }
}

const removed = catalog.videos.filter((video) => duplicateOf.has(video.slug));
const remaining = catalog.videos.filter(
  (video) => !duplicateOf.has(video.slug)
);
// Objects on our bucket only; an avatar goes when no remaining video uses it.
const keyOf = (url) =>
  url?.startsWith(`${ORIGIN}/`) ? url.slice(ORIGIN.length + 1) : null;
const avatarsInUse = new Set(remaining.map((video) => video.avatar));
const keys = [
  ...new Set(
    removed.flatMap((video) =>
      [
        video.video,
        video.preview,
        video.poster,
        avatarsInUse.has(video.avatar) ? null : video.avatar,
      ]
        .map(keyOf)
        .filter(Boolean)
    )
  ),
];

for (const video of removed) {
  console.log(
    `remove  ${video.slug}  (duplicate of ${duplicateOf.get(video.slug)})`
  );
}
console.log(`${removed.length} videos, ${keys.length} R2 objects.`);
if (dryRun) {
  process.exit(0);
}

const failed = [];
const queue = [...keys];
const worker = async () => {
  for (let key = queue.shift(); key; key = queue.shift()) {
    try {
      // oxlint-disable-next-line no-await-in-loop
      await run(
        wrangler,
        ["r2", "object", "delete", `${BUCKET}/${key}`, "--remote"],
        { cwd: root }
      );
    } catch (error) {
      failed.push({ key, error: String(error.stderr ?? error) });
    }
  }
};
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

catalog.videos = remaining;
catalog.removed = [
  ...(catalog.removed ?? []),
  ...removed.map((video) => ({
    slug: video.slug,
    duplicateOf: duplicateOf.get(video.slug),
    tweetUrl: video.tweetUrl,
  })),
];
const remainingTranslations = Object.fromEntries(
  Object.entries(translations).filter(([slug]) => !duplicateOf.has(slug))
);
// Similar-video lists and colour pages must not point at removed videos.
deriveCatalog(catalog);
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(
  translationsPath,
  `${JSON.stringify(remainingTranslations, null, 2)}\n`
);

console.log(
  `Removed ${removed.length} videos; deleted ${keys.length - failed.length}/${keys.length} R2 objects.`
);
if (failed.length > 0) {
  console.error("Could not delete:", failed);
  process.exitCode = 1;
}
