import { useEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent } from "react";
import { useIntlayer } from "react-intlayer";
import { Check } from "reicon-react/icons/Check";
import { Clapperboard } from "reicon-react/icons/Clapperboard";
import { Plus } from "reicon-react/icons/Plus";

import { LocalizedLink as Link } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTransientStatus } from "@/hooks/use-transient-status";
import { ratioLabel, filmSeconds, sceneSeconds } from "@/lib/launch-videos";
import type { LaunchFilm, LaunchScene } from "@/lib/launch-videos";
import { fillTemplate } from "@/lib/motion-video-route";
import { cn } from "@/lib/utils";

import { draftActions } from "./draft";
import { lengthLabel, sceneRange } from "./format";

/**
 * A poster that fills its box; if it fails to load, a quiet placeholder
 * takes its place instead of a broken image.
 */
export const LaunchPoster = ({
  src,
  width,
  height,
  className,
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  // An error during server-rendered loading fires before React listens.
  const check = (element: HTMLImageElement | null) => {
    if (element?.complete && element.naturalWidth === 0) {
      setFailed(true);
    }
  };
  return failed ? (
    <span
      aria-hidden="true"
      className={cn(
        "bg-muted text-muted-foreground flex items-center justify-center",
        className
      )}
    >
      <Clapperboard className="size-5 opacity-60" />
    </span>
  ) : (
    <img
      ref={check}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      onError={() => setFailed(true)}
      className={cn("bg-muted object-cover", className)}
    />
  );
};

/**
 * A card's media: the poster, and a muted preview that plays only while the
 * card is hovered or keyboard-focused (`active`), never with reduced motion.
 * Nothing loads until then. With `range` it plays the film from `start` and
 * loops back at `end`, so a scene card shows only its own chapter.
 */
export const LaunchPreview = ({
  poster,
  src,
  width,
  height,
  active,
  range,
}: {
  poster: string;
  src: string;
  width: number;
  height: number;
  active: boolean;
  range?: { start: number; end: number };
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const content = useIntlayer("launch-videos");

  useEffect(() => {
    const element = ref.current;
    if (!element || failed) {
      return;
    }
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    if (!active || reducedMotion.matches) {
      // The pause event (onPause) clears `playing`.
      element.pause();
      return;
    }
    if (!element.getAttribute("src")) {
      element.src = src;
    }
    const start = range?.start ?? 0;
    // Into the scene's range, once the duration is known.
    const cue = () => {
      if (
        range &&
        (element.currentTime < start || element.currentTime >= range.end)
      ) {
        element.currentTime = start;
      }
    };
    const loop = () => {
      if (range && element.currentTime >= range.end) {
        element.currentTime = start;
      }
    };
    element.addEventListener("timeupdate", loop);
    if (element.readyState >= HTMLMediaElement.HAVE_METADATA) {
      cue();
    } else {
      element.addEventListener("loadedmetadata", cue, { once: true });
    }
    // play() itself starts the load (the element preloads nothing).
    const startPlaying = async () => {
      try {
        await element.play();
        setPlaying(true);
      } catch {
        // Autoplay denied, or the media failed (onError shows that): the
        // poster stays.
      }
    };
    void startPlaying();
    return () => {
      element.removeEventListener("timeupdate", loop);
      element.removeEventListener("loadedmetadata", cue);
      element.pause();
    };
  }, [active, failed, range, src]);

  return (
    <div
      className="bg-muted shadow-outline relative overflow-hidden rounded-xl"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <LaunchPoster
        src={poster}
        width={width}
        height={height}
        className="absolute inset-0 size-full"
      />
      {/* Decorative muted preview; the film page has the full player. */}
      {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={ref}
        muted
        playsInline
        loop={!range}
        preload="none"
        aria-hidden="true"
        onError={() => setFailed(true)}
        onPause={() => setPlaying(false)}
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-200 motion-reduce:transition-none",
          playing ? "opacity-100" : "opacity-0"
        )}
      />
      {failed && (
        <span className="bg-background/90 text-muted-foreground absolute bottom-2 left-2 rounded px-2 py-1 text-xs">
          {content.previewError}
        </span>
      )}
    </div>
  );
};

/** Hover or keyboard focus anywhere in the card turns its preview on. */
const useCardActive = () => {
  const [active, setActive] = useState(false);
  return {
    active,
    handlers: {
      onPointerEnter: () => setActive(true),
      onPointerLeave: () => setActive(false),
      onFocus: () => setActive(true),
      onBlur: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setActive(false);
        }
      },
    },
  };
};

