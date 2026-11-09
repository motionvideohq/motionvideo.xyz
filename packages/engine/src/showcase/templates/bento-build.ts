import {
  TAU,
  clamp,
  clamp01,
  lerp,
  seeded,
  shuffled,
  smoothstep,
} from "../../kit/math.ts";
import type { Ease } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A damped spring from 0 to 1: starts at rest, overshoots about 13% and
 * settles. The residual is faded out so it lands exactly on 1.
 */
const spring: Ease = (t) => {
  const k = 7;
  const w = 11;
  const rest = Math.exp(-k * t) * (Math.cos(w * t) + (k / w) * Math.sin(w * t));
  return 1 - rest * (1 - t ** 4);
};

const THIRDS = [1 / 3, 1 / 2, 2 / 3];
/** Longest side over shortest side a tile may have, so none is a sliver. */
const MAX_ASPECT = 2.6;

/** Splits a rect at `ratio` across its width (`across`) or its height. */
const split = (r: Rect, ratio: number, across: boolean): [Rect, Rect] =>
  across
    ? [
        { x: r.x, y: r.y, w: r.w * ratio, h: r.h },
        { x: r.x + r.w * ratio, y: r.y, w: r.w * (1 - ratio), h: r.h },
      ]
    : [
        { x: r.x, y: r.y + r.h * (1 - ratio), w: r.w, h: r.h * ratio },
        { x: r.x, y: r.y, w: r.w, h: r.h * (1 - ratio) },
      ];

/**
 * A bento layout of `n` tiles filling a `width` × `height` box centred on the
 * origin. "mosaic" keeps splitting the largest tile on thirds and halves,
 * "hero" first gives one tile most of the box, "columns" stacks tiles of
 * varied heights in columns.
 */
const bento = (
  n: number,
  width: number,
  height: number,
  variant: string,
  seed: number
): Rect[] => {
  const rand = seeded(seed);
  const box: Rect = { x: -width / 2, y: -height / 2, w: width, h: height };
  if (variant === "columns") {
    const cols = clamp(Math.round(Math.sqrt((n * width) / height)), 1, n);
    const widths = Array.from({ length: cols }, () => 0.8 + 0.4 * rand());
    const totalW = widths.reduce((a, b) => a + b, 0);
    const counts = Array.from(
      { length: cols },
      (_, c) => Math.floor(n / cols) + (c < n % cols ? 1 : 0)
    );
    const order = shuffled(cols, seed + 1);
    const out: Rect[] = [];
    let { x } = box;
    for (let c = 0; c < cols; c += 1) {
      const w = (widths[c] / totalW) * width;
      const k = counts[order[c]];
      const heights = Array.from({ length: k }, () => 0.6 + 0.8 * rand());
      const totalH = heights.reduce((a, b) => a + b, 0);
      let { y } = box;
      for (const h of heights) {
        out.push({ x, y, w, h: (h / totalH) * height });
        y += (h / totalH) * height;
      }
      x += w;
    }
    return out;
  }

  const done: Rect[] = [];
  let open: Rect[] = [box];
  if (variant === "hero" && n > 1) {
    const [hero, rest] = split(box, 0.56 + 0.06 * rand(), box.w >= box.h);
    done.push(hero);
    open = [rest];
  }
  while (done.length + open.length < n) {
    let big = 0;
    for (let i = 1; i < open.length; i += 1) {
      if (open[i].w * open[i].h > open[big].w * open[big].h) {
        big = i;
      }
    }
    const r = open[big];
    const aspect = r.w / r.h;
    const across = aspect > 1.2 || (aspect > 0.83 && rand() < 0.5);
    // Thirds and halves, skipping any that would cut a sliver.
    const fits = THIRDS.filter((ratio) =>
      split(r, ratio, across).every(
        (c) => Math.max(c.w / c.h, c.h / c.w) <= MAX_ASPECT
      )
    );
    const pick = fits.length > 0 ? fits : [0.5];
    const ratio = pick[Math.floor(rand() * pick.length)];
    open.splice(big, 1, ...split(r, ratio, across));
  }
  return [...done, ...open];
};

