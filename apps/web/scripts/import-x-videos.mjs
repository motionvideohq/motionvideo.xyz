// Add curated X video posts to src/data/motion-catalog.json through the public
// FxTwitter API.
//
//   pnpm catalog:import:videos
//
// Each source in x-video-sources.json names the post plus the curation
// FxTwitter can't supply: a title, content categories, the model when the
// creator reported it, and the prompt or a skill URL. The prompt is either
// found in the post (or one of the creator's own replies) between two markers,
// or given as `text` when the creator published it elsewhere (an image, a
// gist, a gallery). Every video needs a prompt or a skill, so a source with
// neither is rejected. Posts already in the catalog are skipped, so the list
// can keep growing; find new posts with `pnpm catalog:discover`. New videos are
// spread evenly through the default (featured) order. Run `pnpm assets:mirror`
// afterwards to move the media onto assets.motionvideo.xyz.
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { z } from "zod";

import {
  EFFORTS,
  ITERATIONS,
  MOTION_CATEGORIES,
  MOTION_MODELS,
} from "../src/lib/motion-catalog.ts";
import { deriveCatalog } from "./derive-catalog.mjs";
import { paletteOf } from "./palette.mjs";

const run = promisify(execFile);
const catalogPath = fileURLToPath(
  new URL("../src/data/motion-catalog.json", import.meta.url)
);
const sourcesPath = fileURLToPath(
  new URL("x-video-sources.json", import.meta.url)
);
const API = "https://api.fxtwitter.com/2";
const CONCURRENCY = 6;
// Cards play a small preview; the detail view plays the best quality.
const PREVIEW_WIDTH = 480;
const sourceSchema = z
  .object({
    post: z.string().regex(/^\w+\/status\/\d+$/u),
    title: z.string().min(1),
    contentTags: z.array(z.enum(MOTION_CATEGORIES)).min(1),
    prompt: z
      .union([
        z.object({
          in: z.enum(["post", "reply"]),
          from: z.string().min(1),
          to: z.string().min(1).optional(),
        }),
        z.object({ text: z.string().min(1) }),
      ])
      .optional(),
    skillUrl: z.url().optional(),
    description: z.string().optional(),
    model: z.enum(MOTION_MODELS).optional(),
    stack: z.string().min(1).optional(),
    effort: z.enum(EFFORTS).optional(),
    iterations: z.enum(ITERATIONS).optional(),
  })
  .refine((source) => source.prompt || source.skillUrl, {
    message: "A source needs a prompt or a skillUrl",
  });

const formatSchema = z.object({
  url: z.url(),
  container: z.string().optional(),
  bitrate: z.number().optional(),
});
const statusSchema = z.object({
  id: z.string(),
  text: z.string(),
  created_timestamp: z.number(),
  author: z.object({
    screen_name: z.string(),
    name: z.string(),
    avatar_url: z.url(),
  }),
  media: z
    .object({
      all: z.array(
        z.object({
          type: z.string(),
          url: z.url(),
          thumbnail_url: z.url().optional(),
          width: z.number(),
          height: z.number(),
          formats: z.array(formatSchema).optional(),
        })
      ),
    })
    .optional(),
});
// Only the author and text matter in replies (the prompt may live there).
const replySchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.object({ screen_name: z.string() }),
});
const conversationSchema = z.object({
  status: statusSchema,
  thread: z.array(replySchema).optional(),
  replies: z.array(replySchema).optional(),
});

