import {
  applyTemplate,
  newShowcaseDoc,
  showcaseVideoConfig,
  TEMPLATES,
} from "@motionvideo/engine";
import type { MediaItem, ShowcaseDoc } from "@motionvideo/engine";
import { Showcase } from "@motionvideo/engine/composition";
import { Composition, Folder } from "remotion";

import samples from "../../../web/src/data/create-samples.json";

// Every Showcase template as a Studio composition, with MotionVideo's sample
// library. Author and tune templates here; `pnpm showcase:previews` renders
// these into the 16:9 preview loops the site shows for each template.

export const PREVIEW_RESOLUTION = 540;
export const PREVIEW_FPS = 30;

interface Sample {
  id: string;
  kind: "image" | "video";
  name: string;
  url: string;
  width: number;
  height: number;
  duration?: number;
  tags: string[];
}

// SAFETY: the manifest is written by apps/web/scripts/create-samples.mjs.
const SAMPLES = samples.items as Sample[];

const toItem = (s: Sample): MediaItem => ({
  id: `sample-${s.id}`,
  kind: s.kind,
  ref: { type: "url", url: s.url },
  name: s.name,
  width: s.width,
  height: s.height,
  duration: s.duration,
  fit: "cover",
  focus: { x: 0.5, y: s.tags.includes("long") ? 0 : 0.5 },
  scroll: s.tags.includes("long"),
  end: "loop",
});

/** A template's preview project: the starter samples the editor uses. */
export const previewDoc = (templateId: string): ShowcaseDoc => {
  const doc = applyTemplate(newShowcaseDoc(), templateId);
  const phone = doc.style.cards.frame === "phone";
  const shots = SAMPLES.filter((s) =>
    phone ? s.tags.includes("mobile") : s.kind === "image" && s.tags.includes("desktop")
  );
  const clip = SAMPLES.find((s) => s.kind === "video");
  return { ...doc, media: [...shots, ...(clip ? [clip] : [])].map(toItem) };
};

const sourcesFor = (doc: ShowcaseDoc) =>
  Object.fromEntries(
    doc.media.map((m) => [m.id, m.ref.type === "url" ? m.ref.url : ""])
  );

export const ShowcaseFolder = () => (
  <Folder name="showcase">
    {TEMPLATES.map((template) => {
      const doc = previewDoc(template.id);
      const config = showcaseVideoConfig(doc, PREVIEW_RESOLUTION, PREVIEW_FPS);
      return (
        <Composition
          key={template.id}
          id={`showcase-${template.id}`}
          component={Showcase}
          durationInFrames={config.durationInFrames}
          fps={config.fps}
          width={config.width}
          height={config.height}
          defaultProps={{ doc, sources: sourcesFor(doc) }}
        />
      );
    })}
  </Folder>
);
