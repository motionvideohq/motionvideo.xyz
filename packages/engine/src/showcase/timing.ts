import { aspectRatio } from "../schema/common.ts";
import { getTemplate, resolveParams } from "./registry.ts";
import type { ShowcaseDoc } from "./schema.ts";

export interface ShowcaseTiming {
  /** Seconds per loop after the speed control. */
  loopSeconds: number;
  /** Whole loops in the clip. */
  loops: number;
  seconds: number;
}

/**
 * Clip length. A custom length is rounded to whole loops by stretching the
 * loop slightly, so every clip ends exactly where it starts.
 */
export const showcaseTiming = (doc: ShowcaseDoc): ShowcaseTiming => {
  const template = getTemplate(doc.template);
  const params = resolveParams(template, doc.params);
  const base = template.baseLoopSeconds / Number(params.speed);
  if (doc.timing.seconds) {
    const loops = Math.max(1, Math.round(doc.timing.seconds / base));
    return {
      loopSeconds: doc.timing.seconds / loops,
      loops,
      seconds: doc.timing.seconds,
    };
  }
  return {
    loopSeconds: base,
    loops: doc.timing.loops,
    seconds: base * doc.timing.loops,
  };
};

export interface OutputSize {
  width: number;
  height: number;
}

/**
 * Output size for a resolution class (720, 1080, 1440, 2160): the frame's
 * short side, so 1080p is 1920×1080 landscape and 1080×1920 portrait.
 * Dimensions are even, as H.264 requires.
 */
export const outputSize = (
  doc: ShowcaseDoc,
  resolution: number
): OutputSize => {
  const ratio = aspectRatio(doc.frame.aspect);
  const [w, h] =
    ratio >= 1
      ? [resolution * ratio, resolution]
      : [resolution, resolution / ratio];
  return {
    width: Math.max(2, Math.round(w / 2) * 2),
    height: Math.max(2, Math.round(h / 2) * 2),
  };
};

/** Remotion composition metadata for a document. */
export const showcaseVideoConfig = (
  doc: ShowcaseDoc,
  resolution: number,
  fps: number
) => ({
  id: "showcase",
  ...outputSize(doc, resolution),
  fps,
  durationInFrames: Math.max(1, Math.round(showcaseTiming(doc).seconds * fps)),
});
