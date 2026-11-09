import {
  applyTemplate,
  ASPECT_IDS,
  DEVICE_FRAMES,
  newShowcaseDoc,
  showcaseVideoConfig,
  TEMPLATES,
} from "@motionvideo/engine";
import type { Aspect } from "@motionvideo/engine";
import { Showcase } from "@motionvideo/engine/composition";
import { Player, Thumbnail } from "@remotion/player";
import { useMemo } from "react";

import { starterMedia } from "./editor/samples";

// Dev-only template lab: one template with the sample library, a live
// player and four fixed frames, driven by the URL so screenshots are
// reproducible.
//   /create-lab?t=tilted-band&aspect=16:9&frame=browser&n=10

export const Lab = () => {
  const query = new URLSearchParams(window.location.search);
  const t = query.get("t") ?? TEMPLATES[0].id;
  const aspect = (ASPECT_IDS.find((a) => a === query.get("aspect")) ??
    "16:9") satisfies Aspect;
  const frame = DEVICE_FRAMES.find((f) => f === query.get("frame"));
  const n = Number(query.get("n")) || undefined;

  const { doc, sources } = useMemo(() => {
    const d = applyTemplate(newShowcaseDoc(), t);
    const frameKind = frame ?? d.style.cards.frame;
    const media = starterMedia(frameKind === "phone" ? "phone" : "other");
    return {
      doc: {
        ...d,
        media,
        frame: { aspect },
        params: n ? { ...d.params, count: n } : d.params,
        style: frame
          ? { ...d.style, cards: { ...d.style.cards, frame } }
          : d.style,
      },
      sources: Object.fromEntries(
        media.map((m) => [m.id, m.ref.type === "url" ? m.ref.url : ""])
      ),
    };
  }, [t, aspect, frame, n]);

  const config = showcaseVideoConfig(doc, 540, 30);
  const props = { doc, sources };

  return (
    <div className="flex gap-6 p-6">
      <ul className="flex w-44 shrink-0 flex-col gap-1 text-sm">
        {TEMPLATES.map((tpl) => (
          <li key={tpl.id}>
            <a
              className={
                tpl.id === t ? "font-semibold" : "text-muted-foreground"
              }
              href={`/create-lab?t=${tpl.id}&aspect=${aspect}${frame ? `&frame=${frame}` : ""}`}
            >
              {tpl.collection} · {tpl.name}
            </a>
          </li>
        ))}
      </ul>
      <div className="flex flex-1 flex-col gap-4">
        <Player
          component={Showcase}
          inputProps={props}
          durationInFrames={config.durationInFrames}
          fps={config.fps}
          compositionWidth={config.width}
          compositionHeight={config.height}
          style={{
            width: 720,
            aspectRatio: `${config.width} / ${config.height}`,
          }}
          controls
          loop
          autoPlay
        />
        <div id="frames" className="grid w-fit grid-cols-2 gap-2">
          {[0, 0.25, 0.5, 0.75].map((p) => (
            <Thumbnail
              key={p}
              component={Showcase}
              inputProps={props}
              frameToDisplay={Math.round(p * (config.durationInFrames - 1))}
              durationInFrames={config.durationInFrames}
              fps={config.fps}
              compositionWidth={config.width}
              compositionHeight={config.height}
              style={{
                width: 480,
                aspectRatio: `${config.width} / ${config.height}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
