import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { z } from "zod";

const SITE = "https://whatships.com/";
const CATEGORY = new URL("videos/category/motion/", SITE).href;
const SEARCH_INDEX = new URL("search-index.json", SITE).href;
const PROXY = "https://proxy.whatships.com/";
// What Ships files long-form talks under Motion; they are not motion design
// and run to gigabytes, so they are never imported.
const EXCLUDED_HANDLES = new Set(["ycombinator"]);
const catalogPath = fileURLToPath(
  new URL("../src/data/motion-catalog.json", import.meta.url)
);
const output = path.resolve(process.argv[2] ?? catalogPath);

// Ids are the MOTION_CATEGORIES in src/lib/motion-catalog.ts. Keywords are
// matched against What Ships tags and title words only, never invented.
const categoryKeywords = [
  ["product-ui", ["ui", "interface", "dashboard", "product-ui", "responsive"]],
  ["phone", ["mobile", "phone", "iphone", "ios", "android"]],
  ["charts", ["chart", "charts", "graph", "graphs"]],
  ["diagrams", ["diagram", "diagrams", "visualization", "visualisation"]],
  ["kinetic-type", ["typography", "kinetic", "lettering", "font", "fonts"]],
  ["shapes", ["shapes", "shape", "geometric", "icon", "icons"]],
  ["particles", ["particle", "particles"]],
  ["characters", ["character", "characters", "mascot"]],
  ["photos", ["photo", "photos", "photography"]],
  ["music", ["music", "song", "vj", "audio", "soundtrack"]],
  [
    "code",
    [
      "code",
      "claude-code",
      "remotion",
      "threejs",
      "three.js",
      "shader",
      "shaders",
      "webgl",
      "hyperframes",
    ],
  ],
];
const categoryIds = categoryKeywords.map(([id]) => id);

const isPublicUrl = (value) =>
  ["https:", "http:"].includes(new URL(value).protocol);
const publicUrl = z.string().url().refine(isPublicUrl);
const statusPattern =
  /^https?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/[^/]+\/status(?:es)?\/(?<id>\d+)/iu;
const detailSchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    category: z.literal("motion"),
    status: z.literal("published"),
    tags: z.array(z.string()),
    tweetUrl: z.string().url().regex(statusPattern),
    tweetId: z.string().regex(/^\d+$/u),
    authorHandle: z.string().regex(/^\w{1,15}$/u),
    authorAvatar: publicUrl,
    poster: z.string().min(1),
    videoUrl: publicUrl.refine(
      (value) => new URL(value).hostname === "video.twimg.com"
    ),
    publishedAt: z.string().datetime(),
  })
  .passthrough();
const videoSchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().min(1),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u)
      .refine((value) => !Number.isNaN(Date.parse(value))),
    tags: z.array(z.enum(["prompt", "skill"])),
    contentTags: z.array(z.string().min(1)),
    promptShared: z.boolean(),
    handle: z.string().min(1),
    avatar: publicUrl,
    poster: publicUrl,
    preview: publicUrl,
    video: publicUrl,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    blur: z.string().optional(),
    prompt: z.string().optional(),
    description: z.string().optional(),
    skillUrl: publicUrl.optional(),
    tweetUrl: publicUrl.optional(),
    sourceUrl: publicUrl,
  })
  .passthrough();
const catalogSchema = z
  .object({
    source: publicUrl,
    importedAt: z.string().datetime(),
    videos: z.array(videoSchema).min(1),
  })
  .passthrough();
const newVideoSchema = videoSchema.extend({
  contentTags: z.array(z.enum(categoryIds)),
  tweetUrl: z.string().url().regex(statusPattern),
});
const objectSchema = z.record(z.string(), z.unknown());

const entities = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  mdash: "—",
  ndash: "–",
};
const decodeHtml = (value) =>
  value.replaceAll(/&(?<code>#x[\da-f]+|#\d+|[a-z]+);/giu, (entity, code) => {
    if (code.startsWith("#")) {
      const hex = code[1].toLowerCase() === "x";
      const radix = hex ? 16 : 10;
      return String.fromCodePoint(
        Number.parseInt(code.slice(hex ? 2 : 1), radix)
      );
    }
    return entities[code.toLowerCase()] ?? entity;
  });
