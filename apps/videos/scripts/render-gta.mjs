import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, cp, link, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Renders MotionVideo GTA 6 Clip Pack overlays over your own clips with the
// GtaClip composition (src/gta).
//
// Drop a clip you own and its overlay spec into public/gta/in (gitignored):
//   public/gta/in/heist.mp4
//   public/gta/in/heist.overlay.json   ← written by the pack's gta-clip skill (spec v1);
//                                        `source.path` is resolved next to the json
//                                        (falls back to heist.mp4)
// then run from the repo root or apps/videos:
//   pnpm gta:render                  every *.overlay.json in public/gta/in
//   pnpm gta:render heist            only heist.overlay.json (several names allowed)
//   pnpm gta:render --sample         (re)make the 12 s test clip + sample overlay, then render all
// Output per clip:
//   out/gta/heist.mp4          after: the clip with every overlay rendered
//   out/gta/heist.before.mp4   before: public/gta/in/heist.before.mp4 when supplied (e.g. an
//                              existing clipper edit of the same moment), else the raw clip
//                              at the same size, fps and length
//
// Runs for different clips can go in parallel: each run bundles once into its
// own temp dir holding only the fonts and that run's clips (hard-linked) and its
// props files; no shared webpack cache, no copy of everyone's public/ folder.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.join(root, "public/gta/in");
const output = path.join(root, "out/gta");
const args = process.argv.slice(2);
const only = args.filter((arg) => !arg.startsWith("--"));

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} exited ${result.status}`);
}

// Root.tsx registers every film, and the brand font (src/brand.ts) loads for all
// of them, so the bundle needs Timeless Sans: the web app's copy (`pnpm fonts:pull`)
// or the one `pnpm fonts` copied here.
const fonts = [path.join(root, "../web/public/fonts/timeless"), path.join(root, "public/fonts/timeless")].find(
  (dir) => existsSync(dir),
);
if (!fonts) throw new Error("Timeless Sans not found: run `pnpm fonts:pull` in apps/web first.");

await mkdir(input, { recursive: true });
await mkdir(output, { recursive: true });

if (args.includes("--sample")) {
  // A synthetic 1080×1920 test pattern with a beeping tone: no footage of anyone's.
  run("ffmpeg", [
    "-y",
    "-loglevel",
    "error",
    "-f",
    "lavfi",
    "-i",
    "testsrc2=size=1080x1920:rate=60:duration=12",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=220:beep_factor=4:sample_rate=48000:duration=12",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "20",
    "-c:a",
    "aac",
    "-shortest",
    path.join(input, "sample.mp4"),
  ]);
  await copyFile(path.join(root, "src/gta/sample.overlay.json"), path.join(input, "sample.overlay.json"));
}

const specs = (await readdir(input))
  .filter((file) => file.endsWith(".overlay.json"))
  .filter((file) => only.length === 0 || only.includes(file.replace(/\.overlay\.json$/, "")));
if (specs.length === 0) {
  console.error(
    `No *.overlay.json in ${path.relative(root, input)}${only.length ? ` matching ${only.join(", ")}` : ""}.\n` +
      "Add <clip>.mp4 + <clip>.overlay.json there, or run `pnpm gta:render --sample` for the test clip.",
  );
  process.exit(1);
}

const temp = await mkdtemp(path.join(os.tmpdir(), "motionvideo-gta-"));
try {
  // The bundle's public folder: just the fonts. Remotion's file server refuses
  // symlinks that resolve outside the bundle, so files are real copies/links.
  const publicDir = path.join(temp, "public");
  await cp(fonts, path.join(publicDir, "fonts/timeless"), { recursive: true });

  const jobs = [];
  for (const file of specs) {
    const name = file.replace(/\.overlay\.json$/, "");
    const overlay = JSON.parse(await readFile(path.join(input, file), "utf8"));
    if (overlay.version !== 1) throw new Error(`${file}: overlay version ${overlay.version} is not supported (expected 1)`);
    const clip = [path.resolve(input, overlay.source?.path ?? ""), path.join(input, `${name}.mp4`)].find(
      (candidate) => candidate.startsWith(input + path.sep) && existsSync(candidate),
    );
    if (!clip) throw new Error(`${file}: clip not found (source.path "${overlay.source?.path}" or ${name}.mp4 in public/gta/in)`);
    const props = path.join(temp, `${name}.props.json`);
    await writeFile(props, JSON.stringify({ src: `gta/in/${path.basename(clip)}`, overlay }));
    jobs.push({ name, overlay, clip, props });
  }

  const bundle = path.join(temp, "bundle");
  run("pnpm", [
    "exec",
    "remotion",
    "bundle",
    "src/index.ts",
    `--public-dir=${publicDir}`,
    `--out-dir=${bundle}`,
    "--bundle-cache=false",
  ]);
  // Clips go into the finished bundle as hard links (a copy across volumes), so
  // bundling never copies footage and never sees other runs' clips.
  await mkdir(path.join(bundle, "public/gta/in"), { recursive: true });
  for (const { clip } of jobs) {
    const target = path.join(bundle, "public/gta/in", path.basename(clip));
    if (existsSync(target)) continue;
    await link(clip, target).catch(() => copyFile(clip, target));
  }

  for (const { name, overlay, clip, props } of jobs) {
    const after = path.join(output, `${name}.mp4`);
    const before = path.join(output, `${name}.before.mp4`);
    run("pnpm", ["exec", "remotion", "render", bundle, "GtaClip", after, `--props=${props}`, "--crf=16"]);
    const { width, height, fps } = overlay.format;
    // A supplied before (an existing edit of the same moment) is only normalized to the output size.
    const supplied = path.join(input, `${name}.before.mp4`);
    const given = existsSync(supplied);
    run("ffmpeg", [
      "-y",
      "-loglevel",
      "error",
      "-i",
      given ? supplied : clip,
      ...(given ? [] : ["-t", String(overlay.source.durationSec)]),
      "-vf",
      // Stack layout: the raw stream letterboxed into the vertical frame, what a clipper starts from.
      overlay.format.layout === "stack" && !given
        ? `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black,fps=${fps}`
        : `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},fps=${fps}`,
      "-c:v",
      "libx264",
      "-crf",
      "16",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-movflags",
      "+faststart",
      before,
    ]);
    console.log(`Wrote ${path.relative(root, after)} and ${path.relative(root, before)}`);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
