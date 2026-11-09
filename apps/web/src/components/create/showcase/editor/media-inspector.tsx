import { DEVICE_FRAMES } from "@motionvideo/engine";
import type { DeviceFrame, MediaItem } from "@motionvideo/engine";
import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useIntlayer } from "react-intlayer";
import { Crop } from "reicon-react/icons/Crop";
import { Trash } from "reicon-react/icons/Trash";
import { Upload } from "reicon-react/icons/Upload";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

import { removeMedia, updateMedia } from "./actions";
import { SegmentedField, SelectField, ToggleField } from "./fields";
import { importFiles } from "./media";
import { editor, useDoc, useEditor } from "./store";

// Per-item settings: fit, focal point, crop, device frame, trim and what a
// clip does when it ends. Click the image to move the focal point; in crop
// mode, drag to draw the crop.

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const pointIn = (e: ReactPointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  return {
    x: clamp01((e.clientX - r.left) / r.width),
    y: clamp01((e.clientY - r.top) / r.height),
  };
};

const MediaStage = ({ item, src }: { item: MediaItem; src: string }) => {
  const content = useIntlayer("create-showcase-editor");
  const [cropping, setCropping] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<MediaItem["crop"]>();
  const crop = draft ?? item.crop;

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = pointIn(e);
    if (!cropping) {
      updateMedia(item.id, { focus: p }, "focus");
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = p;
    setDraft({ x: p.x, y: p.y, w: 0.01, h: 0.01 });
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!cropping || !start.current) {
      return;
    }
    const p = pointIn(e);
    const s = start.current;
    setDraft({
      x: Math.min(s.x, p.x),
      y: Math.min(s.y, p.y),
      w: Math.max(0.02, Math.abs(p.x - s.x)),
      h: Math.max(0.02, Math.abs(p.y - s.y)),
    });
  };
  const onUp = () => {
    if (cropping && draft && draft.w > 0.02 && draft.h > 0.02) {
      updateMedia(item.id, { crop: draft });
    }
    start.current = null;
    setDraft(undefined);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        role="application"
        aria-label={cropping ? content.cropHint.value : content.focusHint.value}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="bg-muted relative max-h-[45vh] cursor-crosshair touch-none self-center overflow-hidden rounded-md select-none"
        style={{ aspectRatio: `${item.width} / ${item.height}` }}
      >
        {item.kind === "video" ? (
          <video
            src={src}
            muted
            loop
            autoPlay
            playsInline
            className="pointer-events-none size-full object-contain"
          />
        ) : (
          <img
            src={src}
            alt=""
            draggable={false}
            className="pointer-events-none size-full object-contain"
          />
        )}
        {crop ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_9999px_rgb(0_0_0/0.45)]"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.w * 100}%`,
              height: `${crop.h * 100}%`,
            }}
          />
        ) : null}
        {cropping ? null : (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/40 shadow"
            style={{
              left: `${item.focus.x * 100}%`,
              top: `${item.focus.y * 100}%`,
            }}
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="xs"
          variant={cropping ? "default" : "outline"}
          onClick={() => setCropping((v) => !v)}
        >
          <Crop aria-hidden="true" className="size-3.5" />
          {cropping ? content.doneCropping : content.crop}
        </Button>
        {item.crop ? (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => updateMedia(item.id, { crop: undefined })}
          >
            {content.resetCrop}
          </Button>
        ) : null}
        <span className="text-muted-foreground text-[11px]">
          {cropping ? content.cropHint : content.focusHint}
        </span>
      </div>
    </div>
  );
};

const TrimControl = ({ item }: { item: MediaItem }) => {
  const content = useIntlayer("create-showcase-editor");
  const duration = item.duration ?? 0;
  const start = item.trim?.start ?? 0;
  const end = item.trim?.end ?? duration;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{content.trim}</span>
        <span className="tabular-nums">
          {start.toFixed(1)} s – {end.toFixed(1)} s
        </span>
      </div>
      <Slider
        label={content.trim.value}
        value={[start, end]}
        min={0}
        max={duration}
        step={0.1}
        minStepsBetweenValues={3}
        onValueChange={(v) => {
          if (Array.isArray(v) && v.length === 2) {
            const [s, e] = v;
            updateMedia(
              item.id,
              {
                trim:
                  s <= 0.01 && e >= duration - 0.01
                    ? undefined
                    : { start: s, end: e },
              },
              "trim"
            );
          }
        }}
      />
    </div>
  );
};

export const MediaInspector = ({
  sources,
}: {
  sources: Record<string, string>;
}) => {
  const content = useIntlayer("create-showcase-editor");
  const doc = useDoc();
  const selected = useEditor((s) => s.selectedMedia);
  const item = doc.media.find((m) => m.id === selected);
  const file = useRef<HTMLInputElement>(null);
  const src = item ? sources[item.id] : undefined;

  const replace = async (files: FileList | null) => {
    if (!item || !files?.length) {
      return;
    }
    const { added } = await importFiles([files[0]]);
    const [next] = added;
    if (!next) {
      return;
    }
    // Keep the item's place and settings that still apply.
    editor.update((d) => ({
      ...d,
      media: d.media.map((m) =>
        m.id === item.id
          ? { ...next, fit: m.fit, frame: m.frame, end: m.end }
          : m
      ),
    }));
    editor.ui({ selectedMedia: next.id });
  };

  return (
    <Dialog
      open={Boolean(item)}
      onOpenChange={(open) => !open && editor.ui({ selectedMedia: null })}
    >
      <DialogContent className="sm:max-w-xl">
        {item ? (
          <>
            <DialogHeader>
              <DialogTitle className="truncate">
                {item.name || content.untitledMedia}
              </DialogTitle>
              <DialogDescription>
                {item.width}×{item.height}
                {item.duration ? ` · ${item.duration.toFixed(1)} s` : ""}
              </DialogDescription>
            </DialogHeader>
            {src ? <MediaStage item={item} src={src} /> : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <SegmentedField
                label={content.fit}
                value={item.fit}
                options={[
                  { value: "cover", label: content.cover },
                  { value: "contain", label: content.contain },
                ]}
                onChange={(fit) => updateMedia(item.id, { fit })}
              />
              <SelectField<DeviceFrame | "default">
                label={content.deviceFrame}
                value={item.frame ?? "default"}
                options={[
                  { value: "default", label: content.projectDefault },
                  ...DEVICE_FRAMES.map((f) => ({
                    value: f,
                    label: content.frames[f],
                  })),
                ]}
                onChange={(v) =>
                  updateMedia(item.id, {
                    frame: v === "default" ? undefined : v,
                  })
                }
              />
            </div>
            {item.kind === "image" ? (
              <ToggleField
                label={content.scrollTall}
                checked={item.scroll}
                onChange={(scroll) => updateMedia(item.id, { scroll })}
              />
            ) : (
              <>
                <TrimControl item={item} />
                <SegmentedField
                  label={content.whenClipEnds}
                  value={item.end}
                  options={[
                    { value: "loop", label: content.loopClip },
                    { value: "hold", label: content.holdLast },
                  ]}
                  onChange={(end) => updateMedia(item.id, { end })}
                />
              </>
            )}
            <div className="flex justify-between gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => removeMedia(item.id)}
              >
                <Trash aria-hidden="true" className="size-3.5" />
                {content.removeMedia}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => file.current?.click()}
              >
                <Upload aria-hidden="true" className="size-3.5" />
                {content.replaceMedia}
              </Button>
              <input
                ref={file}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  replace(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
