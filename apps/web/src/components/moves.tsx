import { Dialog } from "@base-ui/react/dialog";
import { Link } from "@tanstack/react-router";
import { createContext, use, useId, useState } from "react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ChevronLeft } from "reicon-react/icons/ChevronLeft";
import { ChevronRight } from "reicon-react/icons/ChevronRight";

import { CopyIcon } from "@/components/copy-icon";
import { LockedPrompt } from "@/components/locked-prompt";
import {
  DetailOverlay,
  DetailRow,
  MotionPreview,
  OverlayCloseButton,
  OverlayPlayer,
  StepButton,
  useArrowSteps,
} from "@/components/motion-video";
import { Button } from "@/components/ui/button";
import { useTransientStatus } from "@/hooks/use-transient-status";
import type { MotionVideo } from "@/lib/motion-catalog";
import type { MoveFamily } from "@/lib/move-families";
import { movePath } from "@/lib/moves";
import type { Move, MovePrompt } from "@/lib/moves";
import { cn } from "@/lib/utils";
import type { MoveCardMedia, MovePromptResult } from "@/server/move-functions";

// `**bold**` and `code` inside a line of move text.
const inline = (text: string): ReactNode[] =>
  text.split(/(?<token>\*\*[^*]+\*\*|`[^`]+`)/u).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      // oxlint-disable-next-line no-array-index-key
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        // oxlint-disable-next-line no-array-index-key
        <code
          key={index}
          className="bg-muted rounded px-1 font-mono text-[0.9em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });

/**
 * A move's body: blank-line separated paragraphs and `- ` lists, with bold
 * and inline code. Written by us (src/data/moves.json), rendered as React
 * elements, never as HTML.
 */
export const MoveBody = ({ body }: { body: string }) => (
  <div className="flex flex-col gap-3 text-sm leading-relaxed text-pretty">
    {body.split(/\n{2,}/u).map((block, index) => {
      const lines = block.split("\n");
      if (lines.every((line) => line.startsWith("- "))) {
        return (
          // oxlint-disable-next-line no-array-index-key
          <ul key={index} className="flex list-disc flex-col gap-1.5 pl-5">
            {lines.map((line) => (
              <li key={line}>{inline(line.slice(2))}</li>
            ))}
          </ul>
        );
      }
      // oxlint-disable-next-line no-array-index-key
      return <p key={index}>{inline(block)}</p>;
    })}
  </div>
);

/**
 * The grid behind an open move: every move (`undefined`) or one family's.
 * The `/moves` layout provides it, keeping whichever grid the move was
 * opened from, so the overlay steps through that grid and closes back to it.
 */
export const MovesGridContext = createContext<MoveFamily | undefined>(
  undefined
);
export const useMovesGrid = () => use(MovesGridContext);

/** Opens a move: `/moves/<family>/<slug>`, over the current grid. */
export const MoveLink = ({
  move,
  ...props
}: Omit<ComponentPropsWithRef<"a">, "href"> & {
  move: Pick<Move, "family" | "slug">;
  /** Replace the history entry (stepping within an open overlay). */
  replace?: boolean;
}) => (
  <Link
    to="/moves/$family/$slug"
    params={{ family: move.family, slug: move.slug }}
    resetScroll={false}
    {...props}
  />
);

/**
 * A tile in the moves grid. With a gallery example it reads like a gallery
 * card (the clip loops while on screen) with the move's name always shown;
 * without one it is a text card.
 */
export const MoveCard = ({
  move,
  media,
  paused,
}: {
  move: Move;
  media: MoveCardMedia | undefined;
  paused: boolean;
}) => {
  const content = useIntlayer("moves");
  const label = content.familyLabels[move.family];
  if (!media) {
    return (
      <MoveLink
        move={move}
        className="bg-card shadow-outline hover:bg-muted/60 focus-visible:ring-ring flex flex-col gap-2 rounded-xl p-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <span className="text-muted-foreground text-xs">{label}</span>
        <span className="text-lg leading-tight font-semibold tracking-tight text-balance">
          {move.name}
        </span>
        <span className="text-muted-foreground line-clamp-3 text-sm text-pretty">
          {move.summary}
        </span>
      </MoveLink>
    );
  }
  return (
    <MoveLink
      move={move}
      aria-label={`${move.name}: ${label.value}`}
      className="group/card focus-visible:ring-ring relative block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <MotionPreview video={media} paused={paused} />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 rounded-b-xl bg-linear-to-t from-black/70 to-transparent p-3 pt-10 text-white">
        <span className="text-[11px] font-medium text-white/70">{label}</span>
        <span className="truncate text-sm font-medium tracking-tight">
          {move.name}
        </span>
      </span>
    </MoveLink>
  );
};

const sectionClass = "flex flex-col gap-3 border-t border-dashed pt-4";

/** Pro: the copy-ready prompt, its parameters and a copy button. */
const PromptSection = ({ prompt }: { prompt: MovePrompt }) => {
  const content = useIntlayer("moves");
  const id = useId();
  const [status, flash] = useTransientStatus<"idle" | "copied" | "failed">(
    "idle"
  );
  return (
    <section aria-labelledby={id} className={sectionClass}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="text-sm font-medium">
          {content.prompt}
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(prompt.prompt);
              flash("copied");
            } catch {
              flash("failed");
            }
          }}
        >
          <CopyIcon copied={status === "copied"} />
          {status === "copied" ? content.copied : content.copy}
        </Button>
      </div>
      <pre className="bg-muted rounded-xl p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap">
        {prompt.prompt}
      </pre>
      {prompt.parameters.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{content.parameters}</h3>
          <ul className="text-muted-foreground flex list-disc flex-col gap-1 pl-5 text-sm">
            {prompt.parameters.map((parameter) => (
              <li key={parameter}>{parameter}</li>
            ))}
          </ul>
        </div>
      )}
      <output className="text-muted-foreground text-xs">
        {status === "failed" && content.copyError}
      </output>
    </section>
  );
};

/** Everyone else: the upgrade panel in place of the prompt. */
const LockedPromptSection = ({
  signedIn,
  move,
}: {
  signedIn: boolean;
  move: Move;
}) => {
  const content = useIntlayer("moves");
  const id = useId();
  return (
    <section aria-labelledby={id} className={sectionClass}>
      <h2 id={id} className="text-sm font-medium">
        {content.prompt}
      </h2>
      <LockedPrompt
        title={content.lockedTitle}
        body={content.lockedBody}
        signInReason={content.signInReason}
        signedIn={signedIn}
        redirect={movePath(move)}
        track={{ "data-track": "moves_unlock", "data-track-move": move.slug }}
      />
    </section>
  );
};

/** Without a gallery example, the stage shows the move as a title card. */
const MoveTitleCard = ({ move }: { move: Move }) => {
  const content = useIntlayer("moves");
  return (
    <div
      className="bg-card pointer-events-auto flex aspect-video flex-col justify-end gap-3 rounded-xl p-8 shadow-2xl sm:p-12"
      style={{ width: "min(100cqw, calc(100cqh * 16 / 9))" }}
    >
      <span className="text-muted-foreground text-sm">
        {content.familyLabels[move.family]}
      </span>
      <span className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
        {move.name}
      </span>
      <span className="text-muted-foreground max-w-xl text-pretty sm:text-lg">
        {move.summary}
      </span>
    </div>
  );
};

/**
 * Route overlay for a move, laid out like a video's: its gallery example
 * plays on the stage (or a title card stands in), and the sidebar holds the
 * details, the prompt (Pro) and the write-up.
 */
export const MoveOverlay = ({
  move,
  examples,
  related,
  prompt,
  signedIn,
  onClose,
  previous,
  next,
}: {
  move: Move;
  examples: MotionVideo[];
  related: Move[];
  prompt: MovePromptResult;
  signedIn: boolean;
  onClose: () => void;
  previous?: () => void;
  next?: () => void;
}) => {
  const content = useIntlayer("moves");
  const gallery = useIntlayer("motion-gallery");
  // The example on stage; stepping to another move starts on its first.
  const [shown, setShown] = useState({ slug: move.slug, index: 0 });
  const [failed, setFailed] = useState<string | null>(null);
  const index = shown.slug === move.slug ? shown.index : 0;
  const example = examples[index] ?? examples[0];
  useArrowSteps(previous, next);

  return (
    <DetailOverlay
      onClose={onClose}
      glow={example?.poster}
      stage={
        example ? (
          <OverlayPlayer
            key={example.slug}
            video={example}
            onError={() => setFailed(example.slug)}
          />
        ) : (
          <MoveTitleCard move={move} />
        )
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <OverlayCloseButton label={content.closeMove.value} />
          <div className="flex shrink-0 gap-2">
            <StepButton
              onStep={previous}
              icon={ChevronLeft}
              label={content.previousMove.value}
              endLabel={content.noPreviousMove.value}
            />
            <StepButton
              onStep={next}
              icon={ChevronRight}
              label={content.nextMove.value}
              endLabel={content.noNextMove.value}
            />
          </div>
        </div>
        <Dialog.Title className="text-xl leading-tight font-semibold tracking-tight text-balance">
          {move.name}
        </Dialog.Title>
      </div>
      <Dialog.Description className="text-sm leading-relaxed text-pretty">
        {move.summary}
      </Dialog.Description>
      {example && failed === example.slug && (
        <p role="alert" className="text-destructive text-sm">
          {gallery.videoError}
        </p>
      )}
      {examples.length > 1 && (
        <div className="grid grid-cols-3 gap-2">
          {examples.map((video, position) => (
            <button
              key={video.slug}
              type="button"
              aria-label={`${content.showExample.value}: ${video.title}`}
              aria-pressed={position === index}
              onClick={() => setShown({ slug: move.slug, index: position })}
              className={cn(
                "bg-muted focus-visible:ring-ring aria-pressed:ring-primary aspect-video overflow-hidden rounded-lg opacity-60 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 aria-pressed:opacity-100 aria-pressed:ring-2"
              )}
            >
              <img
                src={video.poster}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <dl>
        <DetailRow label={content.family}>
          <Link
            to="/moves/$family"
            params={{ family: move.family }}
            className="hover:underline"
          >
            {content.familyLabels[move.family]}
          </Link>
        </DetailRow>
        {move.aka.length > 0 && (
          <DetailRow label={content.alsoCalled}>
            {move.aka.join(", ")}
          </DetailRow>
        )}
        {move.goodFor.length > 0 && (
          <DetailRow label={content.goodFor}>
            {move.goodFor.join(", ")}
          </DetailRow>
        )}
        {example && (
          <DetailRow label={content.example}>
            <Link
              to="/videos/$slug"
              params={{ slug: example.slug }}
              className="hover:underline"
            >
              @{example.handle}
            </Link>
          </DetailRow>
        )}
      </dl>
      {prompt.locked ? (
        <LockedPromptSection signedIn={signedIn} move={move} />
      ) : (
        <PromptSection prompt={prompt.prompt} />
      )}
      <section aria-label={content.about.value} className={sectionClass}>
        <h2 className="text-sm font-medium">{content.about}</h2>
        <MoveBody body={move.body} />
      </section>
      {related.length > 0 && (
        <section aria-label={content.related.value} className={sectionClass}>
          <h2 className="text-sm font-medium">{content.related}</h2>
          <ul className="-mx-2 flex flex-col">
            {related.map((item) => (
              <li key={item.slug}>
                <MoveLink
                  move={item}
                  replace
                  className="hover:bg-muted focus-visible:ring-ring flex items-baseline justify-between gap-3 rounded-lg px-2 py-1.5 text-sm outline-none focus-visible:ring-2"
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {content.familyLabels[item.family]}
                  </span>
                </MoveLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </DetailOverlay>
  );
};
