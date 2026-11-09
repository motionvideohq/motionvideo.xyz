import { TAU, clamp, deg, smoothstep, wrap } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

const FADE = 0.16;

// Two interleaved spirals of cards climbing around a vertical axis. Every
// card travels the whole strand once per loop and fades out at the top as it
// fades back in at the bottom, so the loop has no seam.
export const doubleHelix: TemplateDef = {
  id: "double-helix",
  name: "Double Helix",
  collection: "orbit",
  description: "Two spirals of cards climbing around a turning axis.",
  tier: "pro",
  slots: { min: 12, default: 24, max: 44 },
  baseLoopSeconds: 24,
  cardRatio: "4:3",
  cardHeight: 0.34,
  params: [
    {
      type: "range",
      key: "turns",
      label: "Turns",
      min: 1,
      max: 4,
      step: 0.25,
      default: 2,
    },
    {
      type: "range",
      key: "radius",
      label: "Radius",
      min: 0.7,
      max: 1.6,
      step: 0.01,
      default: 1,
    },
    {
      type: "range",
      key: "rise",
      label: "Rise per turn",
      min: 1.5,
      max: 5,
      step: 0.1,
      default: 2.6,
    },
    {
      type: "range",
      key: "strandGap",
      label: "Strand gap",
      min: 60,
      max: 180,
      step: 1,
      default: 180,
      unit: "°",
    },
  ],
  style: {
    camera: { fov: 32, tilt: 9 },
    light: { on: true, shade: 0.5 },
    shadow: { opacity: 0.18 },
    depth: { on: true, amount: 0.3, focus: 0 },
  },
  move: "orbiting-shapes",
  layout: ({ n, p, dir, params, frameW, frameH, cardW, cardH }) => {
    const turns = Number(params.turns);
    const perStrand = Math.max(3, Math.ceil(n / 2));
    // Neighbouring cards on a strand sit a little more than a card apart.
    const spaced =
      ((cardW * 1.05 * perStrand) / (turns * TAU)) * Number(params.radius);
    const height = turns * Number(params.rise) * cardH;
    const gapAngle = deg(Number(params.strandGap));

    // Fill the frame height first. Wide frames then widen the spiral into
    // the spare room; tall ones tighten it a little before shrinking it.
    const fitH = clamp((0.98 * frameH) / (height + cardH), 0.3, 1.4);
    const room = Math.max(0, (0.44 * frameW) / fitH - cardW / 2);
    const radius = clamp(
      Math.max(spaced, room * 0.55 * Number(params.radius)),
      spaced * 0.7,
      Math.max(spaced * 0.7, room)
    );
    const k = Math.min(fitH, (0.44 * frameW) / (radius + cardW / 2));

    const poses: CardPose[] = [];
    for (let strand = 0; strand < 2; strand += 1) {
      for (let j = 0; j < perStrand; j += 1) {
        // The second strand sits half a step up, so cards interleave.
        const s = wrap(j + strand * 0.5 + p * perStrand * dir, perStrand);
        const t = s / perStrand;
        const a = t * turns * TAU + strand * gapAngle;
        const facing = (Math.cos(a) + 1) / 2;
        const fade = smoothstep(0, FADE, t) * smoothstep(1, 1 - FADE, t);
        poses.push({
          position: [
            Math.sin(a) * radius * k,
            (t - 0.5) * height * k,
            (Math.cos(a) - 1) * radius * k,
          ],
          rotation: [0, a, 0],
          scale: k * (0.85 + 0.15 * fade),
          brightness: 0.45 + 0.55 * facing,
          opacity: fade * (0.4 + 0.6 * facing),
          media: strand + j * 2,
        });
      }
    }
    return poses;
  },
};
