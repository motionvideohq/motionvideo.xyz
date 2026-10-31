import type { CSSProperties } from "react";

// Blur per layer in px. The ramp eases in, so content stays crisp until the
// last few pixels and only the very edge reads as soft.
const BLURS = [0.5, 1, 1.75, 2.75, 4, 5.5] as const;
const LAYERS = BLURS.length;

// Each layer is masked to a band that overlaps its neighbours, so the blur
// ramps smoothly from 0.5px to 5.5px towards the bottom.
const layerStyle = (index: number): CSSProperties => {
  const stop = (step: number) => `${((index + step) / (LAYERS + 1)) * 100}%`;
  const mask = `linear-gradient(180deg, rgba(255, 255, 255, 0) ${stop(0)}, rgba(255, 255, 255, 1) ${stop(1)}, rgba(255, 255, 255, 1) ${stop(2)}, rgba(255, 255, 255, 0) ${stop(3)})`;
  const blur = `blur(${BLURS[index]}px)`;
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
  };
};

/**
 * A fixed blur that softens content as it scrolls under the bottom edge.
 * Shorter on mobile, where the footer wordmark is only ~45px tall and
 * the full ramp would blur it away entirely. A page without scrolling
 * content under it (e.g. /sign-in) opts out with `data-no-bottom-blur`;
 * CSS, so it is gone from the first paint.
 */
export const ProgressiveBlur = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-x-0 bottom-0 z-35 h-10 transition-opacity duration-200 in-data-overlay-open:opacity-0 md:h-18 [body:has([data-no-bottom-blur])_&]:hidden"
  >
    {Array.from({ length: LAYERS }, (_, index) => (
      <div
        key={index}
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={layerStyle(index)}
      />
    ))}
  </div>
);
