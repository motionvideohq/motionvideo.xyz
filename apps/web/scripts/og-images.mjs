// Open Graph images for the product and company pages (moves, templates,
// blog, changelog, docs), rendered at build time: Satori lays the card out
// as SVG, resvg turns it into PNG, sharp blurs the background posters.
// Everything else keeps the main /og.jpg.
//
//   node scripts/og-images.mjs --sample   three samples into .og-cache/samples
//
// Needs static font instances in .og-cache/fonts (Satori can't read the
// variable WOFF2 the site serves): TimelessSans-{400,500,600}.ttf and
// PaperMono-450.ttf.
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".og-cache");
const WIDTH = 1200;
const HEIGHT = 630;

const COLOR = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  muted: "#737373",
  border: "#e5e5e5",
  surface: "#f5f5f5",
  // --primary, oklch(0.852 0.199 91.936)
  primary: "#f7c600",
  primaryInk: "#3d2f00",
};

const readJson = async (file) =>
  JSON.parse(await readFile(path.join(ROOT, file), "utf-8"));

const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

// --- Data ----------------------------------------------------------------

const catalog = await readJson("src/data/motion-catalog.json");
const videosBySlug = new Map(
  catalog.videos.map((video) => [video.slug, video])
);
const { moves } = await readJson("src/data/moves.json");

/** Frontmatter of an MDX file: flat `key: value` and `key:` + `- item` lists. */
const frontmatter = async (file) => {
  const source = await readFile(file, "utf-8");
  const head = source.split("---")[1] ?? "";
  const data = {};
  let list;
  for (const line of head.split("\n")) {
    const item = line.match(/^\s+- (?<value>.+)$/u);
    if (item && list) {
      list.push(item.groups.value.trim());
      continue;
    }
    const pair = line.match(/^(?<key>[a-zA-Z]+):\s*(?<value>.*)$/u);
    if (pair) {
      const value = pair.groups.value
        .trim()
        .replace(/^"(?<inner>.*)"$/u, "$<inner>");
      if (value) {
        data[pair.groups.key] = value;
        list = undefined;
      } else {
        list = [];
        data[pair.groups.key] = list;
      }
    }
  }
  return data;
};

// --- Assets --------------------------------------------------------------

const dataUri = (buffer, type) =>
  `data:${type};base64,${buffer.toString("base64")}`;

/** A poster, downloaded once, as a crisp and a blurred JPEG data URI. */
const poster = async (slug) => {
  const video = videosBySlug.get(slug);
  if (!video) {
    return null;
  }
  const dir = path.join(CACHE, "posters");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${slug}.jpg`);
  if (!(await exists(file))) {
    const response = await fetch(video.poster);
    if (!response.ok) {
      throw new Error(`Poster ${slug}: ${response.status}`);
    }
    await writeFile(
      file,
      await sharp(Buffer.from(await response.arrayBuffer()))
        .resize({ width: 960, height: 540, fit: "cover" })
        .jpeg({ quality: 82 })
        .toBuffer()
    );
  }
  const crisp = await readFile(file);
  const blurred = await sharp(crisp)
    .blur(14)
    .modulate({ brightness: 1.04 })
    .jpeg({ quality: 70 })
    .toBuffer();
  return {
    crisp: dataUri(crisp, "image/jpeg"),
    blurred: dataUri(blurred, "image/jpeg"),
  };
};

const logomark = async () => {
  const source = await readFile(
    path.join(ROOT, "src/components/logomark.tsx"),
    "utf-8"
  );
  const { d } = source.match(/\bd="(?<d>[^"]+)"/u).groups;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="12 12 1242 587"><path fill="${COLOR.foreground}" d="${d}"/></svg>`;
  return dataUri(Buffer.from(svg), "image/svg+xml");
};

const font = (file) => readFile(path.join(CACHE, "fonts", file));

