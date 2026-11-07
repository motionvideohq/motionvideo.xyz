import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useIntlayer } from "react-intlayer";
import { Xmark } from "reicon-react/icons/Xmark";

import { GitHubIcon, XIcon } from "@/components/icons";
import { Logomark } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { LINK } from "@/constants/links";
import { cn } from "@/lib/utils";

// Asks visitors who have browsed a little to follow on X and star the repo.
// Once dismissed (the cross, Escape, or either button) it stays away for a
// day; the dismissal time is kept in localStorage.
const DISMISSED_KEY = "motionvideo:follow-prompt-dismissed";
const DAY_MS = 24 * 60 * 60 * 1000;
// Time on the site before it appears. Mounted at the root, so the timer
// keeps running across client-side navigation.
const DELAY_MS = 15_000;

const recentlyDismissed = () => {
  const at = Number(localStorage.getItem(DISMISSED_KEY));
  return Number.isFinite(at) && Date.now() - at < DAY_MS;
};

const rememberDismissal = () =>
  localStorage.setItem(DISMISSED_KEY, String(Date.now()));

const spring = { type: "spring", stiffness: 420, damping: 32 } as const;

export const FollowPrompt = () => {
  const content = useIntlayer("follow-prompt");
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (recentlyDismissed()) {
      return;
    }
    const timer = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    rememberDismissal();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        rememberDismissal();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        // Non-modal: the page stays usable while it's open.
        <motion.dialog
          open
          aria-labelledby="follow-prompt-title"
          aria-describedby="follow-prompt-body"
          // Past its own width plus the edge gap: it starts fully off screen.
          initial={reduceMotion ? { opacity: 0 } : { x: "120%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { x: "120%" }}
          transition={reduceMotion ? { duration: 0.15 } : spring}
          // Above the bottom blur (z-35); hidden while printing. `left-auto
          // m-0 border-0` undo the dialog element's centring and border.
          className="bg-popover text-popover-foreground shadow-popover fixed right-4 bottom-4 left-auto z-50 m-0 flex w-[calc(100vw-2rem)] flex-col gap-4 rounded-2xl border-0 p-3 sm:right-6 sm:bottom-6 sm:w-75 print:hidden"
        >
          <button
            type="button"
            aria-label={content.close.value}
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring absolute top-2 right-2 grid size-8 place-items-center rounded-full transition-colors outline-none focus-visible:ring-2"
          >
            <Xmark aria-hidden="true" className="size-4" />
          </button>
          <div className="flex flex-col gap-1 px-1 pt-1">
            <Logomark className="text-primary mb-2.5 h-4 w-8" />
            <h2
              id="follow-prompt-title"
              className="text-[15px] font-semibold tracking-tight"
            >
              {content.title}
            </h2>
            <p
              id="follow-prompt-body"
              className="text-muted-foreground text-sm text-pretty"
            >
              {content.body}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={LINK.X}
              target="_blank"
              rel="noreferrer"
              onClick={dismiss}
              data-track="follow_prompt"
              data-track-target="x"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "flex-1"
              )}
            >
              <XIcon aria-hidden="true" className="size-3" />
              {content.follow}
            </a>
            <a
              href={LINK.GITHUB_REPO}
              target="_blank"
              rel="noreferrer"
              onClick={dismiss}
              data-track="follow_prompt"
              data-track-target="github"
              className={cn(
                buttonVariants({ variant: "gradient", size: "lg" }),
                "flex-1"
              )}
            >
              <GitHubIcon aria-hidden="true" className="size-4" />
              {content.star}
            </a>
          </div>
        </motion.dialog>
      )}
    </AnimatePresence>
  );
};
