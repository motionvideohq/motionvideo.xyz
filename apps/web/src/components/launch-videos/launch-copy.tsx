import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { AlertTriangle } from "reicon-react/icons/AlertTriangle";

import { CopyIcon } from "@/components/copy-icon";
import { LockedPrompt } from "@/components/locked-prompt";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { track } from "@/lib/analytics";
import type { AnalyticsProps } from "@/lib/analytics";
import {
  ASPECTS,
  PROMPT_MODES,
  RENDERERS,
  RENDERER_NAMES,
} from "@/lib/launch-videos";
import type { LaunchFilm, LaunchScene, PublicSlot } from "@/lib/launch-videos";
import { getLaunchPrompt, getLaunchSlots } from "@/server/launch-functions";
import type { LaunchPromptResult } from "@/server/launch-functions";

import {
  FPS_CHOICES,
  draftActions,
  outputOptions,
  useLaunchDraft,
} from "./draft";

type CompiledPrompt = Extract<LaunchPromptResult, { status: "ok" }>["prompt"];
type LockReason = Extract<LaunchPromptResult, { status: "locked" }>["reason"];
type CompilerError = Extract<LaunchPromptResult, { status: "error" }>["error"];
/** A compiler refusal, or `unavailable` when the request itself failed. */
export interface LaunchPromptError {
  code: CompilerError["code"] | "unavailable";
  message: string;
  details: CompilerError["details"];
}

// Plan class for analytics: never the account, only what it may do.
const PLAN_CLASS: Record<LockReason, string> = {
  signed_out: "guest",
  no_plan: "free",
};

export type CopyState =
  | { kind: "idle" }
  | { kind: "busy"; scope: string }
  | {
      kind: "copied";
      scope: string;
      prompt: CompiledPrompt;
      /** The clipboard refused; the prompt is shown to copy by hand. */
      clipboardFailed: boolean;
    }
  | { kind: "locked"; scope: string; reason: LockReason }
  | { kind: "error"; scope: string; error: LaunchPromptError };

/**
 * Writes the prompt to the clipboard while the click's user activation is
 * still live: Safari only lets a page write after an await through a
 * ClipboardItem whose content is a promise.
 */
const copyWhenReady = async (text: Promise<string | null>) => {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    const blob = (async () => {
      const value = await text;
      if (value === null) {
        throw new Error("Nothing to copy");
      }
      return new Blob([value], { type: "text/plain" });
    })();
    // The browser may refuse the write before it reads the blob; the refusal
    // reaches the caller through write(), so this copy of it is handled here.
    const observe = async () => {
      try {
        await blob;
      } catch {
        // Reported by write().
      }
    };
    void observe();
    await navigator.clipboard.write([
      new ClipboardItem({ "text/plain": blob }),
    ]);
    return;
  }
  const value = await text;
  if (value !== null) {
    await navigator.clipboard.writeText(value);
  }
};

export interface LaunchCopy {
  state: CopyState;
  run: (
    scope: string,
    request: () => Promise<LaunchPromptResult>,
    analytics: AnalyticsProps
  ) => Promise<LaunchPromptResult | null>;
  retry: () => void;
  reset: () => void;
}

/**
 * One copy action's lifecycle: fetch the prompt only on click, copy it,
 * and report what came back (locked, an error with its details, or the
 * missing inputs and warnings).
 */
export const useLaunchCopy = (surface: string): LaunchCopy => {
  const [state, setState] = useState<CopyState>({ kind: "idle" });
  const last = useRef<{
    scope: string;
    request: () => Promise<LaunchPromptResult>;
    analytics: AnalyticsProps;
  } | null>(null);

  const run = async (
    scope: string,
    request: () => Promise<LaunchPromptResult>,
    analytics: AnalyticsProps
  ) => {
    last.current = { scope, request, analytics };
    setState({ kind: "busy", scope });
    const pending = request();
    const markdown = async () => {
      const result = await pending;
      return result.status === "ok" ? result.prompt.markdown : null;
    };
    const copyPrompt = async () => {
      try {
        await copyWhenReady(markdown());
        return true;
      } catch {
        return false;
      }
    };
    const copying = copyPrompt();
    let result: LaunchPromptResult;
    try {
      result = await pending;
    } catch {
      await copying;
      setState({
        kind: "error",
        scope,
        error: { code: "unavailable", message: "", details: {} },
      });
      return null;
    }
    let copied = await copying;
    if (result.status === "ok" && !copied) {
      // The first write can fail where a plain one works (Firefox without
      // promise ClipboardItems); then the prompt is shown to copy by hand.
      try {
        await navigator.clipboard.writeText(result.prompt.markdown);
        copied = true;
      } catch {
        copied = false;
      }
    }
    if (result.status === "ok") {
      track("launch_prompt_copy", {
        ...analytics,
        scope,
        surface,
        plan: "entitled",
        count: result.prompt.scenes.length,
      });
      setState({
        kind: "copied",
        scope,
        prompt: result.prompt,
        clipboardFailed: !copied,
      });
    } else if (result.status === "locked") {
      track("launch_prompt_gate_view", {
        ...analytics,
        scope,
        surface,
        plan: PLAN_CLASS[result.reason],
      });
      setState({ kind: "locked", scope, reason: result.reason });
    } else {
      setState({ kind: "error", scope, error: result.error });
    }
    return result;
  };

  const retry = () => {
    const previous = last.current;
    if (previous) {
      void run(previous.scope, previous.request, previous.analytics);
    }
  };

  return {
    state,
    run,
    retry,
    reset: () => setState({ kind: "idle" }),
  };
};