const fonts = async () => [
  { name: "Timeless", data: await font("TimelessSans-400.ttf"), weight: 400 },
  { name: "Timeless", data: await font("TimelessSans-500.ttf"), weight: 500 },
  { name: "Timeless", data: await font("TimelessSans-600.ttf"), weight: 600 },
  { name: "Paper Mono", data: await font("PaperMono-450.ttf"), weight: 400 },
];

// --- Template ------------------------------------------------------------

// Satori takes React-element-shaped objects; `h` builds them without JSX.
const h = (type, style, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.flat() },
});
const img = (src, style) => ({ type: "img", props: { src, style } });

const clip = (text, max) =>
  text.length <= max ? text : `${text.slice(0, max).replace(/\s+\S*$/u, "")}…`;

/** A poster card: rounded, bordered, with a soft shadow. */
const card = (src, { width, rotate, x, y, z = 0, opacity = 1 }) =>
  h(
    "div",
    {
      position: "absolute",
      left: x,
      top: y,
      width,
      height: Math.round((width * 9) / 16),
      borderRadius: 18,
      overflow: "hidden",
      border: `1px solid ${COLOR.border}`,
      boxShadow: "0 24px 48px -12px rgba(0,0,0,0.22)",
      transform: `rotate(${rotate}deg)`,
      opacity,
      zIndex: z,
    },
    img(src, { width: "100%", height: "100%", objectFit: "cover" })
  );

/** A code card in Paper Mono, for pages without imagery (docs). */
const codeCard = (lines, label, { width, rotate, x, y }) =>
  h(
    "div",
    {
      position: "absolute",
      left: x,
      top: y,
      width,
      zIndex: 2,
      flexDirection: "column",
      borderRadius: 18,
      overflow: "hidden",
      background: COLOR.background,
      border: `1px solid ${COLOR.border}`,
      boxShadow: "0 24px 48px -12px rgba(0,0,0,0.22)",
      transform: `rotate(${rotate}deg)`,
    },
    h(
      "div",
      {
        alignItems: "center",
        gap: 8,
        padding: "14px 20px",
        borderBottom: `1px solid ${COLOR.border}`,
        background: COLOR.surface,
        color: COLOR.muted,
        fontFamily: "Paper Mono",
        fontSize: 18,
      },
      ...["#e5e5e5", "#e5e5e5", "#e5e5e5"].map((color) =>
        h("div", {
          width: 12,
          height: 12,
          borderRadius: 999,
          background: color,
        })
      ),
      h("div", { marginLeft: 10 }, label)
    ),
    h(
      "div",
      {
        flexDirection: "column",
        padding: "22px 24px",
        fontFamily: "Paper Mono",
        fontSize: 21,
        lineHeight: 1.6,
        color: COLOR.foreground,
      },
      ...lines.map((line) => h("div", { whiteSpace: "pre" }, line || " "))
    )
  );

// --- Layouts -------------------------------------------------------------
// Three to compare; each takes the same page data. Only what makes the card
// stand out: the section, the title, the page's own imagery.

const brandRow = (mark, eyebrow) =>
  h(
    "div",
    { alignItems: "center", gap: 16 },
    img(mark, { width: 64, height: 30 }),
    h(
      "div",
      {
        padding: "6px 16px",
        borderRadius: 999,
        background: COLOR.primary,
        color: COLOR.primaryInk,
        fontSize: 22,
        fontWeight: 500,
      },
      eyebrow
    )
  );

const titleText = (title, size, style = {}) =>
  h(
    "div",
    {
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1.04,
      letterSpacing: "-0.035em",
      ...style,
    },
    title
  );

const canvas = (...children) =>
  h(
    "div",
    {
      position: "relative",
      width: WIDTH,
      height: HEIGHT,
      background: COLOR.background,
      fontFamily: "Timeless",
      color: COLOR.foreground,
      overflow: "hidden",
    },
    ...children
  );

/** The page's own front element: a crisp poster or a code card. */
const frontNode = (front, placement) =>
  front.kind === "code"
    ? codeCard(front.lines, front.label, placement)
    : card(front.src, { z: 2, ...placement });

