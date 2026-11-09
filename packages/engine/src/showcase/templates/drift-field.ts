import { TAU, deg, seeded } from "../../kit/math.ts";
import type { TemplateDef } from "../types.ts";

// Cards float at different depths, bobbing and turning gently, while the
// whole field sways around its centre. Every motion is a whole sine cycle
// per loop, so the clip loops cleanly.
export const driftField: TemplateDef = {
  id: "drift-field",
  name: "Drift Field",
  collection: "depth",
  description: "Cards float at different depths, bobbing gently with parallax.",
  tier: "free",
  slots: { min: 5, default: 10, max: 24 },
  baseLoopSeconds: 14,
  cardRatio: "4:3",
  cardHeight: 0.5,
  move: "moving-hold",
  params: [
    {
      type: "range",
      key: "spread",
      label: "Spread",
      min: 0.5,
      max: 1.4,
      step: 0.01,
      default: 1,
    },
    {
      type: "range",
      key: "float",
      label: "Float",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
    },
    {
      type: "range",
      key: "rotation",
      label: "Rotation",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.45,
    },
    {
      type: "range",
      key: "depth",
      label: "Depth",
      min: 0,
      max: 3,
      step: 0.01,
      default: 1.6,
    },
  ],
  style: {
    camera: { fov: 30 },
    depth: { on: true, amount: 0.4, focus: 0.2 },
    light: { on: true, shade: 0.35, glare: 0.2 },
    shadow: { opacity: 0.26, softness: 0.6, offset: 0.4 },
  },
  layout: ({ n, p, params, frameW, frameH, cardW, cardH, seed }) => {
    const spread = Number(params.spread);
    const float = Number(params.float);
    const rotation = Number(params.rotation);
    const depth = Number(params.depth);
    const rand = seeded(seed * 4099 + 7);
    // A jittered grid keeps cards from piling on each other.
    const aspect = frameW / frameH;
    const cols = Math.max(1, Math.round(Math.sqrt(n * aspect)));
    const rows = Math.ceil(n / cols);
    const cellW = (frameW * 0.92 * spread) / cols;
    const cellH = (frameH * 0.92 * spread) / rows;
    const scale = Math.min(1, (cellW * 0.95) / cardW, (cellH * 1.1) / cardH);
    const sway = deg(9) * rotation * Math.sin(TAU * p);
    return Array.from({ length: n }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jx = (rand() - 0.5) * cellW * 0.35;
      const jy = (rand() - 0.5) * cellH * 0.35;
      const z = -rand() * depth;
      const phase = rand();
      const tilt = rand() * 2 - 1;
      const x0 = (col - (cols - 1) / 2) * cellW + jx;
      const y0 = ((rows - 1) / 2 - row) * cellH + jy;
      // Sway the field around its centre (a turn about Y).
      const x = x0 * Math.cos(sway) - z * Math.sin(sway);
      const zz = x0 * Math.sin(sway) + z * Math.cos(sway);
      const bob = float * 0.08 * Math.sin(TAU * (p + phase));
      return {
        position: [x, y0 + bob, zz],
        rotation: [
          rotation * deg(10) * Math.sin(TAU * (p + phase + 0.25)),
          sway + rotation * deg(16) * tilt * Math.cos(TAU * (p + phase)),
          rotation * deg(4) * tilt,
        ],
        scale: scale * (1 + z * 0.04),
      };
    });
  },
};
