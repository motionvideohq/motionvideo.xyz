import { useEffect, useRef, useState } from "react";
import { Mute } from "reicon-react/icons/Mute";
import { Pause } from "reicon-react/icons/Pause";
import { Play } from "reicon-react/icons/Play";
import { Volume } from "reicon-react/icons/Volume";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Clip {
  video: string;
  poster: string;
}

type Side = "before" | "after";

interface BeforeAfterProps {
  before: Clip;
  after: Clip;
  /** Translated strings; plain text, used in labels and aria attributes. */
  labels: {
    before: string;
    after: string;
    sound: string;
    mute: string;
    play: string;
    pause: string;
  };
}

// The two videos show the same moment, but the Before (an existing clipper
// edit) can be shorter or trimmed. The After leads: it loops, and the Before
// follows its play, pause, seeks and loop restarts, holding its last frame if
// it ends first. Pausing or seeking the Before is mirrored on the After.
const SEEK_TOLERANCE_S = 0.08;
const DRIFT_TOLERANCE_S = 0.15;

const play = async (video: HTMLVideoElement) => {
  try {
    await video.play();
  } catch {
    // Autoplay can be denied, or there is no source yet; the posters stay.
  }
};

/**
 * Two muted, looping portrait (9:16) videos side by side at phone size on
 * every screen width, labelled Before and After, playing in sync while on
 * screen. Tapping a video plays
 * its sound and mutes the other; one button pauses or plays both. With
 * reduced motion they wait on their posters until played.
 */
export const BeforeAfter = ({ before, after, labels }: BeforeAfterProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLVideoElement>(null);
  const afterRef = useRef<HTMLVideoElement>(null);
  const [audible, setAudible] = useState<Side | null>(null);
  const [playing, setPlaying] = useState(false);
  // Paused by the visitor: stays paused when scrolled back into view.
  const heldRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const first = beforeRef.current;
    const second = afterRef.current;
    if (!container || !first || !second) {
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    // React doesn't always carry `muted` from the server HTML into the
    // element, and browsers only autoplay muted video.
    first.muted = true;
    second.muted = true;
    for (const [from, to] of [
      [first, second],
      [second, first],
    ] as const) {
      from.addEventListener(
        "play",
        () => {
          if (to.paused && !(to === first && to.ended)) {
            void play(to);
          }
        },
        { signal }
      );
      from.addEventListener(
        "pause",
        () => {
          // The Before reaching its end pauses it; that must not stop the After.
          if (!to.paused && !from.ended) {
            to.pause();
          }
        },
        { signal }
      );
      from.addEventListener(
        "seeked",
        () => {
          if (
            Math.abs(to.currentTime - from.currentTime) > SEEK_TOLERANCE_S &&
            from.currentTime < (to.duration || Number.POSITIVE_INFINITY)
          ) {
            to.currentTime = from.currentTime;
          }
        },
        { signal }
      );
    }
    second.addEventListener(
      "timeupdate",
      () => {
        if (second.paused) {
          return;
        }
        // The After looped: restart the Before with it.
        if (first.ended && second.currentTime < 1) {
          first.currentTime = 0;
          void play(first);
          return;
        }
        if (
          second.currentTime < first.duration &&
          Math.abs(first.currentTime - second.currentTime) > DRIFT_TOLERANCE_S
        ) {
          first.currentTime = second.currentTime;
        }
      },
      { signal }
    );
    second.addEventListener("play", () => setPlaying(true), { signal });
    second.addEventListener("pause", () => setPlaying(false), { signal });

    // Autoplay while on screen, like the gallery previews.
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      if (
        visible &&
        !heldRef.current &&
        !reducedMotion.matches &&
        !document.hidden
      ) {
        void play(second);
      } else {
        second.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.25 }
    );
    observer.observe(container);
    reducedMotion.addEventListener("change", update, { signal });
    document.addEventListener("visibilitychange", update, { signal });
    return () => {
      controller.abort();
      observer.disconnect();
      second.pause();
    };
  }, []);

  const toggleSound = (side: Side) => {
    const next = audible === side ? null : side;
    // Set here, in the tap, so the browser counts it as a user gesture.
    if (beforeRef.current && afterRef.current) {
      beforeRef.current.muted = next !== "before";
      afterRef.current.muted = next !== "after";
    }
    setAudible(next);
    if (next && afterRef.current?.paused) {
      heldRef.current = false;
      void play(afterRef.current);
    }
  };

  const togglePlayback = () => {
    const video = afterRef.current;
    if (!video) {
      return;
    }
    if (video.paused) {
      heldRef.current = false;
      void play(video);
    } else {
      heldRef.current = true;
      video.pause();
    }
  };

  const panes = [
    { side: "before", clip: before, label: labels.before, ref: beforeRef },
    { side: "after", clip: after, label: labels.after, ref: afterRef },
  ] as const;

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      {/* Side by side at every width; the 9:16 boxes hold their size before
          the posters load, so nothing shifts. */}
      <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-2 sm:gap-4">
        {panes.map(({ side, clip, label, ref }) => {
          const on = audible === side;
          return (
            <figure
              key={side}
              className="bg-muted shadow-outline relative aspect-9/16 overflow-hidden rounded-2xl sm:rounded-3xl"
            >
              {/* The sound is the stream's own; there is no speech to caption beyond it. */}
              {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={ref}
                src={clip.video}
                poster={clip.poster}
                muted
                loop={side === "after"}
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
              <figcaption className="bg-background/90 absolute top-2 left-2 rounded-md px-2 py-1 text-xs font-medium sm:top-3 sm:left-3">
                {label}
              </figcaption>
              <button
                type="button"
                aria-pressed={on}
                aria-label={`${label}: ${on ? labels.mute : labels.sound}`}
                onClick={() => toggleSound(side)}
                className="focus-visible:ring-ring/50 absolute inset-0 flex items-end justify-center rounded-[inherit] p-2 outline-none focus-visible:ring-[3px] sm:p-3"
              >
                <span
                  className={cn(
                    "bg-background/90 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] whitespace-nowrap sm:text-xs",
                    on && "text-foreground"
                  )}
                >
                  {on ? (
                    <Volume aria-hidden="true" className="size-3.5" />
                  ) : (
                    <Mute aria-hidden="true" className="size-3.5" />
                  )}
                  {!on && labels.sound}
                </span>
              </button>
            </figure>
          );
        })}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={togglePlayback}
        className="self-center"
      >
        {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        {playing ? labels.pause : labels.play}
      </Button>
    </div>
  );
};
