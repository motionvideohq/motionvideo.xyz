import { TAU, deg, fibonacciSphere, smoothstep } from "../../kit/math.ts";
import type { CardPose, TemplateDef } from "../types.ts";

// 3×3 rotation matrices, row-major. Cards need a full orientation chain
// (latitude, longitude, spin, axis tilt) folded into one XYZ Euler.
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

/** The XYZ Euler angles of a rotation matrix (same convention as three). */
const toEuler = (m: M3): [number, number, number] => {
  const y = Math.asin(Math.max(-1, Math.min(1, m[2])));
  if (Math.abs(m[2]) < 0.999999) {
    return [Math.atan2(-m[5], m[8]), y, Math.atan2(-m[1], m[0])];
  }
  return [Math.atan2(m[7], m[4]), y, 0];
};

// Seen from slightly above, so the poles read as a globe.
const VIEW = rx(deg(14));

// Cards spread evenly over a slowly turning globe, each facing outward. The
// globe makes one full turn per loop; the far side fades out.
export const planet: TemplateDef = {
  id: "planet",
  name: "Planet",
  collection: "orbit",
  description: "Cards spread over a slowly turning globe.",
  tier: "pro",
  slots: { min: 12, default: 30, max: 56 },
  baseLoopSeconds: 30,
  cardRatio: "4:3",
  cardHeight: 0.3,
  params: [
    {
      type: "range",
      key: "radius",
      label: "Radius",
      min: 0.6,
      max: 1.2,
      step: 0.01,
      default: 1,
    },
    {
      type: "range",
      key: "cardScale",
      label: "Card size",
      min: 0.5,
      max: 1.4,
      step: 0.01,
      default: 1,
    },
    {
      type: "range",
      key: "axisTilt",
      label: "Axis tilt",
      min: -40,
      max: 40,
      step: 1,
      default: 16,
      unit: "°",
    },
  ],
  style: {
    camera: { fov: 30 },
    light: { on: true, shade: 0.55 },
    shadow: { opacity: 0.16 },
    depth: { on: true, amount: 0.35, focus: 0 },
  },
  move: "orbiting-shapes",
  layout: ({ n, p, dir, params, frameW, frameH, cardW }) => {
    const radius = 0.4 * Math.min(frameW, frameH) * Number(params.radius);
    // Cards a little narrower than the spacing between lattice points.
    const spacing = Math.sqrt((4 * Math.PI) / n) * radius;
    const scale = (spacing * 0.78 * Number(params.cardScale)) / cardW;
    const tilt = mul(VIEW, rz(deg(Number(params.axisTilt))));
    const spin = mul(tilt, ry(p * TAU * dir));

    return Array.from({ length: n }, (_, i): CardPose => {
      const [x, y, z] = fibonacciSphere(i, n);
      // Longitude then latitude keeps every card's top pointing north.
      const m = mul(spin, mul(ry(Math.atan2(x, z)), rx(-Math.asin(y))));
      // The card normal is the matrix's third column.
      const nz = m.at(8) ?? 0;
      return {
        position: [m[2] * radius, m[5] * radius, nz * radius - radius * 0.25],
        rotation: toEuler(m),
        scale,
        brightness: 0.5 + 0.5 * smoothstep(-0.3, 0.8, nz),
        opacity: 0.1 + 0.9 * smoothstep(-0.45, 0.2, nz),
        media: i,
      };
    });
  },
};
