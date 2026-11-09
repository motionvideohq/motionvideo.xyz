// Small numeric helpers shared by templates. Everything is a pure function of
// its inputs: templates must render the same frame for the same document.

export const TAU = Math.PI * 2;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const clamp01 = (v: number) => clamp(v, 0, 1);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Positive modulo: `wrap(-1, 4)` is 3. */
export const wrap = (v: number, n: number) => ((v % n) + n) % n;

/**
 * Signed distance from slot `i` to the moving head `u` on a ring of `n`
 * slots, in (-n/2, n/2]. The card at the head is 0, its neighbours ±1.
 */
export const ringOffset = (i: number, u: number, n: number) => {
  const r = wrap(i - u, n);
  return r > n / 2 ? r - n : r;
};

export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export const deg = (d: number) => (d * Math.PI) / 180;

export type Ease = (t: number) => number;

export const EASES = {
  linear: (t: number) => t,
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  inOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2,
  inOutQuint: (t: number) =>
    t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2,
  inOutExpo: (t: number) => {
    if (t <= 0) {
      return 0;
    }
    if (t >= 1) {
      return 1;
    }
    return t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2;
  },
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
} satisfies Record<string, Ease>;

export type EaseName = keyof typeof EASES;

/**
 * Stepped progress for one-at-a-time templates. Over one loop the head moves
 * through `n` steps; each step holds for `hold` of its time, then eases to the
 * next slot. Returns a continuous slot position in [0, n).
 */
export const stepProgress = (
  p: number,
  n: number,
  hold: number,
  ease: Ease
) => {
  const c = wrap(p, 1) * n;
  const k = Math.floor(c);
  const f = c - k;
  return k + ease(clamp01((f - hold) / Math.max(1e-3, 1 - hold)));
};

/** Deterministic PRNG (mulberry32): the same seed gives the same sequence. */
/* oxlint-disable no-bitwise -- mulberry32 is defined by 32-bit integer ops */
export const seeded = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d_2b_79_f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

/* oxlint-enable no-bitwise */

/** A seeded permutation of `0..n-1`. */
export const shuffled = (n: number, seed: number) => {
  const rand = seeded(seed);
  const out = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** Points spread evenly over a unit sphere (Fibonacci lattice). */
export const fibonacciSphere = (
  i: number,
  n: number
): [number, number, number] => {
  const y = 1 - (2 * (i + 0.5)) / n;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const a = i * 2.399963229728653;
  return [Math.cos(a) * r, y, Math.sin(a) * r];
};
