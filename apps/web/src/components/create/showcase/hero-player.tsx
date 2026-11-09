import {
  getTemplate,
  newShowcaseDoc,
  showcaseVideoConfig,
} from "@motionvideo/engine";
import type { ShowcaseDoc } from "@motionvideo/engine";
import { Showcase } from "@motionvideo/engine/composition";
import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { starterMedia } from "@/components/create/showcase/editor/samples";
import { LocalizedLink as Link } from "@/components/localized-link";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// The real Showcase engine on the marketing pages: a Remotion player cycling
// through a few templates with the sample library, one loop each. Browser
// only (three.js, WebGL); pages load it lazily inside ClientOnly.

const RESOLUTION = 720;
const FPS = 30;

/** A template's document with the sample media its frame suits. */
const docFor = (templateId: string): ShowcaseDoc => {
  const doc = newShowcaseDoc(templateId);
  const media = starterMedia(
    doc.style.cards.frame === "phone" ? "phone" : "other"
  );
  return { ...doc, name: getTemplate(templateId).name, media };
};

export const HeroPlayer = ({
  templates,
  chips = true,
  className,
}: {
  /** Template ids, played in order. */
  templates: readonly string[];
  /** Template buttons and an editor link under the player. */
  chips?: boolean;
  className?: string;
}) => {
  const content = useIntlayer("showcase-hero-player");
  const player = useRef<PlayerRef>(null);
  const frame = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const templateId = templates[index % templates.length] ?? templates[0];
  const doc = useMemo(() => docFor(templateId), [templateId]);
  // Sample media are remote URLs, so each item's source is its own URL.
  const sources = useMemo(
    () =>
      Object.fromEntries(
        doc.media.flatMap((item) =>
          item.ref.type === "url" ? [[item.id, item.ref.url]] : []
        )
      ),
    [doc]
  );
  const config = showcaseVideoConfig(doc, RESOLUTION, FPS);

  // Switches template and starts it from its first frame.
  const show = useCallback((pick: (i: number) => number) => {
    setIndex(pick);
    const { current } = player;
    if (current && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.seekTo(0);
      current.play();
    }
  }, []);

  // One loop per template, then the next.
  useEffect(() => {
    const { current } = player;
    if (!current) {
      return;
    }
    const next = () => show((i) => (i + 1) % templates.length);
    current.addEventListener("ended", next);
    return () => current.removeEventListener("ended", next);
  }, [templates.length, show]);

  // Off screen the WebGL canvas rests.
  useEffect(() => {
    const element = frame.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          player.current?.play();
        } else {
          player.current?.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <figure
        ref={frame}
        aria-label={`${content.player.value}: ${doc.name}`}
        className="bg-muted relative aspect-video overflow-hidden rounded-xl border shadow-sm"
      >
        <Player
          ref={player}
          component={Showcase}
          inputProps={{ doc, sources }}
          durationInFrames={config.durationInFrames}
          fps={config.fps}
          compositionWidth={config.width}
          compositionHeight={config.height}
          initialFrame={Math.round(config.durationInFrames / 4)}
          acknowledgeRemotionLicense
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          style={{ width: "100%", height: "100%" }}
        />
      </figure>
      {chips && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <fieldset className="flex flex-wrap gap-1.5">
            <legend className="sr-only">{content.templates}</legend>
            {templates.map((id, i) => (
              <button
                key={id}
                type="button"
                aria-pressed={id === templateId}
                onClick={() => show(() => i)}
                className="bg-secondary text-muted-foreground hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background focus-visible:ring-ring/50 rounded-full px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-3"
              >
                {getTemplate(id).name}
              </button>
            ))}
          </fieldset>
          <Link
            to={ROUTES.CREATE_SHOWCASE_EDITOR}
            search={{ template: templateId }}
            data-track="showcase_hero_use_template"
            data-track-template={templateId}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm underline-offset-4 transition-colors hover:underline"
          >
            {content.useTemplate}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
