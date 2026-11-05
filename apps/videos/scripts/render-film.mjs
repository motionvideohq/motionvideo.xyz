import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Renders the launch film, then finishes it in ffmpeg: fine temporal luma
// grain (light stage strength) and the foley stem.
//
//   node scripts/render-film.mjs           out/launch-film-preview.mp4  960×540, 30 fps
//   node scripts/render-film.mjs --final   out/launch-film.mp4          1920×1080, 60 fps
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const final = process.argv.includes("--final");
const composition = final ? "LaunchFilm" : "LaunchFilmPreview";
const picture = path.join(root, `out/film/${composition}-picture.mp4`);
const output = path.join(root, final ? "out/launch-film.mp4" : "out/launch-film-preview.mp4");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} exited ${result.status}`);
}

await mkdir(path.dirname(picture), { recursive: true });
run("pnpm", [
  "exec",
  "remotion",
  "render",
  composition,
  picture,
  "--crf=12",
  "--muted",
  ...(final ? ["--concurrency=4"] : []),
]);
run("ffmpeg", [
  "-y",
  "-loglevel",
  "error",
  "-i",
  picture,
  "-i",
  path.join(root, "public/film/foley.wav"),
  "-vf",
  "format=yuv444p,noise=c0s=3:c0f=t,format=yuv420p",
  "-c:v",
  "libx264",
  "-crf",
  final ? "14" : "18",
  "-preset",
  "slow",
  "-c:a",
  "aac",
  "-b:a",
  "192k",
  "-shortest",
  "-movflags",
  "+faststart",
  output,
]);
console.log("Wrote", path.relative(root, output));
