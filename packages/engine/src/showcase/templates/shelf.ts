import {
  EASES,
  clamp01,
  deg,
  ringOffset,
  smoothstep,
  stepProgress,
} from "../../kit/math.ts";
import type { TemplateDef } from "../types.ts";

// A shelf of cards: the centre card faces the viewer, the others turn in
// towards it on both sides. The shelf holds, then slides one slot along.
export const shelf: TemplateDef = {
  id: "shelf",
  name: "Shelf",
  collection: "carousel",
  description:
    "One card faces you while the rest turn in on both sides, sliding one slot at a time.",
  tier: "free",
  slots: { min: 4, default: 8, max: 16 },
  baseLoopSeconds: 18,
  cardRatio: "4:3",
  cardHeight: 0.92,
  move: "slow-in-slow-out",
  params: [
    {
      type: "range",
      key: "angle",
      label: "Side angle",
      min: 0,
      max: 80,
      step: 1,
      default: 55,
      unit: "°",
    },
    {
      type: "range",
      key: "spacing",
      label: "Side spacing",
      min: 0.1,
      max: 0.8,
      step: 0.01,
      default: 0.3,
    },
    {
      type: "range",
      key: "depth",
      label: "Side depth",
      min: 0,
      max: 1.5,
      step: 0.01,
      default: 0.55,
    },
    {
      type: "range",
      key: "hold",
      label: "Hold",
      min: 0,
      max: 0.9,
      step: 0.01,
      default: 0.55,
    },
  ],
  style: {
    camera: { fov: 30 },
    light: { on: true, shade: 0.45, glare: 0.12 },
    shadow: { opacity: 0.32, softness: 0.5, offset: 0.4 },
  },
  layout: ({ n, p, dir, params, frameW, cardW }) => {
    const angle = deg(Number(params.angle));
    const spacing = Number(params.spacing);
    const depth = Number(params.depth);
    const hold = Number(params.hold);
    // Narrow frames shrink the shelf so the centre card and a peek of its
    // neighbours stay in view.
    const fit = Math.min(1, frameW / (cardW * 1.3));
    const w = cardW * fit;
    // The first side card clears the centre card; the rest stack tighter.
    const first = w * (0.5 + 0.5 * Math.cos(angle) * 0.62 + 0.1);
    const step = w * spacing;
    const head = stepProgress(p, n, hold, EASES.inOutCubic) * dir;
    return Array.from({ length: n }, (_, i) => {
      const o = ringOffset(i, head, n);
      const a = Math.abs(o);
      const side = Math.sign(o);
      const near = Math.min(a, 1);
      const beyond = Math.max(a - 1, 0);
      // Cards crossing the far side of the ring fade instead of jumping.
      const edge = clamp01((n / 2 - a) / 0.75);
      const shown = 1 - smoothstep(3.2, 4.2, a);
      return {
        position: [
          side * (near * first + beyond * step),
          0,
          (-depth * near - beyond * 0.06) * fit,
        ],
        rotation: [0, -side * angle * smoothstep(0, 1, near), 0],
        scale: fit,
        brightness: 1 - 0.14 * near - 0.06 * Math.min(beyond, 3),
        opacity: edge * shown,
      };
    });
  },
};
