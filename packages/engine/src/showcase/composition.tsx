import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import { useImageTextures, VideoTextures } from "../kit/textures.tsx";
import { Overlays } from "./overlays.tsx";
import { getTemplate } from "./registry.ts";
import { ShowcaseScene } from "./scene.tsx";
import type { ShowcaseDoc } from "./schema.ts";
import { showcaseTiming } from "./timing.ts";

/**
 * The Showcase video: background, 3D cards and overlays for one document.
 * A pure function of (doc, sources, frame), so the editor preview, browser
 * export and later server renders all produce the same frames.
 */
export const Showcase = ({
  doc,
  sources,
}: {
  doc: ShowcaseDoc;
  sources: Record<string, string>;
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const template = getTemplate(doc.template);
  const { loops } = showcaseTiming(doc);
  const progress = ((frame / durationInFrames) * loops) % 1;
  // Card media plus the logo and media background, decoded together.
  const allMedia = useMemo(
    () => [...doc.media, ...doc.assets],
    [doc.media, doc.assets]
  );
  const images = useImageTextures(allMedia, sources);
  const logoId = doc.overlays.logo.media;

  return (
    <AbsoluteFill>
      {images.ready ? (
        <ThreeCanvas
          width={width}
          height={height}
          linear
          flat
          gl={{ antialias: false, alpha: true, preserveDrawingBuffer: true }}
        >
          <VideoTextures items={allMedia} sources={sources}>
            <ShowcaseScene
              doc={doc}
              template={template}
              images={images.map}
              progress={progress}
              frame={frame}
            />
          </VideoTextures>
        </ThreeCanvas>
      ) : null}
      <Overlays
        overlays={doc.overlays}
        background={doc.background}
        logoSrc={logoId ? sources[logoId] : undefined}
        frame={frame}
        durationInFrames={durationInFrames}
        fps={fps}
        width={width}
        height={height}
      />
    </AbsoluteFill>
  );
};
