// oxlint-disable-next-line typescript/triple-slash-reference -- gifenc ships no types; its declarations must reach every consumer of this module
/// <reference path="../types/gifenc.d.ts" />
import {
  canRenderMediaOnWeb,
  renderFramesOnWeb,
  renderMediaOnWeb,
  renderStillOnWeb,
} from "@remotion/web-renderer";
import type { CanRenderIssue } from "@remotion/web-renderer";
import { Zip, ZipPassThrough } from "fflate";
import { GIFEncoder, applyPalette, quantize } from "gifenc";

import { Showcase } from "../showcase/composition.tsx";
import type { ShowcaseDoc } from "../showcase/schema.ts";
import { outputSize, showcaseVideoConfig } from "../showcase/timing.ts";

// Browser exports of a Showcase document. Every function renders the same
// composition the editor previews, through Remotion's browser renderer.
// MotionVideo qualifies for Remotion's free license (one person); each
// browser render reports its domain to Remotion, as their license requires.

const LICENSE_KEY = "free-license";

export type VideoFormat = "mp4" | "webm";
export type VideoQuality = "low" | "medium" | "high" | "very-high";

export interface VideoOutput {
  format: VideoFormat;
  /** Short side in pixels: 720, 1080, 1440 or 2160. */
  resolution: number;
  fps: number;
  quality: VideoQuality;
  /** WebM only: keeps the background transparent. */
  transparent: boolean;
}

export interface RenderInput {
  doc: ShowcaseDoc;
  sources: Record<string, string>;
  signal?: AbortSignal;
  /** 0–1. */
  onProgress?: (progress: number) => void;
}

const composition = (
  { doc, sources }: Pick<RenderInput, "doc" | "sources">,
  resolution: number,
  fps: number
) => ({
  component: Showcase,
  defaultProps: { doc, sources },
  ...showcaseVideoConfig(doc, resolution, fps),
});

/** Problems that would stop this export in this browser, if any. */
export const checkVideoSupport = async (
  doc: ShowcaseDoc,
  output: VideoOutput
): Promise<CanRenderIssue[]> => {
  const { width, height } = outputSize(doc, output.resolution);
  const result = await canRenderMediaOnWeb({
    container: output.format,
    videoCodec: output.format === "webm" ? "vp9" : "h264",
    width,
    height,
    muted: true,
    transparent: output.format === "webm" && output.transparent,
    videoBitrate: output.quality,
  });
  return result.issues.filter((issue) => issue.severity === "error");
};

export const renderVideo = async (
  { doc, sources, signal, onProgress }: RenderInput,
  output: VideoOutput
): Promise<Blob> => {
  const result = await renderMediaOnWeb({
    composition: composition({ doc, sources }, output.resolution, output.fps),
    inputProps: { doc, sources },
    container: output.format,
    videoCodec: output.format === "webm" ? "vp9" : "h264",
    videoBitrate: output.quality,
    transparent: output.format === "webm" && output.transparent,
    muted: true,
    signal: signal ?? null,
    onProgress: onProgress ? (p) => onProgress(p.progress) : null,
    licenseKey: LICENSE_KEY,
  });
  return result.getBlob();
};

export type StillFormat = "png" | "jpeg";

/** One frame as an image; PNG keeps a transparent background. */
export const renderStill = async (
  { doc, sources, signal }: RenderInput,
  {
    frame,
    resolution,
    format,
  }: { frame: number; resolution: number; format: StillFormat }
): Promise<Blob> => {
  const result = await renderStillOnWeb({
    composition: composition({ doc, sources }, resolution, 30),
    inputProps: { doc, sources },
    frame,
    signal: signal ?? null,
    licenseKey: LICENSE_KEY,
  });
  return result.blob({ format, quality: 0.92 });
};

/** Frames per renderFramesOnWeb call: bounds memory on long clips. */
const BATCH = 24;

const renderBatches = async (
  { doc, sources, signal, onProgress }: RenderInput,
  resolution: number,
  fps: number,
  onFrame: (canvas: OffscreenCanvas, index: number) => void | Promise<void>
) => {
  const config = composition({ doc, sources }, resolution, fps);
  const total = config.durationInFrames;
  // Batches run one after another on purpose: each holds its frames in
  // memory, and frames must reach the encoder in order.
  /* oxlint-disable no-await-in-loop */
  for (let start = 0; start < total; start += BATCH) {
    signal?.throwIfAborted();
    const frames = Array.from(
      { length: Math.min(BATCH, total - start) },
      (_, i) => start + i
    );
    const stills = await renderFramesOnWeb({
      composition: config,
      inputProps: { doc, sources },
      frames,
      signal: signal ?? null,
      licenseKey: LICENSE_KEY,
    });
    for (const [i, still] of stills.entries()) {
      await onFrame(await still.canvas(), start + i);
      onProgress?.((start + i + 1) / total);
    }
  }
  /* oxlint-enable no-await-in-loop */
  return total;
};

export interface GifOutput {
  /** Width in pixels; height follows the frame. */
  width: number;
  fps: number;
  colors: number;
}

/** An animated GIF that loops forever. */
export const renderGif = async (
  input: RenderInput,
  output: GifOutput
): Promise<Blob> => {
  const { width, height } = outputSize(input.doc, 1080);
  // Render at the GIF's size directly: small frames are fast to quantize.
  const short = Math.round((Math.min(width, height) * output.width) / width);
  const gif = GIFEncoder();
  const delay = Math.round(1000 / output.fps);
  let scratch: OffscreenCanvasRenderingContext2D | null = null;
  await renderBatches(input, short, output.fps, (canvas) => {
    if (!scratch || scratch.canvas.width !== canvas.width) {
      scratch = new OffscreenCanvas(canvas.width, canvas.height).getContext(
        "2d",
        {
          willReadFrequently: true,
        }
      );
    }
    if (!scratch) {
      throw new Error("Could not read rendered frames.");
    }
    scratch.clearRect(0, 0, canvas.width, canvas.height);
    scratch.drawImage(canvas, 0, 0);
    const { data } = scratch.getImageData(0, 0, canvas.width, canvas.height);
    const palette = quantize(data, output.colors);
    gif.writeFrame(applyPalette(data, palette), canvas.width, canvas.height, {
      palette,
      delay,
      repeat: 0,
    });
  });
  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
};

/** Every frame as a PNG, zipped, for editing software. */
export const renderPngSequence = async (
  input: RenderInput,
  { resolution, fps, name }: { resolution: number; fps: number; name: string }
): Promise<Blob> => {
  const parts: Uint8Array<ArrayBuffer>[] = [];
  const zip = new Zip((err, chunk) => {
    if (err) {
      throw err;
    }
    parts.push(chunk);
  });
  const total = composition(input, resolution, fps).durationInFrames;
  const digits = String(total).length;
  await renderBatches(input, resolution, fps, async (canvas, index) => {
    const png = await canvas.convertToBlob({ type: "image/png" });
    const file = new ZipPassThrough(
      `${name}-${String(index).padStart(digits, "0")}.png`
    );
    zip.add(file);
    file.push(new Uint8Array(await png.arrayBuffer()), true);
  });
  zip.end();
  return new Blob(parts, { type: "application/zip" });
};
