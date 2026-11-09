import { EASES, stepProgress } from "../../kit/math.ts";
import type { TemplateDef } from "../types.ts";

// One large card at a time: each new card slides in and pushes the previous
// one out of frame. Media cycles through the card count, so the loop ends on
// the card it started with.
export const pushThrough: TemplateDef = {
  id: "push-through",
  name: "Push Through",
  collection: "sequence",
  description:
    "One card at a time; each new card pushes the last one out of frame.",
  tier: "free",
  slots: { min: 2, default: 6, max: 16 },
  baseLoopSeconds: 15,
  cardRatio: "16:10",
  cardHeight: 1.3,
  move: "ease-out-entrance",
  params: [
    {
      type: "select",
      key: "from",
      label: "Push from",
      options: [
        { value: "right", label: "Right" },
        { value: "bottom", label: "Bottom" },
      ],
      default: "right",
    },
    {
      type: "range",
      key: "hold",
      label: "Hold",
      min: 0.2,
      max: 0.9,
      step: 0.01,
      default: 0.62,
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
  ],
  style: {
    camera: { fov: 30 },
    light: { on: true, shade: 0.25, glare: 0.18, sweep: false },
    shadow: { opacity: 0.32, softness: 0.55, offset: 0.4 },
  },
  layout: ({ n, p, dir, params, frameW, frameH, cardW, cardH }) => {
    const vertical = params.from === "bottom";
    const hold = Number(params.hold);
    const depth = Number(params.depth);
    const scale = Math.min(1, (frameW * 0.8) / cardW, (frameH * 0.8) / cardH);
    const head = stepProgress(p, n, hold, EASES.inOutQuint);
    const k = Math.floor(head);
    const f = head - k;
    // Far enough that the card fully leaves the frame.
    const travel = vertical
      ? frameH / 2 + (cardH * scale) / 2 + 0.1
      : frameW / 2 + (cardW * scale) / 2 + 0.1;
    const sign = dir;
    const at = (offset: number): [number, number, number] =>
      vertical ? [0, -offset * sign, 0] : [offset * sign, 0, 0];
    const outgoing = at(-f * travel);
    const incoming = at((1 - f) * travel);
    return [
      {
        position: [outgoing[0], outgoing[1], -depth * f],
        rotation: vertical ? [-0.25 * f * sign, 0, 0] : [0, 0.3 * f * sign, 0],
        scale: scale * (1 - 0.12 * f),
        brightness: 1 - 0.35 * f,
        media: k % n,
        order: 0,
      },
      {
        position: [incoming[0], incoming[1], 0],
        scale,
        media: (k + 1) % n,
        order: 1,
      },
    ];
  },
};
