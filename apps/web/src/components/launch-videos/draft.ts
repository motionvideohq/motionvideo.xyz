import { useMemo, useSyncExternalStore } from "react";
import { z } from "zod";

import { track } from "@/lib/analytics";
import { findLaunchScene } from "@/lib/launch-catalog";
import {
  ASPECTS,
  MAX_STORYBOARD_SCENES,
  PROMPT_MODES,
  RENDERERS,
} from "@/lib/launch-videos";
import type {
  Aspect,
  Fps,
  InputType,
  PromptMode,
  Renderer,
} from "@/lib/launch-videos";

// The Launch Videos draft: the storyboard (scene IDs in order, plus the joins
// picked between them) and the brand brief and output settings every copy
// shares, so a brief typed on a film page is already there in the composer.
// Local only: no cloud sync, no uploads. URL inputs (a logo file, a CTA link)
// can point at unreleased work, so they stay in memory for the tab and are
// never written to storage.

const STORAGE_KEY = "motionvideo-launch-draft";

/** Output frame rates offered; empty keeps the source's. */
export const FPS_CHOICES = [
  "24/1",
  "25/1",
  "30000/1001",
  "30/1",
  "60/1",
] as const;
export type FpsChoice = (typeof FPS_CHOICES)[number];

export const parseFps = (choice: FpsChoice): Fps => {
  const [num, den] = choice.split("/").map(Number);
  return { num: num ?? 30, den: den ?? 1 };
};

export interface StoryboardItem {
  /** Stable per position, so a duplicated scene is its own row. */
  key: string;
  sceneId: string;
  /** How this scene meets the next; only while the next is still `to`. */
  join?: { to: string; kind: "cut" | "bridge" };
}

export interface LaunchDraft {
  items: StoryboardItem[];
  /** Brief values by slot key, URL values excluded. */
  brief: Record<string, string>;
  mode: PromptMode;
  renderer: Renderer;
  aspect?: Aspect;
  fps?: FpsChoice;
  targetSeconds?: number;
}

const EMPTY: LaunchDraft = {
  items: [],
  brief: {},
  mode: "adapt",
  renderer: "hyperframes",
};

const itemSchema = z.object({
  key: z.string().min(1).max(40),
  sceneId: z.string().min(1).max(200),
  join: z
    .object({ to: z.string().max(40), kind: z.enum(["cut", "bridge"]) })
    .optional(),
});

// Storage may hold anything (an older build, a hand edit): each part falls
// back to its default unless it parses, and unpublished scenes drop out.
const parseDraft = (raw: string | null): LaunchDraft => {
  if (!raw) {
    return EMPTY;
  }
  try {
    const value = z.record(z.string(), z.unknown()).parse(JSON.parse(raw));
    const items = (z.array(itemSchema).safeParse(value.items).data ?? [])
      .filter((item) => findLaunchScene(item.sceneId))
      .slice(0, MAX_STORYBOARD_SCENES);
    return {
      items,
      brief:
        z.record(z.string().max(60), z.string().max(500)).safeParse(value.brief)
          .data ?? {},
      mode: z.enum(PROMPT_MODES).safeParse(value.mode).data ?? EMPTY.mode,
      renderer:
        z.enum(RENDERERS).safeParse(value.renderer).data ?? EMPTY.renderer,
      aspect: z.enum(ASPECTS).safeParse(value.aspect).data,
      fps: z.enum(FPS_CHOICES).safeParse(value.fps).data,
      targetSeconds: z
        .number()
        .positive()
        .max(600)
        .safeParse(value.targetSeconds).data,
    };
  } catch {
    return EMPTY;
  }
};

