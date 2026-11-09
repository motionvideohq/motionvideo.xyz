import type { MediaItem, ShowcaseDoc } from "@motionvideo/engine";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { useRef } from "react";
import { useIntlayer } from "react-intlayer";
import { MoreH } from "reicon-react/icons/MoreH";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { useLocalizedNavigate } from "@/hooks/use-localized-navigate";

import { newProjectId, readDoc } from "./project";
import { getMedia, putMedia, putProject } from "./storage";
import { editor } from "./store";

// Project files (.motionvideo): a zip of doc.json plus every local media
// file, to move a project to another browser. The same doc.json is what the
// future CLI and API accept.

const EXT = ".motionvideo";

const mediaBytes = async (key: string) => {
  const record = await getMedia(key);
  if (!record) {
    return null;
  }
  const buffer = await record.blob.arrayBuffer();
  return [`media/${key}`, new Uint8Array(buffer)] as const;
};

export const exportProjectFile = async (doc: ShowcaseDoc) => {
  const keys = [...doc.media, ...doc.assets].flatMap((item) =>
    item.ref.type === "local" ? [item.ref.key] : []
  );
  const entries = await Promise.all(keys.map(mediaBytes));
  const files: Record<string, Uint8Array> = Object.fromEntries(
    entries.filter((entry) => entry !== null)
  );
  files["doc.json"] = strToU8(JSON.stringify(doc, null, 2));
  const zip = zipSync(files, { level: 0 });
  const url = URL.createObjectURL(new Blob([zip], { type: "application/zip" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.name.trim().replaceAll(/[^\w-]+/gu, "-") || "project"}${EXT}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

/** Imports a project file as a new project and returns its id. */
export const importProjectFile = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const entries = unzipSync(new Uint8Array(buffer));
  const raw = entries["doc.json"];
  const doc = raw ? readDoc(JSON.parse(strFromU8(raw))) : null;
  if (!doc) {
    throw new Error("invalid");
  }
  // Fresh media ids so imports never collide with what's already stored.
  const remap = new Map<string, string>();
  const restore = async (item: MediaItem): Promise<MediaItem | null> => {
    if (item.ref.type !== "local") {
      return item;
    }
    const bytes = entries[`media/${item.ref.key}`];
    if (!bytes) {
      return null;
    }
    const id = remap.get(item.ref.key) ?? newProjectId();
    remap.set(item.ref.key, id);
    await putMedia({
      id,
      blob: new Blob([new Uint8Array(bytes)]),
      kind: item.kind,
      type: "",
      name: item.name,
      size: bytes.byteLength,
      width: item.width,
      height: item.height,
      duration: item.duration,
      poster: null,
      createdAt: Date.now(),
    });
    return { ...item, id, ref: { type: "local", key: id } };
  };
  const restoredMedia = await Promise.all(doc.media.map(restore));
  const restoredAssets = await Promise.all(doc.assets.map(restore));
  const media = restoredMedia.filter((m) => m !== null);
  const assets = restoredAssets.filter((m) => m !== null);
  const fix = (id: string | undefined) => (id ? (remap.get(id) ?? id) : id);
  const next: ShowcaseDoc = {
    ...doc,
    media,
    assets,
    background:
      doc.background.type === "media"
        ? { ...doc.background, media: fix(doc.background.media) ?? "" }
        : doc.background,
    overlays: {
      ...doc.overlays,
      logo: { ...doc.overlays.logo, media: fix(doc.overlays.logo.media) },
    },
  };
  const now = Date.now();
  const id = newProjectId();
  await putProject({
    id,
    tool: "showcase",
    name: next.name,
    doc: next,
    thumb: null,
    createdAt: now,
    updatedAt: now,
    rev: 0,
  });
  return id;
};

export const ProjectFileMenu = () => {
  const content = useIntlayer("create-showcase-editor");
  const navigate = useLocalizedNavigate();
  const file = useRef<HTMLInputElement>(null);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={content.more.value}
            />
          }
        >
          <MoreH aria-hidden="true" className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              navigate({ to: ROUTES.CREATE_SHOWCASE_EDITOR, search: {} })
            }
          >
            {content.newProject}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportProjectFile(editor.get().doc)}>
            {content.downloadProject}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => file.current?.click()}>
            {content.openProject}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={file}
        type="file"
        accept={`${EXT},application/zip`}
        className="hidden"
        onChange={async (e) => {
          const picked = e.target.files?.[0];
          e.target.value = "";
          if (!picked) {
            return;
          }
          try {
            const id = await importProjectFile(picked);
            navigate({
              to: ROUTES.CREATE_SHOWCASE_EDITOR,
              search: { project: id },
            });
          } catch {
            editor.ui({
              notice: { tone: "error", message: content.invalidProject.value },
            });
          }
        }}
      />
    </>
  );
};
