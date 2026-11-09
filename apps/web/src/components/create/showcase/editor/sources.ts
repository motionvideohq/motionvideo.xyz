import type { MediaItem, MediaRef } from "@motionvideo/engine";
import { useEffect, useState } from "react";

import { getMedia } from "./storage";

// Object URLs for media stored in IndexedDB, made once per blob and kept for
// the page's lifetime so the preview, thumbnails and exports share them.

interface LocalUrls {
  src: string;
  poster: string | null;
}

const urls = new Map<string, Promise<LocalUrls>>();

const makeUrls = async (key: string): Promise<LocalUrls> => {
  const record = await getMedia(key);
  if (!record) {
    throw new Error(`Missing media ${key}`);
  }
  return {
    src: URL.createObjectURL(record.blob),
    poster: record.poster ? URL.createObjectURL(record.poster) : null,
  };
};

const localUrls = async (key: string) => {
  let pending = urls.get(key);
  if (!pending) {
    pending = makeUrls(key);
    urls.set(key, pending);
  }
  try {
    return await pending;
  } catch (error) {
    // Let a later call retry, e.g. after the blob is imported again.
    urls.delete(key);
    throw error;
  }
};

export interface ResolvedMedia {
  /** Loadable URL per media id. */
  sources: Record<string, string>;
  /** Thumbnail URL per media id, when one exists. */
  posters: Record<string, string>;
  /** Ids whose bytes are missing (e.g. storage was cleared). */
  missing: string[];
  ready: boolean;
}

/** `local:<key>`, or the URL itself for remote media. */
const refKey = (ref: MediaRef) => {
  if (ref.type === "local") {
    return `local:${ref.key}`;
  }
  return ref.type === "url" ? ref.url : ref.path;
};

const resolveEntry = async (line: string) => {
  const [id, ref] = line.split("\t");
  if (!ref.startsWith("local:")) {
    return { id, urls: { src: ref, poster: null } };
  }
  try {
    return { id, urls: await localUrls(ref.slice("local:".length)) };
  } catch {
    return { id, urls: null };
  }
};

export const useResolvedMedia = (
  items: readonly MediaItem[]
): ResolvedMedia => {
  // One line per item, `id\tref`: a stable effect key for the whole set.
  const key = items.map((m) => `${m.id}\t${refKey(m.ref)}`).join("\n");
  const [resolved, setResolved] = useState<ResolvedMedia>({
    sources: {},
    posters: {},
    missing: [],
    ready: false,
  });

  useEffect(() => {
    let alive = true;
    const resolve = async () => {
      const entries = await Promise.all(
        key.split("\n").filter(Boolean).map(resolveEntry)
      );
      if (!alive) {
        return;
      }
      const next: ResolvedMedia = {
        sources: {},
        posters: {},
        missing: [],
        ready: true,
      };
      for (const { id, urls: found } of entries) {
        if (!found) {
          next.missing.push(id);
          continue;
        }
        next.sources[id] = found.src;
        if (found.poster) {
          next.posters[id] = found.poster;
        }
      }
      setResolved(next);
    };
    resolve();
    return () => {
      alive = false;
    };
  }, [key]);

  return resolved;
};
