import { getTemplate, outputSize } from "@motionvideo/engine";
import type { ShowcaseDoc } from "@motionvideo/engine";
import * as render from "@motionvideo/engine/render";
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { Download } from "reicon-react/icons/Download";

import { LocalizedLink as Link } from "@/components/localized-link";
import { useSignInDialog } from "@/components/sign-in-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CREATE_PASS_CENTS,
  FREE_LIMITS,
  GIF_FPS,
  GIF_WIDTHS,
  STILL_SIZES,
  unlocked,
  VIDEO_FPS,
  VIDEO_RESOLUTIONS,
} from "@/constants/create";
import type { CreateAccess } from "@/constants/create";
import { formatUsd } from "@/constants/pricing";
import { ROUTES } from "@/constants/routes";
import { track } from "@/lib/analytics";
import { useSession } from "@/lib/auth-client";
import { startCreatePassCheckout } from "@/server/create-functions";

import { SegmentedField, ToggleField } from "./fields";
import { editor, useEditor } from "./store";

// Export: video, GIF, a still or a PNG sequence, rendered in this browser
// with the same composition as the preview. Free exports stop at 1080p30
// MP4; Pro or a single export for this project unlocks every setting.

type Kind = "video" | "gif" | "still" | "sequence";
type Quality = "low" | "medium" | "high" | "very-high";

interface Settings {
  kind: Kind;
  format: "mp4" | "webm";
  resolution: (typeof VIDEO_RESOLUTIONS)[number];
  fps: (typeof VIDEO_FPS)[number];
  quality: Quality;
  transparent: boolean;
  gifWidth: (typeof GIF_WIDTHS)[number];
  gifFps: (typeof GIF_FPS)[number];
  stillSize: (typeof STILL_SIZES)[number];
  stillFormat: "png" | "jpeg";
}

const DEFAULTS: Settings = {
  kind: "video",
  format: "mp4",
  resolution: 1080,
  fps: 30,
  quality: "high",
  transparent: false,
  gifWidth: 640,
  gifFps: 20,
  stillSize: 1440,
  stillFormat: "png",
};

/** Why these settings need Pro or a single export, if they do. */
const lockReason = (s: Settings, doc: ShowcaseDoc): string | null => {
  if (getTemplate(doc.template).tier === "pro") {
    return "template";
  }
  if (s.kind === "gif" && !FREE_LIMITS.gif) {
    return "gif";
  }
  if (s.kind === "sequence" && !FREE_LIMITS.sequence) {
    return "sequence";
  }
  if (s.kind === "still") {
    return s.stillSize > FREE_LIMITS.still ? "size" : null;
  }
  if (s.kind === "video") {
    if (s.format !== "mp4") {
      return "format";
    }
    if (s.resolution > FREE_LIMITS.resolution) {
      return "size";
    }
    if (s.fps > FREE_LIMITS.fps) {
      return "fps";
    }
  }
  return null;
};

const fileBase = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "") || "showcase";

/** Pixel size of the export these settings produce. */
const sizeOf = (s: Settings, doc: ShowcaseDoc) => {
  if (s.kind === "gif") {
    const { width, height } = outputSize(doc, 1080);
    return {
      width: s.gifWidth,
      height: Math.round((s.gifWidth * height) / width / 2) * 2,
    };
  }
  if (s.kind === "still") {
    const { width, height } = outputSize(doc, 1080);
    const scale = s.stillSize / Math.max(width, height);
    return {
      width: Math.round(width * scale),
      height: Math.round(height * scale),
    };
  }
  return outputSize(doc, s.resolution);
};

const STILL_LABELS = new Map([
  [2160, "4K"],
  [4320, "8K"],
]);

/** Renders the export for these settings; throws with the browser's reason. */
const renderExport = async (
  s: Settings,
  input: render.RenderInput,
  frame: number,
  transparentBg: boolean
): Promise<{ blob: Blob; name: string }> => {
  const { width, height } = sizeOf(s, input.doc);
  const base = `${fileBase(input.doc.name)}-${width}x${height}`;
  if (s.kind === "gif") {
    const blob = await render.renderGif(input, {
      width: s.gifWidth,
      fps: s.gifFps,
      colors: 256,
    });
    return { blob, name: `${base}.gif` };
  }
  if (s.kind === "still") {
    // Stills render at their long side; resolution is the short side.
    const blob = await render.renderStill(input, {
      frame,
      resolution: Math.min(width, height),
      format: s.stillFormat,
    });
    return {
      blob,
      name: `${base}.${s.stillFormat === "jpeg" ? "jpg" : "png"}`,
    };
  }
  if (s.kind === "sequence") {
    const blob = await render.renderPngSequence(input, {
      resolution: s.resolution,
      fps: s.fps,
      name: fileBase(input.doc.name),
    });
    return { blob, name: `${base}-frames.zip` };
  }
  const output: render.VideoOutput = {
    format: s.format,
    resolution: s.resolution,
    fps: s.fps,
    quality: s.quality,
    transparent: s.format === "webm" && s.transparent && transparentBg,
  };
  const issues = await render.checkVideoSupport(input.doc, output);
  if (issues.length > 0) {
    throw new Error(issues.map((i) => i.message).join(" "));
  }
  const blob = await render.renderVideo(input, output);
  return { blob, name: `${base}-${s.fps}fps.${s.format}` };
};

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

