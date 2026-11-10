// Adapted from chanhdai.com/components/logos-swap.
import {
  AnimatePresence,
  motion,
  useInView,
  usePageInView,
  useReducedMotion,
} from "motion/react";
import type { Transition, Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const SWAP_INTERVAL_MS = 1500;
const GOLDEN_RATIO = 1.618;
const EASE_IN_OUT_EXPO = [0.87, 0, 0.13, 1] as const;
const TRANSITION: Transition = { duration: 0.9, ease: EASE_IN_OUT_EXPO };
const LOGO_VARIANTS: Variants = {
  initial: { opacity: 0, transform: "translateY(50%)" },
  animate: {
    opacity: 1,
    transform: "translateY(0%)",
    transition: { ...TRANSITION, delay: 0.1 },
  },
  exit: { opacity: 0, transform: "translateY(-50%)", transition: TRANSITION },
};

/**
 * Slots in the order they swap: golden-ratio steps scatter them like a
 * shuffle, deterministically, so server and client render the same.
 */
const swapOrderOf = (slotCount: number) =>
  Array.from({ length: slotCount }, (_, slot) => slot).toSorted(
    (a, b) => ((a * GOLDEN_RATIO) % 1) - ((b * GOLDEN_RATIO) % 1)
  );

/**
 * A row of logos that swaps one slot at a time, in a scattered order. Shows
 * `columnCount` at once (set `--column-count` to wrap onto fewer columns) and
 * only swaps with more logos than that. Pauses while the page or the row is
 * out of view, and stays still for reduced motion, so put the most important
 * logos first.
 */
export const LogosSwap = ({
  logos,
  columnCount = 4,
  className,
  style,
  ...props
}: Omit<ComponentProps<"div">, "ref" | "children"> & {
  /** Each logo, keyed. */
  logos: ReactNode[];
  columnCount?: number;
}) => {
  const slotCount = Math.min(columnCount, logos.length);
  const swapOrder = swapOrderOf(slotCount);
  // Queued in swap order so the slots start in `logos` order; each slot
  // then takes the next logo on its turn, so none shows twice at once.
  const queue = [
    ...swapOrder.map((slot) => logos[slot]),
    ...logos.slice(slotCount),
  ];

  const ref = useRef<HTMLDivElement>(null);
  const pageInView = usePageInView();
  const inView = useInView(ref, { margin: "100px" });
  const reducedMotion = useReducedMotion();
  const playing =
    pageInView && inView && logos.length > slotCount && !reducedMotion;

  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!playing) {
      return;
    }
    const id = window.setInterval(
      () => setStep((prev) => prev + 1),
      SWAP_INTERVAL_MS
    );
    return () => window.clearInterval(id);
  }, [playing]);

  if (logos.length === 0) {
    return null;
  }
  return (
    <div
      ref={ref}
      data-slot="logos-swap"
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(var(--column-count,${slotCount}), minmax(0, 1fr))`,
        ...style,
      }}
      {...props}
    >
      {Array.from({ length: slotCount }, (_, slot) => {
        const turn = swapOrder.indexOf(slot);
        const swaps = Math.ceil((step - turn) / slotCount);
        const index = (turn + swaps * slotCount) % logos.length;
        return (
          // The bleed holds the feathered edge, so logos at rest are never
          // dimmed.
          <div
            key={slot}
            className="-my-3 grid h-20 min-w-0 grid-cols-1 grid-rows-1 overflow-hidden mask-y-from-85% py-3"
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={index}
                className="col-start-1 row-start-1 flex min-h-0 min-w-0 items-center justify-center"
                variants={LOGO_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {queue[index]}
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
