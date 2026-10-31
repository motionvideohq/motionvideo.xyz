// Fill in each video's dominant colours in src/data/motion-catalog.json, for
// the gallery's colour filter and similar videos.
//
//   pnpm catalog:refresh:colors          # videos without colours
//   pnpm catalog:refresh:colors --all    # every video, e.g. after a tweak
//
// Needs ffmpeg. A video whose preview can't be read keeps what it had and is
// reported at the end.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { deriveCatalog } from "./derive-catalog.mjs";
import { paletteOf } from "./palette.mjs";

const catalogPath = fileURLToPath(
  new URL("../src/data/motion-catalog.json", import.meta.url)
);
const CONCURRENCY = 8;

const catalog = JSON.parse(await readFile(catalogPath, "utf-8"));
const all = process.argv.includes("--all");
const queue = catalog.videos.filter((video) => all || !video.colors);
const total = queue.length;
const failed = [];
const worker = async () => {
  for (let video = queue.shift(); video; video = queue.shift()) {
    // oxlint-disable-next-line no-await-in-loop
    const colors = await paletteOf(video.preview);
    if (colors) {
      video.colors = colors;
    } else {
      failed.push(video.slug);
    }
  }
};
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

// Colour pages and similar videos depend on the palettes.
deriveCatalog(catalog);
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`${total - failed.length}/${total} videos coloured.`);
if (failed.length > 0) {
  console.error(failed);
  process.exitCode = 1;
}
