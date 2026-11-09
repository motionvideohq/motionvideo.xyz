import { TAU, deg, seeded, smoothstep, wrap } from "../../kit/math.ts";
import type { TemplateDef } from "../types.ts";

const FOV = 32;
// Camera distance for the template's field of view.
const CAMERA = 1 / Math.tan(deg(FOV) / 2);
const FAR = -9;
const NEAR = CAMERA - 1.4;

// The camera glides through a field of floating cards: each card drifts
// from the distance towards the viewer and slips past the edge of the frame,
// then starts again at the back, so the field never runs out.
export const cameraGlide: TemplateDef = {
  id: "camera-glide",
  name: "Camera Glide",
  collection: "depth",
  description: "Glide past a field of floating cards that drift towards you.",
  tier: "free",
  slots: { min: 8, default: 16, max: 32 },
  baseLoopSeconds: 20,
  cardRatio: "4:3",
  cardHeight: 0.42,
  params: [
    {
      type: "range",
      key: "spread",
      label: "Spread",
      min: 0.5,
      max: 1.5,
      step: 0.01,
      default: 1,
    },
    {
      type: "range",
      key: "sway",
      label: "Sway",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.35,
    },
    {
      type: "range",
      key: "turn",
      label: "Card turn",
      min: 0,
      max: 40,
      step: 1,
      default: 14,
      unit: "°",
    },
  ],
  style: {
    camera: { fov: FOV },
    depth: { on: true, amount: 0.35, focus: 0.35 },
    shadow: { opacity: 0.18 },
    light: { on: true, shade: 0.3 },
  },
  layout: ({ n, p, dir, params, frameW, frameH, seed }) => {
    const spread = Number(params.spread);
    const sway = Number(params.sway);
    const turn = deg(Number(params.turn));
    const rand = seeded(seed * 7919 + 13);
    return Array.from({ length: n }, (_, i) => {
      // Cards keep a ring around the centre so none flies into the lens.
      const angle = rand() * TAU;
      const radius = 0.38 + rand() * 0.62;
      const phase = rand();
      const spin = rand() * 2 - 1;
      const t = wrap(i / n + p * dir, 1);
      const z = FAR + t * (NEAR - FAR);
      // Screen-space placement: scale by distance so far cards still spread.
      const reach = (CAMERA - z) / CAMERA;
      const bob = sway * 0.12 * Math.sin(TAU * (p + phase));
      const x = Math.cos(angle) * radius * (frameW / 2) * spread * reach;
      const y = Math.sin(angle) * radius * (frameH / 2) * spread * reach + bob;
      return {
        position: [x, y, z],
        rotation: [
          spin * turn * 0.4,
          -Math.sign(x) * turn * (0.5 + 0.5 * radius),
          spin * turn * 0.2,
        ],
        opacity: smoothstep(0, 0.12, t) * (1 - smoothstep(0.86, 1, t)),
      };
    });
  },
};
