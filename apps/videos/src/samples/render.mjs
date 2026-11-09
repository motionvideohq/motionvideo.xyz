// Renders the Create sample library (catalog.json) to out/samples: stills as
// PNG, clips as small muted H.264 MP4, plus out/samples/index.json describing
// every file. apps/web's `pnpm create:samples` converts, uploads and writes
// the web manifest from that folder.
//
//   pnpm samples:render              # everything
//   pnpm samples:render analytics    # only the named samples
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = path.join(root, "out/samples");
const bundle = path.join(out, ".bundle");
const remotion = path.join(root, "node_modules/.bin/remotion");

const catalog = JSON.parse(
  await readFile(path.join(root, "src/samples/catalog.json"), "utf8")
);
const only = new Set(process.argv.slice(2));
const unknown = [...only].filter(
  (id) => !catalog.samples.some((sample) => sample.id === id)
);
if (unknown.length > 0) {
  throw new Error(`Unknown samples: ${unknown.join(", ")}`);
}

await mkdir(out, { recursive: true });
await rm(bundle, { recursive: true, force: true });
process.stdout.write("Bundling…\n");
await run(remotion, ["bundle", "src/index.ts", "--out-dir", bundle], {
  cwd: root,
  maxBuffer: 64 * 1024 * 1024,
});

const fileOf = (sample) =>
  `${sample.id}.${sample.kind === "video" ? "mp4" : "png"}`;

for (const sample of catalog.samples) {
  if (only.size > 0 && !only.has(sample.id)) {
    continue;
  }
  const file = path.join(out, fileOf(sample));
  const id = `sample-${sample.id}`;
  const args =
    sample.kind === "video"
      ? [
          "render",
          bundle,
          id,
          file,
          "--codec=h264",
          "--crf=26",
          "--x264-preset=slow",
          "--pixel-format=yuv420p",
          "--muted",
          "--overwrite",
        ]
      : ["still", bundle, id, file, "--image-format=png", "--overwrite"];
  process.stdout.write(`Rendering ${sample.id}…\n`);
  // One at a time: each render already uses every core.
  // eslint-disable-next-line no-await-in-loop
  await run(remotion, args, { cwd: root, maxBuffer: 64 * 1024 * 1024 });
}

await writeFile(
  path.join(out, "index.json"),
  `${JSON.stringify(
    {
      version: 1,
      samples: catalog.samples.map((sample) => ({
        ...sample,
        file: fileOf(sample),
      })),
    },
    null,
    2
  )}\n`
);
await rm(bundle, { recursive: true, force: true });
process.stdout.write(`Done: ${out}\n`);
