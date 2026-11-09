import { EASES, TAU, deg, stepProgress } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

// Phone screens circle a centre phone on a tilted ring. The centre phone
// steps through the media while the ring makes whole turns per loop.
export const phoneOrbit: TemplateDef = {
  id: "phone-orbit",
  name: "Phone Orbit",
  collection: "device",
  description:
    "Phone screens circle a centre phone that steps through your screens.",
  tier: "free",
  slots: { min: 4, default: 7, max: 13 },
  baseLoopSeconds: 18,
  cardRatio: "9:16",
  cardHeight: 1.25,
  move: "arc-motion",
  params: [
    {
      type: "range",
      key: "ring",
      label: "Ring size",
      min: 0.6,
      max: 1.6,
      step: 0.01,
      default: 1,
    },
    {
      type: "range",
      key: "tilt",
      label: "Ring tilt",
      min: -30,
      max: 30,
      step: 1,
      default: 14,
      unit: "°",
    },
    {
      type: "range",
      key: "turns",
      label: "Ring turns",
      min: 1,
      max: 3,
      step: 1,
      default: 1,
    },
    {
      type: "range",
      key: "hold",
      label: "Hold",
      min: 0.2,
      max: 0.9,
      step: 0.01,
      default: 0.65,
    },
  ],
  style: {
    camera: { fov: 30 },
    cards: { frame: "phone", frameTone: "dark" },
    light: { on: true, shade: 0.4, glare: 0.3 },
    shadow: { opacity: 0.3, softness: 0.6, offset: 0.35 },
  },
  layout: ({ n, p, dir, params, frameW, frameH, cardW, cardH }) => {
    const tilt = deg(Number(params.tilt));
    const turns = Number(params.turns);
    const hold = Number(params.hold);
    const scale = Math.min(1, (frameH * 0.62) / cardH, (frameW * 0.36) / cardW);
    const ringCount = n - 1;
    const radius = Math.min(frameW * 0.42, frameH * 0.75) * Number(params.ring);
    const head = stepProgress(p, n, hold, EASES.inOutCubic);
    const k = Math.floor(head);
    const f = head - k;
    const poses: CardPose[] = Array.from({ length: ringCount }, (_, i) => {
      const a = (i / ringCount) * TAU + p * TAU * turns * dir;
      const x = Math.sin(a) * radius;
      const z = Math.cos(a) * radius;
      return {
        position: [
          x,
          -z * Math.sin(tilt) * 0.6,
          z * Math.cos(tilt) - radius * 0.3,
        ],
        // Ring phones keep facing the viewer as they travel.
        rotation: [0, -a * 0.15, 0],
        scale: scale * 0.48,
        brightness: 0.75 + 0.25 * ((Math.cos(a) + 1) / 2),
        media: 1 + i,
      };
    });
    // The centre phone turns a half circle to change screens, swapping at
    // the edge-on midpoint so the change is never seen.
    const spin = (f < 0.5 ? f : f - 1) * Math.PI * dir;
    poses.push({
      position: [0, 0, 0.15],
      rotation: [0, deg(5) * Math.sin(TAU * p) + spin, 0],
      scale,
      media: (f < 0.5 ? k : k + 1) % n,
      order: 5,
    });
    return poses;
  },
};
