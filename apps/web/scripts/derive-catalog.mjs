// Precompute what the site would otherwise work out on the server for every
// visit, and store it in src/data/motion-catalog.json:
//
// - `colorPages`: the named colours with enough videos for a /color/$color
//   page (12 colours × every video × OKLab distances);
// - each video's `similar`: the slugs of its most similar videos.
//
// On the Workers Free plan a request gets 10 ms of CPU, and these took longer
// than that on their own. The colour, import and removal scripts run this
// after changing the catalog; run it by hand with
//
//   pnpm catalog:derive
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  MIN_COLOR_PAGE_VIDEOS,
  MOTION_COLORS,
  SIMILAR_VIDEOS,
  filterMotionVideos,
  similarMotionVideos,
} from "../src/lib/motion-catalog.ts";

const catalogPath = fileURLToPath(
  new URL("../src/data/motion-catalog.json", import.meta.url)
);

/** Fills in `colorPages` and every video's `similar`, in place. */
export const deriveCatalog = (catalog) => {
  catalog.colorPages = MOTION_COLORS.filter(
    (color) =>
      filterMotionVideos(catalog.videos, { color: color.hex }).length >=
      MIN_COLOR_PAGE_VIDEOS
  ).map((color) => color.slug);
  for (const video of catalog.videos) {
    video.similar = similarMotionVideos(
      video,
      catalog.videos,
      SIMILAR_VIDEOS
    ).map((other) => other.slug);
  }
  return catalog;
};

// Run directly: derive and write the catalog.
if (process.argv[1] === import.meta.filename) {
  const catalog = JSON.parse(await readFile(catalogPath, "utf-8"));
  deriveCatalog(catalog);
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(
    `${catalog.colorPages.length} colour pages, similar videos for ${catalog.videos.length} videos.`
  );
}
