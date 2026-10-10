import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import { z } from "zod";

const SOURCE = "https://prompt-motion.com/";
const output = path.resolve(
  process.argv[2] ??
    fileURLToPath(new URL("../src/data/motion-catalog.json", import.meta.url))
);
const stringSchema = z.string();
const valuesSchema = z.array(z.unknown());
const objectSchema = z.record(z.string(), z.unknown());
const elementSchema = z.tuple([
  z.literal("$"),
  z.string(),
  z.unknown(),
  objectSchema,
]);
const flightTupleSchema = z.tuple([z.number(), z.unknown()]).rest(z.unknown());
const publicUrlSchema = z
  .string()
  .url()
  .refine((value) => ["https:", "http:"].includes(new URL(value).protocol));
const cardSchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().min(1),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u)
      .refine((value) => !Number.isNaN(Date.parse(value))),
    tags: z.array(z.string()),
    contentTags: z.array(z.string()),
    promptShared: z.boolean(),
    handle: z.string().min(1),
    avatar: publicUrlSchema,
    poster: publicUrlSchema,
    preview: publicUrlSchema,
    video: publicUrlSchema,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    blur: z.string().optional(),
    prompt: z.string().optional(),
    description: z.string().optional(),
    skillUrl: publicUrlSchema.optional(),
    tweetUrl: publicUrlSchema.optional(),
    sourceUrl: publicUrlSchema.optional(),
  })
  .passthrough();
const catalogCardSchema = cardSchema.extend({ sourceUrl: publicUrlSchema });

const fetchHtml = async (url) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(45_000),
    headers: {
      "User-Agent": "MotionVideo-PublicCatalogImporter/1.0",
      Accept: "text/html",
    },
  });
  if (!response.ok) {
    throw new Error(`${url}: HTTP ${response.status}`);
  }
  const html = await response.text();
  if (!html.includes("self.__next_f.push(")) {
    throw new Error(`${url}: missing public Flight payload`);
  }
  return html;
};

// Parse JSON arguments only. Never evaluate scripts obtained from the source site.
const flightText = (html) => {
  const chunks = [];
  for (const match of html.matchAll(
    /<script\b[^>]*>(?<script>[\s\S]*?)<\/script>/giu
  )) {
    const { script } = match.groups;
    const call = script
      .trim()
      .match(/^self\.__next_f\.push\((?<tuple>\[[\s\S]*\])\);?$/u);
    if (!call) {
      continue;
    }
    const [kind, payload] = flightTupleSchema.parse(
      JSON.parse(call.groups.tuple)
    );
    if (kind === 1) {
      chunks.push(stringSchema.parse(payload));
    }
  }
  if (!chunks.length) {
    throw new Error("No public Flight text found");
  }
  return chunks.join("");
};

const cardsFromFlight = (text) => {
  const marker = '"cards":';
  const markerAt = text.indexOf(marker);
  if (markerAt === -1) {
    throw new Error("Homepage cards array not found");
  }
  const start = markerAt + marker.length;
  if (text[start] !== "[") {
    throw new Error("Unexpected cards array format");
  }
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        quoted = false;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === "[") {
      depth += 1;
    } else if (character === "]") {
      depth -= 1;
      if (depth === 0) {
        return z
          .array(cardSchema)
          .min(1)
          .parse(JSON.parse(text.slice(start, index + 1)));
      }
    }
  }
  throw new Error("Unterminated homepage cards array");
};

