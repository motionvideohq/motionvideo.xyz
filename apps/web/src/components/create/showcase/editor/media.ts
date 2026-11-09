import type { MediaItem } from "@motionvideo/engine";

import {
  MAX_IMAGE_EDGE,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
} from "@/constants/create";

import { putMedia } from "./storage";
import type { MediaRecord } from "./storage";

// Turning dropped, picked or pasted files into project media: decode once to
// prove the browser can read the file, downscale large images, grab a video
// poster, then keep the bytes in IndexedDB.

const VIDEO_EXT = /\.(?:mp4|m4v|mov|webm)$/iu;
const IMAGE_EXT = /\.(?:jpe?g|png|gif|webp|avif|bmp|svg|heic|heif)$/iu;

export const kindOf = (file: File): "image" | "video" | null => {
  if (
    file.type.startsWith("video/") ||
    (!file.type && VIDEO_EXT.test(file.name))
  ) {
    return "video";
  }
  if (
    file.type.startsWith("image/") ||
    (!file.type && IMAGE_EXT.test(file.name))
  ) {
    return "image";
  }
  return null;
};

export type ImportError =
  | { reason: "unsupported"; name: string }
  | { reason: "undecodable"; name: string }
  | { reason: "too-large"; name: string }
  | { reason: "too-long"; name: string };

const newId = () => crypto.randomUUID().replaceAll("-", "").slice(0, 16);

const toBlob = (canvas: OffscreenCanvas, type: string, quality?: number) =>
  canvas.convertToBlob({ type, quality });

/** A small JPEG of a bitmap, for thumbnails and posters. */
const thumbnail = (
  source: CanvasImageSource,
  width: number,
  height: number,
  max = 480
) => {
  const scale = Math.min(1, max / Math.max(width, height));
  const canvas = new OffscreenCanvas(
    Math.max(2, Math.round(width * scale)),
    Math.max(2, Math.round(height * scale))
  );
  canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
  return toBlob(canvas, "image/jpeg", 0.82);
};

const importImage = async (file: File): Promise<MediaRecord | ImportError> => {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { reason: "undecodable", name: file.name };
  }
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(width, height));
  let blob: Blob = file;
  let w = width;
  let h = height;
  // Keep small files as they are; re-encode big ones at the editor's size.
  // GIFs become their first frame either way, so only re-encode when large.
  if (scale < 1 || file.size > 6 * 2 ** 20) {
    w = Math.round(width * scale);
    h = Math.round(height * scale);
    const canvas = new OffscreenCanvas(w, h);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, w, h);
    const keepAlpha = file.type === "image/png" || file.type === "image/webp";
    blob = await toBlob(canvas, keepAlpha ? "image/png" : "image/jpeg", 0.92);
  }
  const poster = await thumbnail(bitmap, width, height);
  bitmap.close();
  return {
    id: newId(),
    blob,
    kind: "image",
    type: blob.type || file.type,
    name: file.name,
    size: blob.size,
    width: w,
    height: h,
    poster,
    createdAt: Date.now(),
  };
};

const loadVideo = (url: string) => {
  const { promise, resolve, reject } =
    Promise.withResolvers<HTMLVideoElement>();
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  const timer = setTimeout(() => reject(new Error("timeout")), 15_000);
  video.addEventListener("loadeddata", () => {
    clearTimeout(timer);
    resolve(video);
  });
  video.addEventListener("error", () => {
    clearTimeout(timer);
    reject(new Error("decode"));
  });
  video.src = url;
  return promise;
};

const seek = (video: HTMLVideoElement, time: number) => {
  const { promise, resolve } = Promise.withResolvers<null>();
  video.addEventListener("seeked", () => resolve(null), { once: true });
  video.currentTime = time;
  return promise;
};

const importVideo = async (file: File): Promise<MediaRecord | ImportError> => {
  if (file.size > MAX_VIDEO_BYTES) {
    return { reason: "too-large", name: file.name };
  }
  const url = URL.createObjectURL(file);
  try {
    const video = await loadVideo(url);
    const { duration } = video;
    if (!Number.isFinite(duration) || duration <= 0 || video.videoWidth === 0) {
      return { reason: "undecodable", name: file.name };
    }
    if (duration > MAX_VIDEO_SECONDS + 0.5) {
      return { reason: "too-long", name: file.name };
    }
    await seek(video, Math.min(0.5, duration / 4));
    const poster = await thumbnail(video, video.videoWidth, video.videoHeight);
    return {
      id: newId(),
      blob: file,
      kind: "video",
      type: file.type || "video/mp4",
      name: file.name,
      size: file.size,
      width: video.videoWidth,
      height: video.videoHeight,
      duration,
      poster,
      createdAt: Date.now(),
    };
  } catch {
    return { reason: "undecodable", name: file.name };
  } finally {
    URL.revokeObjectURL(url);
  }
};

const isError = (value: MediaRecord | ImportError): value is ImportError =>
  "reason" in value;

/** The document's view of a stored media record. */
export const toMediaItem = (record: MediaRecord): MediaItem => ({
  id: record.id,
  kind: record.kind,
  ref: { type: "local", key: record.id },
  name: record.name.slice(0, 200),
  width: record.width,
  height: record.height,
  duration: record.duration,
  fit: "cover",
  // Screenshots read from the top; centre everything else.
  focus: {
    x: 0.5,
    y: record.kind === "image" && record.height > record.width * 1.6 ? 0 : 0.5,
  },
  scroll: record.kind === "image" && record.height > record.width * 1.6,
  end: "loop",
});

const importFile = async (file: File): Promise<MediaRecord | ImportError> => {
  const kind = kindOf(file);
  if (!kind) {
    return { reason: "unsupported", name: file.name };
  }
  const result =
    kind === "image" ? await importImage(file) : await importVideo(file);
  if (!isError(result)) {
    await putMedia(result);
  }
  return result;
};

/**
 * Imports files, keeping their order. Returns the items added and the files that could
 * not be used, with the reason.
 */
export const importFiles = async (files: readonly File[]) => {
  const results = await Promise.all(files.map(importFile));
  const added: MediaItem[] = [];
  const failed: ImportError[] = [];
  for (const result of results) {
    if (isError(result)) {
      failed.push(result);
    } else {
      added.push(toMediaItem(result));
    }
  }
  return { added, failed };
};
