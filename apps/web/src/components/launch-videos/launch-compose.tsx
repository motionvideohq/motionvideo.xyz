import { useId, useMemo, useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { useIntlayer } from "react-intlayer";
import { ArrowDown } from "reicon-react/icons/ArrowDown";
import { ArrowUp } from "reicon-react/icons/ArrowUp";
import { Check } from "reicon-react/icons/Check";
import { Clapperboard } from "reicon-react/icons/Clapperboard";
import { Copy3 } from "reicon-react/icons/Copy3";
import { Play } from "reicon-react/icons/Play";
import { Reorder } from "reicon-react/icons/Reorder";
import { Trash } from "reicon-react/icons/Trash";
import { z } from "zod";

import { CollectionEmptyState } from "@/components/collection-grid";
import { LocalizedLink as Link } from "@/components/localized-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ROUTES } from "@/constants/routes";
import { track } from "@/lib/analytics";
import { findLaunchFilm, findLaunchScene } from "@/lib/launch-catalog";
import { MAX_STORYBOARD_SCENES, sceneSeconds } from "@/lib/launch-videos";
import type { LaunchFilm, LaunchScene, SceneRole } from "@/lib/launch-videos";
import { fillTemplate } from "@/lib/motion-video-route";
import { cn } from "@/lib/utils";
import { composeLaunchPrompt } from "@/server/launch-functions";

import { draftActions, outputOptions, useLaunchDraft } from "./draft";
import type { LaunchDraft, StoryboardItem } from "./draft";
import { lengthLabel, sceneRange } from "./format";
import { LaunchPreview } from "./launch-cards";
import {
  LaunchCopyButton,
  LaunchCopyResult,
  LaunchOptions,
  useLaunchCopy,
} from "./launch-copy";
import type { LaunchPromptError } from "./launch-copy";

// The suggested arc: slots to aim for, never a rule. A storyboard can open
// on the product, merge proof and demo, repeat features or skip the CTA.
const SUGGESTED = [
  { id: "hook", roles: ["hook"] },
  { id: "reveal", roles: ["reveal"] },
  { id: "payoff", roles: ["demo", "proof", "feature"] },
  { id: "cta", roles: ["cta", "brand-outro"] },
] as const satisfies readonly { id: string; roles: readonly SceneRole[] }[];

interface Row {
  item: StoryboardItem;
  scene: LaunchScene;
  film: LaunchFilm;
}

type JoinKind = "cut" | "bridge";

/** The joins the storyboard asks for, by outgoing position. */
const joinsOf = (items: StoryboardItem[]) =>
  items.flatMap((item, index) =>
    item.join && items[index + 1]?.key === item.join.to
      ? [{ after: index, kind: item.join.kind }]
      : []
  );

const numberDetail = (error: LaunchPromptError, key: string) => {
  const parsed = z.number().safeParse(error.details[key]);
  return parsed.success ? parsed.data : undefined;
};

/** Where a reorder key sends the row at `index`, or null for other keys. */
const handleKeyTarget = (key: string, index: number, count: number) => {
  switch (key) {
    case "ArrowUp": {
      return index - 1;
    }
    case "ArrowDown": {
      return index + 1;
    }
    case "Home": {
      return 0;
    }
    case "End": {
      return count - 1;
    }
    default: {
      return null;
    }
  }
};

/** How scene `index` meets the next: the compiler's default, a cut or a bridge. */
const JoinControl = ({
  index,
  kind,
}: {
  index: number;
  kind: JoinKind | undefined;
}) => {
  const content = useIntlayer("launch-compose");
  const choices = [
    { value: null, label: content.joinAuto },
    { value: "cut", label: content.cut },
    { value: "bridge", label: content.bridge },
  ] as const;
  return (
    <div className="flex items-center gap-2 py-1 pl-10">
      <span className="text-muted-foreground text-xs">{content.join}</span>
      <ButtonGroup
        aria-label={fillTemplate(content.joinAfter.value, {
          position: String(index + 1),
        })}
      >
        {choices.map((choice) => (
          <Button
            key={choice.value ?? "auto"}
            size="xs"
            variant={(kind ?? null) === choice.value ? "secondary" : "ghost"}
            aria-pressed={(kind ?? null) === choice.value}
            onClick={() => draftActions.setJoin(index, choice.value)}
          >
            {choice.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

/** One storyboard row: drag or arrow keys to reorder, preview, duplicate, remove. */
const StoryboardRow = ({
  row,
  index,
  count,
  dragging,
  onDragStart,
  onDragEnd,
  onDrop,
  onMove,
  handleRef,
  helpId,
}: {
  row: Row;
  index: number;
  count: number;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onMove: (to: number) => void;
  handleRef: (element: HTMLButtonElement | null) => void;
  /** The hidden help text on reordering by keyboard. */
  helpId: string;
}) => {
  const content = useIntlayer("launch-compose");
  const shared = useIntlayer("launch-videos");
  const [preview, setPreview] = useState(false);
  const [hover, setHover] = useState(false);
  const { scene, film } = row;
  const range = useMemo(() => sceneRange(scene, film), [scene, film]);
  const onHandleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const to = handleKeyTarget(event.key, index, count);
    if (to !== null && to >= 0 && to < count && to !== index) {
      event.preventDefault();
      onMove(to);
    }
  };
  return (
    <div
      draggable
      onDragStart={(event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", row.item.key);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      className={cn(
        "bg-card shadow-outline flex items-center gap-3 rounded-xl p-2 transition-opacity",
        dragging && "opacity-50"
      )}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label={fillTemplate(content.reorder.value, { title: scene.title })}
        aria-describedby={helpId}
        onKeyDown={onHandleKey}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md outline-none focus-visible:ring-2 active:cursor-grabbing"
      >
        <Reorder aria-hidden="true" className="size-4" />
      </button>
      <span className="text-muted-foreground w-5 shrink-0 text-center text-sm tabular-nums">
        {index + 1}
      </span>
      <div className="w-28 shrink-0 sm:w-40">
        <LaunchPreview
          poster={scene.poster}
          src={film.video}
          width={film.width}
          height={film.height}
          active={preview || hover}
          range={range}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          to={ROUTES.LAUNCH_VIDEO_FILM}
          params={{ film: film.slug }}
          search={{ scene: scene.slug }}
          className="truncate text-sm font-medium hover:underline"
        >
          {scene.title}
        </Link>
        <span className="text-muted-foreground truncate text-xs">
          {fillTemplate(shared.fromFilm.value, { film: film.title })} ·{" "}
          <span className="tabular-nums">
            {lengthLabel(sceneSeconds(scene, film))}
          </span>
        </span>
        <span className="flex flex-wrap gap-1">
          {[scene.role, ...scene.secondaryRoles].map((role) => (
            <span
              key={role}
              className="bg-secondary rounded-full px-2 py-0.5 text-[11px]"
            >
              {shared.roles[role]}
            </span>
          ))}
        </span>
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={content.preview.value}
          aria-pressed={preview}
          title={content.preview.value}
          onClick={() => setPreview(!preview)}
        >
          <Play aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={content.moveUp.value}
          title={content.moveUp.value}
          disabled={index === 0}
          onClick={() => onMove(index - 1)}
        >
          <ArrowUp aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={content.moveDown.value}
          title={content.moveDown.value}
          disabled={index === count - 1}
          onClick={() => onMove(index + 1)}
        >
          <ArrowDown aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={content.duplicate.value}
          title={content.duplicate.value}
          disabled={count >= MAX_STORYBOARD_SCENES}
          onClick={() => draftActions.duplicate(row.item.key)}
        >
          <Copy3 aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={content.remove.value}
          title={content.remove.value}
          onClick={() => draftActions.remove(row.item.key)}
        >
          <Trash aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

/** Hook → Reveal → Demo/Payoff → CTA, ticked off as the storyboard covers them. */
const SuggestedArc = ({ rows }: { rows: Row[] }) => {
  const content = useIntlayer("launch-compose");
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h2 id={id} className="text-sm font-medium">
          {content.suggested}
        </h2>
        <p className="text-muted-foreground text-xs">{content.suggestedHint}</p>
      </div>
      <ol className="flex flex-wrap items-center gap-2">
        {SUGGESTED.map((slot, index) => {
          const roles: readonly SceneRole[] = slot.roles;
          const covered = rows.some(({ scene }) =>
            [scene.role, ...scene.secondaryRoles].some((role) =>
              roles.includes(role)
            )
          );
          return (
            <li key={slot.id} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className="text-muted-foreground">
                  →
                </span>
              )}
              <Link
                to={ROUTES.LAUNCH_VIDEOS}
                search={{ view: "scenes", role: slot.roles.join(",") }}
                title={fillTemplate(content.findScene.value, {
                  slot: content.slots[slot.id].value,
                })}
                className={cn(
                  buttonVariants({
                    variant: covered ? "secondary" : "outline",
                    size: "sm",
                  }),
                  "rounded-full"
                )}
              >
                {covered && <Check aria-hidden="true" />}
                {content.slots[slot.id]}
                <span className="sr-only">
                  {covered ? ` (${content.covered.value})` : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

/**
 * /launch-videos/compose: an ordered storyboard of scenes from any films,
 * one brand brief, and one master prompt copied through composeLaunchPrompt.
 * Only scene IDs, order, joins and non-sensitive inputs are kept, locally.
 */
export const LaunchCompose = () => {
  const content = useIntlayer("launch-compose");
  const helpId = useId();
  const draft = useLaunchDraft();
  const copy = useLaunchCopy("compose");
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const handles = useRef(new Map<string, HTMLButtonElement>());

  const rows: Row[] = draft.items.flatMap((item) => {
    const scene = findLaunchScene(item.sceneId);
    const film = scene && findLaunchFilm(scene.filmSlug);
    return scene && film ? [{ item, scene, film }] : [];
  });
  const sceneIds = rows.map(({ scene }) => scene.id);
  const seconds = rows.reduce(
    (sum, { scene, film }) => sum + sceneSeconds(scene, film),
    0
  );

  const move = (from: number, to: number, keepFocus: boolean) => {
    const row = rows[from];
    if (!row) {
      return;
    }
    // Committed now, so the moved handle can take focus back below.
    flushSync(() => draftActions.move(from, to));
    setAnnouncement(
      fillTemplate(content.moved.value, {
        title: row.scene.title,
        position: String(to + 1),
        count: String(rows.length),
      })
    );
    if (keepFocus) {
      // Reordering moves the focused handle in the DOM, which blurs it.
      handles.current.get(row.item.key)?.focus();
    }
  };

  const copyStoryboard = async (
    overrides: {
      join?: { after: number; kind: JoinKind };
      draft?: Partial<LaunchDraft>;
    } = {}
  ) => {
    const options = { ...draft, ...overrides.draft };
    const joins = joinsOf(draft.items).filter(
      (join) => join.after !== overrides.join?.after
    );
    if (overrides.join) {
      joins.push(overrides.join);
    }
    const films = new Set(rows.map(({ film }) => film.slug)).size;
    const analytics = {
      count: rows.length,
      films,
      mode: options.mode,
      renderer: options.renderer,
    };
    const result = await copy.run(
      "storyboard",
      () =>
        composeLaunchPrompt({
          data: {
            sceneIds,
            joins: joins.length > 0 ? joins : undefined,
            mode: options.mode,
            renderer: options.renderer,
            inputs:
              Object.keys(draft.inputs).length > 0 ? draft.inputs : undefined,
            ...outputOptions(options),
          },
        }),
      analytics
    );
    if (result?.status === "ok") {
      track("launch_storyboard_copied", analytics);
    }
  };

  // The compiler's refusals that have a one-click fix.
  const remedies = (error: LaunchPromptError) => {
    if (error.code === "incompatible_join") {
      const after = numberDetail(error, "after");
      if (after === undefined) {
        return null;
      }
      const fix = (kind: JoinKind) => {
        draftActions.setJoin(after, kind);
        void copyStoryboard({ join: { after, kind } });
      };
      return (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">
            {fillTemplate(content.incompatible.value, {
              from: String(after + 1),
              to: String(after + 2),
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => fix("cut")}>
              {content.useCut}
            </Button>
            <Button size="sm" variant="outline" onClick={() => fix("bridge")}>
              {content.useBridge}
            </Button>
          </div>
        </div>
      );
    }
    if (error.code === "impossible_duration") {
      const min = numberDetail(error, "minSeconds");
      const max = numberDetail(error, "maxSeconds");
      if (min === undefined || max === undefined) {
        return null;
      }
      const use = (targetSeconds: number) => {
        draftActions.setOptions({ targetSeconds });
        void copyStoryboard({ draft: { targetSeconds } });
      };
      return (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">
            {fillTemplate(content.durationRange.value, {
              min: String(min),
              max: String(max),
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => use(min)}>
              {fillTemplate(content.useSeconds.value, { seconds: String(min) })}
            </Button>
            <Button size="sm" variant="outline" onClick={() => use(max)}>
              {fillTemplate(content.useSeconds.value, { seconds: String(max) })}
            </Button>
          </div>
        </div>
      );
    }
    return null;
  };

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
            {content.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-pretty">
            {content.intro}
          </p>
        </header>
        <SuggestedArc rows={rows} />
        {rows.length === 0 ? (
          <div className="flex flex-col gap-4">
            <CollectionEmptyState
              icon={Clapperboard}
              title={content.emptyTitle}
              description={content.emptyDescription}
            />
            <Link
              to={ROUTES.LAUNCH_VIDEOS}
              search={{ view: "scenes" }}
              className={cn(buttonVariants({ size: "lg" }), "self-center")}
            >
              {content.browseScenes}
            </Link>
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-muted-foreground text-sm tabular-nums">
                {fillTemplate(content.count.value, {
                  count: String(rows.length),
                  max: String(MAX_STORYBOARD_SCENES),
                })}{" "}
                · {lengthLabel(seconds)}
              </p>
              <div className="flex gap-2">
                <Link
                  to={ROUTES.LAUNCH_VIDEOS}
                  search={{ view: "scenes" }}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {content.addScenes}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => draftActions.clear()}
                >
                  {content.clear}
                </Button>
              </div>
            </div>
            <p id={helpId} className="sr-only">
              {content.reorderHelp}
            </p>
            <ol className="flex flex-col">
              {rows.map((row, index) => (
                <li key={row.item.key} className="flex flex-col">
                  <StoryboardRow
                    row={row}
                    index={index}
                    count={rows.length}
                    dragging={dragKey === row.item.key}
                    onDragStart={() => setDragKey(row.item.key)}
                    onDragEnd={() => setDragKey(null)}
                    onDrop={() => {
                      const from = rows.findIndex(
                        (entry) => entry.item.key === dragKey
                      );
                      if (from !== -1) {
                        move(from, index, false);
                      }
                      setDragKey(null);
                    }}
                    onMove={(to) => move(index, to, true)}
                    helpId={helpId}
                    handleRef={(element) => {
                      if (element) {
                        handles.current.set(row.item.key, element);
                      } else {
                        handles.current.delete(row.item.key);
                      }
                    }}
                  />
                  {index < rows.length - 1 && (
                    <JoinControl
                      index={index}
                      kind={
                        row.item.join?.to === rows[index + 1]?.item.key
                          ? row.item.join?.kind
                          : undefined
                      }
                    />
                  )}
                </li>
              ))}
            </ol>
            <p aria-live="polite" className="sr-only">
              {announcement}
            </p>
          </section>
        )}
      </div>
      <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
        <h2 className="text-base font-medium">{content.brief}</h2>
        <p className="text-muted-foreground -mt-2 text-xs text-pretty">
          {content.briefHint}
        </p>
        <LaunchOptions sceneIds={[...new Set(sceneIds)]} />
        <LaunchCopyButton
          copy={copy}
          scope="storyboard"
          variant="gradient"
          label={content.copy}
          disabled={rows.length === 0}
          onClick={async () => {
            await copyStoryboard();
          }}
        />
        {rows.length === 0 && (
          <p className="text-muted-foreground text-xs">{content.copyEmpty}</p>
        )}
        <div aria-live="polite">
          <LaunchCopyResult
            copy={copy}
            redirect={ROUTES.LAUNCH_VIDEOS_COMPOSE}
            errorExtra={remedies}
          />
        </div>
      </aside>
    </main>
  );
};
