import type { ShowcaseDoc } from "@motionvideo/engine";
import { useSyncExternalStore } from "react";

// The editor's state: the project document with undo/redo history, plus UI
// state that is never saved. A tiny external store keeps the preview,
// panels and autosave in sync without a state library.

const HISTORY_LIMIT = 100;
/** Edits with the same key inside this window become one undo step. */
const GROUP_MS = 700;

export type LeftTab = "templates" | "controls";
export type RightTab = "visual" | "text";

export interface EditorState {
  projectId: string;
  doc: ShowcaseDoc;
  past: ShowcaseDoc[];
  future: ShowcaseDoc[];
  /** Bumped on every document change; autosave watches it. */
  version: number;
  selectedMedia: string | null;
  leftTab: LeftTab;
  rightTab: RightTab;
  exportOpen: boolean;
  /** A short message shown over the preview, e.g. after an import. */
  notice: Notice | null;
}

export interface Notice {
  tone: "info" | "error";
  message: string;
}

type Listener = () => void;

let state: EditorState | null = null;
const listeners = new Set<Listener>();
let lastGroup: { key: string; at: number } | null = null;

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const current = () => {
  if (!state) {
    throw new Error("Editor store used before a project was loaded.");
  }
  return state;
};

export const editor = {
  /** Starts editing a project; clears history. */
  load(projectId: string, doc: ShowcaseDoc) {
    state = {
      projectId,
      doc,
      past: [],
      future: [],
      version: 0,
      selectedMedia: null,
      leftTab: "templates",
      rightTab: "visual",
      exportOpen: false,
      notice: null,
    };
    lastGroup = null;
    emit();
  },

  get: current,

  /**
   * Changes the document. Edits sharing a `group` key within a short window
   * (one slider drag, typing in one field) collapse into one undo step.
   */
  update(change: (doc: ShowcaseDoc) => ShowcaseDoc, group?: string) {
    const s = current();
    const next = change(s.doc);
    if (next === s.doc) {
      return;
    }
    const now = Date.now();
    const merge =
      group !== undefined &&
      lastGroup?.key === group &&
      now - lastGroup.at < GROUP_MS;
    lastGroup = group === undefined ? null : { key: group, at: now };
    state = {
      ...s,
      doc: next,
      past: merge ? s.past : [...s.past, s.doc].slice(-HISTORY_LIMIT),
      future: [],
      version: s.version + 1,
    };
    emit();
  },

  undo() {
    const s = current();
    const prev = s.past.at(-1);
    if (!prev) {
      return;
    }
    lastGroup = null;
    state = {
      ...s,
      doc: prev,
      past: s.past.slice(0, -1),
      future: [s.doc, ...s.future],
      version: s.version + 1,
    };
    emit();
  },

  redo() {
    const s = current();
    const [next] = s.future;
    if (!next) {
      return;
    }
    lastGroup = null;
    state = {
      ...s,
      doc: next,
      past: [...s.past, s.doc],
      future: s.future.slice(1),
      version: s.version + 1,
    };
    emit();
  },

  /** UI-only changes: never part of history or autosave. */
  ui(
    patch: Partial<
      Pick<
        EditorState,
        "selectedMedia" | "leftTab" | "rightTab" | "exportOpen" | "notice"
      >
    >
  ) {
    state = { ...current(), ...patch };
    emit();
  },
};

export const useEditor = <T>(select: (s: EditorState) => T): T =>
  useSyncExternalStore(
    subscribe,
    () => select(current()),
    () => select(current())
  );

export const useDoc = () => useEditor((s) => s.doc);
