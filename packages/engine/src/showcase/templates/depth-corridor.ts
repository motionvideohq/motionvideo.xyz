import { deg, smoothstep, wrap } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

const FOV = 40;
const CAMERA = 1 / Math.tan(deg(FOV) / 2);

// Walls of cards lining a corridor the viewer flies down. Cards travel
// towards the camera and re-enter at the far end, so the corridor is
// endless.
export const depthCorridor: TemplateDef = {
  id: "depth-corridor",
  name: "Depth Corridor",
  collection: "depth",
  description: "Fly down a corridor lined with your cards.",
  tier: "pro",
  slots: { min: 8, default: 16, max: 32 },
  baseLoopSeconds: 18,
  cardRatio: "4:3",
  cardHeight: 0.6,
  params: [
    {
      type: "select",
      key: "walls",
      label: "Walls",
      options: [
        { value: "2", label: "Left and right" },
        { value: "4", label: "All four" },
      ],
      default: "2",
    },
    {
      type: "range",
      key: "width",
      label: "Width",
      min: 0.6,
      max: 1.6,
      step: 0.01,
      default: 1,
    },
    {
      type: "range",
      key: "open",
      label: "Wall angle",
      min: 0,
      max: 35,
      step: 1,
      default: 12,
      unit: "°",
    },
    {
      type: "range",
      key: "gap",
      label: "Gap",
      min: 0,
      max: 0.8,
      step: 0.01,
      default: 0.15,
    },
  ],
  style: {
    camera: { fov: FOV },
    depth: { on: true, amount: 0.3, focus: 0.4 },
    light: { on: true, shade: 0.55 },
    shadow: { on: false },
  },
  layout: ({ n, p, dir, params, frameW, frameH, cardW, cardH }) => {
    const walls = params.walls === "4" ? 4 : 2;
    const open = deg(Number(params.open));
    const gap = Number(params.gap);
    const halfW = (frameW / 2) * Number(params.width);
    const halfH = frameH / 2;
    const perWall = Math.max(4, Math.ceil(n / walls));
    const length = perWall * cardW * (1 + gap);
    const near = CAMERA - 0.6;
    const far = near - length;
    // Each wall: where it sits and how its cards turn to face the aisle.
    const all: { x: number; y: number; rot: [number, number, number] }[] = [
      { x: -halfW, y: 0, rot: [0, deg(90) - open, 0] },
      { x: halfW, y: 0, rot: [0, -deg(90) + open, 0] },
      { x: 0, y: -halfH, rot: [-deg(90) + open, 0, 0] },
      { x: 0, y: halfH, rot: [deg(90) - open, 0, 0] },
    ];
    const sides = all.slice(0, walls);
    const poses: CardPose[] = [];
    for (const [w, side] of sides.entries()) {
      for (let k = 0; k < perWall; k += 1) {
        // Floor and ceiling run half a slot ahead so seams don't line up.
        const t = wrap(k / perWall + p * dir + (w >= 2 ? 0.5 / perWall : 0), 1);
        const z = far + t * length;
        // Floor and ceiling cards lie lengthwise along the corridor.
        const along = w >= 2 ? cardH : cardW;
        poses.push({
          position: [side.x, side.y, z],
          rotation: side.rot,
          scale: (length / perWall / along) * (1 / (1 + gap)),
          opacity: smoothstep(0, 0.15, t) * (1 - smoothstep(0.9, 1, t)),
          media: w * perWall + k,
        });
      }
    }
    return poses;
  },
};
