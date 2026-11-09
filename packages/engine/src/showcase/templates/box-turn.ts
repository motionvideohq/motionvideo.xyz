import { EASES, deg, stepProgress } from "../../kit/math.ts";
import type { TemplateDef } from "../types.ts";

/** Which media a face shows: front, next, (hidden) back, previous. */
const FACE_OFFSET = [0, 1, 2, -1];

// Cards on the four sides of a box that turns a quarter at a time. Each face
// takes its next media while it's on the hidden back, so every media item
// gets its turn at the front.
export const boxTurn: TemplateDef = {
  id: "box-turn",
  name: "Box Turn",
  collection: "sequence",
  description: "Cards on the sides of a box that turns a quarter at a time.",
  tier: "pro",
  slots: { min: 3, default: 6, max: 16 },
  baseLoopSeconds: 15,
  cardRatio: "4:3",
  cardHeight: 0.95,
  params: [
    {
      type: "range",
      key: "hold",
      label: "Hold",
      min: 0.2,
      max: 0.9,
      step: 0.01,
      default: 0.55,
    },
    {
      type: "range",
      key: "box",
      label: "Box depth",
      min: 0.4,
      max: 1.6,
      step: 0.01,
      default: 1,
    },
    {
      type: "range",
      key: "tilt",
      label: "Tilt",
      min: -30,
      max: 30,
      step: 1,
      default: 12,
      unit: "°",
    },
  ],
  style: {
    camera: { fov: 30 },
    light: { on: true, shade: 0.7, glare: 0.25 },
    shadow: { on: false },
    cards: { radius: 0.02 },
  },
  layout: ({ n, p, dir, params, frameW, frameH, cardW, cardH }) => {
    const hold = Number(params.hold);
    const tilt = deg(Number(params.tilt));
    const scale = Math.min(1, (frameW * 0.62) / cardW, (frameH * 0.62) / cardH);
    const w = cardW * scale;
    // Distance from the box's axis to each face.
    const apothem = (w / 2) * Number(params.box);
    const head = stepProgress(p, n, hold, EASES.inOutCubic);
    const k = Math.floor(head);
    const turn = head * deg(90) * dir;
    return FACE_OFFSET.map((_, face) => {
      const rel = (((face - k) % 4) + 4) % 4;
      const theta = face * deg(90) * dir - turn;
      const x = Math.sin(theta) * apothem;
      const z = Math.cos(theta) * apothem;
      // Tilt the whole box about X around its centre (0, 0, -apothem).
      return {
        position: [x, -z * Math.sin(tilt), z * Math.cos(tilt) - apothem],
        rotation: [tilt, theta, 0],
        scale,
        media: (((k + FACE_OFFSET[rel]) % n) + n) % n,
        opacity: rel === 2 ? 0 : 1,
      };
    });
  },
};