/** A: text left, card stack right. */
const split = async ({ eyebrow, title, description, front, behind }) =>
  canvas(
    h(
      "div",
      { position: "absolute", left: 560, top: 0, width: 640, height: HEIGHT },
      ...behind.slice(0, 2).map((src, index) =>
        card(src, {
          width: 400,
          rotate: index === 0 ? 8 : -10,
          x: index === 0 ? 250 : 40,
          y: index === 0 ? 40 : 360,
        })
      ),
      frontNode(front, { width: 500, rotate: -3, x: 90, y: 165 })
    ),
    h(
      "div",
      {
        position: "absolute",
        left: 72,
        top: 64,
        bottom: 64,
        width: 480,
        flexDirection: "column",
        justifyContent: "space-between",
      },
      brandRow(await logomark(), eyebrow),
      h(
        "div",
        { flexDirection: "column", gap: 20, marginBottom: 40 },
        titleText(title, title.length > 32 ? 54 : 64),
        h(
          "div",
          {
            display: "block",
            fontSize: 24,
            lineHeight: 1.4,
            color: COLOR.muted,
            lineClamp: 2,
          },
          clip(description, 140)
        )
      )
    )
  );

/** B: the main OG image's look: centred title, blurred cards all around. */
const centred = async ({ eyebrow, title, behind, scatter }) => {
  const spots = [
    { width: 300, rotate: -8, x: 40, y: 40 },
    { width: 260, rotate: 6, x: 880, y: 30 },
    { width: 320, rotate: 7, x: -40, y: 400 },
    { width: 300, rotate: -6, x: 900, y: 410 },
    { width: 220, rotate: 3, x: 470, y: -90 },
    { width: 240, rotate: -4, x: 480, y: 540 },
  ];
  return canvas(
    ...[...behind, ...scatter]
      .slice(0, spots.length)
      .map((src, index) => card(src, spots[index])),
    h(
      "div",
      {
        position: "absolute",
        inset: 0,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      },
      brandRow(await logomark(), eyebrow),
      titleText(title, title.length > 32 ? 68 : 84, {
        maxWidth: 780,
        textAlign: "center",
        justifyContent: "center",
      })
    )
  );
};

/** C: a big title bottom-left, the page's own card huge and off the edge. */
const bleed = async ({ eyebrow, title, front, behind }) =>
  canvas(
    card(behind[0], { width: 520, rotate: 10, x: 760, y: -120 }),
    frontNode(front, { width: 680, rotate: -7, x: 600, y: 170 }),
    h(
      "div",
      {
        position: "absolute",
        left: 72,
        top: 64,
        bottom: 72,
        width: 560,
        flexDirection: "column",
        justifyContent: "space-between",
      },
      brandRow(await logomark(), eyebrow),
      titleText(title, title.length > 32 ? 64 : 88)
    )
  );

const LAYOUTS = { split, centred, bleed };

