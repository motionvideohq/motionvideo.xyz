import { EASES, clamp, deg, lerp, stepProgress, wrap } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

// 3×3 rotation matrices, row-major: the card's own turn is composed with the
// deck's lean and folded back into one XYZ Euler.
type M3 = readonly number[];

const rx = (a: number): M3 => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [1, 0, 0, 0, c, -s, 0, s, c];
};

const ry = (a: number): M3 => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
};

const rz = (a: number): M3 => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
};

const mul = (a: M3, b: M3): M3 =>
  Array.from({ length: 9 }, (_, i) => {
    const r = Math.floor(i / 3) * 3;
    const c = i % 3;
    return a[r] * b[c] + a[r + 1] * b[c + 3] + a[r + 2] * b[c + 6];
  });

const apply = (
  m: M3,
  [x, y, z]: readonly number[]
): [number, number, number] => [
  m[0] * x + m[1] * y + m[2] * z,
  m[3] * x + m[4] * y + m[5] * z,
  m[6] * x + m[7] * y + m[8] * z,
];

/** The XYZ Euler angles of a rotation matrix (same convention as three). */
const toEuler = (m: M3): [number, number, number] => {
  const y = Math.asin(Math.max(-1, Math.min(1, m[2])));
  if (Math.abs(m[2]) < 0.999999) {
    return [Math.atan2(-m[5], m[8]), y, Math.atan2(-m[1], m[0])];
  }
  return [Math.atan2(m[7], m[4]), y, 0];
};

// The deck leans back and turns slightly, so its stacked edge shows.
const DECK = mul(rx(deg(-16)), ry(deg(-14)));
const LAYER = 0.012;

// A neat stack: the top card slides out, arcs over and tucks back in at the
// bottom, one card per step. After n steps every card is home again.
/** Draw order: the moving card is on top while it lifts, under once it tucks back. */
const orderFor = (f: number, level: number, n: number) => {
  if (f <= 0) {
    return Math.round(level);
  }
  return f < 0.5 ? n + 1 : -1;
};

export const deckShuffle: TemplateDef = {
  id: "deck-shuffle",
  name: "Deck Shuffle",
  collection: "stack",
  description: "The top card slides out and tucks back under the stack.",
  tier: "free",
  slots: { min: 3, default: 6, max: 12 },
  baseLoopSeconds: 12,
  cardRatio: "4:3",
  cardHeight: 0.78,
  params: [
    {
      type: "range",
      key: "offset",
      label: "Stack offset",
      min: 0,
      max: 0.08,
      step: 0.005,
      default: 0.03,
    },
    {
      type: "range",
      key: "lift",
      label: "Lift",
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
    },
    {
      type: "range",
      key: "hold",
      label: "Hold",
      min: 0.1,
      max: 0.8,
      step: 0.01,
      default: 0.4,
    },
  ],
  style: {
    camera: { fov: 28 },
    light: { on: true, shade: 0.4, glare: 0.12 },
    shadow: { opacity: 0.34, softness: 0.5 },
  },
  move: "arc-motion",
  layout: ({ n, p, dir, params, frameW, frameH, cardW, cardH }) => {
    const wide = frameW > frameH * 1.2;
    // Wide frames pull the card out sideways, square and tall ones upward.
    const [dx, dy] = wide ? [1, 0.18] : [0.12, 1];
    const travel = (wide ? cardW : cardH) * 1.1;
    const offset = Number(params.offset);
    const lift = Number(params.lift);
    const step: [number, number] = [-offset * cardW * 0.5, offset * cardH];

    const spanW = cardW + travel * dx + n * Math.abs(step[0]);
    const spanH = cardH + travel * dy + n * step[1] + lift * cardH * 0.35;
    const k = clamp(
      Math.min((0.8 * frameW) / spanW, (0.76 * frameH) / spanH),
      0.25,
      1.3
    );
    // Centre the deck together with the pulled-out card.
    const cx = (travel * dx - n * Math.abs(step[0])) / 2;
    const cy = (travel * dy + n * step[1]) / 2;

    const u = stepProgress(p, n, Number(params.hold), EASES.inOutCubic);
    return Array.from({ length: n }, (_, i): CardPose => {
      const s = wrap(i + u * dir, n);
      // The top slot (n - 1 to n) is the trip from the top to the bottom.
      const f = Math.max(0, s - (n - 1));
      const level = f > 0 ? lerp(n - 1, 0, f) : s;
      const arc = Math.sin(Math.PI * f);
      const local = [
        level * step[0] + arc * travel * dx - cx,
        level * step[1] + arc * (travel * dy + lift * cardH * 0.35) - cy,
        // Over the deck on the way out, under it on the way back.
        level * LAYER + Math.sin(2 * Math.PI * f) * lift * cardH * 0.3,
      ];
      const turn = mul(
        ry(arc * 0.4 * dx),
        mul(rx(-arc * 0.35 * dy), rz(-arc * 0.12))
      );
      const [x, y, z] = apply(DECK, local);
      return {
        position: [x * k, y * k, z * k],
        rotation: toEuler(mul(DECK, turn)),
        scale: k,
        order: orderFor(f, level, n),
        media: i,
      };
    });
  },
};
