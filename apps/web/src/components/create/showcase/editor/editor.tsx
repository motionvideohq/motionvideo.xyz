import { useEffect, useRef, useState } from "react";
import { useIntlayer } from "react-intlayer";
import { Download } from "reicon-react/icons/Download";
import { Folder } from "reicon-react/icons/Folder";
import { Redo } from "reicon-react/icons/Redo";
import { Undo } from "reicon-react/icons/Undo";
import { Xmark } from "reicon-react/icons/Xmark";

import { LocalizedLink as Link } from "@/components/localized-link";
import { Logo } from "@/components/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { useLocalizedNavigate } from "@/hooks/use-localized-navigate";
import { cn } from "@/lib/utils";

import { useCreateAccess } from "./access";
import { importAndAdd } from "./actions";
import { ControlsPanel } from "./controls-panel";
import { ExportDialog } from "./export-dialog";
import { useImportFeedback } from "./import-feedback";
import { MediaInspector } from "./media-inspector";
import { MediaTray } from "./media-tray";
import { Preview } from "./preview";
import type { PreviewHandle } from "./preview";
import { useAutosave, useLoadProject } from "./project";
import type { SaveStatus } from "./project";
import { ProjectFileMenu } from "./project-file";
import { useResolvedMedia } from "./sources";
import type { ProjectRecord } from "./storage";
import { editor, useDoc, useEditor } from "./store";
import type { LeftTab, RightTab } from "./store";
import { TemplatePanel } from "./template-panel";
import { TextPanel } from "./text-panel";
import { VisualPanel } from "./visual-panel";

// The Showcase editor: templates and controls on the left, the live preview
// in the middle, the look and text on the right, media along the bottom.

export interface EditorProps {
  projectId?: string;
  templateId?: string;
  paymentId?: string;
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const SaveIndicator = ({ status }: { status: SaveStatus }) => {
  const content = useIntlayer("create-showcase-editor");
  const label = {
    saved: content.saved,
    saving: content.saving,
    full: content.storageFull,
    error: content.saveFailed,
  }[status];
  return (
    <output
      className={cn(
        "hidden text-xs sm:inline",
        status === "full" || status === "error"
          ? "text-destructive"
          : "text-muted-foreground"
      )}
    >
      {label}
    </output>
  );
};

const LeftPanel = () => {
  const content = useIntlayer("create-showcase-editor");
  const tab = useEditor((s) => s.leftTab);
  return (
    <Tabs
      value={tab}
      onValueChange={(v: LeftTab) => editor.ui({ leftTab: v })}
      className="min-h-0 flex-1 gap-0"
    >
      <div className="px-3 pt-3">
        <TabsList className="w-full">
          <TabsTrigger value="templates">{content.templates}</TabsTrigger>
          <TabsTrigger value="controls">{content.controls}</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="templates" className="min-h-0 flex-1 overflow-y-auto">
        <TemplatePanel />
      </TabsContent>
      <TabsContent value="controls" className="min-h-0 flex-1 overflow-y-auto">
        <ControlsPanel />
      </TabsContent>
    </Tabs>
  );
};

const RightPanel = () => {
  const content = useIntlayer("create-showcase-editor");
  const tab = useEditor((s) => s.rightTab);
  return (
    <Tabs
      value={tab}
      onValueChange={(v: RightTab) => editor.ui({ rightTab: v })}
      className="min-h-0 flex-1 gap-0"
    >
      <div className="px-3 pt-3">
        <TabsList className="w-full">
          <TabsTrigger value="visual">{content.visual}</TabsTrigger>
          <TabsTrigger value="text">{content.textTab}</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="visual" className="min-h-0 flex-1 overflow-y-auto">
        <VisualPanel />
      </TabsContent>
      <TabsContent value="text" className="min-h-0 flex-1 overflow-y-auto">
        <TextPanel />
      </TabsContent>
    </Tabs>
  );
};

const NoticeBar = () => {
  const content = useIntlayer("create-showcase-editor");
  const notice = useEditor((s) => s.notice);
  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = setTimeout(() => editor.ui({ notice: null }), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  if (!notice) {
    return null;
  }
  return (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      className={cn(
        "absolute top-3 left-1/2 z-20 flex max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-lg px-3 py-2 text-sm shadow-lg",
        notice.tone === "error"
          ? "bg-destructive text-white"
          : "bg-foreground text-background"
      )}
    >
      <span className="text-pretty">{notice.message}</span>
      <button
        type="button"
        aria-label={content.dismiss.value}
        onClick={() => editor.ui({ notice: null })}
      >
        <Xmark aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
};

const Workspace = ({
  record,
  paymentId,
}: {
  record: ProjectRecord;
  paymentId?: string;
}) => {
  const content = useIntlayer("create-showcase-editor");
  const doc = useDoc();
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const preview = useRef<PreviewHandle>(null);
  const media = useResolvedMedia([...doc.media, ...doc.assets]);
  const status = useAutosave(
    record,
    () => preview.current?.capture() ?? Promise.resolve(null)
  );
  const { access } = useCreateAccess(paymentId);
  const report = useImportFeedback();
  const [dragging, setDragging] = useState(false);
  const [sheet, setSheet] = useState<"left" | "right" | null>(null);

  // Open the export dialog after returning from a single-export checkout.
  useEffect(() => {
    if (paymentId) {
      editor.ui({ exportOpen: true });
    }
  }, [paymentId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || document.querySelector("[role=dialog]")) {
        return;
      }
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          editor.redo();
        } else {
          editor.undo();
        }
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        editor.redo();
      } else if (e.key === " ") {
        e.preventDefault();
        preview.current?.toggle();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        preview.current?.step(
          (e.key === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 10 : 1)
        );
      }
    };
    const onPaste = async (e: ClipboardEvent) => {
      if (isTyping(e.target)) {
        return;
      }
      const files = [...(e.clipboardData?.files ?? [])];
      if (files.length > 0) {
        e.preventDefault();
        report(await importAndAdd(files));
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("paste", onPaste);
    };
  }, [report]);