const render = async (tree) => {
  const svg = await satori(tree, {
    width: WIDTH,
    height: HEIGHT,
    fonts: await fonts(),
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
    .render()
    .asPng();
};

// --- Poster picks ---------------------------------------------------------

const posters = async (slugs) => {
  const found = await Promise.all(slugs.map(poster));
  return found.filter(Boolean);
};

// How vivid a "rrggbb" colour is: HSV saturation times value, 0 to 1, so
// dark tints (high saturation, low value) score low.
const vividness = (hex) => {
  const [r, g, b] = [0, 2, 4].map(
    (i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255
  );
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : ((max - min) / max) * max;
};

// The most colourful landscape posters (by their dominant colour, the first
// in `colors`), one per creator: the blurred layer reads as colour.
const VIVID = catalog.videos
  .map((video) => ({
    video,
    score: video.colors?.[0] ? vividness(video.colors[0]) : 0,
  }))
  .filter(({ video, score }) => score > 0.45 && video.width > video.height)
  .toSorted((a, b) => b.score - a.score)
  .filter(
    ({ video }, index, list) =>
      list.findIndex((item) => item.video.handle === video.handle) === index
  )
  .map(({ video }) => video.slug);

/** `count` vivid posters, picked by `seed` so each page gets its own set. */
const fillerSlugs = (seed, exclude, count) => {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.codePointAt(0)) % 9973;
  }
  const pool = VIVID.filter((slug) => !exclude.includes(slug));
  return Array.from(
    { length: Math.min(count, pool.length) },
    (_, i) => pool[(hash + i) % pool.length]
  );
};

// --- Page kinds ----------------------------------------------------------
// Each returns the page's data for a layout: section, title, description,
// its own front element, blurred posters behind, and more for scattering.

const crispOf = async (slug) => {
  const found = await poster(slug);
  return found?.crisp;
};

const moveData = async (move) => {
  const own = (move.examples ?? []).slice(0, 2);
  const fill = await posters(fillerSlugs(move.slug, own, 6));
  const ownPosters = await posters(own);
  return {
    eyebrow: "Move",
    title: move.name,
    description: move.summary,
    front: { kind: "poster", src: ownPosters[0].crisp },
    behind: [...ownPosters.slice(1), ...fill].map((item) => item.blurred),
    scatter: fill.map((item) => item.blurred),
  };
};

const blogData = async (post) => {
  const own = [
    post.cover,
    ...(post.videos ?? []).filter((slug) => slug !== post.cover),
  ];
  const ownPosters = await posters(own.slice(0, 3));
  const fill = await posters(fillerSlugs(post.title, own, 6));
  return {
    eyebrow: "Blog",
    title: post.title,
    description: post.description,
    front: { kind: "poster", src: await crispOf(post.cover) },
    behind: [...ownPosters.slice(1), ...fill].map((item) => item.blurred),
    scatter: fill.map((item) => item.blurred),
  };
};

// The code each docs page is about, shown on its card.
const DOCS_SNIPPETS = {
  index: ["npx skills add", "  motionvideohq/skill"],
  mcp: [
    '"motionvideo": {',
    '  "url": "https://mcp',
    '    .motionvideo.xyz/mcp"',
    "}",
  ],
  skill: ["$ npx skills add", "  git@github.com:", "  motionvideohq/skill"],
  moves: ["search-moves", '  { "query": "spring" }'],
  templates: ["{{concept}} · {{palette}}", "{{length}} · {{size}}"],
  plans: ["Pro       $9 / mo", "Business  $29 / mo"],
  api: ["GET /api/catalog/", "GET /api/moves/"],
};

const docsData = async (slug, page) => {
  const fill = await posters(fillerSlugs(slug, [], 6));
  return {
    eyebrow: "Docs",
    title: page.title,
    description: page.description,
    front: {
      kind: "code",
      lines: DOCS_SNIPPETS[slug] ?? [],
      label: slug === "index" ? "quickstart" : slug,
    },
    behind: fill.map((item) => item.blurred),
    scatter: fill.slice(2).map((item) => item.blurred),
  };
};

// --- Run -----------------------------------------------------------------

const samples = async () => {
  const out = path.join(CACHE, "samples");
  await mkdir(out, { recursive: true });
  const blogDir = path.join(ROOT, "content/blog");
  const [firstPost] = await readdir(blogDir);
  const pages = {
    move: await moveData(moves[0]),
    blog: await blogData(await frontmatter(path.join(blogDir, firstPost))),
    docs: await docsData(
      "mcp",
      await frontmatter(path.join(ROOT, "content/docs/mcp.mdx"))
    ),
  };
  // One image at a time: each render holds a full-size bitmap in memory.
  for (const [kind, data] of Object.entries(pages)) {
    for (const [name, layoutFn] of Object.entries(LAYOUTS)) {
      // oxlint-disable-next-line no-await-in-loop -- sequential, see above
      const png = await render(await layoutFn(data));
      // oxlint-disable-next-line no-await-in-loop -- sequential, see above
      await writeFile(path.join(out, `${kind}-${name}.png`), png);
    }
  }
  console.log(`Wrote ${Object.keys(pages).length * 3} samples to ${out}`);
};

if (process.argv.includes("--sample")) {
  await samples();
}
