import { EASES, TAU, clamp, clamp01, deg, seeded } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

const STAGGER = 0.07;
// A tilt and a slow sway give the flat fan some depth.
const LEAN = deg(-12);
const SWAY = deg(9);

/**
 * How far card `rank` (0 bottom, 1 top) is fanned out at loop time `p`: open
 * for the first third, then a staggered close, a short closed beat and a
 * springy reopen, so the clip starts and ends fully open.
 */
const openness = (p: number, rank: number) => {
  if (p < 0.34) {
    return 1;
  }
  if (p < 0.6) {
    const t = (p - 0.34 - (1 - rank) * STAGGER) / (0.22 - STAGGER);
    return 1 - EASES.inOutCubic(clamp01(t));
  }
  const t = (p - 0.62 - rank * STAGGER) / (0.24 - STAGGER);
  return EASES.outBack(clamp01(t));
};

interface FanLayout {
  n: number;
  spread: number;
  pivot: number;
  overlap: number;
  corner: boolean;
  cardW: number;
  cardH: number;
}

/** Card centre and roll at a given openness, around the fan's pivot. */
const fanPose = (s: FanLayout, i: number, open: number, jitter: number) => {
  const u = s.n > 1 ? i / (s.n - 1) : 0.5;
  const reach = s.pivot * s.cardH;
  // Below full overlap, cards also slide apart instead of only rotating.
  const slide = s.cardW * (1 - s.overlap) * open;
  if (s.corner) {
    const theta = -u * s.spread * open + jitter * (1 - open);
    const arm = s.cardW * 0.38;
    const c = Math.cos(theta);
    const sn = Math.sin(theta);
    return [
      -arm + arm * c - reach * sn + u * (s.n - 1) * slide * 0.3,
      -reach + arm * sn + reach * c,
      theta,
    ] as const;
  }
  const theta = (0.5 - u) * s.spread * open + jitter * (1 - open);
  return [
    -reach * Math.sin(theta) + (u - 0.5) * (s.n - 1) * slide * 0.45,
    -reach + reach * Math.cos(theta),
    theta,
  ] as const;
};

// Cards fan out around a pivot like a hand of cards, hold, fold back into a
// stack and spring open again.
export const handFan: TemplateDef = {
  id: "hand-fan",
  name: "Hand Fan",
  collection: "stack",
  description: "Cards fan out from a pivot, fold back and spring open again.",
  tier: "free",
  slots: { min: 3, default: 7, max: 14 },
  baseLoopSeconds: 8,
  cardRatio: "4:3",
  cardHeight: 0.62,
  params: [
    {
      type: "range",
      key: "spread",
      label: "Spread",
      min: 30,
      max: 180,
      step: 1,
      default: 100,
      unit: "°",
    },
    {
      type: "range",
      key: "pivot",
      label: "Pivot distance",
      min: 0.5,
      max: 2.5,
      step: 0.05,
      default: 1.3,
    },
    {
      type: "range",
      key: "overlap",
      label: "Overlap",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.8,
    },
    {
      type: "select",
      key: "anchor",
      label: "Pivot",
      options: [
        { value: "bottom", label: "Bottom centre" },
        { value: "corner", label: "Corner" },
      ],
      default: "bottom",
    },
  ],
  style: {
    camera: { fov: 28 },
    light: { on: true, shade: 0.4, glare: 0.12 },
    shadow: { opacity: 0.32, softness: 0.5 },
  },
  move: "overshoot-and-settle",
  layout: ({ n, p, params, frameW, frameH, cardW, cardH, seed }) => {
    const fan: FanLayout = {
      n,
      // Tall frames get a narrower fan, so the cards can stay large.
      spread:
        deg(Number(params.spread)) * clamp((frameW / frameH) * 1.15, 0.6, 1),
      pivot: Number(params.pivot),
      overlap: Number(params.overlap),
      corner: params.anchor === "corner",
      cardW,
      cardH,
    };
    const rand = seeded(seed);
    // A closed stack is never perfectly square: each card keeps a small roll.
    const jitters = Array.from({ length: n }, () => (rand() - 0.5) * deg(7));

    // Frame the fan by its closed and fully open (with overshoot) extents.
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const open of [0, 1.06]) {
      for (let i = 0; i < n; i += 1) {
        const [x, y, theta] = fanPose(fan, i, open, jitters[i]);
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        for (const [dx, dy] of [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ]) {
          const px = (dx * cardW) / 2;
          const py = (dy * cardH) / 2;
          const wx = x + px * c - py * s;
          const wy = y + px * s + py * c;
          minX = Math.min(minX, wx);
          maxX = Math.max(maxX, wx);
          minY = Math.min(minY, wy);
          maxY = Math.max(maxY, wy);
        }
      }
    }
    const k = clamp(
      Math.min((0.8 * frameW) / (maxX - minX), (0.8 * frameH) / (maxY - minY)),
      0.2,
      1.6
    );
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const breathe = 1 + 0.035 * Math.sin(TAU * p * 2);
    const sway = SWAY * Math.sin(TAU * p);
    const ca = Math.cos(LEAN);
    const sa = Math.sin(LEAN);
    const cb = Math.cos(sway);
    const sb = Math.sin(sway);
    return Array.from({ length: n }, (_, i): CardPose => {
      const rank = n > 1 ? i / (n - 1) : 1;
      const open = openness(p, rank) * breathe;
      const [x, y, theta] = fanPose(fan, i, open, jitters[i]);
      const lx = (x - cx) * k;
      const ly = (y - cy) * k;
      // The corner fan keeps its first card on top, like a swatch book.
      const order = fan.corner ? n - i : i;
      const lz = order * 0.01 * k;
      // Sway (Y) then lean (X), matching the XYZ Euler of the rotation.
      const zx = -lx * sb + lz * cb;
      return {
        position: [lx * cb + lz * sb, ly * ca - zx * sa, ly * sa + zx * ca],
        rotation: [LEAN, sway, theta],
        scale: k,
        order,
      };
    });
  },
};
