// Upload rendered Showcase template previews to R2 and write the manifest
// the landing, template and editor pages read.
//
//   node scripts/create-previews.mjs <dir>
//
// <dir> holds `<templateId>.mp4` and `<templateId>.jpg` pairs plus
// `sizes.json` ({ "<templateId>": { "width": 960, "height": 540 } }).
// `pnpm showcase:previews` in apps/videos renders them and calls this script.
// Keys embed a content hash, so re-running only uploads changed files and
// never overwrites an object.
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = fileURLToPath(new URL("..", import.meta.url));
const BUCKET = "motionvideo-assets";
const ORIGIN = "https://assets.motionvideo.xyz";
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const manifestPath = path.join(root, "src/data/create-showcase-previews.json");
const wrangler = path.join(root, "node_modules/.bin/wrangler");
const TYPES = { mp4: "video/mp4", jpg: "image/jpeg" };

const dir = process.argv.at(2);
if (!dir) {
  console.error("Usage: node scripts/create-previews.mjs <dir>");
  process.exit(1);
}

const exists = async (url) => {
  const response = await fetch(url, { method: "HEAD" });
  return response.ok;
};

const upload = async (file, id, ext) => {
  const bytes = await readFile(file);
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 10);
  const key = `create/previews/${id}-${hash}.${ext}`;
  const url = `${ORIGIN}/${key}`;
  if (await exists(url)) {
    return url;
  }
  await run(wrangler, [
    "r2",
    "object",
    "put",
    `${BUCKET}/${key}`,
    "--file",
    file,
    "--remote",
    "--content-type",
    TYPES[ext],
    "--cache-control",
    CACHE_CONTROL,
  ]);
  console.log(`uploaded ${key}`);
  return url;
};

const sizes = JSON.parse(await readFile(path.join(dir, "sizes.json"), "utf-8"));
const files = await readdir(dir);
const ids = files
  .filter((name) => name.endsWith(".mp4"))
  .map((name) => name.slice(0, -4))
  .toSorted();

// Merge: rendering a few templates keeps every other template's preview.
const manifest = JSON.parse(
  await readFile(manifestPath, "utf-8").catch(() => "{}")
);
const uploaded = await Promise.all(
  ids.map(async (id) => {
    const size = sizes[id];
    if (!size) {
      throw new Error(`sizes.json has no entry for ${id}`);
    }
    const [poster, video] = await Promise.all([
      upload(path.join(dir, `${id}.jpg`), id, "jpg"),
      upload(path.join(dir, `${id}.mp4`), id, "mp4"),
    ]);
    return [id, { poster, video, width: size.width, height: size.height }];
  })
);
Object.assign(manifest, Object.fromEntries(uploaded));

const sorted = Object.fromEntries(
  Object.entries(manifest).toSorted(([a], [b]) => a.localeCompare(b))
);
await writeFile(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(
  `wrote ${Object.keys(sorted).length} previews to ${path.relative(root, manifestPath)}`
);
