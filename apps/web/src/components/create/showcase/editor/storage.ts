import type { ShowcaseDoc } from "@motionvideo/engine";

import type { CreateTool } from "@/constants/create";

// Projects and media live in the visitor's browser (IndexedDB), never on our
// servers. Media blobs are stored once and shared by every project that
// references them; a collection pass removes blobs no project uses.

const DB_NAME = "motionvideo-create";
const DB_VERSION = 1;

export interface ProjectRecord {
  id: string;
  tool: CreateTool;
  name: string;
  doc: ShowcaseDoc;
  /** Small preview frame for the projects page. */
  thumb: Blob | null;
  createdAt: number;
  updatedAt: number;
  rev: number;
}

export interface MediaRecord {
  id: string;
  blob: Blob;
  kind: "image" | "video";
  type: string;
  name: string;
  size: number;
  width: number;
  height: number;
  duration?: number;
  poster: Blob | null;
  createdAt: number;
}

let opening: Promise<IDBDatabase> | null = null;

const open = () => {
  if (!opening) {
    const { promise, resolve, reject } = Promise.withResolvers<IDBDatabase>();
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id" }).createIndex(
          "tool",
          "tool"
        );
      }
      if (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media", { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => {
      opening = null;
      reject(request.error ?? new Error("IndexedDB is not available."));
    });
    opening = promise;
  }
  return opening;
};

/**
 * Runs one request against a store and resolves with its result. IndexedDB
 * types results as `any`; each caller names the record type it stored.
 */
const run = async <T>(
  name: "projects" | "media",
  mode: IDBTransactionMode,
  start: (store: IDBObjectStore) => IDBRequest
): Promise<T> => {
  const db = await open();
  const request = start(db.transaction(name, mode).objectStore(name));
  const { promise, resolve, reject } = Promise.withResolvers<T>();
  request.addEventListener("success", () => resolve(request.result));
  request.addEventListener("error", () =>
    reject(request.error ?? new Error("Storage failed."))
  );
  return promise;
};

export const listProjects = async (tool: CreateTool) => {
  const all = await run<ProjectRecord[]>("projects", "readonly", (s) =>
    s.index("tool").getAll(tool)
  );
  return all.toSorted((a, b) => b.updatedAt - a.updatedAt);
};

export const getProject = (id: string) =>
  run<ProjectRecord | undefined>("projects", "readonly", (s) => s.get(id));

export const putProject = async (record: ProjectRecord) => {
  await run("projects", "readwrite", (s) => s.put(record));
};

export const deleteProject = async (id: string) => {
  await run("projects", "readwrite", (s) => s.delete(id));
};

export const getMedia = (id: string) =>
  run<MediaRecord | undefined>("media", "readonly", (s) => s.get(id));

export const putMedia = async (record: MediaRecord) => {
  await run("media", "readwrite", (s) => s.put(record));
};

/** Media younger than this is kept even when unused: it may be unsaved. */
const COLLECT_AFTER_MS = 60 * 60 * 1000;

/** Deletes media blobs no project references. */
export const collectMedia = async () => {
  const projects = await run<ProjectRecord[]>("projects", "readonly", (s) =>
    s.getAll()
  );
  const used = new Set<string>();
  for (const { doc } of projects) {
    for (const item of [...doc.media, ...doc.assets]) {
      if (item.ref.type === "local") {
        used.add(item.ref.key);
      }
    }
  }
  const records = await run<MediaRecord[]>("media", "readonly", (s) =>
    s.getAll()
  );
  const cutoff = Date.now() - COLLECT_AFTER_MS;
  const stale = records.filter((r) => !used.has(r.id) && r.createdAt < cutoff);
  await Promise.all(
    stale.map((r) => run("media", "readwrite", (s) => s.delete(r.id)))
  );
};

/** Asks the browser not to evict our data under storage pressure. */
export const persistStorage = async () => {
  try {
    if (await navigator.storage?.persisted?.()) {
      return true;
    }
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
};