// When storage is blocked or full, the draft still works on this page.
let unstored: string | null = null;
// URL inputs, for this tab only.
let memoryInputs: Record<string, string> = {};
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Other tabs editing the same draft.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const readRaw = () => {
  if (unstored !== null) {
    return unstored;
  }
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const write = (next: LaunchDraft) => {
  const json = JSON.stringify(next);
  try {
    localStorage.setItem(STORAGE_KEY, json);
    unstored = null;
  } catch {
    unstored = json;
  }
  notify();
};

const update = (change: (draft: LaunchDraft) => LaunchDraft) =>
  write(change(parseDraft(readRaw())));

const newKey = () => Math.random().toString(36).slice(2, 10);

// A join only holds while the scene after it is the one it was picked for.
const pruneJoins = (items: StoryboardItem[]) =>
  items.map((item, index) =>
    item.join && item.join.to !== items[index + 1]?.key
      ? { key: item.key, sceneId: item.sceneId }
      : item
  );

export const draftActions = {
  /** Appends a scene; false when the storyboard is full. */
  add: (sceneId: string, surface: string): boolean => {
    const draft = parseDraft(readRaw());
    if (draft.items.length >= MAX_STORYBOARD_SCENES) {
      return false;
    }
    if (draft.items.length === 0) {
      track("launch_storyboard_first_scene", {
        scene: sceneId,
        role: findLaunchScene(sceneId)?.role ?? "",
        surface,
      });
    }
    write({
      ...draft,
      items: [...draft.items, { key: newKey(), sceneId }],
    });
    return true;
  },
  remove: (key: string) =>
    update((draft) => ({
      ...draft,
      items: pruneJoins(draft.items.filter((item) => item.key !== key)),
    })),
  duplicate: (key: string) =>
    update((draft) => {
      const index = draft.items.findIndex((item) => item.key === key);
      const original = draft.items[index];
      if (!original || draft.items.length >= MAX_STORYBOARD_SCENES) {
        return draft;
      }
      const items = draft.items.toSpliced(index + 1, 0, {
        key: newKey(),
        sceneId: original.sceneId,
      });
      return { ...draft, items: pruneJoins(items) };
    }),
  /** Moves the scene at `from` to position `to`. */
  move: (from: number, to: number) =>
    update((draft) => {
      const moved = draft.items[from];
      if (!moved || from === to || to < 0 || to >= draft.items.length) {
        return draft;
      }
      const items = draft.items.toSpliced(from, 1).toSpliced(to, 0, moved);
      return { ...draft, items: pruneJoins(items) };
    }),
  /** Sets (or clears, with `null`) how scene `index` meets the next. */
  setJoin: (index: number, kind: "cut" | "bridge" | null) =>
    update((draft) => {
      const next = draft.items[index + 1];
      const items = draft.items.map((item, position) => {
        if (position !== index) {
          return item;
        }
        return kind && next
          ? { ...item, join: { to: next.key, kind } }
          : { key: item.key, sceneId: item.sceneId };
      });
      return { ...draft, items };
    }),
  clear: () => update((draft) => ({ ...draft, items: [] })),
  setInput: (key: string, type: InputType, value: string) => {
    if (type === "url") {
      memoryInputs = Object.fromEntries([
        ...Object.entries(memoryInputs),
        [key, value],
      ]);
      notify();
      return;
    }
    update((draft) => ({
      ...draft,
      brief: Object.fromEntries([
        ...Object.entries(draft.brief).filter(([entry]) => entry !== key),
        ...(value ? [[key, value]] : []),
      ]),
    }));
  },
  setOptions: (
    options: Partial<
      Pick<
        LaunchDraft,
        "mode" | "renderer" | "aspect" | "fps" | "targetSeconds"
      >
    >
  ) => update((draft) => ({ ...draft, ...options })),
};

/**
 * The saved draft plus this tab's URL inputs. The server (and hydration)
 * sees the empty draft, so the markup matches; the stored one applies right
 * after.
 */
export const useLaunchDraft = () => {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const memory = useSyncExternalStore(
    subscribe,
    () => memoryInputs,
    () => memoryInputs
  );
  return useMemo(() => {
    const draft = parseDraft(raw);
    const inputs = Object.fromEntries(
      Object.entries({ ...draft.brief, ...memory }).filter(([, value]) => value)
    );
    return { ...draft, inputs };
  }, [raw, memory]);
};

/** The draft's output options, as the server functions take them. */
export const outputOptions = (draft: LaunchDraft) =>
  draft.mode === "adapt"
    ? {
        aspect: draft.aspect,
        fps: draft.fps ? parseFps(draft.fps) : undefined,
        targetSeconds: draft.targetSeconds,
      }
    : {};
