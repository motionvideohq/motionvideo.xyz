import { ProgressiveBlur } from "@/components/progressive-blur";
import { SITE } from "@/constants/site";

/**
 * The oversized MotionVideo wordmark closing every page. Letters are filled
 * with the page colour and raised only by a soft shadow, and the bottom is
 * cropped and blurred, so they dissolve into the page's edge. Masonry pages
 * blur the whole bottom edge already (PageBottomBlur), so the wordmark's own
 * blur steps aside there rather than doubling up.
 * On mobile the word is small and sits wholly in the blur, which erases a
 * shadow-only edge, so it gets a faint foreground fill there instead.
 * Decorative: the brand name is already in the footer row.
 */
export const FooterWordmark = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none relative overflow-hidden select-none"
  >
    <svg
      viewBox="0 0 1000 120"
      className="fill-background max-md:fill-foreground/10 dark:max-md:fill-foreground/12 block w-full [filter:drop-shadow(0_6px_14px_oklch(0_0_0/0.07))_drop-shadow(0_1px_1px_oklch(0_0_0/0.05))] md:translate-y-[18%] dark:fill-[oklch(0.165_0_0)] dark:[filter:drop-shadow(0_0_1px_oklch(1_0_0/0.14))_drop-shadow(0_6px_18px_oklch(1_0_0/0.05))]"
    >
      {/* textLength stretches the word edge to edge at any font metrics. */}
      <text
        x="0"
        y="118"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        className="font-sans text-[150px] font-extrabold tracking-tight uppercase"
      >
        {SITE.NAME}
      </text>
    </svg>
    <ProgressiveBlur className="absolute [body:has([data-slot=virtual-masonry]:not([data-component-preview]_*))_&]:hidden" />
  </div>
);
