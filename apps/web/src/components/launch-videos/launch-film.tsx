import MediaThemeSutro from "player.style/sutro/react";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { Clapperboard } from "reicon-react/icons/Clapperboard";

import { LocalizedLink as Link } from "@/components/localized-link";
import { DetailRow } from "@/components/motion-video";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ROUTES, launchFilmPath } from "@/constants/routes";
import { track } from "@/lib/analytics";
import {
  filmFps,
  filmSeconds,
  fpsLabel,
  ratioLabel,
} from "@/lib/launch-videos";
import type { LaunchFilm, LaunchScene } from "@/lib/launch-videos";
import { fillTemplate } from "@/lib/motion-video-route";
import { findMove, movePath } from "@/lib/moves";
import { cn } from "@/lib/utils";

import { clock, frameAt, lengthLabel, sceneRange } from "./format";
import { AddSceneButton, LaunchPoster } from "./launch-cards";
import { LaunchCopyPanel } from "./launch-copy";

/** A scene's roles as chips, primary first. */
const RoleChips = ({ scene }: { scene: LaunchScene }) => {
  const content = useIntlayer("launch-videos");
  return (
    <span className="flex flex-wrap gap-1">
      {[scene.role, ...scene.secondaryRoles].map((role, index) => (
        <span
          key={role}
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            index === 0 ? "bg-primary text-primary-foreground" : "bg-secondary"
          )}
        >
          {content.roles[role]}
        </span>
      ))}
    </span>
  );
};

/** The chapter button a navigation key moves focus to, if any. */
const chapterTarget = (
  buttons: HTMLButtonElement[],
  index: number,
  key: string
) => {
  switch (key) {
    case "ArrowDown": {
      return buttons[Math.min(index + 1, buttons.length - 1)];
    }
    case "ArrowUp": {
      return buttons[Math.max(index - 1, 0)];
    }
    case "Home": {
      return buttons[0];
    }
    case "End": {
      return buttons.at(-1);
    }
    default: {
      return null;
    }
  }
};

/**
 * The chapter list: one button per scene. Arrow keys, Home and End move
 * between chapters; Enter or a click selects one and seeks to it. The
 * selected chapter shows its edit decisions.
 */
