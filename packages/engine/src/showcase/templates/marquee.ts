import { deg, wrap } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

// Rows of cards scrolling edge to edge, alternate rows running the other
// way. The whole wall can be turned on the frame; rows are long enough to
// cover the frame's diagonal, so a turned wall never shows an empty corner.
export const marquee: TemplateDef = {
  id: "marquee",
  name: "Marquee",
  collection: "carousel",
  description:
    "Rows of cards scroll across the frame, alternate rows in opposite directions.",
  tier: "free",
  slots: { min: 4, default: 10, max: 24 },
  baseLoopSeconds: 24,
  cardRatio: "4:3",
  cardHeight: 0.5,
  move: "staggered-timing",
  params: [
    {
      type: "range",
      key: "rows",
      label: "Rows",
      min: 2,
      max: 4,
      step: 1,
      default: 3,
    },
    {
      type: "range",
      key: "tilt",
      label: "Wall tilt",
      min: -30,
      max: 30,
      step: 1,
      default: -10,
      unit: "°",
    },
    {
      type: "range",
      key: "gap",
      label: "Gap",
      min: 0,
      max: 0.6,
      step: 0.01,
      default: 0.1,
    },
    {
      type: "toggle",
      key: "alternate",
      label: "Alternate rows",
      default: true,
    },
  ],
  style: {
    camera: { fov: 30 },
    shadow: { opacity: 0.22, softness: 0.4, offset: 0.25 },
  },
  layout: ({ n, p, dir, params, frameW, frameH, cardW, cardH }) => {
    const rows = Number(params.rows);
    const tilt = deg(Number(params.tilt));
    const gap = Number(params.gap);
    const alternate = Boolean(params.alternate);
    // The wall covers the frame's diagonal so turning it leaves no gaps.
    const span = Math.hypot(frameW, frameH) * 1.08;
    const scale = span / rows / (cardH * (1 + gap));
    const pitchX = cardW * scale * (1 + gap);
    const pitchY = cardH * scale * (1 + gap);
    // At least the visible span plus one card each side, so wrapping is
    // always off screen.
    const perRow = Math.max(n, Math.ceil(span / pitchX) + 2);
    const period = perRow * pitchX;
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    const poses: CardPose[] = [];
    for (let r = 0; r < rows; r += 1) {
      const rowDir = alternate && r % 2 === 1 ? -dir : dir;
      // Rows start staggered by half a card so columns don't line up.
      const shift = p * period * rowDir + (r % 2) * pitchX * 0.5;
      const y = ((rows - 1) / 2 - r) * pitchY;
      for (let c = 0; c < perRow; c += 1) {
        const x = wrap(c * pitchX + shift, period) - period / 2;
        poses.push({
          position: [x * cos - y * sin, x * sin + y * cos, 0],
          rotation: [0, 0, tilt],
          scale,
          media: r * perRow + c,
        });
      }
    }
    return poses;
  },
};