const chipClass =
  "rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm";

/** Adds a scene to the local storyboard, with a moment of feedback. */
export const AddSceneButton = ({
  scene,
  surface,
  size = "icon-sm",
  className,
}: {
  scene: LaunchScene;
  surface: string;
  size?: "icon-sm" | "sm";
  className?: string;
}) => {
  const content = useIntlayer("launch-videos");
  const [status, flash] = useTransientStatus<"idle" | "added" | "full">("idle");
  const labels = {
    added: content.added.value,
    full: content.storyboardFull.value,
    idle: content.addToStoryboard.value,
  };
  const label = labels[status];
  return (
    <Button
      variant="outline"
      size={size}
      aria-label={size === "sm" ? undefined : label}
      title={label}
      className={cn(size === "icon-sm" && "rounded-full", className)}
      onClick={() =>
        flash(draftActions.add(scene.id, surface) ? "added" : "full")
      }
    >
      {status === "added" ? (
        <Check aria-hidden="true" />
      ) : (
        <Plus aria-hidden="true" />
      )}
      {size === "sm" && label}
      <output className="sr-only">{status === "idle" ? "" : label}</output>
    </Button>
  );
};

/** A film in the Videos view: poster, preview on hover, the facts below. */
export const FilmCard = ({ film }: { film: LaunchFilm }) => {
  const content = useIntlayer("launch-videos");
  const { active, handlers } = useCardActive();
  const tags = film.styles.slice(0, 2);
  return (
    <article className="group/card flex flex-col gap-2" {...handlers}>
      <Link
        to={ROUTES.LAUNCH_VIDEO_FILM}
        params={{ film: film.slug }}
        aria-label={fillTemplate(content.watch.value, { title: film.title })}
        className="focus-visible:ring-ring relative block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <LaunchPreview
          poster={film.poster}
          src={film.preview}
          width={film.width}
          height={film.height}
          active={active}
        />
        <span className="pointer-events-none absolute top-2.5 left-2.5 flex gap-1">
          {tags.map((style) => (
            <span key={style} className={chipClass}>
              {content.styles[style]}
            </span>
          ))}
        </span>
      </Link>
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate text-sm font-medium tracking-tight">
            {film.title}
          </h2>
          <p className="text-muted-foreground truncate text-xs">{film.brand}</p>
        </div>
        <p className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {lengthLabel(filmSeconds(film))} ·{" "}
          {ratioLabel(film.width, film.height)}
        </p>
      </div>
    </article>
  );
};

/** A scene in the Scenes view: its chapter loops on hover; add it in place. */
export const SceneCard = ({
  scene,
  film,
}: {
  scene: LaunchScene;
  film: LaunchFilm;
}) => {
  const content = useIntlayer("launch-videos");
  const { active, handlers } = useCardActive();
  const range = useMemo(() => sceneRange(scene, film), [scene, film]);
  return (
    <article className="group/card relative flex flex-col gap-2" {...handlers}>
      <Link
        to={ROUTES.LAUNCH_VIDEO_FILM}
        params={{ film: film.slug }}
        search={{ scene: scene.slug }}
        aria-label={`${scene.title}. ${fillTemplate(content.fromFilm.value, { film: film.title })}`}
        className="focus-visible:ring-ring relative block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <LaunchPreview
          poster={scene.poster}
          src={film.video}
          width={film.width}
          height={film.height}
          active={active}
          range={range}
        />
        <span className="pointer-events-none absolute top-2.5 left-2.5 flex flex-wrap gap-1 pr-12">
          {[scene.role, ...scene.secondaryRoles].map((role) => (
            <span key={role} className={chipClass}>
              {content.roles[role]}
            </span>
          ))}
        </span>
        <span className="pointer-events-none absolute right-2.5 bottom-2.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white tabular-nums backdrop-blur-sm">
          {lengthLabel(sceneSeconds(scene, film))}
        </span>
      </Link>
      {/* A sibling of the card link: buttons can't nest in a link. */}
      <AddSceneButton
        scene={scene}
        surface="card"
        className="absolute top-2.5 right-2.5"
      />
      <div className="flex flex-col gap-0.5 px-0.5">
        <p className="line-clamp-2 text-sm text-pretty">{scene.device}</p>
        <p className="text-muted-foreground truncate text-xs">
          {fillTemplate(content.fromFilm.value, { film: film.title })} ·{" "}
          {film.brand}
        </p>
      </div>
    </article>
  );
};
