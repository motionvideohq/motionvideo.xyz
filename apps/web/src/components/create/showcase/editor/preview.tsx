import {
  SOCIAL_PRESETS,
  showcaseTiming,
  showcaseVideoConfig,
} from "@motionvideo/engine";
import type { ShowcaseDoc } from "@motionvideo/engine";
import { Showcase } from "@motionvideo/engine/composition";
import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Ref } from "react";
import { useIntlayer } from "react-intlayer";
import { Pause } from "reicon-react/icons/Pause";
import { Play } from "reicon-react/icons/Play";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// The live preview: the same composition the export renders, at 720p so it
// stays fluid, with a transport bar and the social preset's safe zones.

const PREVIEW_RESOLUTION = 720;
const PREVIEW_FPS = 30;

export interface PreviewHandle {
  /** The frame currently shown, in preview frames. */
  frame: () => number;
  /** The current frame as a small JPEG, for the project's thumbnail. */
  capture: () => Promise<Blob | null>;
  toggle: () => void;
  step: (frames: number) => void;
}

const formatTime = (seconds: number) => {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
};

export const Preview = ({
  doc,
  sources,
  ref,
}: {
  doc: ShowcaseDoc;
  sources: Record<string, string>;
  ref: Ref<PreviewHandle>;
}) => {
  const content = useIntlayer("create-showcase-editor");
  const player = useRef<PlayerRef>(null);
  const box = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const config = showcaseVideoConfig(doc, PREVIEW_RESOLUTION, PREVIEW_FPS);
  const timing = showcaseTiming(doc);
  const safe = doc.frame.social ? SOCIAL_PRESETS[doc.frame.social].safe : null;

  useEffect(() => {
    const p = player.current;
    if (!p) {
      return;
    }
    const onFrame = (e: { detail: { frame: number } }) =>
      setFrame(e.detail.frame);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    p.addEventListener("frameupdate", onFrame);
    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);
    return () => {
      p.removeEventListener("frameupdate", onFrame);
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    frame: () => player.current?.getCurrentFrame() ?? 0,
    capture: () => {
      const canvas = box.current?.querySelector("canvas");
      if (!canvas) {
        return Promise.resolve(null);
      }
      const scale = 320 / canvas.width;
      const out = new OffscreenCanvas(
        320,
        Math.max(2, Math.round(canvas.height * scale))
      );
      out.getContext("2d")?.drawImage(canvas, 0, 0, out.width, out.height);
      return out.convertToBlob({ type: "image/jpeg", quality: 0.8 });
    },
    toggle: () => player.current?.toggle(),
    step: (frames) => {
      const p = player.current;
      if (!p) {
        return;
      }
      p.pause();
      const total = config.durationInFrames;
      p.seekTo((((p.getCurrentFrame() + frames) % total) + total) % total);
    },
  }));

  const total = config.durationInFrames;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-6">
        <div
          ref={box}
          className="relative max-h-full max-w-full overflow-hidden rounded-lg shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_8px_40px_rgb(0_0_0/0.18)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]"
          style={{
            aspectRatio: `${config.width} / ${config.height}`,
            height: config.width >= config.height ? "auto" : "100%",
            width: config.width >= config.height ? "100%" : "auto",
            // Transparent exports show a checkerboard behind the preview.
            backgroundImage:
              doc.background.type === "transparent"
                ? "conic-gradient(#e5e5e5 25%, #fff 0 50%, #e5e5e5 0 75%, #fff 0)"
                : undefined,
            backgroundSize: "20px 20px",
          }}
        >
          <Player
            ref={player}
            component={Showcase}
            inputProps={{ doc, sources }}
            durationInFrames={total}
            fps={PREVIEW_FPS}
            compositionWidth={config.width}
            compositionHeight={config.height}
            style={{ width: "100%", height: "100%" }}
            loop
            autoPlay
            clickToPlay={false}
            acknowledgeRemotionLicense
          />
          {safe ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute border border-dashed border-white/70 mix-blend-difference"
              style={{
                top: `${safe.top * 100}%`,
                bottom: `${safe.bottom * 100}%`,
                left: `${safe.left * 100}%`,
                right: `${safe.right * 100}%`,
              }}
            />
          ) : null}
        </div>
      </div>
      <div className="border-border/60 flex items-center gap-3 border-t px-4 py-2">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={playing ? content.pause.value : content.play.value}
          onClick={() => player.current?.toggle()}
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-4" />
          ) : (
            <Play aria-hidden="true" className="size-4" />
          )}
        </Button>
        <Slider
          label={content.timeline.value}
          value={Math.min(frame, total - 1)}
          min={0}
          max={Math.max(1, total - 1)}
          step={1}
          onValueChange={(v) => {
            const [next] = [v].flat();
            player.current?.pause();
            player.current?.seekTo(next);
          }}
          className="flex-1"
        />
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {formatTime(frame / PREVIEW_FPS)} / {formatTime(timing.seconds)}
        </span>
        <span className="text-muted-foreground hidden shrink-0 text-xs md:inline">
          {timing.loops === 1
            ? content.oneLoop
            : content.loops({ count: timing.loops })}
        </span>
      </div>
    </div>
  );
};
