import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scratch = path.join(root, "out/cinematic-audio");
await mkdir(scratch, { recursive: true });
const raw = path.join(scratch, "mix.wav");
const output = path.join(root, "public/cinematic/soundtrack.wav");

function ffmpeg(args) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-nostdin", "-y", ...args], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stderr;
}

// Keep one continuous musical phrase: no looping, time stretch, or unverified beat edits.
// The 4.5-second fade resolves over the logo and leaves a half-second silent tail.
ffmpeg([
  "-i",
  path.join(root, "public/cinematic/music-source.mp3"),
  "-i",
  path.join(root, "public/cinematic/foley.wav"),
  "-filter_complex",
  "[0:a]atrim=0:50,asetpts=PTS-STARTPTS,aresample=48000,afade=t=in:st=0:d=0.6,afade=t=out:st=45:d=4.5,volume=0.5[music];[music][1:a]amix=inputs=2:duration=first:normalize=0,atrim=0:50[mix]",
  "-map",
  "[mix]",
  "-c:a",
  "pcm_f32le",
  raw,
]);
const analysis = ffmpeg([
  "-i",
  raw,
  "-af",
  "loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json",
  "-f",
  "null",
  "-",
]);
const measured = JSON.parse(analysis.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0] ?? "null");
if (!measured || !Number.isFinite(Number(measured.input_i))) {
  throw new Error("Music/SFX mix did not produce measurable loudness");
}
ffmpeg([
  "-i",
  raw,
  "-af",
  `loudnorm=I=-16:TP=-1.5:LRA=9:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`,
  "-ar",
  "48000",
  "-ac",
  "2",
  "-c:a",
  "pcm_s24le",
  output,
]);
const verification = ffmpeg([
  "-i",
  output,
  "-af",
  "loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json",
  "-f",
  "null",
  "-",
]);
const final = JSON.parse(verification.match(/\{\s*"input_i"[\s\S]*?\}/)?.[0] ?? "null");
if (!final || Math.abs(Number(final.input_i) + 16) > 0.5 || Number(final.input_tp) > -1.4) {
  throw new Error(`Soundtrack loudness/true-peak verification failed: ${JSON.stringify(final)}`);
}
const manifest = {
  music: "public/cinematic/music-source.mp3",
  effects: "public/cinematic/foley.wav",
  output: "public/cinematic/soundtrack.wav",
  excerpt: { start: 0, seconds: 50, fadeIn: 0.6, fadeOutStart: 45, fadeOutSeconds: 4.5 },
  musicGain: 0.5,
  sampleRate: 48000,
  channels: 2,
  measuredBefore: measured,
  measuredAfter: final,
};
await mkdir(path.join(root, "audio/cinematic"), { recursive: true });
await writeFile(
  path.join(root, "audio/cinematic/mix.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(JSON.stringify(manifest, null, 2));
