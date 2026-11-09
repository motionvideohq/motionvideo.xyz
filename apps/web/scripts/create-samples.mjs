// Publishes the Create sample library: takes the files rendered by
// `pnpm --filter @motionvideo/videos samples:render` (apps/videos/out/samples),
// encodes stills to WebP, makes 480 px thumbnails, uploads everything to R2
// under content-hashed keys and writes src/data/create-samples.json.
//
//   pnpm create:samples [renderedDir]
//
// Idempotent: keys are content hashes, and keys already served by
// assets.motionvideo.xyz are skipped, so nothing is ever overwritten.
// Needs `cwebp`, `ffmpeg`/`ffprobe` and a logged-in wrangler.
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = fileURLToPath(new URL("..", import.meta.url));
const ORIGIN = "https://assets.motionvideo.xyz";
const BUCKET = "motionvideo-assets";
const PREFIX = "create/samples";
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const THUMB_WIDTH = 480;
// Thumbnails stop at 3:4; taller shots (phones, long pages) keep their top.
const THUMB_MAX_RATIO = 4 / 3;
const TYPES = { mp4: "video/mp4", png: "image/png", webp: "image/webp" };
const wrangler = path.join(root, "node_modules/.bin/wrangler");
const manifestPath = path.join(root, "src/data/create-samples.json");

const source = path.resolve(
  process.argv[2] ?? path.join(root, "../videos/out/samples")
);
const work = path.join(source, "web");
await mkdir(work, { recursive: true });
const rendered = JSON.parse(
  await readFile(path.join(source, "index.json"), "utf-8")
);

const sha = async (file) =>
  createHash("sha256")
    .update(await readFile(file))
    .digest("hex")
    .slice(0, 10);

const exists = async (key) => {
  // A unique query string skips Cloudflare's edge cache: a cached 404 for a
  // not-yet-uploaded key would otherwise hide the new file for a while.
  const response = await fetch(`${ORIGIN}/${key}?check=${Date.now()}`, {
    method: "HEAD",
    signal: AbortSignal.timeout(15_000),
  });
  return response.ok;
};

/** Uploads a file under a content-hashed key and returns its public URL. */
const publish = async (file, name) => {
  const ext = path.extname(file).slice(1);
  const key = `${PREFIX}/${name}-${await sha(file)}.${ext}`;
  if (await exists(key)) {
    process.stdout.write(`  kept     ${key}\n`);
  } else {
    await run(
      wrangler,
      [
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
      ],
      { cwd: root, maxBuffer: 16 * 1024 * 1024 }
    );
    process.stdout.write(`  uploaded ${key}\n`);
  }
  return `${ORIGIN}/${key}`;
};

/** A 480 px wide WebP, cropped from the top when taller than 3:4. */
const thumbnail = async (input, width, height, output) => {
  const crop = Math.min(height, Math.round(width * THUMB_MAX_RATIO));
  await run("cwebp", [
    "-quiet",
    "-q",
    "82",
    "-m",
    "6",
    "-alpha_q",
    "100",
    "-crop",
    "0",
    "0",
    String(width),
    String(crop),
    "-resize",
    String(THUMB_WIDTH),
    "0",
    input,
    "-o",
    output,
  ]);
};

/** Encodes, uploads and describes one rendered sample. */
const build = async (sample) => {
  process.stdout.write(`${sample.id}\n`);
  const file = path.join(source, sample.file);
  const thumbFile = path.join(work, `${sample.id}-thumb.webp`);
  const base = {
    id: sample.id,
    kind: sample.kind,
    name: sample.name,
  };
  const size = { width: sample.width, height: sample.height };

  if (sample.kind === "video") {
    const { stdout } = await run("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      file,
    ]);
    const duration = Math.round(Number(stdout.trim()) * 100) / 100;
    // The poster frame sits at 62%, where every clip shows its finished
    // state.
    const frame = path.join(work, `${sample.id}-poster.png`);
    await run("ffmpeg", [
      "-v",
      "error",
      "-y",
      "-ss",
      String(duration * 0.62),
      "-i",
      file,
      "-frames:v",
      "1",
      frame,
    ]);
    await thumbnail(frame, sample.width, sample.height, thumbFile);
    return {
      ...base,
      url: await publish(file, sample.id),
      thumb: await publish(thumbFile, `${sample.id}-thumb`),
      ...size,
      duration,
      tags: sample.tags,
    };
  }

  // The logo stays a PNG: overlays and exports take it as-is, alpha intact.
  let full = file;
  if (!sample.tags.includes("logo")) {
    full = path.join(work, `${sample.id}.webp`);
    await run("cwebp", [
      "-quiet",
      "-q",
      "90",
      "-m",
      "6",
      "-sharp_yuv",
      file,
      "-o",
      full,
    ]);
  }
  await thumbnail(file, sample.width, sample.height, thumbFile);
  return {
    ...base,
    url: await publish(full, sample.id),
    thumb: await publish(thumbFile, `${sample.id}-thumb`),
    ...size,
    tags: sample.tags,
  };
};

const items = [];
for (const sample of rendered.samples) {
  // One at a time: keeps wrangler's uploads and the log in catalog order.
  // eslint-disable-next-line no-await-in-loop
  items.push(await build(sample));
}

await writeFile(
  manifestPath,
  `${JSON.stringify({ version: 1, items }, null, 2)}\n`
);
process.stdout.write(
  `Wrote ${path.relative(root, manifestPath)} (${items.length} items)\n`
);
