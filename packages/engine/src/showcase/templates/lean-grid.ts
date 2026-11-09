import { clamp, deg, wrap } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

const FOV = 34;
// Camera distance for the template's field of view, used to find which part
// of the tilted plane the frame sees.
const CAMERA = 1 / Math.tan(deg(FOV) / 2);
// The grid turns in its own plane before it tips back.
const TURN = deg(-18);
// Cover a little more than the frame, for camera drift and zoom.
const MARGIN = 1.1;
const MAX_CARDS = 64;

// A grid of cards on a plane tipped back in 3D, drifting diagonally. The
// grid wraps around a tile just larger than the visible area, and each loop
// moves it by exactly one tile, so it looks endless and loops cleanly.
export const leanGrid: TemplateDef = {
  id: "lean-grid",
  name: "Lean Grid",
  collection: "stack",
  description: "An endless tilted grid of cards drifting across the frame.",
  tier: "free",
  slots: { min: 4, default: 8, max: 16 },
  baseLoopSeconds: 30,
  cardRatio: "4:3",
  cardHeight: 0.4,
  params: [
    {
      type: "range",
      key: "columns",
      label: "Columns",
      min: 3,
      max: 7,
      step: 1,
      default: 4,
    },
    {
      type: "range",
      key: "tilt",
      label: "Tilt",
      min: 0,
      max: 45,
      step: 1,
      default: 32,
      unit: "°",
    },
    {
      type: "range",
      key: "gap",
      label: "Gap",
      min: 0.04,
      max: 0.4,
      step: 0.01,
      default: 0.12,
    },
    {
      type: "range",
      key: "angle",
      label: "Drift angle",
      min: 0,
      max: 315,
      step: 45,
      default: 45,
      unit: "°",
    },
  ],
  style: {
    camera: { fov: FOV },
    light: { on: true, shade: 0.35 },
    shadow: { opacity: 0.24 },
    depth: { on: true, amount: 0.45, focus: 0.3 },
  },
  layout: ({ n, p, dir, params, frameW, frameH, cardW, cardH }) => {
    const alpha = -deg(Number(params.tilt));
    const gap = Number(params.gap);
    const angle = deg(Number(params.angle));
    const ca = Math.cos(alpha);
    const sa = Math.sin(alpha);
    const ct = Math.cos(TURN);
    const st = Math.sin(TURN);

    // Where the frame corners' camera rays meet the plane, in grid space.
    let u0 = Infinity;
    let u1 = -Infinity;
    let v0 = Infinity;
    let v1 = -Infinity;
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      const x = (sx * frameW * MARGIN) / 2;
      const y = (sy * frameH * MARGIN) / 2;
      // The plane normal is (0, -sin α, cos α); keep far rays finite.
      const t = (CAMERA * ca) / Math.max(0.15 * CAMERA, CAMERA * ca + y * sa);
      const wx = t * x;
      const wy = t * y;
      const wz = CAMERA * (1 - t);
      // Undo the tip (X), then the in-plane turn (Z).
      const py = wy * ca + wz * sa;
      const u = wx * ct + py * st;
      const v = -wx * st + py * ct;
      u0 = Math.min(u0, u);
      u1 = Math.max(u1, u);
      v0 = Math.min(v0, v);
      v1 = Math.max(v1, v);
    }

    // Tall frames size cells as if a little wider, so cards stay readable.
    let pitch = Math.max(frameW, frameH * 0.8) / Number(params.columns);
    let scale = 0;
    let pitchY = 0;
    let cols = 0;
    let rows = 0;
    // The tile is one cell larger than the visible area, so cards wrap out
    // of sight. Cells grow until the tile fits the card budget.
    for (let pass = 0; pass < 6; pass += 1) {
      scale = (pitch * (1 - gap)) / cardW;
      pitchY = cardH * scale + pitch * gap;
      cols = Math.ceil((u1 - u0) / pitch) + 1;
      rows = Math.ceil((v1 - v0) / pitchY) + 1;
      if (cols * rows <= MAX_CARDS) {
        break;
      }
      pitch *= Math.sqrt((cols * rows) / MAX_CARDS);
    }
    const tileW = cols * pitch;
    const tileH = rows * pitchY;
    const startU = u0 - pitch / 2;
    const startV = v0 - pitchY / 2;
    // Whole tiles per loop, so drift angles snap to the eight compass points.
    const driftU = Math.round(Math.cos(angle)) * tileW * p * dir;
    const driftV = Math.round(Math.sin(angle)) * tileH * p * dir;
    // Rows shift the media pattern, so repeats never line up.
    const shift = Math.max(1, Math.round(n * 0.38));

    const poses: CardPose[] = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const u = startU + wrap(c * pitch + driftU, tileW);
        const v = startV + wrap(r * pitchY + driftV, tileH);
        const x = u * ct - v * st;
        const y = u * st + v * ct;
        const z = y * sa;
        poses.push({
          position: [x, y * ca, z],
          rotation: [alpha, 0, TURN],
          scale,
          // Cards fade a little into the distance.
          brightness: 1 - 0.3 * clamp(-z / 2, 0, 1),
          media: wrap(c + r * shift, n),
        });
      }
    }
    return poses;
  },
};
