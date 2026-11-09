import { EASES, ringOffset, smoothstep, stepProgress } from "../../kit/math.ts";
import type { TemplateDef } from "../types.ts";

// A vertical conveyor: cards rise through the frame one slot at a time and
// the card passing the centre grows and comes forward.
export const lift: TemplateDef = {
  id: "lift",
  name: "Lift",
  collection: "carousel",
  description:
    "A vertical conveyor; the card passing the centre grows and comes forward.",
  tier: "free",
  slots: { min: 5, default: 8, max: 16 },
  baseLoopSeconds: 16,
  cardRatio: "16:10",
  cardHeight: 0.5,
  move: "overshoot-and-settle",
  params: [
    {
      type: "range",
      key: "spacing",
      label: "Spacing",
      min: 0,
      max: 0.8,
      step: 0.01,
      default: 0.18,
    },
    {
      type: "range",
      key: "centre",
      label: "Centre scale",
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
      max: 1.5,
      step: 0.01,
      default: 0.6,
    },
    {
      type: "range",
      key: "hold",
      label: "Hold",
      min: 0,
      max: 0.9,
      step: 0.01,
      default: 0.4,
    },
  ],
  style: {
    camera: { fov: 30 },
    light: { on: true, shade: 0.3, glare: 0.15 },
    shadow: { opacity: 0.3, softness: 0.5, offset: 0.35 },
  },
  layout: ({ n, p, dir, params, frameW, cardW, cardH }) => {
    const spacing = Number(params.spacing);
    const centre = Number(params.centre);
    const depth = Number(params.depth);
    const hold = Number(params.hold);
    // Keep the grown centre card inside narrow frames.
    const fit = Math.min(1, (frameW * 0.86) / (cardW * (1 + centre)));
    const pitch = cardH * fit * (1 + spacing);
    const head = stepProgress(p, n, hold, EASES.outBack) * dir;
    return Array.from({ length: n }, (_, i) => {
      const o = ringOffset(i, head, n);
      const a = Math.abs(o);
      const focus = 1 - smoothstep(0, 1, a);
      // Cards near the far end of the ring fade before they wrap around.
      const edge = 1 - smoothstep(n / 2 - 1.2, n / 2 - 0.3, a);
      return {
        position: [0, -o * pitch, -depth * Math.min(a, 2.5) * 0.5],
        rotation: [-o * 0.08, 0, 0],
        scale: fit * (1 + centre * focus),
        brightness: 0.72 + 0.28 * focus,
        opacity: edge,
        order: Math.round(focus * 10),
      };
    });
  },
};
