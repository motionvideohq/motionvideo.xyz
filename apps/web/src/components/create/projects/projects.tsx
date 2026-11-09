import { getTemplate } from "@motionvideo/engine";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { Add } from "reicon-react/icons/Add";
import { Copy } from "reicon-react/icons/Copy";
import { Edit } from "reicon-react/icons/Edit";
import { Trash } from "reicon-react/icons/Trash";
import { Upload } from "reicon-react/icons/Upload";

import { newProjectId } from "@/components/create/showcase/editor/project";
import { importProjectFile } from "@/components/create/showcase/editor/project-file";
import {
  deleteProject,
  listProjects,
  putProject,
} from "@/components/create/showcase/editor/storage";
import type { ProjectRecord } from "@/components/create/showcase/editor/storage";
import { LocalizedLink as Link } from "@/components/localized-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useLocalizedNavigate } from "@/hooks/use-localized-navigate";

// Projects saved in this browser. Nothing here touches our servers.

const UNDO_MS = 6000;

const ProjectCard = ({
  project,
  onRename,
  onDuplicate,
  onDelete,
}: {
  project: ProjectRecord;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) => {
  const content = useIntlayer("create-projects");
  const { locale } = useLocale();
  const [editing, setEditing] = useState(false);
  const thumb = useMemo(
    () => (project.thumb ? URL.createObjectURL(project.thumb) : null),
    [project.thumb]
  );
  useEffect(
    () => () => {
      if (thumb) {
        URL.revokeObjectURL(thumb);
      }
    },
    [thumb]
  );
  const updated = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(project.updatedAt);

  return (
    <li className="group flex flex-col gap-2">
      <Link
        to={ROUTES.CREATE_SHOWCASE_EDITOR}
        search={{ project: project.id }}
        className="bg-muted ring-border/60 hover:ring-primary block aspect-video overflow-hidden rounded-xl ring-1 transition-shadow"
      >
        {thumb ? (
          <img src={thumb} alt="" className="size-full object-cover" />
        ) : null}
      </Link>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              // Focus the field the moment rename starts.
              // oxlint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              defaultValue={project.name}
              maxLength={120}
              aria-label={content.rename.value}
              onBlur={(e) => {
                setEditing(false);
                const name = e.target.value.trim();
                if (name && name !== project.name) {
                  onRename(name);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  setEditing(false);
                }
              }}
              className="bg-muted w-full rounded px-1.5 py-0.5 text-sm font-medium outline-none"
            />
          ) : (
            <p className="truncate text-sm font-medium">{project.name}</p>
          )}
          <p className="text-muted-foreground truncate text-xs">
            {getTemplate(project.doc.template).name} · {updated}
          </p>
        </div>
        <div className="flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label={content.rename.value}
            onClick={() => setEditing(true)}
          >
            <Edit aria-hidden="true" className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label={content.duplicate.value}
            onClick={onDuplicate}
          >
            <Copy aria-hidden="true" className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label={content.delete.value}
            onClick={onDelete}
          >
            <Trash aria-hidden="true" className="size-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
};

export const Projects = () => {
  const content = useIntlayer("create-projects");
  const navigate = useLocalizedNavigate();
  const [projects, setProjects] = useState<ProjectRecord[] | null>(null);
  const [pending, setPending] = useState<ProjectRecord | null>(null);
  const [error, setError] = useState<"storage" | "file" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const file = useRef<HTMLInputElement>(null);

  // Lists projects on mount.
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const list = await listProjects("showcase");
        if (alive) {
          setProjects(list);
        }
      } catch {
        if (alive) {
          setProjects([]);
          setError("storage");
        }
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  // Re-reads the list after a change made on this page.
  const reload = async () => {
    try {
      setProjects(await listProjects("showcase"));
    } catch {
      setError("storage");
    }
  };

  // Deleting waits a few seconds so it can be undone.
  const remove = (project: ProjectRecord) => {
    if (timer.current) {
      clearTimeout(timer.current);
      if (pending) {
        deleteProject(pending.id);
      }
    }
    setPending(project);
    timer.current = setTimeout(async () => {
      await deleteProject(project.id);
      setPending(null);
      timer.current = null;
    }, UNDO_MS);
  };

  const undo = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setPending(null);
  };

  const shown = (projects ?? []).filter((p) => p.id !== pending?.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Link to={ROUTES.CREATE_SHOWCASE_EDITOR} className={buttonVariants()}>
          <Add aria-hidden="true" className="size-4" />
          {content.newProject}
        </Link>
        <Button
          type="button"
          variant="outline"
          onClick={() => file.current?.click()}
        >
          <Upload aria-hidden="true" className="size-4" />
          {content.openFile}
        </Button>
        <input
          ref={file}
          type="file"
          accept=".motionvideo,application/zip"
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
              setError("file");
            }
          }}
        />
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error === "file" ? content.invalidFile : content.storageUnavailable}
        </p>
      ) : null}
      {pending ? (
        <output className="bg-muted flex w-fit items-center gap-3 rounded-lg px-3 py-2 text-sm">
          {content.deleted({ name: pending.name })}
          <Button type="button" size="xs" variant="outline" onClick={undo}>
            {content.undo}
          </Button>
        </output>
      ) : null}

      {projects !== null && shown.length === 0 ? (
        <div className="border-border flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="text-sm font-medium">{content.emptyTitle}</p>
          <p className="text-muted-foreground max-w-sm text-sm text-pretty">
            {content.emptyBody}
          </p>
        </div>
      ) : null}
      {shown.length > 0 ? (
        <ul className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onRename={async (name) => {
                await putProject({
                  ...project,
                  name,
                  doc: { ...project.doc, name },
                  updatedAt: Date.now(),
                });
                reload();
              }}
              onDuplicate={async () => {
                const now = Date.now();
                const name = content
                  .copyOf({ name: project.name })
                  .value.slice(0, 120);
                await putProject({
                  ...project,
                  id: newProjectId(),
                  name,
                  doc: { ...project.doc, name },
                  createdAt: now,
                  updatedAt: now,
                  rev: 0,
                });
                reload();
              }}
              onDelete={() => remove(project)}
            />
          ))}
        </ul>
      ) : null}
      <p className="text-muted-foreground text-xs text-pretty">
        {content.localNote}
      </p>
    </div>
  );
};
