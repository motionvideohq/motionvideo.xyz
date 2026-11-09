import type { MediaItem } from "@motionvideo/engine";

import { MAX_MEDIA_ITEMS } from "@/constants/create";

import { importFiles } from "./media";
import { isSample } from "./samples";
import { editor } from "./store";

// Document edits shared by the tray, drop zone, paste handler and inspector.

/**
 * Adds media to the project. The first time the visitor adds their own
 * media, the starter samples make way for it.
 */
export const addMedia = (items: readonly MediaItem[]) => {
  if (items.length === 0) {
    return { replacedSamples: false };
  }
  let replacedSamples = false;
  editor.update((d) => {
    const own = items.some((m) => !isSample(m));
    const onlySamples = d.media.length > 0 && d.media.every(isSample);
    replacedSamples = own && onlySamples;
    const kept = replacedSamples ? [] : d.media;
    return { ...d, media: [...kept, ...items].slice(0, MAX_MEDIA_ITEMS) };
  });
  return { replacedSamples };
};

export const importAndAdd = async (files: readonly File[]) => {
  const { added, failed } = await importFiles(files);
  const { replacedSamples } = addMedia(added);
  return { added, failed, replacedSamples };
};

export const removeMedia = (id: string) => {
  editor.update((d) => ({ ...d, media: d.media.filter((m) => m.id !== id) }));
  if (editor.get().selectedMedia === id) {
    editor.ui({ selectedMedia: null });
  }
};

export const updateMedia = (
  id: string,
  patch: Partial<MediaItem>,
  group?: string
) =>
  editor.update(
    (d) => ({
      ...d,
      media: d.media.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }),
    group ? `media:${id}:${group}` : undefined
  );

export const moveMedia = (from: number, to: number) =>
  editor.update((d) => {
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= d.media.length ||
      to >= d.media.length
    ) {
      return d;
    }
    const media = [...d.media];
    const [item] = media.splice(from, 1);
    media.splice(to, 0, item);
    return { ...d, media };
  });

export type { ImportError } from "./media";
