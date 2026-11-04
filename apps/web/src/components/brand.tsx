import type { CSSProperties } from "react";
import { useIntlayer } from "react-intlayer";
import { Download } from "reicon-react/icons/Download";
import { Text } from "reicon-react/icons/Text";
import { Window } from "reicon-react/icons/Window";

import { LocalizedLink as Link } from "@/components/localized-link";
import { Logomark } from "@/components/logomark";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ASSETS = {
  logomark: "/brand/motionvideo-logomark-black.svg",
  logotype: "/brand/motionvideo-wordmark.svg",
  appIcon: "/brand/motionvideo-app-icon.svg",
} as const;
const ZIP = "/brand/motionvideo-brand-assets.zip";

/** Copies an SVG's markup, ready to paste into Figma or code. */
const copySvg = async (asset: keyof typeof ASSETS) => {
  try {
    const response = await fetch(ASSETS[asset]);
    await navigator.clipboard.writeText(await response.text());
    track("brand_copy", { asset });
  } catch {
    // Clipboard blocked: nothing to undo.
  }
};

const iconClass = "text-muted-foreground size-4";

// Each part of the wordmark has its own hover move, and each is its own
// `group/part`:
//   logomark → the yellow app-icon tile springs up behind it
//   "Motion" → the two o's bounce like balls, with squash and stretch
//   "Video"  → the letters advance one film frame while sprockets run past
// The animated letters are decorative; `sr-only` text carries the name.

// "MotionVideo" → ["Motion", "Video"].
const [MOTION, VIDEO] = SITE.NAME.split(/(?=[A-Z])/u);

const sprocketClass =
  "absolute inset-x-0 h-[0.1em] bg-[repeating-linear-gradient(90deg,currentColor_0_0.14em,transparent_0.14em_0.3em)] bg-size-[0.3em_100%] opacity-0 transition-opacity group-hover/part:opacity-40 motion-safe:group-hover/part:animate-brand-sprockets";

const AnimatedWordmark = () => (
  <span aria-hidden="true" className="inline-flex items-center gap-2">
    {/* Logomark: the app-icon tile (site radius) springs up behind the mark,
        which settles inside it in black. Explicit width (the viewBox is
        1242 × 587): `w-auto` collapses inside the grid. */}
    <span className="group/part relative inline-grid place-items-center">
      <span className="bg-cta-to absolute top-1/2 left-1/2 size-[2.4rem] -translate-1/2 scale-0 rounded-lg transition-transform duration-300 ease-out group-hover/part:scale-100 group-hover/part:duration-500 group-hover/part:ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none" />
      <Logomark className="relative h-4 w-[2.12rem] transition-[scale,color] duration-300 group-hover/part:scale-[0.78] group-hover/part:text-black motion-reduce:transition-none" />
    </span>
    <span className="inline-flex items-center leading-[1.2em]">
      {/* "Motion": each o anticipates, stretches up, squashes on landing and
          settles; the second a beat behind (staggered by its index). */}
      <span className="group/part inline-flex">
        {[...MOTION].map((letter, index) => (
          <span
            // Letters repeat ("o" twice), so the index is the identity.
            // oxlint-disable-next-line no-array-index-key
            key={index}
            className={cn(
              "inline-block",
              letter === "o" &&
                "origin-bottom motion-safe:group-hover/part:[animation:brand-bounce_640ms_calc(var(--i)*40ms)_both]"
            )}
            // SAFETY: `--i` is a CSS custom property read by the stagger delay.
            style={{ "--i": index } as CSSProperties}
          >
            {letter}
          </span>
        ))}
      </span>
      {/* "Video": each letter is a two-frame strip that slides up one frame,
          staggered, with sprocket holes running above and below. */}
      <span className="group/part relative inline-flex">
        <span className={cn(sprocketClass, "-top-[0.3em]")} />
        <span className={cn(sprocketClass, "-bottom-[0.3em]")} />
        {[...VIDEO].map((letter, index) => (
          <span
            // oxlint-disable-next-line no-array-index-key
            key={index}
            className="inline-flex h-[1.2em] flex-col overflow-hidden leading-[1.2em]"
          >
            <span
              className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/part:-translate-y-1/2 group-hover/part:delay-[calc(var(--i)*45ms)] motion-reduce:transition-none"
              // SAFETY: `--i` is a CSS custom property read by the stagger delay.
              style={{ "--i": index } as CSSProperties}
            >
              <span>{letter}</span>
              <span>{letter}</span>
            </span>
          </span>
        ))}
      </span>
    </span>
  </span>
);

/**
 * The header wordmark. Right-click (or long-press) offers the brand assets:
 * copy the logomark, logotype or app icon as SVG, open the guidelines, or
 * download everything as one zip.
 */
export const Brand = () => {
  const content = useIntlayer("brand-menu");
  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <Link
            to={ROUTES.HOME}
            className="flex items-center font-semibold tracking-tight whitespace-nowrap"
          />
        }
      >
        <AnimatedWordmark />
        <span className="sr-only">{SITE.NAME}</span>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => copySvg("logomark")}>
          <Logomark
            aria-hidden="true"
            className="text-muted-foreground h-2.5 w-4"
          />
          {content.copyLogomark}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => copySvg("logotype")}>
          <Text aria-hidden="true" className={iconClass} />
          {content.copyLogotype}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => copySvg("appIcon")}>
          <Window aria-hidden="true" className={iconClass} />
          {content.copyAppIcon}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          render={<Link to={ROUTES.BRAND} data-track="brand_guidelines" />}
        >
          {/* A dashed square: the guidelines frame the marks. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            className={iconClass}
          >
            <rect
              x="2"
              y="2"
              width="12"
              height="12"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2.5 2"
            />
          </svg>
          {content.guidelines}
        </ContextMenuItem>
        <ContextMenuItem
          render={
            <a
              href={ZIP}
              download
              aria-label={content.download.value}
              data-track="brand_download"
            />
          }
        >
          <Download aria-hidden="true" className={iconClass} />
          {content.download}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