type Phase =
  | { status: "idle" }
  | { status: "rendering"; progress: number; eta: number | null }
  | { status: "done"; size: number }
  | { status: "error"; message: string };

/** The settings for the chosen export kind. */
const SettingsFields = ({
  s,
  set,
  badge,
  transparentBg,
}: {
  s: Settings;
  set: (patch: Partial<Settings>) => void;
  badge: (locked: boolean) => ReactNode;
  transparentBg: boolean;
}) => {
  const content = useIntlayer("create-showcase-editor");
  return (
    <>
      {s.kind === "video" || s.kind === "sequence" ? (
        <>
          {s.kind === "video" ? (
            <SegmentedField
              label={content.format}
              value={s.format}
              options={[
                { value: "mp4", label: "MP4" },
                { value: "webm", label: "WebM", badge: badge(true) },
              ]}
              onChange={(format) => set({ format })}
            />
          ) : null}
          <SegmentedField
            label={content.resolution}
            value={s.resolution}
            options={VIDEO_RESOLUTIONS.map((r) => ({
              value: r,
              label: r === 2160 ? "4K" : `${r}p`,
              badge: badge(r > FREE_LIMITS.resolution),
            }))}
            onChange={(resolution) => set({ resolution })}
          />
          <SegmentedField
            label={content.frameRate}
            value={s.fps}
            options={VIDEO_FPS.map((f) => ({
              value: f,
              label: `${f}`,
              badge: badge(f > FREE_LIMITS.fps),
            }))}
            onChange={(fps) => set({ fps })}
          />
          {s.kind === "video" ? (
            <SegmentedField
              label={content.quality}
              value={s.quality}
              options={[
                { value: "low", label: content.qualityLow },
                { value: "medium", label: content.qualityMedium },
                { value: "high", label: content.qualityHigh },
                { value: "very-high", label: content.qualityMax },
              ]}
              onChange={(quality) => set({ quality })}
            />
          ) : null}
          {s.kind === "video" && s.format === "webm" && transparentBg ? (
            <ToggleField
              label={content.transparentExport}
              checked={s.transparent}
              onChange={(transparent) => set({ transparent })}
            />
          ) : null}
          {s.kind === "video" && s.format === "webm" && !transparentBg ? (
            <p className="text-muted-foreground text-[11px]">
              {content.transparentHint}
            </p>
          ) : null}
        </>
      ) : null}

      {s.kind === "gif" ? (
        <>
          <SegmentedField
            label={content.width}
            value={s.gifWidth}
            options={GIF_WIDTHS.map((w) => ({ value: w, label: `${w}` }))}
            onChange={(gifWidth) => set({ gifWidth })}
          />
          <SegmentedField
            label={content.frameRate}
            value={s.gifFps}
            options={GIF_FPS.map((f) => ({ value: f, label: `${f}` }))}
            onChange={(gifFps) => set({ gifFps })}
          />
        </>
      ) : null}

      {s.kind === "still" ? (
        <>
          <SegmentedField
            label={content.longSide}
            value={s.stillSize}
            options={STILL_SIZES.map((v) => ({
              value: v,
              label: STILL_LABELS.get(v) ?? `${v}`,
              badge: badge(v > FREE_LIMITS.still),
            }))}
            onChange={(stillSize) => set({ stillSize })}
          />
          <SegmentedField
            label={content.format}
            value={s.stillFormat}
            options={[
              { value: "png", label: "PNG" },
              { value: "jpeg", label: "JPEG" },
            ]}
            onChange={(stillFormat) => set({ stillFormat })}
          />
          <p className="text-muted-foreground text-[11px]">
            {content.stillNote}
          </p>
        </>
      ) : null}
    </>
  );
};