// Bento tiles of mixed sizes hold a layout, swap places, reshuffle into a new
// layout, then scatter and spring back together into the first one.
export const bentoBuild: TemplateDef = {
  id: "bento-build",
  name: "Bento Build",
  collection: "stack",
  description: "Bento tiles assemble, swap places and spring into new layouts.",
  tier: "free",
  slots: { min: 3, default: 6, max: 10 },
  baseLoopSeconds: 12,
  cardRatio: "4:3",
  cardHeight: 0.5,
  params: [
    {
      type: "select",
      key: "variant",
      label: "Layout",
      options: [
        { value: "mosaic", label: "Mosaic" },
        { value: "hero", label: "Hero" },
        { value: "columns", label: "Columns" },
      ],
      default: "mosaic",
    },
    {
      type: "range",
      key: "gap",
      label: "Gap",
      min: 0.01,
      max: 0.12,
      step: 0.005,
      default: 0.045,
    },
    {
      type: "range",
      key: "hold",
      label: "Hold",
      min: 0.2,
      max: 0.7,
      step: 0.01,
      default: 0.45,
    },
  ],
  style: {
    camera: { fov: 30 },
    cards: { radius: 0.06 },
    light: { on: true, shade: 0.3, glare: 0.1 },
    shadow: { opacity: 0.22 },
  },
  move: "spring-animation",
  layout: ({ n, p, params, frameW, frameH, cardW, cardH, seed }) => {
    const variant = String(params.variant);
    const gap = Number(params.gap);
    const hold = Number(params.hold);
    const width = frameW * 0.84;
    const height = frameH * 0.8;

    const first = bento(n, width, height, variant, seed);
    // Swap: the same tiles trade places, nobody stays put.
    const perm = shuffled(n, seed + 7);
    for (let i = 0; i < n; i += 1) {
      if (perm[i] === i) {
        const j = (i + 1) % n;
        [perm[i], perm[j]] = [perm[j], perm[i]];
      }
    }
    const layouts = [
      first,
      perm.map((j) => first[j]),
      bento(n, width, height, variant, seed + 13),
    ];

    const rand = seeded(seed + 29);
    const tiles = Array.from({ length: n }, () => ({
      lift: 0.1 + 0.14 * rand(),
      spinZ: (rand() - 0.5) * 0.8,
      push: 0.25 + 0.3 * rand(),
    }));
    const delays = shuffled(n, seed + 3);

    const seg = Math.min(2, Math.floor(p * 3));
    const t = clamp01((p * 3 - seg - hold) / (1 - hold));
    const from = layouts[seg];
    const to = layouts[(seg + 1) % 3];
    // The whole board sways slowly, for a little depth.
    const gx = -0.08;
    const gy = 0.12 * Math.sin(TAU * p);
    const cx = Math.cos(gx);
    const sx = Math.sin(gx);
    const cy = Math.cos(gy);
    const sy = Math.sin(gy);

    return Array.from({ length: n }, (_, i): CardPose => {
      const ti = clamp01((t - (n > 1 ? (delays[i] / (n - 1)) * 0.3 : 0)) / 0.7);
      const a = from[i];
      const b = to[i];
      let x: number;
      let y: number;
      let z = 0;
      let w: number;
      let h: number;
      let rot: [number, number, number] = [0, 0, 0];
      let opacity = 1;

      if (seg < 2) {
        const e = spring(ti);
        const arc = Math.sin(Math.PI * ti);
        const ax = a.x + a.w / 2;
        const ay = a.y + a.h / 2;
        const bx = b.x + b.w / 2;
        const by = b.y + b.h / 2;
        x = lerp(ax, bx, e);
        y = lerp(ay, by, e);
        w = lerp(a.w, b.w, e);
        h = lerp(a.h, b.h, e);
        z = arc * tiles[i].lift;
        rot = [
          -arc * 0.2 * Math.sign(by - ay),
          arc * 0.25 * Math.sign(bx - ax),
          0,
        ];
      } else {
        // Scatter from the last layout, then spring back into the first.
        const out = ti < 0.5;
        const r = out ? a : b;
        const rx = r.x + r.w / 2;
        const ry = r.y + r.h / 2;
        const len = Math.hypot(rx, ry) || 1;
        const e = out ? (ti * 2) ** 3 : 1 - spring((ti - 0.5) * 2);
        const push = e * tiles[i].push;
        x = rx + (rx / len) * push;
        y = ry + (ry / len) * push;
        w = r.w * (1 - 0.25 * e);
        h = r.h * (1 - 0.25 * e);
        z = -0.6 * e;
        rot = [0, 0, tiles[i].spinZ * e];
        opacity = out
          ? 1 - smoothstep(0.4, 1, e)
          : smoothstep(0, 0.35, (ti - 0.5) * 2);
      }

      // Lean the board: sway (Y), then tip (X).
      const zx = -x * sy + z * cy;
      return {
        position: [x * cy + z * sy, y * cx - zx * sx, y * sx + zx * cx],
        rotation: [gx + rot[0], gy + rot[1], rot[2]],
        stretch: [
          Math.max(0.05, w - gap) / cardW,
          Math.max(0.05, h - gap) / cardH,
        ],
        opacity,
        media: i,
      };
    });
  },
};