const attribute = (html, name) => {
  const match = html.match(new RegExp(`\\s${name}="(?<value>[^"]*)"`, "u"));
  return match ? decodeHtml(match.groups.value) : null;
};
const fetchPublic = async (url, accept) => {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      "User-Agent": "MotionVideo-PublicDirectoryImporter/1.0",
    },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) {
    throw new Error(`${url}: HTTP ${response.status}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes(accept)) {
    throw new Error(`${url}: requested ${accept}, received ${contentType}`);
  }
  return response.text();
};
const videoSlug = (href) =>
  new URL(href, SITE).pathname.match(/^\/videos\/(?<slug>[^/]+)\/$/u)?.groups
    .slug ?? null;

// The category page, its markdown alternate, and the search index must agree.
const listMotionVideos = async () => {
  const [markdown, html, index] = await Promise.all([
    fetchPublic(CATEGORY, "text/markdown"),
    fetchPublic(CATEGORY, "text/html"),
    fetchPublic(SEARCH_INDEX, "application/json"),
  ]);
  const listings = new Map();
  for (const { groups } of markdown.matchAll(
    /^- \[(?<title>.+)\]\((?<url>https:\/\/whatships\.com\/videos\/[^/)]+\/)\) — .+$/gmu
  )) {
    listings.set(videoSlug(groups.url), groups.title);
  }
  if (!listings.size) {
    throw new Error(`${CATEGORY}: no public markdown listings found`);
  }
  const cards = new Set();
  for (const { groups } of html.matchAll(
    /<h2\b[^>]*>\s*<a\b(?<link>[^>]*)>[\s\S]*?<\/a>\s*<\/h2>/gu
  )) {
    const slug = videoSlug(attribute(groups.link, "href") ?? "");
    if (slug) {
      cards.add(slug);
    }
  }
  const indexed = new Set(
    z
      .array(
        z
          .object({ kind: z.string(), slug: z.string(), meta: z.string() })
          .passthrough()
      )
      .parse(JSON.parse(index))
      .filter(
        ({ kind, meta }) => kind === "video" && meta.endsWith(" · Motion")
      )
      .map(({ slug }) => slug)
  );
  for (const [label, slugs] of [
    ["HTML cards", cards],
    ["search index", indexed],
  ]) {
    const missing = [...listings.keys()].filter((slug) => !slugs.has(slug));
    const extra = [...slugs].filter((slug) => !listings.has(slug));
    if (missing.length || extra.length) {
      throw new Error(
        `${CATEGORY}: markdown and ${label} disagree (missing ${missing.join(", ") || "none"}; extra ${extra.join(", ") || "none"})`
      );
    }
  }
  return listings;
};

// Astro island props: every value is a [type, value] pair. Only plain values
// (0) and arrays (1) are expected; anything else fails loudly.
const decodeAstro = (encoded) => {
  const [type, value] = z.tuple([z.number(), z.unknown()]).parse(encoded);
  if (type === 0) {
    const object = objectSchema.safeParse(value);
    return object.success
      ? Object.fromEntries(
          Object.entries(object.data).map(([key, item]) => [
            key,
            decodeAstro(item),
          ])
        )
      : value;
  }
  if (type === 1) {
    return z.array(z.unknown()).parse(value).map(decodeAstro);
  }
  throw new Error(`Unsupported Astro prop type ${type}`);
};

// Parse serialized props and JSON-LD only. Never evaluate remote scripts.
const detailFromHtml = (html, url) => {
  const islands = Array.from(
    html.matchAll(/<astro-island\b[^>]*>/gu),
    ([tag]) => tag
  ).filter((tag) =>
    /\/DetailPlayer\.[\w-]+\.js$/u.test(attribute(tag, "component-url") ?? "")
  );
  if (islands.length !== 1) {
    throw new Error(
      `${url}: expected one DetailPlayer, found ${islands.length}`
    );
  }
  const props = JSON.parse(attribute(islands[0], "props") ?? "null");
  const detail = detailSchema.parse(decodeAstro([0, props]).video);
  const contentUrls = Array.from(
    html.matchAll(
      /<script type="application\/ld\+json">(?<json>[\s\S]*?)<\/script>/gu
    ),
    ({ groups }) => JSON.parse(groups.json)
  )
    .flatMap((data) => data["@graph"] ?? [data])
    .filter((node) => node["@type"] === "VideoObject")
    .map((node) => node.contentUrl);
  if (contentUrls.length !== 1) {
    throw new Error(
      `${url}: expected one VideoObject, found ${contentUrls.length}`
    );
  }
  // video.twimg.com rejects cross-site Referer headers, so playback uses the
  // public What Ships proxy URL published as the page's schema.org contentUrl.
  const video = publicUrl.parse(contentUrls[0]);
  const proxied = new URL(video);
  if (
    `${proxied.origin}/` !== PROXY ||
    proxied.searchParams.get("url") !== detail.videoUrl
  ) {
    throw new Error(`${url}: contentUrl does not proxy ${detail.videoUrl}`);
  }
  const statusId = detail.tweetUrl.match(statusPattern).groups.id;
  if (statusId !== detail.tweetId) {
    throw new Error(
      `${url}: tweetUrl ${statusId} differs from ${detail.tweetId}`
    );
  }
  if (detail.slug !== videoSlug(url)) {
    throw new Error(`${url}: page slug ${detail.slug} differs from URL`);
  }
  return { ...detail, video };
};

const ffprobe = promisify(execFile);
const dimensions = async ({ videoUrl, video }) => {
  const size = new URL(videoUrl).pathname.match(/\/(?<w>\d+)x(?<h>\d+)\//u);
  if (size) {
    return { width: Number(size.groups.w), height: Number(size.groups.h) };
  }
  const { stdout } = await ffprobe("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "json",
    video,
  ]);
  const [stream] = JSON.parse(stdout).streams ?? [];
  if (!stream?.width || !stream?.height) {
    throw new Error(`${videoUrl}: ffprobe found no video dimensions`);
  }
  return { width: stream.width, height: stream.height };
};

const contentTagsFor = ({ tags, title }) => {
  const words = new Set(
    [...tags, ...title.split(/\s+/u)].flatMap((value) => {
      const word = value.toLowerCase().replaceAll(/^[^\w.]+|[^\w.]+$/gu, "");
      return [word, ...word.split("-")];
    })
  );
  return categoryKeywords
    .filter(([, keywords]) => keywords.some((keyword) => words.has(keyword)))
    .map(([id]) => id);
};

const slugBase = (handle) =>
  handle
    .toLowerCase()
    .replaceAll(/[^a-z\d]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");
const uniqueSlug = (handle, tweetId, taken) => {
  for (let attempt = 0; ; attempt += 1) {
    const hex = createHash("sha256")
      .update(`whatships:${tweetId}:${attempt}`)
      .digest("hex")
      .slice(0, 6);
    const slug = `${slugBase(handle)}-${hex}`;
    if (!taken.has(slug)) {
      return slug;
    }
  }
};

const statusId = (url) => url?.match(statusPattern)?.groups.id ?? null;
// Compare media by origin URL: unwrap the What Ships proxy, drop query/hash.
const mediaKey = (url) => {
  if (!url) {
    return null;
  }
  let parsed = new URL(url);
  if (`${parsed.origin}/` === PROXY && parsed.searchParams.has("url")) {
    parsed = new URL(parsed.searchParams.get("url"));
  }
  return `${parsed.hostname.toLowerCase()}${parsed.pathname}`;
};
const titleWords = (title) =>
  new Set(title.toLowerCase().match(/[\p{L}\p{N}]+/gu));
const similarTitles = (left, right) => {
  const a = titleWords(left);
  const b = titleWords(right);
  const shared = [...a].filter((word) => b.has(word)).length;
  return shared / (a.size + b.size - shared || 1) >= 0.6;
};
const findDuplicate = (candidate, videos) => {
  const id = statusId(candidate.tweetUrl);
  const media = new Set(
    [candidate.video, candidate.preview, candidate.poster, candidate.sourceUrl]
      .map(mediaKey)
      .filter(Boolean)
  );
  for (const video of videos) {
    if (id && statusId(video.tweetUrl) === id) {
      return { slug: video.slug, by: `tweet status ${id}` };
    }
    const sharedMedia = [
      video.video,
      video.preview,
      video.poster,
      video.sourceUrl,
    ]
      .map(mediaKey)
      .find((key) => key && media.has(key));
    if (sharedMedia) {
      return { slug: video.slug, by: `media URL ${sharedMedia}` };
    }
    if (
      video.handle.toLowerCase() === candidate.handle.toLowerCase() &&
      similarTitles(video.title, candidate.title)
    ) {
      return {
        slug: video.slug,
        by: `handle @${video.handle} + similar title`,
      };
    }
  }
  return null;
};

const main = async () => {
  // Validate, but merge into the raw JSON so existing entries keep key order.
  const catalog = JSON.parse(await readFile(catalogPath, "utf-8"));
  catalogSchema.parse(catalog);
  const listings = await listMotionVideos();
  const details = [];
  const failures = [];
  const queue = [...listings.keys()];
  // Exactly three paced workers. Sequential awaits deliberately cap source load.
  const worker = async () => {
    while (queue.length) {
      const slug = queue.shift();
      const url = new URL(`videos/${slug}/`, SITE).href;
      try {
        // eslint-disable-next-line no-await-in-loop
        const detail = detailFromHtml(await fetchPublic(url, "text/html"), url);
        if (decodeHtml(listings.get(slug)) !== detail.title) {
          throw new Error(`${url}: markdown title differs from page title`);
        }
        // eslint-disable-next-line no-await-in-loop
        details.push({ ...detail, url, ...(await dimensions(detail)) });
      } catch (error) {
        failures.push({ slug, url, error: error.message });
      }
      // eslint-disable-next-line no-await-in-loop
      await pause(250);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  if (failures.length) {
    console.error(JSON.stringify({ failures }, null, 2));
    throw new Error(
      `${failures.length} What Ships pages failed; catalog left untouched.`
    );
  }

  const videos = [...catalog.videos];
  const taken = new Set(videos.map(({ slug }) => slug));
  const matched = [];
  const added = [];
  // Newest first among new entries, matching the existing catalog's order.
  details.sort(
    (a, b) =>
      b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug)
  );
  for (const detail of details) {
    if (EXCLUDED_HANDLES.has(detail.authorHandle.toLowerCase())) {
      continue;
    }
    const description = detail.description.trim();
    const candidate = {
      slug: "",
      title: detail.title,
      date: detail.publishedAt.slice(0, 10),
      // What Ships publishes no prompts or skill links, so none are claimed.
      tags: [],
      contentTags: contentTagsFor(detail),
      promptShared: false,
      handle: detail.authorHandle,
      avatar: detail.authorAvatar,
      poster: new URL(detail.poster, SITE).href,
      preview: detail.video,
      video: detail.video,
      width: detail.width,
      height: detail.height,
      sourceUrl: detail.url,
      tweetUrl: detail.tweetUrl,
    };
    if (description) {
      candidate.description = description;
    }
    const duplicate = findDuplicate(candidate, videos);
    if (duplicate) {
      matched.push({ whatships: detail.slug, ...duplicate });
      continue;
    }
    candidate.slug = uniqueSlug(detail.authorHandle, detail.tweetId, taken);
    taken.add(candidate.slug);
    newVideoSchema.parse(candidate);
    videos.push(candidate);
    added.push(candidate.slug);
  }

  const next = { ...catalog, videos };
  catalogSchema.parse(next);
  if (new Set(videos.map(({ slug }) => slug)).size !== videos.length) {
    throw new Error("Duplicate slug in merged catalog");
  }
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(next, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        output,
        whatShipsMotion: listings.size,
        alreadyInCatalog: matched,
        added,
        total: videos.length,
      },
      null,
      2
    )
  );
};

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
