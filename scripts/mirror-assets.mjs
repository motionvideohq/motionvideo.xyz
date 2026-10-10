// Mirror every remote media file referenced by the catalogs into the R2
// bucket behind assets.motionvideo.xyz, then point the JSON at our domain.
//
//   pnpm assets:mirror            upload missing files and rewrite URLs
//   pnpm assets:mirror --dry-run  list what would be uploaded
//
// Idempotent: keys embed a hash of the source URL, objects that already exist
// on the public domain are skipped, and URLs already on our domain are left
// alone. Uploads go through `wrangler r2 object put --remote`, so run
// `wrangler login` first.
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = fileURLToPath(new URL("..", import.meta.url));
const BUCKET = "motionvideo-assets";
const ORIGIN = "https://assets.motionvideo.xyz";
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const CONCURRENCY = 6;
const ATTEMPTS = 3;
const MAX_UPLOAD = 300 * 2 ** 20;
const DOWNLOAD_TIMEOUT = 10 * 60_000;
const catalogPath = path.join(root, "src/data/motion-catalog.json");
const directoriesPath = path.join(root, "src/data/resource-directories.json");
const wrangler = path.join(root, "node_modules/.bin/wrangler");
const dryRun = process.argv.includes("--dry-run");

const EXTENSIONS = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  mp4: "video/mp4",
  png: "image/png",
  webm: "video/webm",
  webp: "image/webp",
};

// The What Ships proxy wraps the real file URL in `?url=`.
const innerUrl = (url) => {
  const parsed = new URL(url);
  return parsed.searchParams.get("url") ?? url;
};
const extensionOf = (url) => {
  const match = new URL(innerUrl(url)).pathname.match(/\.(?<ext>[a-z\d]+)$/iu);
  const ext = match?.groups.ext.toLowerCase();
  return ext && Object.hasOwn(EXTENSIONS, ext) ? ext : null;
};
const slugPart = (value) =>
  value
    .toLowerCase()
    .replaceAll(/[^a-z\d]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
const hashOf = (url) =>
  createHash("sha256").update(url).digest("hex").slice(0, 10);

const catalog = JSON.parse(await readFile(catalogPath, "utf-8"));
const directories = JSON.parse(await readFile(directoriesPath, "utf-8"));

// source URL → object key (first reference names it; duplicates share it).
const jobs = new Map();
const plan = (url, prefix) => {
  if (!url || url.startsWith(`${ORIGIN}/`) || jobs.has(url)) {
    return;
  }
  const ext = extensionOf(url);
  if (!ext) {
    throw new Error(`Unknown file type for ${url}`);
  }
  jobs.set(url, `${prefix}-${hashOf(url)}.${ext}`);
};

for (const video of catalog.videos) {
  const folder = `motion/${slugPart(video.slug)}`;
  plan(video.video, `${folder}/video`);
  plan(video.preview, `${folder}/preview`);
  plan(video.poster, `${folder}/poster`);
  plan(video.avatar, `avatars/${slugPart(video.handle)}`);
}
for (const [group, { entries }] of Object.entries({
  studios: directories.studios,
  tools: directories.tools,
})) {
  for (const entry of entries) {
    plan(entry.cover, `directories/${group}/${slugPart(entry.id)}`);
  }
}

console.log(`${jobs.size} remote files referenced.`);
if (dryRun) {
  for (const [url, key] of jobs) {
    console.log(`${key}  ←  ${url}`);
  }
  process.exit(0);
}

const workDir = await mkdtemp(path.join(tmpdir(), "motionvideo-assets-"));
const mirrored = new Map();
const failures = [];

const exists = async (key) => {
  const response = await fetch(`${ORIGIN}/${key}`, {
    method: "HEAD",
    signal: AbortSignal.timeout(15_000),
  });
  return response.ok;
};

const mirror = async (url, key) => {
  if (await exists(key)) {
    return "skipped";
  }
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT),
  });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed with HTTP ${response.status}`);
  }
  // `wrangler r2 object put` rejects files over 300 MiB; fail fast instead of
  // downloading them.
  const size = Number(response.headers.get("content-length"));
  if (size > MAX_UPLOAD) {
    await response.body.cancel();
    throw new Error(
      `Too large for wrangler (${Math.round(size / 2 ** 20)} MiB)`
    );
  }
  const file = path.join(workDir, hashOf(key));
  await pipeline(Readable.fromWeb(response.body), createWriteStream(file));
  const contentType = EXTENSIONS[path.extname(key).slice(1)];
  try {
    await run(
      wrangler,
      [
        "r2",
        "object",
        "put",
        `${BUCKET}/${key}`,
        "--remote",
        "--file",
        file,
        "--content-type",
        contentType,
        "--cache-control",
        CACHE_CONTROL,
      ],
      { cwd: root, maxBuffer: 16 * 1024 * 1024 }
    );
  } finally {
    await rm(file, { force: true });
  }
  return "uploaded";
};

const queue = [...jobs];
let done = 0;
const worker = async () => {
  for (let next = queue.shift(); next; next = queue.shift()) {
    const [url, key] = next;
    let lastError;
    for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
      try {
        // Sequential per worker: one transfer in flight per worker slot.
        // eslint-disable-next-line no-await-in-loop
        const result = await mirror(url, key);
        mirrored.set(url, `${ORIGIN}/${key}`);
        done += 1;
        console.log(`[${done}/${jobs.size}] ${result} ${key}`);
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) {
      failures.push({ key, url, error: lastError.message });
      console.error(`failed ${key}: ${lastError.message}`);
    }
  }
};

try {
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
} finally {
  await rm(workDir, { force: true, recursive: true });
}

// Only successfully mirrored URLs are rewritten; failures keep their source.
const swap = (url) => mirrored.get(url) ?? url;
for (const video of catalog.videos) {
  video.video = swap(video.video);
  video.preview = swap(video.preview);
  video.poster = swap(video.poster);
  video.avatar = swap(video.avatar);
}
for (const group of [directories.tools, directories.studios]) {
  for (const entry of group.entries) {
    entry.cover = entry.cover ? swap(entry.cover) : entry.cover;
  }
}
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(directoriesPath, `${JSON.stringify(directories, null, 2)}\n`);

console.log(
  `Mirrored ${mirrored.size}/${jobs.size}. Failed ${failures.length}.`
);
if (failures.length > 0) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
