import { useThree } from "@react-three/fiber";
import { Video } from "@remotion/media";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  useDelayRender,
  useRemotionEnvironment,
  useVideoConfig,
} from "remotion";
import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
  Texture,
} from "three";

import type { MediaItem } from "../schema/common.ts";

// Media becomes textures here. Images load once per URL, outside the
// <ThreeCanvas>, so the first rendered frame already has them. Videos decode
// through @remotion/media inside the canvas and paint each frame into a
// canvas texture.

export interface MediaTexture {
  texture: Texture;
  width: number;
  height: number;
}

export type TextureMap = Record<string, MediaTexture | undefined>;

const prepare = <T extends Texture>(texture: T) => {
  texture.colorSpace = NoColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
};

const decodeImage = async (src: string) => {
  const img = new Image();
  if (!src.startsWith("blob:") && !src.startsWith("data:")) {
    img.crossOrigin = "anonymous";
  }
  img.src = src;
  await img.decode();
  return img;
};

const imageCache = new Map<string, Promise<MediaTexture>>();

const loadImageTexture = (src: string) => {
  let pending = imageCache.get(src);
  if (!pending) {
    pending = (async () => {
      try {
        const img = await decodeImage(src);
        return {
          texture: prepare(new Texture(img)),
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
      } catch (error) {
        imageCache.delete(src);
        throw error;
      }
    })();
    imageCache.set(src, pending);
  }
  return pending;
};

/** Drops a cached image texture, e.g. after its blob URL was revoked. */
export const releaseImageTexture = async (src: string) => {
  const pending = imageCache.get(src);
  imageCache.delete(src);
  try {
    const loaded = await pending;
    loaded?.texture.dispose();
  } catch {
    // A failed load has no texture to free.
  }
};

export interface ImageTextures {
  map: TextureMap;
  /** True once the first set of images is decoded; stays true after. */
  ready: boolean;
}

/** One line per image, `id\tsrc`: a stable effect key for the set. */
const imageKey = (
  items: readonly MediaItem[],
  sources: Record<string, string>
) =>
  items
    .filter((m) => m.kind === "image" && sources[m.id])
    .map((m) => `${m.id}\t${sources[m.id]}`)
    .join("\n");

/**
 * Image textures for every image in `items`, keyed by media id; failed
 * images are left out. Holds the render until the textures are committed:
 * the hold is released in an effect, after the components that use the new
 * textures (and their own render holds) have mounted.
 */
export const useImageTextures = (
  items: readonly MediaItem[],
  sources: Record<string, string>
): ImageTextures => {
  const { delayRender, continueRender } = useDelayRender();
  const key = imageKey(items, sources);
  const [state, setState] = useState<{
    map: TextureMap;
    ready: boolean;
    release: number | null;
  }>({ map: {}, ready: false, release: null });

  useEffect(() => {
    let alive = true;
    const handle = delayRender("Loading image textures");
    const wanted = key
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split("\t"));
    const load = async () => {
      const results = await Promise.allSettled(
        wanted.map(([, src]) => loadImageTexture(src))
      );
      if (!alive) {
        continueRender(handle);
        return;
      }
      const map: TextureMap = {};
      for (const [i, result] of results.entries()) {
        if (result.status === "fulfilled") {
          map[wanted[i][0]] = result.value;
        }
      }
      setState({ map, ready: true, release: handle });
    };
    load();
    return () => {
      alive = false;
      continueRender(handle);
    };
  }, [key, delayRender, continueRender]);

  useEffect(() => {
    if (state.release !== null) {
      continueRender(state.release);
    }
  }, [state.release, continueRender]);

  return { map: state.map, ready: state.ready };
};

const VideoTexturesContext = createContext<TextureMap>({});

export const useVideoTextures = () => useContext(VideoTexturesContext);

/** Largest edge a video is decoded at; enough for a card in a 4K frame. */
const MAX_VIDEO_EDGE = 1920;

interface VideoTarget {
  ctx: OffscreenCanvasRenderingContext2D | null;
  texture: CanvasTexture<OffscreenCanvas>;
}

const VideoSource = ({
  item,
  src,
  onTexture,
}: {
  item: MediaItem;
  src: string;
  onTexture: (id: string, value: MediaTexture) => void;
}) => {
  const { fps } = useVideoConfig();
  const { isRendering } = useRemotionEnvironment();
  const { invalidate, advance } = useThree();
  const scale = Math.min(1, MAX_VIDEO_EDGE / Math.max(item.width, item.height));
  const w = Math.max(2, Math.round(item.width * scale));
  const h = Math.max(2, Math.round(item.height * scale));
  const target = useRef<VideoTarget | null>(null);

  useLayoutEffect(() => {
    const canvas = new OffscreenCanvas(w, h);
    const texture = prepare(new CanvasTexture(canvas));
    target.current = { ctx: canvas.getContext("2d"), texture };
    onTexture(item.id, { texture, width: w, height: h });
    return () => {
      texture.dispose();
      target.current = null;
    };
  }, [item.id, onTexture, w, h]);

  const onVideoFrame = useCallback(
    (frame: CanvasImageSource) => {
      const t = target.current;
      if (!t) {
        return;
      }
      t.ctx?.drawImage(frame, 0, 0, w, h);
      t.texture.needsUpdate = true;
      // While rendering, the canvas only redraws on demand: the frame was
      // already drawn with the previous video frame, so draw it again now.
      if (isRendering) {
        advance(performance.now());
      } else {
        invalidate();
      }
    },
    [w, h, isRendering, advance, invalidate]
  );

  const trimBefore = item.trim ? Math.round(item.trim.start * fps) : undefined;
  const length = item.trim
    ? Math.max(1, Math.round((item.trim.end - item.trim.start) * fps))
    : undefined;

  return (
    <Video
      src={src}
      headless
      muted
      loop={item.end === "loop"}
      trimBefore={trimBefore}
      durationInFrames={length}
      maxCanvasSinkFrameSize={{ width: w }}
      onVideoFrame={onVideoFrame}
    />
  );
};

/**
 * Decodes every video in `items` and provides their textures to the cards
 * below. Must sit inside the <ThreeCanvas>.
 */
export const VideoTextures = ({
  items,
  sources,
  children,
}: {
  items: readonly MediaItem[];
  sources: Record<string, string>;
  children: ReactNode;
}) => {
  const [map, setMap] = useState<TextureMap>({});
  const onTexture = useCallback((id: string, value: MediaTexture) => {
    setMap((prev) => (prev[id] === value ? prev : { ...prev, [id]: value }));
  }, []);
  const videos = items.filter((m) => m.kind === "video" && sources[m.id]);

  return (
    <VideoTexturesContext value={map}>
      {videos.map((item) => (
        <VideoSource
          key={`${item.id}:${sources[item.id]}`}
          item={item}
          src={sources[item.id]}
          onTexture={onTexture}
        />
      ))}
      {children}
    </VideoTexturesContext>
  );
};
