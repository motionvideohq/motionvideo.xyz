import { EASES, clamp01, deg, lerp, stepProgress } from "../../kit/math.ts";
import type { TemplateDef } from "../types.ts";

// A laptop lid swings open from closed, holds on a screen, closes, then opens on
// the next one. The card turns about its bottom edge, which stays put like a
// hinge; the screen changes while the laptop is closed.
export const laptopOpen: TemplateDef = {
  id: "laptop-open",
  name: "Laptop Open",
  collection: "device",
  description: "A laptop opens on each of your screens in turn.",
  tier: "pro",
  slots: { min: 2, default: 5, max: 12 },
  baseLoopSeconds: 18,
  cardRatio: "16:10",
  cardHeight: 1.15,
  move: "overshoot-and-settle",
  params: [
    {
      type: "range",
      key: "open",
      label: "Open angle",
      min: 60,
      max: 105,
      step: 1,
      default: 92,
      unit: "°",
    },
    {
      type: "range",
      key: "hold",
      label: "Hold",
      min: 0.2,
      max: 0.8,
      step: 0.01,
      default: 0.5,
    },
    {
      type: "range",
      key: "height",
      label: "Camera height",
      min: -10,
      max: 35,
      step: 1,
      default: 14,
      unit: "°",
    },
  ],
  style: {
    camera: { fov: 30 },
    cards: { frame: "laptop", frameTone: "dark", radius: 0.01 },
    light: { on: true, shade: 0.5, glare: 0.3 },
    shadow: { opacity: 0.35, softness: 0.6, offset: 0.2 },
  },
  layout: ({ n, p, params, frameW, frameH, cardW, cardH }) => {
    const open = deg(Number(params.open));
    const hold = Number(params.hold);
    const camera = deg(Number(params.height));
    const scale = Math.min(1, (frameW * 0.78) / cardW, (frameH * 0.72) / cardH);
    const h = cardH * scale;
    // Each media gets one step: open, hold, close.
    const head = stepProgress(p, n, 0, EASES.linear);
    const k = Math.floor(head);
    const f = head - k;
    const swing = (1 - hold) / 2;
    const opening = EASES.outBack(clamp01(f / swing));
    const closing = EASES.inOutCubic(clamp01((f - (1 - swing)) / swing));
    const amount = opening - closing;
    // Closed, the lid lies face down towards the viewer (+90°); open, it
    // stands `open` degrees up from there, reclining past upright.
    const lid = lerp(deg(90), deg(90) - open, amount);
    // The hinge sits low in the frame; the card's centre swings around it.
    const hinge: [number, number, number] = [0, -h * 0.42, 0];
    const y = hinge[1] + (h / 2) * Math.cos(lid);
    const z = hinge[2] + (h / 2) * Math.sin(lid);
    // Camera height: turn the whole scene about X around the hinge.
    const cy =
      hinge[1] + (y - hinge[1]) * Math.cos(camera) - z * Math.sin(camera);
    const cz = (y - hinge[1]) * Math.sin(camera) + z * Math.cos(camera);
    return [
      {
        position: [0, cy, cz],
        rotation: [lid + camera, 0, 0],
        scale,
        brightness: 0.55 + 0.45 * clamp01(amount),
        media: k % n,
      },
    ];
  },
};