export const ExportDialog = ({
  doc,
  sources,
  access,
  currentFrame,
}: {
  doc: ShowcaseDoc;
  sources: Record<string, string>;
  access: CreateAccess;
  currentFrame: () => number;
}) => {
  const content = useIntlayer("create-showcase-editor");
  const { locale } = useLocale();
  const open = useEditor((s) => s.exportOpen);
  const projectId = useEditor((s) => s.projectId);
  const session = useSession();
  const signIn = useSignInDialog();
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [phase, setPhase] = useState<Phase>({ status: "idle" });
  const [buying, setBuying] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const isUnlocked = unlocked(access, "showcase", projectId);
  const reason = isUnlocked ? null : lockReason(s, doc);
  const set = (patch: Partial<Settings>) =>
    setS((prev) => ({ ...prev, ...patch }));
  const pass = access.passes.find(
    (p) => p.tool === "showcase" && p.projectId === projectId
  );
  const transparentBg = doc.background.type === "transparent";

  const size = sizeOf(s, doc);

  const run = async () => {
    const controller = new AbortController();
    abort.current = controller;
    const started = performance.now();
    setPhase({ status: "rendering", progress: 0, eta: null });
    const props = {
      kind: s.kind,
      template: doc.template,
      width: size.width,
      height: size.height,
      unlocked: isUnlocked,
    };
    track("create_export_started", props);
    const input: render.RenderInput = {
      doc,
      sources,
      signal: controller.signal,
      onProgress: (progress) => {
        const elapsed = (performance.now() - started) / 1000;
        const eta =
          progress > 0.05 ? Math.max(0, elapsed / progress - elapsed) : null;
        setPhase({ status: "rendering", progress, eta });
      },
    };
    let result: { blob: Blob; name: string } | null = null;
    let failure = "";
    try {
      result = await renderExport(s, input, currentFrame(), transparentBg);
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
    }
    abort.current = null;
    if (controller.signal.aborted) {
      setPhase({ status: "idle" });
      return;
    }
    if (!result) {
      setPhase({ status: "error", message: failure });
      track("create_export_failed", { ...props, error: failure.slice(0, 200) });
      return;
    }
    download(result.blob, result.name);
    setPhase({ status: "done", size: result.blob.size });
    track("create_export_completed", {
      ...props,
      mb: Math.round(result.blob.size / 10_000) / 100,
      seconds: Math.round((performance.now() - started) / 1000),
    });
  };

  const buy = async () => {
    if (!session.data) {
      signIn.open(content.signInToBuy.value);
      return;
    }
    setBuying(true);
    track("create_pass_checkout", { template: doc.template });
    try {
      window.location.assign(
        await startCreatePassCheckout({
          data: { tool: "showcase", projectId, projectName: doc.name, locale },
        })
      );
    } catch {
      setBuying(false);
      setPhase({ status: "error", message: content.checkoutFailed.value });
    }
  };

  const rendering = phase.status === "rendering";
  let description: ReactNode = content.freeNote;
  if (isUnlocked) {
    description =
      pass && !access.pro
        ? content.passActive({
            date: new Date(pass.expiresAt).toLocaleDateString(locale),
          })
        : content.unlockedNote;
  }
  const pro = (
    <Badge className="ml-1 h-3.5 px-1 text-[9px]">{content.pro}</Badge>
  );
  const badge = (locked: boolean) => (locked && !isUnlocked ? pro : undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && rendering) {
          return;
        }
        editor.ui({ exportOpen: next });
        if (!next) {
          setPhase({ status: "idle" });
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{content.export}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {rendering ? (
          <div className="flex flex-col gap-3 py-2">
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-[width]"
                style={{ width: `${Math.round(phase.progress * 100)}%` }}
              />
            </div>
            <p className="text-sm tabular-nums">
              {Math.round(phase.progress * 100)}%
              {phase.eta === null
                ? ""
                : ` · ${content.timeLeft({ seconds: String(Math.ceil(phase.eta)) }).value}`}
            </p>
            <p className="text-muted-foreground text-xs">{content.keepOpen}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => abort.current?.abort()}
            >
              {content.cancel}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Tabs value={s.kind} onValueChange={(kind: Kind) => set({ kind })}>
              <TabsList className="w-full">
                <TabsTrigger value="video">{content.video}</TabsTrigger>
                <TabsTrigger value="gif">GIF{badge(true)}</TabsTrigger>
                <TabsTrigger value="still">{content.still}</TabsTrigger>
                <TabsTrigger value="sequence">
                  {content.sequence}
                  {badge(true)}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <SettingsFields
              s={s}
              set={set}
              badge={badge}
              transparentBg={transparentBg}
            />
            <p className="text-muted-foreground text-xs tabular-nums">
              {size.width} × {size.height}
            </p>

            {phase.status === "error" ? (
              <p role="alert" className="text-destructive text-sm text-pretty">
                {content.exportFailed} {phase.message}
              </p>
            ) : null}
            {phase.status === "done" ? (
              <output className="text-sm">
                {content.exportDone({
                  size: `${(phase.size / 1_048_576).toFixed(1)} MB`,
                })}
              </output>
            ) : null}

            {reason ? (
              <div className="bg-muted/60 flex flex-col gap-2 rounded-lg p-3">
                <p className="text-sm font-medium">
                  {reason === "template"
                    ? content.lockedTemplate
                    : content.lockedSetting}
                </p>
                <p className="text-muted-foreground text-xs text-pretty">
                  {content.unlockBody}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={buy}
                    disabled={buying}
                    data-track="create_pass_click"
                  >
                    {content.buyPass({ price: formatUsd(CREATE_PASS_CENTS) })}
                  </Button>
                  <Link
                    to={ROUTES.PRO}
                    className="text-sm underline-offset-4 hover:underline"
                    data-track="get_pro"
                    data-track-from="create_export"
                  >
                    {content.getPro}
                  </Link>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                onClick={run}
                data-track="create_export_click"
              >
                <Download aria-hidden="true" className="size-4" />
                {content.exportButton}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
