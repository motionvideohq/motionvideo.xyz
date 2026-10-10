import type { CSSProperties } from "react";

const LAYERS = 8;

// Each layer blurs one px more than the last and is masked to a band that
// overlaps its neighbours, so the blur ramps from 0 to 7px towards the bottom.
const layerStyle = (index: number): CSSProperties => {
  const stop = (step: number) => `${((index + step) / (LAYERS + 1)) * 100}%`;
  const mask = `linear-gradient(180deg, rgba(255, 255, 255, 0) ${stop(0)}, rgba(255, 255, 255, 1) ${stop(1)}, rgba(255, 255, 255, 1) ${stop(2)}, rgba(255, 255, 255, 0) ${stop(3)})`;
  const blur = `blur(${index}px)`;
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
  };
};

/** A fixed blur that softens content as it scrolls under the bottom edge. */
export const ProgressiveBlur = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-x-0 bottom-0 z-35 h-24 transition-opacity duration-200 in-data-overlay-open:opacity-0"
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
