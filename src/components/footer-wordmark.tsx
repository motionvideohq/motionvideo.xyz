import { SITE } from "@/constants/site";

/**
 * The oversized MotionVideo wordmark closing every page. Letters are filled
 * with the page colour and raised only by a soft shadow, and the bottom is
 * cropped, so the fixed progressive blur dissolves them into the edge.
 * Decorative: the brand name is already in the footer row.
 */
export const FooterWordmark = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none overflow-hidden select-none"
  >
    <svg
      viewBox="0 0 1000 120"
      className="fill-background block w-full translate-y-[18%] [filter:drop-shadow(0_6px_14px_oklch(0_0_0/0.07))_drop-shadow(0_1px_1px_oklch(0_0_0/0.05))] dark:fill-[oklch(0.165_0_0)] dark:[filter:drop-shadow(0_0_1px_oklch(1_0_0/0.14))_drop-shadow(0_6px_18px_oklch(1_0_0/0.05))]"
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
  </div>
);
