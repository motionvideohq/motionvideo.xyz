import { EASES, TAU, deg, stepProgress } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

/** Where the back windows sit, as fractions of the front window's size. */
const BACK = [
  { x: -0.56, y: 0.22, z: -0.9, ry: 22 },
  { x: 0.58, y: -0.18, z: -1.1, ry: -24 },
  { x: -0.4, y: -0.3, z: -1.6, ry: 16 },
  { x: 0.42, y: 0.32, z: -1.9, ry: -18 },
];

// A large browser window front and centre steps through your screens, with
// more windows angled behind it. Everything drifts on whole sine cycles.
export const browserHero: TemplateDef = {
  id: "browser-hero",
  name: "Browser Hero",
  collection: "device",
  description:
    "A large browser window steps through your screens, more windows angled behind.",
  tier: "free",
  slots: { min: 2, default: 5, max: 12 },
  baseLoopSeconds: 16,
  cardRatio: "16:10",
  cardHeight: 1.05,
  move: "slow-in-slow-out",
  params: [
    {
      type: "range",
      key: "back",
      label: "Back windows",
      min: 0,
      max: 4,
      step: 1,
      default: 2,
    },
    {
      type: "range",
      key: "hold",
      label: "Hold",
      min: 0.2,
      max: 0.9,
      step: 0.01,
      default: 0.7,
    },
    {
      type: "range",
      key: "tilt",
      label: "Tilt",
      min: -20,
      max: 20,
      step: 1,
      default: 6,
      unit: "°",
    },
  ],
  style: {
    camera: { fov: 30, drift: 0.3 },
    cards: { frame: "browser", frameTone: "dark", radius: 0.02 },
    light: { on: true, shade: 0.3, glare: 0.15 },
    shadow: { opacity: 0.38, softness: 0.7, offset: 0.5 },
    depth: { on: true, amount: 0.3, focus: 0 },
  },
  layout: ({ n, p, params, frameW, frameH, cardW, cardH }) => {
    const backCount = Number(params.back);
    const hold = Number(params.hold);
    const tilt = deg(Number(params.tilt));
    const scale = Math.min(1, (frameW * 0.74) / cardW, (frameH * 0.74) / cardH);
    const w = cardW * scale;
    const h = cardH * scale;
    const head = stepProgress(p, n, hold, EASES.inOutCubic);
    const k = Math.floor(head);
    const f = head - k;
    const poses: CardPose[] = BACK.slice(0, backCount).map((b, i) => ({
      position: [b.x * w, b.y * h + 0.03 * Math.sin(TAU * (p + i * 0.3)), b.z],
      rotation: [
        tilt * 0.6,
        deg(b.ry) + deg(3) * Math.sin(TAU * (p + i * 0.2)),
        0,
      ],
      scale: scale * 0.8,
      brightness: 0.78,
      media: (k + 2 + i) % n,
      order: -1 - i,
    }));
    // The front window: the current screen, and the next one rising into
    // its place over the step.
    const sway: [number, number, number] = [
      tilt,
      deg(4) * Math.sin(TAU * p),
      0,
    ];
    poses.push(
      {
        position: [0, -f * 0.08, 0.02 - f * 0.25],
        rotation: sway,
        scale: scale * (1 - 0.05 * f),
        opacity: 1 - f,
        media: k % n,
        order: 1,
      },
      {
        position: [0, (1 - f) * -0.12, 0.04],
        rotation: sway,
        scale: scale * (0.96 + 0.04 * f),
        opacity: f,
        media: (k + 1) % n,
        order: 2,
      }
    );
    return poses;
  },
};
