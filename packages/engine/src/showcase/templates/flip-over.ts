import { EASES, stepProgress } from "../../kit/math.ts";
import type { TemplateDef } from "../types.ts";

// One card flips over to reveal the next media on its other side. The media
// swaps at the halfway point, when the card is edge-on, so the back never
// shows a mirrored image.
export const flipOver: TemplateDef = {
  id: "flip-over",
  name: "Flip Over",
  collection: "sequence",
  description: "A card flips over to reveal the next one on its back.",
  tier: "free",
  slots: { min: 2, default: 6, max: 16 },
  baseLoopSeconds: 14,
  cardRatio: "4:3",
  cardHeight: 1.25,
  move: "anticipation",
  params: [
    {
      type: "select",
      key: "axis",
      label: "Flip axis",
      options: [
        { value: "vertical", label: "Vertical" },
        { value: "horizontal", label: "Horizontal" },
      ],
      default: "vertical",
    },
    {
      type: "range",
      key: "hold",
      label: "Hold",
      min: 0.2,
      max: 0.9,
      step: 0.01,
      default: 0.6,
    },
    {
      type: "range",
      key: "lean",
      label: "Lean",
      min: -25,
      max: 25,
      step: 1,
      default: 8,
      unit: "°",
    },
    {
      type: "range",
      key: "lift",
      label: "Lift",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.45,
    },
  ],
  style: {
    camera: { fov: 30 },
    light: { on: true, shade: 0.5, glare: 0.35 },
    shadow: { opacity: 0.34, softness: 0.6, offset: 0.45 },
  },
  layout: ({ n, p, dir, params, frameW, frameH, cardW, cardH }) => {
    const vertical = params.axis !== "horizontal";
    const hold = Number(params.hold);
    const lean = (Number(params.lean) * Math.PI) / 180;
    const lift = Number(params.lift);
    const scale = Math.min(1, (frameW * 0.78) / cardW, (frameH * 0.78) / cardH);
    const head = stepProgress(p, n, hold, EASES.inOutCubic);
    const k = Math.floor(head);
    const f = head - k;
    const flipped = f >= 0.5;
    const angle = (flipped ? f - 1 : f) * Math.PI * dir;
    const pop = Math.sin(f * Math.PI);
    return [
      {
        position: [0, 0, pop * lift * 0.6],
        rotation: vertical ? [lean * 0.4, angle, 0] : [angle, lean, 0],
        scale: scale * (1 - pop * 0.04),
        media: (flipped ? k + 1 : k) % n,
      },
    ];
  },
};