  return (
    <div
      className="bg-background fixed inset-0 z-40 flex flex-col"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) {
          setDragging(false);
        }
      }}
      onDrop={async (e) => {
        if (!e.dataTransfer.files.length) {
          return;
        }
        e.preventDefault();
        setDragging(false);
        report(await importAndAdd([...e.dataTransfer.files]));
      }}
    >
      <header className="border-border/60 flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <Link
          to={ROUTES.CREATE_SHOWCASE}
          aria-label={content.backToShowcase.value}
          className="flex items-center"
        >
          <Logo />
        </Link>
        <span className="text-muted-foreground hidden text-sm md:inline">
          /
        </span>
        <input
          aria-label={content.projectName.value}
          value={doc.name}
          maxLength={120}
          onChange={(e) =>
            editor.update((d) => ({ ...d, name: e.target.value }), "name")
          }
          className="hover:bg-muted focus:bg-muted min-w-0 flex-1 rounded-md bg-transparent px-2 py-1 text-sm font-medium outline-none md:max-w-72"
        />
        <SaveIndicator status={status} />
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={!canUndo}
            onClick={() => editor.undo()}
            aria-label={content.undo.value}
          >
            <Undo aria-hidden="true" className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            disabled={!canRedo}
            onClick={() => editor.redo()}
            aria-label={content.redo.value}
          >
            <Redo aria-hidden="true" className="size-4" />
          </Button>
          <ProjectFileMenu />
          <Link
            to={ROUTES.CREATE_PROJECTS}
            className={cn(
              buttonVariants({ size: "sm", variant: "ghost" }),
              "hidden sm:inline-flex"
            )}
          >
            <Folder aria-hidden="true" className="size-4" />
            {content.projects}
          </Link>
          <Button
            type="button"
            size="sm"
            onClick={() => editor.ui({ exportOpen: true })}
            data-track="create_export_open"
          >
            <Download aria-hidden="true" className="size-4" />
            {content.export}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="border-border/60 hidden w-72 shrink-0 flex-col border-r lg:flex">
          <LeftPanel />
        </aside>
        <main className="relative flex min-w-0 flex-1 flex-col">
          <NoticeBar />
          {media.missing.length > 0 ? (
            <p
              role="alert"
              className="bg-destructive/10 text-destructive px-4 py-2 text-xs"
            >
              {content.missingMedia}
            </p>
          ) : null}
          <Preview ref={preview} doc={doc} sources={media.sources} />
          <div className="flex gap-2 px-4 pb-2 lg:hidden">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setSheet("left")}
            >
              {content.templates}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setSheet("right")}
            >
              {content.visual}
            </Button>
          </div>
          <MediaTray posters={media.posters} />
          {dragging ? (
            <div className="bg-primary/10 border-primary pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-xl border-2 border-dashed">
              <p className="bg-background rounded-lg px-4 py-2 text-sm font-medium shadow">
                {content.dropToAdd}
              </p>
            </div>
          ) : null}
        </main>
        <aside className="border-border/60 hidden w-72 shrink-0 flex-col border-l lg:flex">
          <RightPanel />
        </aside>
      </div>

      <Drawer
        open={sheet !== null}
        onOpenChange={(open) => !open && setSheet(null)}
        shouldScaleBackground={false}
      >
        <DrawerContent className="flex h-[70svh] flex-col">
          <DrawerTitle className="sr-only">
            {sheet === "left" ? content.templates : content.visual}
          </DrawerTitle>
          {sheet === "left" ? <LeftPanel /> : <RightPanel />}
        </DrawerContent>
      </Drawer>

      <MediaInspector sources={media.sources} />
      <ExportDialog
        doc={doc}
        sources={media.sources}
        access={access}
        currentFrame={() => preview.current?.frame() ?? 0}
      />
    </div>
  );
};

export const ShowcaseEditor = ({
  projectId,
  templateId,
  paymentId,
}: EditorProps) => {
  const content = useIntlayer("create-showcase-editor");
  const navigate = useLocalizedNavigate();
  const state = useLoadProject(projectId, templateId, (id) =>
    navigate({
      to: ROUTES.CREATE_SHOWCASE_EDITOR,
      search: { project: id },
      replace: true,
    })
  );

  if (state.status === "loading") {
    return (
      <div className="flex h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">{content.loading}</p>
      </div>
    );
  }
  if (state.status === "missing") {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-sm text-sm text-pretty">{content.projectMissing}</p>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() =>
              navigate({ to: ROUTES.CREATE_SHOWCASE_EDITOR, search: {} })
            }
          >
            {content.newProject}
          </Button>
          <Link
            to={ROUTES.CREATE_PROJECTS}
            className={buttonVariants({ variant: "outline" })}
          >
            {content.projects}
          </Link>
        </div>
      </div>
    );
  }
  return (
    <Workspace
      key={state.record.id}
      record={state.record}
      paymentId={paymentId}
    />
  );
};
