// Render and upload the media every launch film in src/data/launch-videos.json
// points at: the film poster, one poster per scene (its midpoint frame), a
// silent 720p preview loop of up to 6 s, and the full film for films whose
// `video` lives under /launch-videos/. Frames and fps come from the JSON, so
// the posters land on the same frames the scene chapters describe.
//
//   node scripts/launch-media.mjs             render, then upload what is missing
//   node scripts/launch-media.mjs --dry-run   render and list what would be uploaded
//   --source <film>=<path>                    use another local render for a film
//
// Sources default to the local renders in apps/videos/out. Objects that
// already exist on the public domain are skipped (keys are immutable). Uploads
// go through `wrangler r2 object put --remote`, so run `wrangler login` first.
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = fileURLToPath(new URL("..", import.meta.url));
const videos = path.join(root, "../videos");
const BUCKET = "motionvideo-assets";
const ORIGIN = "https://assets.motionvideo.xyz";
const PREFIX = "launch-videos";
const CACHE_CONTROL = "public, max-age=31536000, immutable";
const MAX_UPLOAD = 300 * 2 ** 20;
const PREVIEW_SECONDS = 6;
const wrangler = path.join(root, "node_modules/.bin/wrangler");
const dataPath = path.join(root, "src/data/launch-videos.json");

const DEFAULT_SOURCES = {
  "motionvideo-launch": path.join(videos, "out/motionvideo-launch.mp4"),
  "motionvideo-cinematic": path.join(videos, "out/launch-film.mp4"),
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sources = { ...DEFAULT_SOURCES };
for (let i = 0; i < args.length; i += 1) {
  if (args[i] !== "--source") {
    continue;
  }
  i += 1;
  const [film, file] = (args[i] ?? "").split(/[=](?<path>.*)/su);
  if (!film || !file) {
    throw new Error("--source expects <film>=<path>");
  }
  sources[film] = path.resolve(file);
}

const CONTENT_TYPES = { jpg: "image/jpeg", mp4: "video/mp4" };

const exists = async (key) => {
  // A unique query string skips Cloudflare's edge cache, which would otherwise
  // keep serving a cached 404 for a key uploaded since.
  const response = await fetch(`${ORIGIN}/${key}?check=${Date.now()}`, {
    method: "HEAD",
    signal: AbortSignal.timeout(15_000),
  });
  return response.ok;
};

const upload = async (file, key) => {
  const { size } = await stat(file);
  if (size > MAX_UPLOAD) {
    throw new Error(
      `Too large for wrangler (${Math.round(size / 2 ** 20)} MiB)`
    );
  }
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
      CONTENT_TYPES[path.extname(key).slice(1)],
      "--cache-control",
      CACHE_CONTROL,
    ],
    { cwd: root, maxBuffer: 16 * 1024 * 1024 }
  );
};

const ffmpeg = (...argv) =>
  run("ffmpeg", ["-v", "error", "-y", ...argv], {
    maxBuffer: 16 * 1024 * 1024,
  });

/** Width, height, frame rate and frame count of the first video stream. */
const probe = async (file) => {
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-count_packets",
    "-show_entries",
    "stream=width,height,r_frame_rate,nb_read_packets",
    "-of",
    "json",
    file,
  ]);
  const [stream] = JSON.parse(stdout).streams;
  const [num, den] = stream.r_frame_rate.split("/").map(Number);
  return {
    width: stream.width,
    height: stream.height,
    fps: num / den,
    frames: Number(stream.nb_read_packets),
  };
};

/** A still of film frame `frame`, scaled to the film's own size. */
const poster = (source, film, frame, out) =>
  ffmpeg(
    "-ss",
    ((frame * film.fpsDen) / film.fpsNum).toFixed(6),
    "-i",
    source,
    "-frames:v",
    "1",
    "-vf",
    `scale=${film.width}:${film.height}:flags=lanczos`,
    "-q:v",
    "3",
    out
  );

const { films, scenes } = JSON.parse(await readFile(dataPath, "utf-8"));
const workDir = await mkdtemp(path.join(tmpdir(), "launch-media-"));
const failures = [];