const sectionLabel = "text-sm font-medium";

const slotInputType = (type: PublicSlot["type"]) => {
  if (type === "url" || type === "number") {
    return type;
  }
  return "text";
};

/** One brand input, typed by its slot. */
const SlotInput = ({ slot, value }: { slot: PublicSlot; value: string }) => {
  const content = useIntlayer("launch-copy");
  const id = useId();
  const set = (next: string) =>
    draftActions.setInput(slot.key, slot.type, next);
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {slot.label}
        {slot.required && (
          <span className="text-muted-foreground font-normal">
            {" "}
            · {content.required}
          </span>
        )}
      </FieldLabel>
      {slot.type === "color" ? (
        <div className="flex gap-2">
          <input
            type="color"
            aria-label={slot.label}
            value={/^#[\da-f]{6}$/iu.test(value) ? value : "#000000"}
            onChange={(event) => set(event.target.value)}
            className="border-input h-9 w-10 shrink-0 cursor-pointer rounded-lg border bg-transparent p-1"
          />
          <Input
            id={id}
            value={value}
            placeholder="#rrggbb"
            maxLength={7}
            onChange={(event) => set(event.target.value.trim())}
          />
        </div>
      ) : (
        <Input
          id={id}
          type={slotInputType(slot.type)}
          inputMode={slot.type === "number" ? "decimal" : undefined}
          value={value}
          maxLength={slot.type === "url" ? 500 : 120}
          placeholder={slot.type === "url" ? "https://" : undefined}
          onChange={(event) => set(event.target.value)}
        />
      )}
    </Field>
  );
};

/**
 * The brand form, built from the scenes' public slots. They load the first
 * time it opens; values live in the shared local draft, URLs only in memory.
 */
