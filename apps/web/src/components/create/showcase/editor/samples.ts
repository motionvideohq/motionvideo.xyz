import type { MediaItem } from "@motionvideo/engine";

import manifest from "@/data/create-samples.json";

// MotionVideo's own sample library (rendered from apps/videos, hosted on
// R2): new projects start with it so every template looks finished before
// the visitor adds anything.

export interface SampleItem {
  id: string;
  kind: "image" | "video";
  name: string;
  url: string;
  thumb: string;
  width: number;
  height: number;
  duration?: number;
  tags: string[];
}

// SAFETY: the manifest is written by scripts/create-samples.mjs in this shape.
export const SAMPLES = manifest.items as SampleItem[];

const SAMPLE_PREFIX = "sample-";

export const isSample = (item: MediaItem) => item.id.startsWith(SAMPLE_PREFIX);

export const sampleMediaItem = (sample: SampleItem, index = 0): MediaItem => ({
  id: `${SAMPLE_PREFIX}${sample.id}-${index}`,
  kind: sample.kind,
  ref: { type: "url", url: sample.url },
  name: sample.name,
  width: sample.width,
  height: sample.height,
  duration: sample.duration,
  fit: "cover",
  focus: { x: 0.5, y: sample.tags.includes("long") ? 0 : 0.5 },
  scroll: sample.tags.includes("long"),
  end: "loop",
});

/** The starter set for a new project: desktop shots plus one clip. */
export const starterMedia = (frame: "phone" | "other"): MediaItem[] => {
  const shots = SAMPLES.filter((s) =>
    frame === "phone"
      ? s.tags.includes("mobile")
      : s.kind === "image" && s.tags.includes("desktop")
  );
  const clip = SAMPLES.find((s) => s.kind === "video");
  return [...shots, ...(clip ? [clip] : [])].map((s) => sampleMediaItem(s));
};

export const thumbFor = (item: MediaItem) =>
  SAMPLES.find((s) => item.id.startsWith(`${SAMPLE_PREFIX}${s.id}-`))?.thumb;