const fetchConversation = async (id) => {
  const response = await fetch(`${API}/conversation/${id}`, {
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    throw new Error(`${id}: HTTP ${response.status}`);
  }
  return conversationSchema.parse(await response.json());
};

const widthOf = (url) =>
  Number(url.match(/\/(?<width>\d+)x\d+\//u)?.groups.width);
const distanceFromPreviewWidth = (format) =>
  Math.abs((widthOf(format.url) || Infinity) - PREVIEW_WIDTH);

// The text from `from` (inclusive) up to and including `to`, if given.
const between = (text, { from, to }) => {
  const start = text.indexOf(from);
  if (start === -1) {
    return null;
  }
  const end = to ? text.indexOf(to, start) : -1;
  return (
    end === -1 ? text.slice(start) : text.slice(start, end + to.length)
  ).trim();
};

const findPrompt = (source, conversation) => {
  const { prompt } = source;
  if (!prompt) {
    return null;
  }
  if ("text" in prompt) {
    return prompt.text.trim();
  }
  const { status } = conversation;
  const texts =
    prompt.in === "post"
      ? [status.text]
      : [...(conversation.thread ?? []), ...(conversation.replies ?? [])]
          .filter(
            (reply) =>
              reply.author.screen_name === status.author.screen_name &&
              reply.id !== status.id
          )
          .map((reply) => reply.text);
  const found = texts.map((text) => between(text, prompt)).find(Boolean);
  if (!found) {
    throw new Error(`${source.post}: prompt marker "${prompt.from}" not found`);
  }
  return found;
};

// A 16px-wide PNG of the poster as a data URI, shown while media loads.
// Optional: skipped when ffmpeg is unavailable or fails.
const blurOf = async (poster) => {
  try {
    const { stdout } = await run(
      "ffmpeg",
      [
        "-loglevel",
        "error",
        "-i",
        poster,
        "-vf",
        "scale=16:-2",
        "-frames:v",
        "1",
        "-f",
        "image2pipe",
        "-vcodec",
        "png",
        "-",
      ],
      { encoding: "buffer", maxBuffer: 1024 * 1024 }
    );
    return `data:image/png;base64,${stdout.toString("base64")}`;
  } catch {
    return null;
  }
};

const buildVideo = async (source) => {
  const [, id] = source.post.split("/status/");
  const conversation = await fetchConversation(id);
  const { status } = conversation;
  const media = status.media?.all.find(
    (item) => item.type === "video" || item.type === "gif"
  );
  if (!media?.thumbnail_url) {
    throw new Error(`${source.post}: no video`);
  }
  const mp4 =
    media.formats?.filter((format) => format.container === "mp4") ?? [];
  const variants = mp4.length > 0 ? mp4 : [{ url: media.url, bitrate: 0 }];
  const [best] = variants.toSorted(
    (a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0)
  );
  const [preview] = variants.toSorted(
    (a, b) => distanceFromPreviewWidth(a) - distanceFromPreviewWidth(b)
  );
  const handle = status.author.screen_name;
  const prompt = findPrompt(source, conversation);
  const [blur, colors] = await Promise.all([
    blurOf(media.thumbnail_url),
    paletteOf(preview.url),
  ]);
  const video = {
    slug: `${handle.toLowerCase()}-${createHash("sha1").update(status.id).digest("hex").slice(0, 6)}`,
    title: source.title,
    date: new Date(status.created_timestamp * 1000).toISOString().slice(0, 10),
    tags: [],
    contentTags: source.contentTags,
    promptShared: Boolean(prompt),
    handle,
    creatorName: status.author.name,
    avatar: status.author.avatar_url,
    poster: media.thumbnail_url,
  };
  if (blur) {
    video.blur = blur;
  }
  Object.assign(video, {
    preview: preview.url,
    video: best.url,
    width: media.width,
    height: media.height,
    tweetUrl: `https://x.com/${handle}/status/${status.id}`,
  });
  if (colors) {
    video.colors = colors;
  }
  if (prompt) {
    video.tags.push("prompt");
    video.prompt = prompt;
  }
  if (source.skillUrl) {
    video.tags.push("skill");
    video.skillUrl = source.skillUrl;
  }
  if (source.description) {
    video.description = source.description;
  }
  for (const key of ["model", "stack", "effort", "iterations"]) {
    if (source[key]) {
      video[key] = source[key];
    }
  }
  return video;
};

const catalog = JSON.parse(await readFile(catalogPath, "utf-8"));
const sources = z
  .array(sourceSchema)
  .parse(JSON.parse(await readFile(sourcesPath, "utf-8")));
// Removed duplicates count as known, so their posts are never re-imported.
const known = new Set(
  [...catalog.videos, ...(catalog.removed ?? [])].map(
    (video) => video.tweetUrl?.match(/status\/(?<id>\d+)/u)?.groups.id
  )
);
const pending = sources.filter(
  (source) => !known.has(source.post.split("/status/")[1])
);

// Indexed by source, so new videos keep the order of the sources file.
const built = [];
const failed = [];
const queue = [...pending.entries()];
// A few posts at a time, to stay gentle on the public API.
const worker = async () => {
  for (let entry = queue.shift(); entry; entry = queue.shift()) {
    const [index, source] = entry;
    try {
      // oxlint-disable-next-line no-await-in-loop
      built[index] = await buildVideo(source);
    } catch (error) {
      failed.push({ post: source.post, error: error.message });
    }
  }
};
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
const added = built.filter(Boolean);

// Spread the new videos evenly through the existing order.
const videos = [];
const step = catalog.videos.length / (added.length + 1);
let next = 0;
for (const [index, video] of catalog.videos.entries()) {
  videos.push(video);
  while (next < added.length && index + 1 >= step * (next + 1)) {
    videos.push(added[next]);
    next += 1;
  }
}
videos.push(...added.slice(next));

if (added.length > 0) {
  await writeFile(
    catalogPath,
    // New videos change colour pages and similar-video lists.
    `${JSON.stringify(deriveCatalog({ ...catalog, importedAt: new Date().toISOString(), videos }), null, 2)}\n`
  );
}
console.log(
  `${added.length} added, ${sources.length - pending.length} already in the catalog, ${failed.length} failed.`
);
if (failed.length > 0) {
  console.error(failed);
  process.exitCode = 1;
}
