import { TAU, clamp, deg } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

const FOV = 30;
// Camera distance for the template's field of view, used to fit the barrel.
const CAMERA = 1 / Math.tan(deg(FOV) / 2);
const GAP = 0.14;
/** Screen-space position of `v` at depth `z`, relative to z = 0. */
const project = (v: number, z: number) => (v * CAMERA) / (CAMERA - z);

// Rows of cards wrapped around a vertical cylinder that makes one full turn
// per loop. Tall frames get extra rows, so the barrel grows taller and
// narrower instead of shrinking.
export const barrel: TemplateDef = {
  id: "barrel",
  name: "Barrel",
  collection: "orbit",
  description: "Rows of cards wrapped around a turning cylinder.",
  tier: "free",
  slots: { min: 12, default: 20, max: 40 },
  baseLoopSeconds: 20,
  cardRatio: "4:3",
  cardHeight: 0.42,
  params: [
    {
      type: "range",
      key: "rows",
      label: "Rows",
      min: 1,
      max: 4,
      step: 1,
      default: 2,
    },
    {
      type: "range",
      key: "radius",
      label: "Radius",
      min: 0.9,
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
      default: 10,
      unit: "°",
    },
    {
      type: "range",
      key: "backFade",
      label: "Back fade",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.6,
    },
  ],
  style: {
    camera: { fov: FOV },
    light: { on: true, shade: 0.45 },
    shadow: { opacity: 0.2 },
  },
  move: "orbiting-shapes",
  layout: ({ n, p, dir, params, frameW, frameH, cardW, cardH }) => {
    const aspect = frameW / frameH;
    // Tall frames get extra rows: one when square-ish, two when portrait.
    const extra = Number(aspect < 1.2) + Number(aspect < 0.75);
    const rows = Math.min(6, Number(params.rows) + extra);
    const perRow = Math.max(6, Math.ceil(n / rows));
    const radius = ((perRow * cardW * (1 + GAP)) / TAU) * Number(params.radius);
    const tilt = deg(Number(params.tilt));
    const backFade = Number(params.backFade);
    const rowH = cardH * (1 + GAP);

    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    // Screen extents of the barrel with its front at z = 0: the widest card
    // edge, and the top and bottom of the front and back of the rims.
    let halfW = 0;
    for (let s = 0; s <= 24; s += 1) {
      const a = (s / 24) * Math.PI;
      const x = radius * Math.sin(a) + (cardW / 2) * Math.cos(a);
      const z = radius * Math.cos(a) - (cardW / 2) * Math.sin(a) - radius;
      halfW = Math.max(halfW, project(x, z));
    }
    let top = -Infinity;
    let bottom = Infinity;
    for (const y of [(rows * rowH) / 2, (-rows * rowH) / 2]) {
      for (const zl of [radius, -radius]) {
        const v = project(y * cos - zl * sin, y * sin + zl * cos - radius);
        top = Math.max(top, v);
        bottom = Math.min(bottom, v);
      }
    }
    const k = clamp(
      Math.min((0.44 * frameW) / halfW, (0.84 * frameH) / (top - bottom)),
      0.3,
      1.3
    );
    // Perspective makes the front rim larger, so re-centre vertically.
    const lift = -(top + bottom) / 2;

    const poses: CardPose[] = [];
    for (let r = 0; r < rows; r += 1) {
      const y = (r - (rows - 1) / 2) * rowH;
      for (let j = 0; j < perRow; j += 1) {
        // Odd rows sit half a card over, like bricks.
        const a = ((j + (r % 2) * 0.5) / perRow) * TAU + p * TAU * dir;
        const x = Math.sin(a) * radius;
        const z = Math.cos(a) * radius;
        // 1 facing the camera, 0 at the far side.
        const facing = (Math.cos(a) + 1) / 2;
        poses.push({
          position: [
            x * k,
            (y * cos - z * sin + lift) * k,
            (y * sin + z * cos - radius) * k,
          ],
          // XYZ Euler: turn around the barrel (Y), then tilt it (X).
          rotation: [tilt, a, 0],
          scale: k,
          brightness: 1 - backFade * 0.65 * (1 - facing),
          opacity: 1 - backFade * 0.45 * (1 - facing),
          media: r * perRow + j,
        });
      }
    }
    return poses;
  },
};
