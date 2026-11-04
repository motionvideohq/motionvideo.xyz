import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const detailUrl = "https://api.openverse.org/v1/audio/36a9cc52-92dc-447b-a6ab-7b6c86b46a22/";
const queryUrl = "https://api.openverse.org/v1/audio/?q=minimal%20electronic%20grove&license=by";
const sourceUrl = "https://freesound.org/people/frankum/sounds/397166/";
const licenseUrl = "https://creativecommons.org/licenses/by/4.0/";
const previewUrl = "https://cdn.freesound.org/previews/397/397166_2305278-hq.mp3";
const title = "minimal electronic grove _Techno loop track";
const assetPath = "public/cinematic/music-source.mp3";

// Anonymous public requests only. curl is a transport fallback, not an auth bypass.
async function download(url, accept) {
  try {
    const response = await fetch(url, {
      headers: { Accept: accept },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.warn(`Node fetch failed (${error.message}); trying curl for ${url}`);
    const result = spawnSync(
      "curl",
      [
        "--fail",
        "--location",
        "--silent",
        "--show-error",
        "--max-time",
        "90",
        "--header",
        `Accept: ${accept}`,
        url,
      ],
      { maxBuffer: 32 * 1024 * 1024 },
    );
    if (result.status !== 0) {
      throw new Error(`curl failed for ${url}: ${result.stderr?.toString()}`);
    }
    return result.stdout;
  }
}

const detail = JSON.parse((await download(detailUrl, "application/json")).toString());
const sourceHtml = (await download(sourceUrl, "text/html")).toString();
if (
  detail.title !== title ||
  detail.creator !== "frankum" ||
  detail.license !== "by" ||
  detail.license_version !== "4.0" ||
  detail.license_url !== licenseUrl ||
  detail.url !== previewUrl ||
  detail.foreign_landing_url.replace(/\/$/, "") !== sourceUrl.replace(/\/$/, "")
) {
  throw new Error("Openverse identity, preview, or license differs from approved candidate");
}
const sourceLicense = sourceHtml.match(
  /<a\b[^>]*href=["']https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/["'][^>]*>[\s\S]*?<\/a>/i,
)?.[0];
if (!sourceLicense || !sourceHtml.includes(title) || !sourceHtml.includes("frankum")) {
  throw new Error("Could not independently verify CC BY 4.0 and track identity on source page");
}
if (!/Login to download/i.test(sourceHtml)) {
  throw new Error(
    "Source download access changed; reassess best accessible original before acquiring preview",
  );
}

const audio = await download(previewUrl, "audio/mpeg");
await mkdir(path.join(root, "public/cinematic"), { recursive: true });
await writeFile(path.join(root, assetPath), audio);
const probe = spawnSync(
  "ffprobe",
  ["-v", "error", "-show_format", "-show_streams", "-of", "json", path.join(root, assetPath)],
  { encoding: "utf8" },
);
if (probe.status !== 0) throw new Error(`ffprobe failed: ${probe.stderr}`);
const metadata = JSON.parse(probe.stdout);
const stream = metadata.streams.find((entry) => entry.codec_type === "audio");
if (!stream || stream.codec_name !== "mp3") throw new Error("Downloaded preview is not MP3 audio");
const decode = spawnSync(
  "ffmpeg",
  ["-v", "error", "-xerror", "-i", path.join(root, assetPath), "-map", "0:a:0", "-f", "null", "-"],
  { encoding: "utf8" },
);
if (decode.status !== 0) throw new Error(`Full audio decode failed: ${decode.stderr}`);

const manifest = {
  title,
  creator: "frankum",
  creatorUrl: "https://freesound.org/people/frankum/",
  acquiredAt: new Date().toISOString(),
  openverse: { id: detail.id, queryUrl, detailUrl },
  sourceUrl,
  downloadUrl: previewUrl,
  license: {
    name: "CC BY 4.0",
    url: licenseUrl,
    verifiedAgainst: sourceUrl,
    sourcePageEvidence: sourceLicense,
  },
  attribution: `“${title}” by frankum (${sourceUrl}), licensed under CC BY 4.0 (${licenseUrl}).`,
  adaptationCredit:
    "For the MotionVideo film: excerpted, gain-adjusted, faded, and mixed with sound effects.",
  accessQuality: {
    kind: "Freesound public high-quality MP3 preview; NOT original download",
    reason:
      "Source page explicitly requires login for original download; no credentials used. Acquired approved public HQ MP3 preview exposed by both Freesound and Openverse.",
    sourceOriginal: { format: "mp3", sampleRateHz: 44100, bitrateBps: 209000, requiresLogin: true },
  },
  assetPath,
  measured: {
    durationSeconds: Number(metadata.format.duration),
    sampleRateHz: Number(stream.sample_rate),
    channels: stream.channels,
    codec: stream.codec_name,
    streamBitrateBps: Number(stream.bit_rate),
    containerBitrateBps: Number(metadata.format.bit_rate),
    bytes: audio.length,
    sha256: createHash("sha256").update(audio).digest("hex"),
    fullDecode: "ffmpeg -v error -xerror: successful",
  },
};
await mkdir(path.join(root, "audio/cinematic"), { recursive: true });
await writeFile(
  path.join(root, "audio/cinematic/music.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(JSON.stringify(manifest, null, 2));
