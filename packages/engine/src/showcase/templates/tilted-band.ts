import { TAU, deg } from "../../kit/math.ts";
import type { TemplateDef } from "../types.ts";

// A tilted ring of cards turning around the centre. Cards face outwards and
// the ring makes one full turn per loop.
export const tiltedBand: TemplateDef = {
  id: "tilted-band",
  name: "Tilted Band",
  collection: "orbit",
  description: "A tilted ring of cards turning around the centre.",
  tier: "free",
  slots: { min: 6, default: 12, max: 24 },
  baseLoopSeconds: 16,
  cardRatio: "4:3",
  cardHeight: 0.42,
  params: [
    {
      type: "range",
      key: "tilt",
      label: "Ring tilt",
      min: -40,
      max: 40,
      step: 1,
      default: 14,
      unit: "°",
    },
    {
      type: "range",
      key: "radius",
      label: "Radius",
      min: 0.5,
      max: 2,
      step: 0.01,
      default: 1,
    },
    {
      type: "range",
      key: "gap",
      label: "Gap",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.18,
    },
    {
      type: "range",
      key: "backFade",
      label: "Back fade",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.45,
    },
  ],
  style: { camera: { fov: 32 }, light: { on: true, shade: 0.5 } },
  layout: ({ n, p, dir, params, cardW }) => {
    const tilt = deg(Number(params.tilt));
    const gap = Number(params.gap);
    // Radius fits n cards with the requested gap, then the user's scale.
    const radius = ((cardW * (1 + gap) * n) / TAU) * Number(params.radius);
    const backFade = Number(params.backFade);
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * TAU + p * TAU * dir;
      const x = Math.sin(a) * radius;
      const z = Math.cos(a) * radius;
      // Tilt the whole ring around the X axis.
      const y = -z * Math.sin(tilt);
      const zt = z * Math.cos(tilt);
      const facing = (Math.cos(a) + 1) / 2;
      // XYZ Euler: turn the card around the ring (Y), then tilt the ring (X).
      return {
        position: [x, y, zt - radius * 0.35],
        rotation: [tilt, a, 0],
        brightness: 1 - backFade * 0.55 * (1 - facing),
      };
    });
  },
};