const BrandInputs = ({ sceneIds }: { sceneIds: string[] }) => {
  const content = useIntlayer("launch-copy");
  const draft = useLaunchDraft();
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<PublicSlot[] | "loading" | "failed">(
    "loading"
  );
  const [attempt, setAttempt] = useState(0);
  const key = sceneIds.join("|");
  // The scenes whose slots are on screen, so reopening doesn't refetch.
  const loaded = useRef<string | null>(null);
  useEffect(() => {
    // A retry is a new attempt at the same scenes.
    const request = `${attempt}:${key}`;
    if (!open || key === "" || loaded.current === request) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setSlots("loading");
      let next: PublicSlot[] | "failed";
      try {
        next = await getLaunchSlots({ data: { sceneIds: key.split("|") } });
      } catch {
        next = "failed";
      }
      if (cancelled) {
        return;
      }
      if (next !== "failed") {
        loaded.current = request;
      }
      setSlots(next);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, key, attempt]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="hover:text-foreground text-muted-foreground flex w-full items-center justify-between text-sm font-medium transition-colors">
        {content.brand}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-3 pt-3">
        <p className="text-muted-foreground text-xs text-pretty">
          {content.brandHint}
        </p>
        {slots === "loading" && sceneIds.length > 0 && (
          <p className="text-muted-foreground text-sm">
            {content.loadingInputs}
          </p>
        )}
        {slots === "failed" && (
          <p role="alert" className="text-muted-foreground text-sm">
            {content.inputsError}{" "}
            <button
              type="button"
              className="text-foreground underline underline-offset-4"
              onClick={() => setAttempt(attempt + 1)}
            >
              {content.retry}
            </button>
          </p>
        )}
        {Array.isArray(slots) &&
          slots.map((slot) => (
            <SlotInput
              key={slot.key}
              slot={slot}
              value={draft.inputs[slot.key] ?? ""}
            />
          ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

/** `30 fps`, `29.97 fps`. */
const fpsName = (choice: (typeof FPS_CHOICES)[number]) => {
  const [num = 30, den = 1] = choice.split("/").map(Number);
  return `${Number((num / den).toFixed(2))} fps`;
};

/**
 * What every copy shares: mode (Adapt by default, or Exact), renderer, the
 * brand brief and, for Adapt, the output canvas, rate and length. Stored in
 * the local draft, so the film pages and the composer agree.
 */
export const LaunchOptions = ({ sceneIds }: { sceneIds: string[] }) => {
  const content = useIntlayer("launch-copy");
  const draft = useLaunchDraft();
  const rendererId = useId();
  const aspectId = useId();
  const fpsId = useId();
  const targetId = useId();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className={sectionLabel} id={`${rendererId}-mode`}>
          {content.mode}
        </span>
        <ButtonGroup aria-labelledby={`${rendererId}-mode`} className="w-full">
          {PROMPT_MODES.map((mode) => (
            <Button
              key={mode}
              variant={draft.mode === mode ? "default" : "outline"}
              aria-pressed={draft.mode === mode}
              className="flex-1"
              onClick={() => draftActions.setOptions({ mode })}
            >
              {content.modes[mode]}
            </Button>
          ))}
        </ButtonGroup>
        <p className="text-muted-foreground text-xs text-pretty">
          {content.modeHints[draft.mode]}
        </p>
      </div>
      <Field>
        <FieldLabel htmlFor={rendererId}>{content.renderer}</FieldLabel>
        <Select
          value={draft.renderer}
          onValueChange={(value) => {
            const renderer = RENDERERS.find((entry) => entry === value);
            if (renderer) {
              draftActions.setOptions({ renderer });
            }
          }}
        >
          <SelectTrigger id={rendererId} className="w-full">
            <SelectValue>{RENDERER_NAMES[draft.renderer]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {RENDERERS.map((renderer) => (
              <SelectItem key={renderer} value={renderer}>
                {RENDERER_NAMES[renderer]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {draft.mode === "adapt" && (
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor={aspectId}>{content.aspect}</FieldLabel>
            <Select
              value={draft.aspect ?? null}
              onValueChange={(value) =>
                draftActions.setOptions({
                  aspect: ASPECTS.find((entry) => entry === value),
                })
              }
            >
              <SelectTrigger id={aspectId} className="w-full">
                <SelectValue>
                  {draft.aspect ?? content.source.value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>{content.source}</SelectItem>
                {ASPECTS.map((aspect) => (
                  <SelectItem key={aspect} value={aspect}>
                    {aspect}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={fpsId}>{content.fps}</FieldLabel>
            <Select
              value={draft.fps ?? null}
              onValueChange={(value) =>
                draftActions.setOptions({
                  fps: FPS_CHOICES.find((entry) => entry === value),
                })
              }
            >
              <SelectTrigger id={fpsId} className="w-full">
                <SelectValue>
                  {draft.fps ? fpsName(draft.fps) : content.source.value}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>{content.source}</SelectItem>
                {FPS_CHOICES.map((fps) => (
                  <SelectItem key={fps} value={fps}>
                    {fpsName(fps)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="col-span-2">
            <FieldLabel htmlFor={targetId}>{content.target}</FieldLabel>
            <Input
              id={targetId}
              type="number"
              inputMode="decimal"
              min={1}
              max={600}
              step={0.5}
              placeholder={content.targetPlaceholder.value}
              value={draft.targetSeconds ?? ""}
              onChange={(event) => {
                const seconds = Number(event.target.value);
                draftActions.setOptions({
                  targetSeconds:
                    Number.isFinite(seconds) && seconds > 0 && seconds <= 600
                      ? seconds
                      : undefined,
                });
              }}
            />
            <FieldDescription>{content.targetHint}</FieldDescription>
          </Field>
        </div>
      )}
      <BrandInputs sceneIds={sceneIds} />
    </div>
  );
};

/**
 * Under the copy buttons: the lock (sign in or upgrade to Pro), an error,
 * or what the copied prompt still needs.
 * `errorExtra` lets the composer add its one-click remedies.
 */
export const LaunchCopyResult = ({
  copy,
  redirect,
  errorExtra,
}: {
  copy: LaunchCopy;
  /** The page to come back to after signing in. */
  redirect: string;
  errorExtra?: (error: LaunchPromptError) => ReactNode;
}) => {
  const content = useIntlayer("launch-copy");
  const { state } = copy;
  if (state.kind === "locked") {
    return (
      <LockedPrompt
        title={content.lockedTitle}
        signInReason={content.signInReason}
        signedIn={state.reason !== "signed_out"}
        redirect={redirect}
        track={{
          "data-track": "launch_unlock",
          "data-track-surface": state.scope,
        }}
      />
    );
  }
  if (state.kind === "error") {
    return (
      <div
        role="alert"
        className="bg-muted flex flex-col gap-3 rounded-xl p-4 text-sm"
      >
        <p className="flex items-start gap-2 font-medium">
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />
          {state.error.message || content.error}
        </p>
        {errorExtra?.(state.error)}
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => copy.retry()}
        >
          {content.retry}
        </Button>
      </div>
    );
  }
  if (state.kind !== "copied") {
    return null;
  }
  const { prompt, clipboardFailed } = state;
  const missing = prompt.slots.filter((slot) =>
    prompt.missing.includes(slot.key)
  );
  return (
    <div className="flex flex-col gap-3 text-sm">
      {clipboardFailed && (
        <p role="alert" className="text-muted-foreground">
          {content.copyFailed}
        </p>
      )}
      {missing.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className={sectionLabel}>{content.missing}</h3>
          <p className="text-muted-foreground text-xs text-pretty">
            {content.missingHint}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {missing.map((slot) => (
              <li
                key={slot.key}
                className="bg-secondary rounded-full px-2.5 py-0.5 text-xs"
              >
                {slot.label}
              </li>
            ))}
          </ul>
        </div>
      )}
      {prompt.warnings.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <h3 className={sectionLabel}>{content.warnings}</h3>
          <ul className="text-muted-foreground flex list-disc flex-col gap-1 pl-5">
            {prompt.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      <Collapsible defaultOpen={clipboardFailed}>
        <CollapsibleTrigger className="text-muted-foreground hover:text-foreground w-fit text-xs underline underline-offset-4 transition-colors">
          {content.showPrompt}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <textarea
            readOnly
            aria-label={content.promptLabel.value}
            value={prompt.markdown}
            rows={12}
            onFocus={(event) => event.currentTarget.select()}
            className="bg-muted mt-2 w-full rounded-xl p-4 font-mono text-xs leading-relaxed"
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

/** A copy button that shows Preparing… then Copied for its own scope. */
export const LaunchCopyButton = ({
  copy,
  scope,
  label,
  variant = "outline",
  disabled,
  onClick,
}: {
  copy: LaunchCopy;
  scope: string;
  label: ReactNode;
  variant?: "outline" | "gradient";
  disabled?: boolean;
  onClick: () => void;
}) => {
  const content = useIntlayer("launch-copy");
  const busy = copy.state.kind === "busy" && copy.state.scope === scope;
  const copied =
    copy.state.kind === "copied" &&
    copy.state.scope === scope &&
    !copy.state.clipboardFailed;
  const copiedLabel = copied ? content.copied : label;
  return (
    <Button
      variant={variant}
      size="lg"
      disabled={disabled || copy.state.kind === "busy"}
      aria-busy={busy}
      onClick={onClick}
      className="w-full"
    >
      <CopyIcon copied={copied} />
      {busy ? content.preparing : copiedLabel}
    </Button>
  );
};

/**
 * The film page's copy panel: options, Copy scene prompt (for the selected
 * chapter) and Copy full film prompt, then the result.
 */
export const LaunchCopyPanel = ({
  film,
  scene,
  redirect,
}: {
  film: LaunchFilm;
  scene: LaunchScene | undefined;
  redirect: string;
}) => {
  const content = useIntlayer("launch-copy");
  const draft = useLaunchDraft();
  const copy = useLaunchCopy("film");
  const id = useId();
  const request = (sceneId?: string) => () =>
    getLaunchPrompt({
      data: {
        filmSlug: film.slug,
        sceneId,
        mode: draft.mode,
        renderer: draft.renderer,
        inputs: Object.keys(draft.inputs).length > 0 ? draft.inputs : undefined,
        ...outputOptions(draft),
      },
    });
  const analytics = {
    film: film.slug,
    mode: draft.mode,
    renderer: draft.renderer,
  };
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="text-base font-medium">
        {content.title}
      </h2>
      <LaunchOptions sceneIds={scene ? [scene.id] : film.sceneIds} />
      <div className="flex flex-col gap-2">
        <LaunchCopyButton
          copy={copy}
          scope="scene"
          label={content.copyScene}
          disabled={!scene}
          onClick={async () => {
            if (scene) {
              await copy.run("scene", request(scene.id), {
                ...analytics,
                scene: scene.id,
                role: scene.role,
              });
            }
          }}
        />
        {!scene && (
          <p className="text-muted-foreground text-xs">{content.pickScene}</p>
        )}
        <LaunchCopyButton
          copy={copy}
          scope="film"
          variant="gradient"
          label={content.copyFilm}
          onClick={async () => {
            await copy.run("film", request(), analytics);
          }}
        />
      </div>
      <div aria-live="polite">
        <LaunchCopyResult copy={copy} redirect={redirect} />
      </div>
    </section>
  );
};
