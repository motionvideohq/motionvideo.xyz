import {
  applyTemplate,
  hasTemplate,
  newShowcaseDoc,
  showcaseDocSchema,
} from "@motionvideo/engine";
import type { ShowcaseDoc } from "@motionvideo/engine";
import { useEffect, useEffectEvent, useState } from "react";

import { starterMedia } from "./samples";
import {
  collectMedia,
  getProject,
  persistStorage,
  putProject,
} from "./storage";
import type { ProjectRecord } from "./storage";
import { editor, useEditor } from "./store";

// Loading, creating and autosaving the project being edited.

const AUTOSAVE_MS = 500;

export const newProjectId = () =>
  crypto.randomUUID().replaceAll("-", "").slice(0, 20);

/** A fresh project with the starter sample media. */
export const createProject = (templateId?: string): ProjectRecord => {
  const base = newShowcaseDoc();
  const doc =
    templateId && hasTemplate(templateId)
      ? applyTemplate(base, templateId)
      : base;
  const now = Date.now();
  return {
    id: newProjectId(),
    tool: "showcase",
    name: doc.name,
    doc: {
      ...doc,
      media: starterMedia(
        doc.style.cards.frame === "phone" ? "phone" : "other"
      ),
    },
    thumb: null,
    createdAt: now,
    updatedAt: now,
    rev: 0,
  };
};

/**
 * Validates a stored or imported document (bytes from IndexedDB or a file
 * are untrusted). A template that no longer exists keeps media and settings
 * on the default template.
 */
export const readDoc = (doc: ShowcaseDoc): ShowcaseDoc | null => {
  const parsed = showcaseDocSchema.safeParse(doc);
  if (!parsed.success) {
    return null;
  }
  return hasTemplate(parsed.data.template)
    ? parsed.data
    : applyTemplate(parsed.data, "");
};

export type LoadState =
  | { status: "loading" }
  | { status: "ready"; record: ProjectRecord }
  | { status: "missing" };

interface Opened {
  record: ProjectRecord;
  /** True when the project was made just now (no id in the URL). */
  created: boolean;
}

const openOrCreate = async (
  projectId: string | undefined,
  templateId: string | undefined
): Promise<Opened | null> => {
  if (projectId) {
    const record = await getProject(projectId);
    const doc = record ? readDoc(record.doc) : null;
    return record && doc
      ? { record: { ...record, doc }, created: false }
      : null;
  }
  const record = createProject(templateId);
  await putProject(record);
  return { record, created: true };
};

/**
 * Opens the project in the URL, or creates one (with the template from the
 * URL) when there is none. Calls `onCreated` with a new project's id so the
 * URL can point at it.
 */
export const useLoadProject = (
  projectId: string | undefined,
  templateId: string | undefined,
  onCreated: (id: string) => void
): LoadState => {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const created = useEffectEvent(onCreated);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      persistStorage();
      let result: Opened | null = null;
      try {
        result = await openOrCreate(projectId, templateId);
      } catch {
        result = null;
      }
      if (!alive) {
        return;
      }
      if (!result) {
        setState({ status: "missing" });
        return;
      }
      editor.load(result.record.id, result.record.doc);
      setState({ status: "ready", record: result.record });
      if (result.created) {
        created(result.record.id);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [projectId, templateId]);

  return state;
};

export type SaveStatus = "saved" | "saving" | "full" | "error";

const isQuotaError = (error: Error) =>
  error instanceof DOMException && error.name === "QuotaExceededError";

/**
 * Saves the document shortly after every change. `thumb` captures a small
 * preview frame for the projects page.
 */
export const useAutosave = (
  record: ProjectRecord,
  thumb: () => Promise<Blob | null>
): SaveStatus => {
  const version = useEditor((s) => s.version);
  const [saved, setSaved] = useState({ record, version: 0 });
  const [failure, setFailure] = useState<"full" | "error" | null>(null);

  const save = useEffectEvent(async () => {
    const { doc, projectId, version: at } = editor.get();
    let capture: Blob | null = null;
    try {
      capture = await thumb();
    } catch {
      capture = null;
    }
    const next: ProjectRecord = {
      ...saved.record,
      id: projectId,
      name: doc.name,
      doc,
      thumb: capture ?? saved.record.thumb,
      updatedAt: Date.now(),
      rev: saved.record.rev + 1,
    };
    try {
      await putProject(next);
      setSaved({ record: next, version: at });
      setFailure(null);
    } catch (error) {
      setFailure(
        error instanceof Error && isQuotaError(error) ? "full" : "error"
      );
    }
  });

  useEffect(() => {
    if (version === 0) {
      return;
    }
    const pending = setTimeout(() => {
      save();
    }, AUTOSAVE_MS);
    return () => clearTimeout(pending);
  }, [version]);

  // Drop media blobs that no project uses, once per editing session.
  useEffect(() => {
    const later = setTimeout(async () => {
      try {
        await collectMedia();
      } catch {
        // Clean-up is best effort; it runs again next session.
      }
    }, 10_000);
    return () => clearTimeout(later);
  }, []);

  if (failure) {
    return failure;
  }
  return version > saved.version ? "saving" : "saved";
};
