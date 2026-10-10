import { useSyncExternalStore } from "react";

import { getBookmarks, setBookmark } from "@/server/bookmark-functions";

interface BookmarkState {
  /** Whose bookmarks these are; `null` while signed out. */
  userId: string | null;
  slugs: ReadonlySet<string>;
  /** The server list has arrived for `userId`. */
  loaded: boolean;
}

const SIGNED_OUT: BookmarkState = {
  userId: null,
  slugs: new Set(),
  loaded: false,
};

// One shared store for every bookmark button on the page: the signed-in
// user's slugs, updated optimistically and reconciled with the server.
let state = SIGNED_OUT;
const listeners = new Set<() => void>();
// Writes the server has not confirmed yet, laid over a list that loads late.
const unconfirmed = new Map<string, boolean>();
// Writes for one slug are sent in order, so the last click wins.
const queues = new Map<string, Promise<unknown>>();

const update = (next: BookmarkState) => {
  state = next;
  for (const listener of listeners) {
    listener();
  }
};

const withBookmark = (
  slugs: ReadonlySet<string>,
  slug: string,
  saved: boolean
) => {
  const next = new Set(slugs);
  if (saved) {
    next.add(slug);
  } else {
    next.delete(slug);
  }
  return next;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useBookmarks = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => SIGNED_OUT
  );

/** Points the store at the current session's user, loading their list. */
export const syncBookmarks = async (userId: string | null) => {
  if (state.userId === userId) {
    return;
  }
  unconfirmed.clear();
  if (!userId) {
    update(SIGNED_OUT);
    return;
  }
  update({ userId, slugs: new Set(), loaded: false });
  try {
    let slugs: ReadonlySet<string> = new Set(await getBookmarks());
    if (state.userId !== userId) {
      return;
    }
    for (const [slug, saved] of unconfirmed) {
      slugs = withBookmark(slugs, slug, saved);
    }
    update({ userId, slugs, loaded: true });
  } catch {
    // Buttons stay usable (showing only this visit's saves); the list loads
    // again on the next sign-in.
  }
};

/** Flips one bookmark for the signed-in user, rolling back if the save fails. */
export const toggleBookmark = async (slug: string) => {
  const { userId } = state;
  if (!userId) {
    return;
  }
  const saved = !state.slugs.has(slug);
  unconfirmed.set(slug, saved);
  update({ ...state, slugs: withBookmark(state.slugs, slug, saved) });

  const previous = queues.get(slug);
  const write = (async () => {
    try {
      await previous;
    } catch {
      // That click rolls itself back; this one still goes out.
    }
    await setBookmark({ data: { slug, saved } });
  })();
  queues.set(slug, write);
  try {
    await write;
  } catch {
    // Only undo if no newer click for this slug has replaced this one.
    if (state.userId === userId && unconfirmed.get(slug) === saved) {
      update({ ...state, slugs: withBookmark(state.slugs, slug, !saved) });
    }
  } finally {
    if (unconfirmed.get(slug) === saved) {
      unconfirmed.delete(slug);
    }
    if (queues.get(slug) === write) {
      queues.delete(slug);
    }
  }
};
