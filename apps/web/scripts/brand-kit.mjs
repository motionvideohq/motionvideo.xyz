// Builds the brand kit in public/brand: the wordmark and lockup as outlined
// SVGs, PNGs of every logo, the zip of all of them, and
// src/data/brand-kit.json (the zip's weight, shown on the brand page). Rerun
// after changing the logomark, the font or a color:
//
//   pnpm brand:kit
//
// The wordmark is "MotionVideo" as the header sets it: Timeless Sans
// SemiBold, tight tracking. Satori outlines the type, so the files don't
// need the font installed; it reads the static instance in
// .og-cache/fonts/TimelessSans-600.ttf (see og-images.mjs).
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { Resvg } from "@resvg/resvg-js";
import { zipSync } from "fflate";
import satori from "satori";

const ROOT = path.join(import.meta.dirname, "..");
const BRAND = path.join(ROOT, "public", "brand");
const MANIFEST = path.join(ROOT, "src", "data", "brand-kit.json");
const FONT = path.join(ROOT, ".og-cache", "fonts", "TimelessSans-600.ttf");
const ZIP = "motionvideo-brand-assets.zip";

const NAME = "MotionVideo";
const INK = { black: "#000000", white: "#FFFFFF" };
// The logomark's own viewBox (LOGOMARK_PATH in src/components/logo.tsx).
const MARK_BOX = { x: 12, y: 12, width: 1242, height: 587 };

// Type is laid out at this size; the header's 16px scaled up.
const FONT_SIZE = 200;
// The header's `tracking-tight` and the Logotype's line box.
const TRACKING = -0.025;
const LINE_HEIGHT = 1.2;

const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

if (!(await exists(FONT))) {
  console.error(
    `brand:kit: missing ${path.relative(ROOT, FONT)}. Make the static ` +
      "instance from public/fonts/timeless (fonttools varLib.instancer, " +
      "wght=600) first."
  );
  process.exit(1);
}

const markSvg = await readFile(
  path.join(BRAND, "motionvideo-logomark-black.svg"),
  "utf-8"
);
const markPath = markSvg.match(/ d="(?<d>[^"]+)"/u)?.groups?.d;
if (!markPath) {
  console.error("brand:kit: no path in motionvideo-logomark-black.svg");
  process.exit(1);
}

const round = (value) => Math.round(value * 100) / 100;

/** The wordmark's glyph outlines, in a FONT_SIZE × line-box frame. */
const wordmarkPaths = async () => {
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          fontFamily: "Timeless Sans",
          fontSize: FONT_SIZE,
          fontWeight: 600,
          letterSpacing: `${TRACKING}em`,
          lineHeight: LINE_HEIGHT,
          color: "#000",
        },
        children: NAME,
      },
    },
    {
      width: FONT_SIZE * NAME.length,
      height: FONT_SIZE * LINE_HEIGHT,
      fonts: [
        {
          name: "Timeless Sans",
          data: await readFile(FONT),
          weight: 600,
          style: "normal",
        },
      ],
    }
  );
  const paths = [...svg.matchAll(/<path[^>]* d="(?<d>[^"]+)"/gu)].map(
    (match) => match.groups.d
  );
  if (paths.length === 0) {
    throw new Error("Satori returned no glyph outlines");
  }
  return paths;
};

const glyphs = await wordmarkPaths();

/** An SVG cropped to its drawing, with the viewBox resvg measures. */
const cropped = (body) => {
  const loose = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10000 -10000 30000 30000">${body}</svg>`;
  const box = new Resvg(loose).getBBox();
  if (!box) {
    throw new Error("Empty drawing");
  }
  const viewBox = [box.x, box.y, box.width, box.height].map(round).join(" ");
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>\n`,
    aspect: box.width / box.height,
  };
};

const wordmark = (fill) =>
  cropped(glyphs.map((d) => `<path fill="${fill}" d="${d}"/>`).join(""));

// The header's Logo: a 1em-tall logomark, centred on the type's line box,
// then a 0.5em gap and the name.
const lockup = (fill) => {
  const markHeight = FONT_SIZE;
  const scale = markHeight / MARK_BOX.height;
  const markWidth = MARK_BOX.width * scale;
  const markTop = (FONT_SIZE * LINE_HEIGHT - markHeight) / 2;
  const mark = `<path fill="${fill}" transform="translate(${round(-MARK_BOX.x * scale)} ${round(markTop - MARK_BOX.y * scale)}) scale(${round(scale * 1e4) / 1e4})" d="${markPath}"/>`;
  const name = `<g transform="translate(${round(markWidth + FONT_SIZE * 0.5)} 0)">${glyphs
    .map((d) => `<path fill="${fill}" d="${d}"/>`)
    .join("")}</g>`;
  return cropped(mark + name);
};

// Every file as bytes: written to public/brand and zipped as they are.
const files = new Map();
const encoder = new TextEncoder();

const addSvg = (name, svg) => {
  files.set(name, encoder.encode(svg));
};
const addPng = (name, svg, width) => {
  const image = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  files.set(name, image.render().asPng());
};

for (const [tone, fill] of Object.entries(INK)) {
  const word = wordmark(fill);
  addSvg(`motionvideo-wordmark-${tone}.svg`, word.svg);
  addPng(`motionvideo-wordmark-${tone}.png`, word.svg, 1600);

  const lock = lockup(fill);
  addSvg(`motionvideo-lockup-${tone}.svg`, lock.svg);
  addPng(`motionvideo-lockup-${tone}.png`, lock.svg, 2400);
}

// The logomarks and the app icon are drawn by hand; only their PNGs are made
// here.
const drawn = [
  ...["black", "white", "yellow"].map((tone) => `motionvideo-logomark-${tone}`),
  "motionvideo-app-icon",
];
const drawnSvgs = await Promise.all(
  drawn.map((name) => readFile(path.join(BRAND, `${name}.svg`), "utf-8"))
);
for (const [index, name] of drawn.entries()) {
  const svg = drawnSvgs[index];
  addSvg(`${name}.svg`, svg);
  addPng(`${name}.png`, svg, name === "motionvideo-app-icon" ? 1024 : 1200);
}

await Promise.all(
  [...files].map(([name, data]) => writeFile(path.join(BRAND, name), data))
);

const zip = zipSync(Object.fromEntries(files), { level: 9 });
await writeFile(path.join(BRAND, ZIP), zip);

await writeFile(
  MANIFEST,
  `${JSON.stringify({ zip: { bytes: zip.byteLength } }, null, 2)}\n`
);
console.log(
  `brand:kit: ${files.size} files and ${ZIP} (${Math.round(zip.byteLength / 1024)} KB) in public/brand`
);