// Flight text records use UTF-8 byte lengths; prompts can contain literal newlines.
const flightRows = (text) => {
  const bytes = Buffer.from(text);
  const rows = new Map();
  let offset = 0;
  while (offset < bytes.length) {
    const colon = bytes.indexOf(58, offset);
    if (colon === -1) {
      throw new Error("Malformed Flight record");
    }
    const id = bytes.subarray(offset, colon).toString();
    offset = colon + 1;
    if (bytes[offset] === 84) {
      const comma = bytes.indexOf(44, offset);
      if (comma === -1) {
        throw new Error("Malformed Flight text length");
      }
      const size = Number.parseInt(
        bytes.subarray(offset + 1, comma).toString(),
        16
      );
      if (
        !Number.isSafeInteger(size) ||
        size < 0 ||
        comma + 1 + size > bytes.length
      ) {
        throw new Error("Invalid Flight text length");
      }
      offset = comma + 1;
      rows.set(id, bytes.subarray(offset, offset + size).toString());
      offset += size;
    } else {
      const newline = bytes.indexOf(10, offset);
      const end = newline === -1 ? bytes.length : newline;
      const payload = bytes.subarray(offset, end).toString();
      if (/^[[{"\d-]|^(?:null|true|false)$/u.test(payload)) {
        rows.set(id, JSON.parse(payload));
      }
      offset = end + 1;
    }
  }
  return rows;
};

// Yield parsed elements, following only serialized public row references.
const elements = function* elements(value, rows, ancestors = new Set()) {
  const text = stringSchema.safeParse(value);
  if (text.success && rows) {
    const reference = text.data.match(/^\$L?(?<id>[a-f\d]+)$/u);
    if (!reference || !rows.has(reference.groups.id)) {
      return;
    }
    const { id } = reference.groups;
    if (ancestors.has(id)) {
      throw new Error(`Cyclic Flight reference: ${id}`);
    }
    ancestors.add(id);
    yield* elements(rows.get(id), rows, ancestors);
    ancestors.delete(id);
    return;
  }
  const array = valuesSchema.safeParse(value);
  if (array.success) {
    const element = elementSchema.safeParse(value);
    if (element.success) {
      yield element.data;
    }
    for (const child of array.data) {
      yield* elements(child, rows, ancestors);
    }
    return;
  }
  const object = objectSchema.safeParse(value);
  if (object.success) {
    for (const child of Object.values(object.data)) {
      yield* elements(child, rows, ancestors);
    }
  }
};

const skillSectionMetadata = (node, rows, publicString, slug) => {
  let heading;
  const links = [];
  const descriptions = [];
  for (const [, childType, , childProps] of elements(node, rows)) {
    if (childType === "h2") {
      heading = childProps.children;
    }
    const childHref = stringSchema.safeParse(childProps.href);
    if (childType === "a" && childHref.success) {
      links.push(publicUrlSchema.parse(childHref.data));
    }
    const childText = stringSchema.safeParse(childProps.children);
    if (childType === "p" && childText.success) {
      descriptions.push(publicString(childText.data));
    }
  }
  if (heading !== "Skill") {
    return {};
  }
  if (links.length > 1) {
    throw new Error(`${slug}: ambiguous skill links`);
  }
  const [skillUrl] = links;
  return {
    skillUrl,
    description: descriptions.length ? descriptions.join("\n\n") : undefined,
  };
};

const detailMetadata = (html, slug, title) => {
  const rows = flightRows(flightText(html));
  const mains = [];
  // Next serializes an unused not-found main too. Match the published title.
  for (const row of rows.values()) {
    for (const node of elements(row)) {
      const [, type] = node;
      if (type !== "main") {
        continue;
      }
      for (const [, childType, , childProps] of elements(node, rows)) {
        if (childType === "h1" && childProps.children === title) {
          mains.push(node);
          break;
        }
      }
    }
  }
  if (mains.length !== 1) {
    throw new Error(
      `${slug}: expected one public detail main, found ${mains.length}`
    );
  }
  const metadata = {};
  const publicString = (value) => {
    const text = stringSchema.parse(value);
    if (text.startsWith("$$")) {
      return text.slice(1);
    }
    if (/^\$[a-f\d]+$/u.test(text)) {
      return stringSchema.parse(rows.get(text.slice(1)));
    }
    return text;
  };
  const [main] = mains;
  for (const node of elements(main, rows)) {
    const [, type, , props] = node;
    if (props.label === "Copy prompt") {
      metadata.prompt = publicString(props.text);
    }
    const href = stringSchema.safeParse(props.href);
    if (
      type === "a" &&
      href.success &&
      /^https:\/\/(?:x\.com|twitter\.com)\/[^/]+\/status\//u.test(href.data)
    ) {
      if (metadata.tweetUrl && metadata.tweetUrl !== href.data) {
        throw new Error(`${slug}: conflicting original post links`);
      }
      metadata.tweetUrl = publicUrlSchema.parse(href.data);
    }
    if (type !== "section") {
      continue;
    }
    Object.assign(
      metadata,
      skillSectionMetadata(node, rows, publicString, slug)
    );
  }
  return metadata;
};

const validateCatalog = (videos) => {
  const validated = z.array(catalogCardSchema).min(1).parse(videos);
  const seen = new Set();
  for (const { slug } of validated) {
    if (seen.has(slug)) {
      throw new Error(`Duplicate slug: ${slug}`);
    }
    seen.add(slug);
  }
  return validated;
};

const main = async () => {
  const cards = cardsFromFlight(flightText(await fetchHtml(SOURCE)));
  const videos = validateCatalog(
    cards.map((card) => ({
      ...card,
      sourceUrl: new URL(card.slug, SOURCE).href,
    }))
  );
  const failures = [];
  let nextIndex = 0;
  // Exactly three paced workers. Sequential awaits deliberately cap source load.
  const worker = async () => {
    while (nextIndex < videos.length) {
      const video = videos[nextIndex];
      nextIndex += 1;
      const { slug, sourceUrl, title } = video;
      try {
        // One in-flight detail request per worker; never fan out the whole catalog.
        // eslint-disable-next-line no-await-in-loop
        const html = await fetchHtml(sourceUrl);
        Object.assign(video, detailMetadata(html, slug, title));
      } catch (error) {
        const { message } = error;
        failures.push({ slug, sourceUrl, error: message });
      }
      // Pacing is required between requests, not just when all workers finish.
      // eslint-disable-next-line no-await-in-loop
      await pause(250);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  if (failures.length) {
    console.error(
      JSON.stringify(
        { count: videos.length, inaccessibleEntries: failures },
        null,
        2
      )
    );
    throw new Error(
      `${failures.length} detail requests failed; existing catalog left untouched. Rerun after resolving failures.`
    );
  }
  const catalog = {
    source: SOURCE,
    importedAt: new Date().toISOString(),
    videos: validateCatalog(videos),
  };
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        output,
        count: videos.length,
        prompts: videos.filter((video) => video.prompt).length,
        skills: videos.filter((video) => video.skillUrl).length,
        originalPosts: videos.filter((video) => video.tweetUrl).length,
        withoutPublicPrompt: videos
          .filter((video) => !video.prompt)
          .map((video) => video.slug),
        inaccessibleEntries: [],
      },
      null,
      2
    )
  );
};

try {
  await main();
} catch (error) {
  const { message } = error;
  console.error(message);
  process.exitCode = 1;
}
