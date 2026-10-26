import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import type { FocusEvent, PointerEvent } from "react";
import { useIntlayer } from "react-intlayer";

import catalog from "@/data/motion-catalog.json";
import type { MotionVideo } from "@/lib/motion-catalog";

const videos: MotionVideo[] = catalog.videos;
const bySlug = new Map(videos.map((entry) => [entry.slug, entry]));
// The floating preview's largest size, and its gap to the viewport edges.
const PREVIEW_MAX_WIDTH = 560;
const PREVIEW_MAX_HEIGHT = 440;
const PREVIEW_MARGIN = 24;
// The preview floats beside the panel only where the panel is a sidebar
// (`lg`) and a real pointer can hover; elsewhere a tap just opens the video.
const PREVIEW_MEDIA = "(min-width: 64rem) and (hover: hover)";

interface Preview {
  video: MotionVideo;
  box: { left: number; top: number; width: number; height: number };
}

/**
 * Where the preview of `video` goes: as large as fits at its aspect ratio,
 * just left of the panel, vertically centred on the whole grid of tiles (kept
 * inside the viewport), so it stays put, only resizing, whichever tile is
 * hovered. Its gap to the panel is the panel's own padding, read from the
 * panel, so the preview sits as far from the sidebar's edge as the sidebar's
 * content does.
 */
const placePreview = (video: MotionVideo, tile: HTMLElement): Preview => {
  const panel = tile.closest("aside");
  const panelLeft = panel?.getBoundingClientRect().left ?? innerWidth;
  // Padding reads as "20px": parseFloat stops at the unit, where Number()
  // would give NaN.
  // oxlint-disable-next-line unicorn/prefer-number-coercion
  const padding = Number.parseFloat(
    panel ? getComputedStyle(panel).paddingLeft : ""
  );
  const gap = Number.isNaN(padding) ? PREVIEW_MARGIN : padding;
  const grid = (tile.closest("ul") ?? tile).getBoundingClientRect();
  const aspect = video.width / video.height;
  const width = Math.min(
    PREVIEW_MAX_WIDTH,
    panelLeft - gap - PREVIEW_MARGIN,
    Math.min(PREVIEW_MAX_HEIGHT, innerHeight - 2 * PREVIEW_MARGIN) * aspect
  );
  const height = width / aspect;
  const top = Math.min(
    Math.max(grid.top + grid.height / 2 - height / 2, PREVIEW_MARGIN),
    innerHeight - PREVIEW_MARGIN - height
  );
  return {
    video,
    box: { left: panelLeft - gap - width, top, width, height },
  };
};

/**
 * The detail view's related videos, a section like Prompt: its heading, then
 * six lifted posters in a 2×3 grid. Hovering one floats a large, playing
 * preview beside the panel; moving between tiles resizes it to each video's
 * shape and crossfades it in place. Key it by video.
 */
export const SimilarVideos = ({
  video,
  onOpen,
}: {
  video: MotionVideo;
  onOpen: (slug: string) => void;
}) => {
  const content = useIntlayer("motion-gallery");
  // Precomputed by `pnpm catalog:derive`; ranking here cost too much CPU.
  const similar = useMemo(
    () =>
      (video.similar ?? []).flatMap((slug) => {
        const other = bySlug.get(slug);
        return other ? [other] : [];
      }),
    [video]
  );
  const [preview, setPreview] = useState<Preview | null>(null);
  const reducedMotion = useReducedMotion();

  const show = (other: MotionVideo, tile: HTMLElement) => {
    if (matchMedia(PREVIEW_MEDIA).matches) {
      setPreview(placePreview(other, tile));
    }
  };
  const onPointerEnter =
    (other: MotionVideo) => (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "mouse") {
        show(other, event.currentTarget);
      }
    };
  // Keyboard focus previews too; a click's focus doesn't (hover already did).
  const onFocus =
    (other: MotionVideo) => (event: FocusEvent<HTMLButtonElement>) => {
      if (event.currentTarget.matches(":focus-visible")) {
        show(other, event.currentTarget);
      }
    };
  const hide = () => setPreview(null);

  if (similar.length === 0) {
    return null;
  }
  const spring = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, bounce: 0.12, duration: 0.4 };

  return (
    <section className="flex flex-col gap-3" aria-label={content.similar.value}>
      <h2 className="text-sm font-medium">{content.similar}</h2>
      <ul onPointerLeave={hide} className="grid grid-cols-2 gap-2">
        {similar.map((other) => (
          <li key={other.slug}>
            {/* A bare button, not the Button component: its 1px transparent
                border and press scale don't belong on a poster. Only the
                gallery cards' outline shadow, plus a focus ring. */}
            <button
              type="button"
              aria-label={other.title}
              onClick={() => {
                hide();
                onOpen(other.slug);
              }}
              onPointerEnter={onPointerEnter(other)}
              onFocus={onFocus(other)}
              onBlur={hide}
              className="bg-muted shadow-outline focus-visible:ring-ring/50 block aspect-video w-full cursor-pointer overflow-hidden rounded-xl outline-none focus-visible:ring-3"
            >
              <img
                src={other.poster}
                alt=""
                loading="lazy"
                decoding="async"
                className="block size-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {preview && (
          <motion.div
            key="preview"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.94, ...preview.box }}
            animate={{ opacity: 1, scale: 1, ...preview.box }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={spring}
            style={{ transformOrigin: "right center" }}
            className="bg-muted shadow-popover pointer-events-none fixed z-10 overflow-hidden rounded-xl"
          >
            {/* Each video fades in over the last while the frame resizes. */}
            <AnimatePresence initial={false}>
              <motion.div
                key={preview.video.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
                className="absolute inset-0"
              >
                {/* Decorative muted preview of a tile already labelled. */}
                {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={preview.video.preview}
                  poster={preview.video.poster}
                  autoPlay={!reducedMotion}
                  muted
                  loop
                  playsInline
                  className="size-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-5 pt-16 pb-4">
                  <p className="truncate text-lg font-medium text-white">
                    {preview.video.title}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
