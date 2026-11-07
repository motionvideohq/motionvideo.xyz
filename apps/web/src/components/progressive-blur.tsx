import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

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
 * A blur that softens content towards the bottom edge of its box. Place it
 * with `className` (`fixed` or `absolute`; it spans the box's bottom). Shorter
 * on mobile, where the footer wordmark is only ~45px tall and the full ramp
 * would blur it away entirely.
 */
export const ProgressiveBlur = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      "pointer-events-none inset-x-0 bottom-0 h-10 md:h-18",
      className
    )}
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

/**
 * Masonry pages (any page with a VirtualMasonry, marked `data-bottom-blur`)
 * soften their endless grid as it scrolls under the viewport's bottom edge.
 * CSS, so it is there from the first paint. Elsewhere only the footer
 * wordmark is blurred, in place (FooterWordmark).
 */
export const PageBottomBlur = () => (
  <ProgressiveBlur className="fixed z-35 hidden transition-opacity duration-200 in-data-overlay-open:opacity-0 [body:has([data-bottom-blur])_&]:block" />
);