// Sequential on purpose: each film spawns ffmpeg encodes and wrangler
// uploads; running them in parallel would oversubscribe the machine and the
// R2 API, and the log reads film by film.
/* oxlint-disable no-await-in-loop */
try {
  for (const film of films) {
    const source = sources[film.slug];
    if (!source) {
      failures.push(
        `${film.slug}: no source render (pass --source ${film.slug}=<path>)`
      );
      continue;
    }
    let info;
    try {
      info = await probe(source);
    } catch (error) {
      failures.push(
        `${film.slug}: cannot read ${source} (${error.stderr?.trim() || error.message})`
      );
      continue;
    }
    // The posters seek by film frame, so the render must run the same length.
    const seconds = (film.frameCount * film.fpsDen) / film.fpsNum;
    if (Math.abs(info.frames / info.fps - seconds) > 1 / info.fps) {
      failures.push(
        `${film.slug}: ${source} runs ${(info.frames / info.fps).toFixed(3)} s, the film ${seconds.toFixed(3)} s`
      );
      continue;
    }
    console.log(
      `${film.slug}: ${path.relative(process.cwd(), source)} (${info.width}×${info.height}, ${info.fps} fps, ${info.frames} frames)`
    );

    const dir = path.join(workDir, film.slug);
    await run("mkdir", ["-p", path.join(dir, "scenes")]);
    const filmScenes = film.sceneIds.map((id) => {
      const scene = scenes.find((s) => s.id === id);
      if (!scene) {
        throw new Error(`${film.slug}: unknown scene ${id}`);
      }
      return scene;
    });
    const jobs = [];

    // The film poster is the end card: the last scene's midpoint.
    const last = filmScenes.at(-1);
    const posterFrame = Math.floor((last.startFrame + last.endFrame) / 2);
    await poster(source, film, posterFrame, path.join(dir, "poster.jpg"));
    jobs.push([
      film.poster,
      path.join(dir, "poster.jpg"),
      `frame ${posterFrame}`,
    ]);

    for (const scene of filmScenes) {
      const frame = Math.floor((scene.startFrame + scene.endFrame) / 2);
      const file = path.join(dir, "scenes", `${scene.slug}.jpg`);
      await poster(source, film, frame, file);
      jobs.push([scene.poster, file, `frame ${frame}`]);
    }

    // The preview starts on the second scene, past the cold open.
    const from = filmScenes[1]?.startFrame ?? 0;
    const length = Math.min(
      PREVIEW_SECONDS,
      seconds - (from * film.fpsDen) / film.fpsNum
    );
    const preview = path.join(dir, "preview.mp4");
    await ffmpeg(
      "-ss",
      ((from * film.fpsDen) / film.fpsNum).toFixed(6),
      "-i",
      source,
      "-t",
      length.toFixed(3),
      "-an",
      "-vf",
      "scale=-2:720:flags=lanczos,fps=30",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "24",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      preview
    );
    jobs.push([
      film.preview,
      preview,
      `frames ${from}+${length.toFixed(2)} s, silent 720p`,
    ]);

    if (film.video.startsWith(`${ORIGIN}/${PREFIX}/`)) {
      jobs.push([film.video, source, "full film"]);
    }

    for (const [url, file, note] of jobs) {
      if (!url.startsWith(`${ORIGIN}/${PREFIX}/`)) {
        failures.push(`${film.slug}: ${url} is not under ${ORIGIN}/${PREFIX}/`);
        continue;
      }
      const key = url.slice(ORIGIN.length + 1);
      const { size } = await stat(file);
      const label = `${key} (${note}, ${Math.round(size / 1024)} KiB)`;
      try {
        if (await exists(key)) {
          console.log(`  skip    ${label}: already on ${ORIGIN}`);
        } else if (dryRun) {
          console.log(`  would upload ${label}`);
        } else {
          await upload(file, key);
          console.log(`  uploaded ${label}`);
        }
      } catch (error) {
        failures.push(`${key}: ${error.stderr?.trim() || error.message}`);
      }
    }
  }
} finally {
  await rm(workDir, { recursive: true, force: true });
}
/* oxlint-enable no-await-in-loop */

if (failures.length > 0) {
  console.error(`\n${failures.length} failed:`);
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  process.exitCode = 1;
}
