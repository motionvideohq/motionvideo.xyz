import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

const output = path.resolve(
  process.argv[2] ??
    fileURLToPath(
      new URL("../src/data/resource-directories.json", import.meta.url)
    )
);
const publicUrl = z
  .string()
  .url()
  .refine((value) => {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  });
const entrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  url: publicUrl,
  cover: publicUrl.nullable(),
});
const sources = {
  tools: "https://whatships.com/tools/",
  studios: "https://whatships.com/studios/",
};
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
const plainText = (html) => decodeHtml(html.replaceAll(/<[^>]*>/gu, "")).trim();
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

const cardsFromHtml = (html, source) => {
  const cards = new Map();
  for (const [article] of html.matchAll(
    /<article\b[^>]*>[\s\S]*?<\/article>/gu
  )) {
    const id = attribute(article.match(/^<article\b[^>]*>/u)?.[0] ?? "", "id");
    if (!/^(?:tool|studio|person)-/u.test(id ?? "")) {
      continue;
    }
    const heading = article.match(/<h2\b[^>]*>(?<heading>[\s\S]*?)<\/h2>/u)
      ?.groups.heading;
    const [link] = heading?.match(/<a\b[^>]*>/u) ?? [];
    const href = link ? attribute(link, "href") : null;
    if (!heading || !href) {
      throw new Error(`${source}: missing name or URL for ${id}`);
    }
    const url = new URL(href, source).href;
    if (cards.has(url)) {
      throw new Error(`${source}: duplicate public URL ${url}`);
    }
    const [image] = article.match(/<img\b[^>]*>/u) ?? [];
    const imageSource = image ? attribute(image, "src") : null;
    const description = article.match(
      /<p\b[^>]*class="video-card__location"[^>]*>(?<description>[\s\S]*?)<\/p>/u
    )?.groups.description;
    const category = article.match(
      /<p\b[^>]*class="video-card__kicker"[^>]*>(?<category>[\s\S]*?)<\/p>/u
    )?.groups.category;
    cards.set(url, {
      id: id.replace(/^(?:tool|studio|person)-/u, ""),
      name: plainText(heading),
      description: plainText(description ?? ""),
      category: plainText(category ?? ""),
      cover: imageSource ? new URL(imageSource, source).href : null,
    });
  }
  return cards;
};

const importDirectory = async (source) => {
  const [markdown, html] = await Promise.all([
    fetchPublic(source, "text/markdown"),
    fetchPublic(source, "text/html"),
  ]);
  const listings = Array.from(
    markdown.matchAll(
      /^- \[(?<name>[^\]]+)\]\((?<url>[^)]+)\) — (?<description>.*?) \((?<category>[^)]+)\)$/gmu
    ),
    ({ groups }) => ({
      name: groups.name,
      url: groups.url,
      description: groups.description,
      category: groups.category,
    })
  );
  if (!listings.length) {
    throw new Error(`${source}: no public markdown listings found`);
  }

  const cards = cardsFromHtml(html, source);
  if (cards.size !== listings.length) {
    throw new Error(
      `${source}: HTML has ${cards.size} cards, markdown has ${listings.length} listings`
    );
  }
  const entries = listings.map((listing) => {
    const url = new URL(listing.url).href;
    const card = cards.get(url);
    if (!card) {
      throw new Error(`${source}: no HTML card found for ${listing.name}`);
    }
    for (const key of ["name", "description", "category"]) {
      if (listing[key] !== card[key]) {
        throw new Error(
          `${source}: markdown/HTML ${key} differs for ${listing.name}`
        );
      }
    }
    return entrySchema.parse({
      ...listing,
      id: card.id,
      url,
      cover: card.cover,
    });
  });
  return { source, entries };
};

const [tools, studios] = await Promise.all([
  importDirectory(sources.tools),
  importDirectory(sources.studios),
]);
await mkdir(path.dirname(output), { recursive: true });
await writeFile(
  output,
  `${JSON.stringify({ importedAt: new Date().toISOString(), tools, studios }, null, 2)}\n`
);
console.log(
  `Imported ${tools.entries.length} tools and ${studios.entries.length} studios to ${output}`
);
