import { smoothstep, wrap } from "../../kit/math.ts";
import type { TemplateDef } from "../types.ts";

// Cards ride a gentle arc across the frame: they rise in from one side,
// grow and come forward at the apex, then fall away on the other side.
export const curveRail: TemplateDef = {
  id: "curve-rail",
  name: "Curve Rail",
  collection: "carousel",
  description:
    "Cards glide along a gentle arc and grow as they pass over the top.",
  tier: "free",
  slots: { min: 4, default: 8, max: 16 },
  baseLoopSeconds: 18,
  cardRatio: "4:3",
  cardHeight: 0.5,
  move: "arc-motion",
  params: [
    {
      type: "range",
      key: "arc",
      label: "Arc height",
      min: 0,
      max: 1.5,
      step: 0.01,
      default: 0.7,
    },
    {
      type: "range",
      key: "spacing",
      label: "Spacing",
      min: 1,
      max: 2,
      step: 0.01,
      default: 1.3,
    },
    {
      type: "range",
      key: "tilt",
      label: "Tilt",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.6,
    },
  ],
  style: {
    camera: { fov: 32 },
    light: { on: true, shade: 0.35, glare: 0.1 },
    shadow: { opacity: 0.3, softness: 0.5 },
  },
  layout: ({ n, p, dir, params, frameW, cardW }) => {
    const arc = Number(params.arc);
    const spacing = Number(params.spacing);
    const tilt = Number(params.tilt);
    // Narrow frames shrink the cards so a few still share the arc.
    const fit = Math.min(1, frameW / (cardW * 2.4));
    const w = cardW * fit;
    const apex = 0.38;
    // The rail is always longer than the frame, so cards wrap out of view.
    const gap = Math.max(spacing * w, (frameW + 2.6 * w * (1 + apex)) / n);
    // Curvature is set against a minimum width so narrow frames see a
    // flatter slice of the arc; the visible slice is centred vertically.
    const half = Math.max(frameW / 2, 1.2);
    const edgeU = frameW / 2 / half;
    const lift = (edgeU * edgeU) / 2;
    const bend = 0.6;
    return Array.from({ length: n }, (_, i) => {
      const s = wrap(i / n + p * dir, 1) - 0.5;
      const x = s * n * gap;
      const u = x / half;
      const y = arc * (lift - u * u);
      const z = bend * (lift - u * u);
      // Tangent of the rail in the xy and xz planes.
      const slopeY = (-2 * arc * u) / half;
      const slopeZ = (-2 * bend * u) / half;
      const bump = Math.exp(-u * u * 2.2);
      return {
        position: [x, y, z],
        rotation: [0, -Math.atan(slopeZ) * 0.8, Math.atan(slopeY) * tilt],
        scale: fit * (1 + apex * bump),
        brightness: 0.78 + 0.22 * bump,
        opacity: 1 - smoothstep(0.42, 0.5, Math.abs(s)),
      };
    });
  },
};
