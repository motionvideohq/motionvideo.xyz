import type { MediaItem } from "@motionvideo/engine";
import { useRef, useState } from "react";
import { useIntlayer } from "react-intlayer";
import { Add } from "reicon-react/icons/Add";
import { Gallery } from "reicon-react/icons/Gallery";
import { Video } from "reicon-react/icons/Video";
import { Xmark } from "reicon-react/icons/Xmark";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { addMedia, importAndAdd, moveMedia, removeMedia } from "./actions";
import { useImportFeedback } from "./import-feedback";
import { SAMPLES, isSample, sampleMediaItem, thumbFor } from "./samples";
import { editor, useDoc, useEditor } from "./store";

// The project's media in card order: add, reorder by dragging, select to
// edit, remove. Samples can be added back from the library at any time.

const formatDuration = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

const Thumb = ({
  item,
  index,
  poster,
  selected,
  onDragStart,
  onDrop,
}: {
  item: MediaItem;
  index: number;
  poster: string | undefined;
  selected: boolean;
  onDragStart: () => void;
  onDrop: () => void;
}) => {
  const content = useIntlayer("create-showcase-editor");
  const [over, setOver] = useState(false);
  return (
    <li
      className={cn(
        "group relative shrink-0",
        over && "translate-x-1 transition-transform"
      )}
    >
      <button
        type="button"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onDrop();
        }}
        onClick={() => editor.ui({ selectedMedia: item.id })}
        aria-label={
          content.editMedia({ name: item.name || String(index + 1) }).value
        }
        className={cn(
          "bg-muted ring-offset-background focus-visible:ring-ring block h-14 w-20 overflow-hidden rounded-md ring-offset-2 outline-none focus-visible:ring-2",
          selected ? "ring-primary ring-2" : "ring-border/60 ring-1"
        )}
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            className="size-full object-cover"
            draggable={false}
          />
        ) : null}
        {item.kind === "video" ? (
          <span className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded bg-black/70 px-1 text-[10px] text-white tabular-nums">
            <Video aria-hidden="true" className="size-2.5" />
            {item.duration
              ? formatDuration(
                  item.trim ? item.trim.end - item.trim.start : item.duration
                )
              : null}
          </span>
        ) : null}
        <span className="absolute top-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white tabular-nums">
          {index + 1}
        </span>
      </button>
      <button
        type="button"
        onClick={() => removeMedia(item.id)}
        aria-label={content.removeMedia.value}
        className="bg-background text-foreground ring-border absolute -top-1.5 -right-1.5 hidden size-5 items-center justify-center rounded-full shadow ring-1 group-focus-within:flex group-hover:flex"
      >
        <Xmark aria-hidden="true" className="size-3" />
      </button>
    </li>
  );
};

export const MediaTray = ({ posters }: { posters: Record<string, string> }) => {
  const content = useIntlayer("create-showcase-editor");
  const doc = useDoc();
  const selected = useEditor((s) => s.selectedMedia);
  const file = useRef<HTMLInputElement>(null);
  const dragging = useRef<number | null>(null);
  const report = useImportFeedback();
  const onlySamples = doc.media.length > 0 && doc.media.every(isSample);

  return (
    <div className="border-border/60 flex items-center gap-3 border-t px-4 py-3">
      <div className="flex shrink-0 flex-col gap-1">
        <Button
          type="button"
          size="sm"
          onClick={() => file.current?.click()}
          data-track="create_media_add"
        >
          <Add aria-hidden="true" className="size-4" />
          {content.addMedia}
        </Button>
        <Popover>
          <PopoverTrigger
            render={<Button type="button" size="xs" variant="ghost" />}
          >
            <Gallery aria-hidden="true" className="size-3.5" />
            {content.samples}
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <p className="text-muted-foreground mb-2 text-xs">
              {content.samplesNote}
            </p>
            <div className="grid max-h-72 grid-cols-3 gap-1.5 overflow-y-auto">
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    addMedia([sampleMediaItem(s, Date.now() % 100_000)])
                  }
                  className="bg-muted ring-border/60 hover:ring-primary aspect-[4/3] overflow-hidden rounded ring-1"
                  aria-label={content.addSample({ name: s.name }).value}
                >
                  <img
                    src={s.thumb}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <input
        ref={file}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          report(await importAndAdd(files));
        }}
      />
      {doc.media.length === 0 ? (
        <p className="text-muted-foreground text-sm">{content.dropHint}</p>
      ) : (
        <ol className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1.5 pr-2">
          {doc.media.map((item, index) => (
            <Thumb
              key={item.id}
              item={item}
              index={index}
              poster={
                posters[item.id] ??
                thumbFor(item) ??
                (item.ref.type === "url" && item.kind === "image"
                  ? item.ref.url
                  : undefined)
              }
              selected={selected === item.id}
              onDragStart={() => {
                dragging.current = index;
              }}
              onDrop={() => {
                if (dragging.current !== null) {
                  moveMedia(dragging.current, index);
                }
                dragging.current = null;
              }}
            />
          ))}
        </ol>
      )}
      {onlySamples ? (
        <p className="text-muted-foreground hidden max-w-48 shrink-0 text-[11px] text-pretty xl:block">
          {content.samplesReplaceNote}
        </p>
      ) : null}
    </div>
  );
};