const Chapters = ({
  film,
  scenes,
  selected,
  playing,
  onSelect,
}: {
  film: LaunchFilm;
  scenes: LaunchScene[];
  selected: LaunchScene | undefined;
  /** The chapter under the playhead. */
  playing: LaunchScene | undefined;
  onSelect: (scene: LaunchScene) => void;
}) => {
  const content = useIntlayer("launch-film");
  const id = useId();
  const list = useRef<HTMLOListElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>) => {
    const buttons = [
      ...(list.current?.querySelectorAll<HTMLButtonElement>("[data-chapter]") ??
        []),
    ];
    const focused = document.activeElement;
    const index =
      focused instanceof HTMLButtonElement ? buttons.indexOf(focused) : -1;
    const target = chapterTarget(buttons, index, event.key);
    if (target) {
      event.preventDefault();
      target.focus();
    }
  };
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-base font-medium">
        {content.chapters}
        <span className="text-muted-foreground ml-2 font-normal tabular-nums">
          {scenes.length}
        </span>
      </h2>
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- arrow keys move focus between the chapter buttons inside */}
      <ol ref={list} onKeyDown={onKeyDown} className="flex flex-col gap-1">
        {scenes.map((scene, index) => {
          const range = sceneRange(scene, film);
          const isSelected = scene.id === selected?.id;
          return (
            <li key={scene.id} className="flex flex-col">
              <div
                className={cn(
                  "group flex items-start gap-2 rounded-xl p-1.5 transition-colors",
                  isSelected ? "bg-muted" : "hover:bg-muted/60"
                )}
              >
                <button
                  type="button"
                  data-chapter
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => onSelect(scene)}
                  className="focus-visible:ring-ring flex min-w-0 flex-1 gap-3 rounded-lg text-left outline-none focus-visible:ring-2"
                >
                  <span
                    className="relative w-24 shrink-0 overflow-hidden rounded-md"
                    style={{ aspectRatio: `${film.width} / ${film.height}` }}
                  >
                    <LaunchPoster
                      src={scene.poster}
                      width={96}
                      height={Math.round((96 * film.height) / film.width)}
                      className="absolute inset-0 size-full"
                    />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-muted-foreground flex items-center gap-2 text-xs tabular-nums">
                      <span>{index + 1}</span>
                      <span>
                        {clock(range.start)}–{clock(range.end)}
                      </span>
                      {playing?.id === scene.id && (
                        <span className="text-foreground">
                          {content.nowPlaying}
                        </span>
                      )}
                    </span>
                    <span className="text-sm leading-tight font-medium">
                      {scene.title}
                    </span>
                    <RoleChips scene={scene} />
                  </span>
                </button>
                <AddSceneButton scene={scene} surface="film" />
              </div>
              {isSelected && (
                <div className="flex flex-col gap-1 px-2 pt-2 pb-3 text-sm">
                  <p className="text-pretty">{scene.device}</p>
                  <p className="text-muted-foreground text-pretty">
                    {scene.description}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

/** Every chapter as text: always available, whatever the player does. */
const Outline = ({
  film,
  scenes,
}: {
  film: LaunchFilm;
  scenes: LaunchScene[];
}) => {
  const content = useIntlayer("launch-film");
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        {content.outline}
      </h2>
      <ol className="flex flex-col gap-6">
        {scenes.map((scene) => {
          const range = sceneRange(scene, film);
          const moves = scene.moves.flatMap((slug) => findMove(slug) ?? []);
          return (
            <li key={scene.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  {clock(range.start)}–{clock(range.end)}
                </span>
                <h3 className="font-medium">{scene.title}</h3>
                <RoleChips scene={scene} />
              </div>
              <p className="text-pretty">
                <span className="text-muted-foreground">{content.device} </span>
                {scene.device}
              </p>
              <p className="text-muted-foreground text-pretty">
                {scene.description}
              </p>
              {moves.length > 0 && (
                <p className="text-sm">
                  <span className="text-muted-foreground">
                    {content.relatedMoves}{" "}
                  </span>
                  {moves.map((move, index) => (
                    <span key={move.slug}>
                      {index > 0 && ", "}
                      <Link
                        to={movePath(move)}
                        className="underline underline-offset-4"
                      >
                        {move.name}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

/**
 * /launch-videos/$film: the full film in the Sutro player with its chapter
 * list, credits, the text outline and the copy panel. `?scene=` selects a
 * chapter and seeks to it once the metadata is in; playback then carries on
 * normally unless Scene loop is on.
 */
export const LaunchFilmPage = ({
  film,
  scenes,
  selected,
  onSelect,
}: {
  film: LaunchFilm;
  scenes: LaunchScene[];
  selected: LaunchScene | undefined;
  /** Puts the chapter in the URL (replacing the entry). */
  onSelect: (scene: LaunchScene) => void;
}) => {
  const content = useIntlayer("launch-film");
  const shared = useIntlayer("launch-videos");
  const video = useRef<HTMLVideoElement>(null);
  const seekedFor = useRef<string | null>(null);
  const [time, setTime] = useState(0);
  const [loop, setLoop] = useState(false);
  const [failed, setFailed] = useState(false);
  const loopHintId = useId();

  // Once per page: which film, and whether a shared scene link opened it.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) {
      return;
    }
    opened.current = true;
    track("launch_film_open", {
      film: film.slug,
      surface: selected ? "scene_link" : "direct",
    });
    if (selected) {
      track("launch_scene_open", {
        film: film.slug,
        scene: selected.id,
        role: selected.role,
        surface: "link",
      });
    }
  }, [film.slug, selected]);

  // Seek to the selected chapter once its metadata is in, once per pick.
  useEffect(() => {
    const element = video.current;
    if (!element || !selected || seekedFor.current === selected.id) {
      return;
    }
    const seek = () => {
      element.currentTime = sceneRange(selected, film).start;
      seekedFor.current = selected.id;
    };
    if (element.readyState >= HTMLMediaElement.HAVE_METADATA) {
      seek();
      return;
    }
    element.addEventListener("loadedmetadata", seek, { once: true });
    return () => element.removeEventListener("loadedmetadata", seek);
  }, [film, selected]);

  const onTimeUpdate = () => {
    const element = video.current;
    if (!element) {
      return;
    }
    if (loop && selected) {
      const frame = frameAt(element.currentTime, film);
      if (frame >= selected.endFrame || frame < selected.startFrame) {
        element.currentTime = sceneRange(selected, film).start;
      }
    }
    setTime(element.currentTime);
  };

  const select = (scene: LaunchScene) => {
    const element = video.current;
    seekedFor.current = scene.id;
    if (element) {
      element.currentTime = sceneRange(scene, film).start;
      // A click is a gesture: play with sound if the browser allows.
      const play = async () => {
        try {
          await element.play();
        } catch {
          // Blocked: the chapter is cued; the controls start it.
        }
      };
      void play();
    }
    track("launch_scene_open", {
      film: film.slug,
      scene: scene.id,
      role: scene.role,
      surface: "chapter",
    });
    onSelect(scene);
  };

  const frame = frameAt(time, film);
  const playing = scenes.find(
    (scene) => frame >= scene.startFrame && frame < scene.endFrame
  );

  return (
    <main
      id="main-content"
      className="mx-auto grid w-full max-w-[1800px] gap-8 px-4 pt-6 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="flex min-w-0 flex-col gap-6">
        <Link
          to={ROUTES.LAUNCH_VIDEOS}
          className="text-muted-foreground hover:text-foreground w-fit text-sm underline-offset-4 transition-colors hover:underline"
        >
          ← {content.back}
        </Link>
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {film.title}
          </h1>
          <p className="text-muted-foreground text-pretty">{film.summary}</p>
        </header>
        <div className="flex flex-col gap-3">
          <MediaThemeSutro
            className="relative block w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: `${film.width} / ${film.height}` }}
          >
            {/* The catalog has no caption tracks yet; the outline below
                carries every chapter as text. */}
            {/* oxlint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={video}
              slot="media"
              src={film.video}
              poster={film.poster}
              playsInline
              preload="metadata"
              // The Sutro theme sets this on its media before hydration (its
              // controls take keyboard focus); matching it keeps hydration
              // clean.
              tabIndex={-1}
              aria-label={film.title}
              onTimeUpdate={onTimeUpdate}
              onError={() => setFailed(true)}
              className="bg-muted size-full object-cover"
            />
          </MediaThemeSutro>
          {failed && (
            <p role="alert" className="text-muted-foreground text-sm">
              {content.playerError}{" "}
              <a
                href={film.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                {film.source.label}
              </a>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={loop}
                disabled={!selected}
                onCheckedChange={setLoop}
                aria-describedby={loopHintId}
              />
              {content.sceneLoop}
            </label>
            <span id={loopHintId} className="text-muted-foreground text-xs">
              {selected
                ? fillTemplate(content.loopHint.value, {
                    title: selected.title,
                  })
                : content.loopPick}
            </span>
          </div>
        </div>
        <dl className="flex flex-col">
          <DetailRow label={content.brand}>{film.brand}</DetailRow>
          <DetailRow label={content.kind}>{shared.kinds[film.kind]}</DetailRow>
          <DetailRow label={content.length}>
            <span className="tabular-nums">
              {lengthLabel(filmSeconds(film))}
            </span>
          </DetailRow>
          <DetailRow label={content.ratio}>
            <span className="tabular-nums">
              {ratioLabel(film.width, film.height)} · {film.width}×{film.height}
            </span>
          </DetailRow>
          <DetailRow label={content.frameRate}>
            <span className="tabular-nums">{fpsLabel(filmFps(film))} fps</span>
          </DetailRow>
          <DetailRow label={content.styles}>
            {film.styles.map((style) => shared.styles[style].value).join(", ")}
          </DetailRow>
          <DetailRow label={content.source}>
            <a
              href={film.source.url}
              target="_blank"
              rel="noopener noreferrer"
              data-track="launch_source_click"
              data-track-film={film.slug}
              className="inline-flex items-center gap-1 underline underline-offset-4"
            >
              {film.source.label}
              <ArrowRightUp aria-hidden="true" className="size-3.5" />
            </a>
          </DetailRow>
          {film.credits.map((credit) => (
            <DetailRow
              key={`${credit.role}:${credit.name}`}
              label={credit.role}
            >
              {credit.url ? (
                <a
                  href={credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  {credit.name}
                </a>
              ) : (
                credit.name
              )}
            </DetailRow>
          ))}
        </dl>
        <Outline film={film} scenes={scenes} />
      </div>
      <aside className="flex flex-col gap-8 lg:sticky lg:top-4 lg:max-h-[calc(100svh-2rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
        <Chapters
          film={film}
          scenes={scenes}
          selected={selected}
          playing={playing}
          onSelect={select}
        />
        <Link
          to={ROUTES.LAUNCH_VIDEOS_COMPOSE}
          className={buttonVariants({ variant: "outline" })}
        >
          <Clapperboard aria-hidden="true" />
          {content.openStoryboard}
        </Link>
        <LaunchCopyPanel
          film={film}
          scene={selected}
          redirect={launchFilmPath(film.slug, selected?.slug)}
        />
      </aside>
    </main>
  );
};
