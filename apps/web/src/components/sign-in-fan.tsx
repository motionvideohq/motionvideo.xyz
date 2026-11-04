import { motion, useReducedMotion } from "motion/react";

import { ASSETS_URL } from "@/constants/links";

// Five gallery posters, copied from src/data/motion-catalog.json so the
// dialog (mounted on every page) doesn't ship the catalog.
const ASSETS = `${ASSETS_URL}/motion`;
const POSTERS = [
  `${ASSETS}/antseed-3a1534/poster-161dc42cc9.jpg`,
  `${ASSETS}/twoclipping-5cba86/poster-9a98945de1.webp`,
  `${ASSETS}/stephanlivera-df17a2/poster-f2e1162434.webp`,
  `${ASSETS}/xiaolinnihao-876941/poster-fc024e61ae.jpg`,
  `${ASSETS}/shneural-2abdfa/poster-bb366515ef.webp`,
];
const CENTRE = (POSTERS.length - 1) / 2;

const SPRING = { type: "spring", stiffness: 260, damping: 22 } as const;

/**
 * The sign-in dialog's footer: a stack of posters that fans out to both sides
 * as the dialog opens, cut off by its bottom edge. The dialog mounts its
 * content on each opening, so the fan replays every time; with reduced motion
 * it is already spread.
 */
export const SignInFan = () => {
  const reducedMotion = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="bg-muted/50 relative h-36 overflow-hidden border-t"
    >
      {POSTERS.map((poster, index) => {
        const offset = index - CENTRE;
        const distance = Math.abs(offset);
        return (
          <motion.img
            key={poster}
            src={poster}
            alt=""
            decoding="async"
            // Stacked low in the middle with a slight jitter, they rise and
            // spread along an arc, the outer cards tilting most.
            initial={
              reducedMotion ? false : { x: 0, y: 48, rotate: offset * 2 }
            }
            animate={{ x: offset * 84, y: distance * 12, rotate: offset * 7 }}
            // Starts once the dialog's own zoom-in is under way; the outer
            // cards trail the inner ones.
            transition={{ ...SPRING, delay: 0.12 + distance * 0.04 }}
            // The middle card on top, each pair behind the last.
            style={{ zIndex: POSTERS.length - distance }}
            className="bg-muted shadow-popover absolute top-6 left-1/2 -ml-18 aspect-4/3 w-36 origin-bottom rounded-lg object-cover"
          />
        );
      })}
    </div>
  );
};
