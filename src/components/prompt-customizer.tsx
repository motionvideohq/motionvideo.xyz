import { useId, useMemo, useSyncExternalStore } from "react";
import { useIntlayer } from "react-intlayer";
import { Undo } from "reicon-react/icons/Undo";
import { z } from "zod";

import { CopyPromptButton } from "@/components/copy-prompt-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { AnalyticsProps } from "@/lib/analytics";
import {
  DEFAULT_DIALS,
  DETAILS_STORAGE_KEY,
  DETAIL_KEYS,
  DIAL_KEYS,
  DIAL_STOPS,
  VIDEO_SIZES,
  customizePrompt,
  fillTemplate,
} from "@/lib/prompt-customizer";
import type {
  DetailKey,
  Dials,
  PromptSegment,
  TemplateField,
} from "@/lib/prompt-customizer";
import type { PromptTemplate } from "@/lib/prompt-templates";
import { cn } from "@/lib/utils";

// What the reader typed, by field key, plus the dials: one object in
// localStorage shared by every prompt, so a palette entered on one prompt is
// already there on the next. Storage may hold anything (an older build, a
// hand edit), so each part falls back to its default unless it parses.
const dialStop = z
  .number()
  .int()
  .min(0)
  .max(DIAL_STOPS - 1);
const dialsSchema = z.object({
  creativity: dialStop,
  pace: dialStop,
  polish: dialStop,
});
const valuesSchema = z.record(z.string(), z.string());

interface Saved {
  dials: Dials;
  values: Record<string, string>;
}

const EMPTY: Saved = { dials: DEFAULT_DIALS, values: {} };

const parseSaved = (raw: string | null): Saved => {
  if (!raw) {
    return EMPTY;
  }
  try {
    const { dials, values } = z
      .object({ dials: z.unknown(), values: z.unknown() })
      .parse(JSON.parse(raw));
    return {
      dials: dialsSchema.safeParse(dials).data ?? DEFAULT_DIALS,
      values: valuesSchema.safeParse(values).data ?? {},
    };
  } catch {
    return EMPTY;
  }
};

// Template fields stored under the generic detail they mean, so the two modes
// share them.
const storageKey = (key: string) => (key === "palette" ? "colors" : key);

// When storage is blocked or full, the form still works on this page.
let unstored: string | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Other tabs editing their copy of the form.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const save = (next: Saved) => {
  const json = JSON.stringify(next);
  try {
    localStorage.setItem(DETAILS_STORAGE_KEY, json);
    unstored = null;
  } catch {
    unstored = json;
  }
  for (const listener of listeners) {
    listener();
  }
};

/**
 * The saved details and dials. The server (and hydration) sees nothing
 * saved, so the markup matches; the stored values apply right after.
 */
const useSaved = () => {
  const raw = useSyncExternalStore(
    subscribe,
    () => unstored ?? localStorage.getItem(DETAILS_STORAGE_KEY),
    () => null
  );
  return useMemo(() => parseSaved(raw), [raw]);
};

const SizeSelect = ({
  id,
  value,
  onChange,
  emptyLabel,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  emptyLabel: string;
}) => {
  const content = useIntlayer("prompt-customizer");
  const size = VIDEO_SIZES.find((entry) => entry === value);
  return (
    <Select value={size ?? null} onValueChange={(next) => onChange(next ?? "")}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue>
          {size
            ? `${size.replace("x", "×")} · ${content.sizeNames[size].value}`
            : emptyLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>{emptyLabel}</SelectItem>
        {VIDEO_SIZES.map((entry) => (
          <SelectItem key={entry} value={entry}>
            {entry.replace("x", "×")} · {content.sizeNames[entry]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const DialSliders = ({
  id,
  dials,
  onChange,
}: {
  id: string;
  dials: Dials;
  onChange: (dials: Dials) => void;
}) => {
  const content = useIntlayer("prompt-customizer");
  return (
    <FieldGroup className="gap-4">
      {DIAL_KEYS.map((dial) => (
        <Field key={dial} className="gap-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <FieldLabel id={`${id}-${dial}`}>{content.dials[dial]}</FieldLabel>
            <span className="text-muted-foreground text-xs" aria-hidden="true">
              {content.stops[dial][dials[dial]]}
            </span>
          </div>
          <Slider
            aria-labelledby={`${id}-${dial}`}
            value={dials[dial]}
            min={0}
            max={DIAL_STOPS - 1}
            step={1}
            getAriaValueText={(_, stop) =>
              content.stops[dial][stop]?.value ?? String(stop)
            }
            onValueChange={(stop) => onChange({ ...dials, [dial]: stop })}
          />
        </Field>
      ))}
    </FieldGroup>
  );
};

const DetailInput = ({
  id,
  detail,
  value,
  onChange,
}: {
  id: string;
  detail: DetailKey;
  value: string;
  onChange: (value: string) => void;
}) => {
  const content = useIntlayer("prompt-customizer");
  if (detail === "size") {
    return (
      <SizeSelect
        id={id}
        value={value}
        onChange={onChange}
        emptyLabel={content.sizeAsWritten.value}
      />
    );
  }
  if (detail === "notes") {
    return (
      <Textarea
        id={id}
        value={value}
        rows={3}
        placeholder={content.placeholders.notes.value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  return (
    <Input
      id={id}
      value={value}
      type={detail === "length" ? "number" : "text"}
      min={detail === "length" ? 1 : undefined}
      inputMode={detail === "length" ? "numeric" : undefined}
      placeholder={content.placeholders[detail].value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

const TemplateInput = ({
  id,
  field,
  value,
  onChange,
}: {
  id: string;
  field: TemplateField;
  value: string;
  onChange: (value: string) => void;
}) => {
  const content = useIntlayer("prompt-customizer");
  if (field.kind === "size") {
    return (
      <SizeSelect
        id={id}
        value={value}
        onChange={onChange}
        emptyLabel={`${content.sizeDefault.value} (${field.fallback.replace("x", "×")})`}
      />
    );
  }
  return (
    <Input
      id={id}
      value={value}
      type={field.kind === "number" ? "number" : "text"}
      min={field.kind === "number" ? 1 : undefined}
      inputMode={field.kind === "number" ? "numeric" : undefined}
      placeholder={field.fallback}
      aria-describedby={`${id}-hint`}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

const highlight = "bg-primary/20 text-foreground rounded-sm";

type PromptCustomizerProps = {
  /** The video's model, for the "run it with" hint. */
  model?: string;
  /** Gallery video slug, sent with the copy event. */
  slug?: string;
  className?: string;
} & (
  | { template: PromptTemplate; prompt?: never }
  | { prompt: string; template?: never }
);

/**
 * "Make it yours": a form card beside the prompt it changes. With a template,
 * the form is the template's fields and the slots they fill are highlighted;
 * with any other prompt, the form is the generic details, appended as a
 * `<my-brief>` block. The dials apply to both.
 */
export const PromptCustomizer = ({
  prompt,
  template,
  model,
  slug,
  className,
}: PromptCustomizerProps) => {
  const content = useIntlayer("prompt-customizer");
  const id = useId();
  const saved = useSaved();
  const valueOf = (key: string) => saved.values[storageKey(key)] ?? "";
  const setValue = (key: string, value: string) =>
    save({ ...saved, values: { ...saved.values, [storageKey(key)]: value } });

  // Reset clears only what this form shows; the rest stays for other prompts.
  const keys = template
    ? template.fields.map((field) => storageKey(field.key))
    : [...DETAIL_KEYS];
  const reset = () =>
    save({
      dials: DEFAULT_DIALS,
      values: Object.fromEntries(
        Object.entries(saved.values).filter(([key]) => !keys.includes(key))
      ),
    });
  const untouched =
    keys.every((key) => !saved.values[key]) &&
    DIAL_KEYS.every((dial) => saved.dials[dial] === DEFAULT_DIALS[dial]);

  const segments = useMemo((): PromptSegment[] => {
    if (template) {
      const values = Object.fromEntries(
        template.fields.map((field) => [
          field.key,
          saved.values[storageKey(field.key)] ?? "",
        ])
      );
      return fillTemplate(
        template.prompt,
        template.fields,
        values,
        saved.dials,
        template.dialSection
      );
    }
    const base = prompt ?? "";
    const details = Object.fromEntries(
      DETAIL_KEYS.map((key) => [key, saved.values[key] ?? ""])
    );
    const result = customizePrompt(base, details, saved.dials);
    if (result === base) {
      return [{ text: base }];
    }
    // The brief is appended after the trimmed prompt: mark it as one slot.
    const kept = base.trimEnd();
    return [
      { text: kept },
      { field: "brief", text: result.slice(kept.length) },
    ];
  }, [prompt, template, saved]);
  const text = segments.map((segment) => segment.text).join("");

  const analytics: AnalyticsProps & { from: string } = { from: "customize" };
  if (slug) {
    analytics.slug = slug;
  }
  if (template) {
    analytics.template = template.id;
  }

  return (
    <div
      className={cn(
        "grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]",
        className
      )}
    >
      {/* Sticky beside the long prompt; taller forms (templates) scroll
          inside so the dials stay reachable. */}
      <Card className="gap-5 px-4 lg:sticky lg:top-6 lg:max-h-[calc(100svh-3rem)] lg:overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold tracking-tight">
              {content.formTitle}
            </h2>
            <p className="text-muted-foreground text-sm text-pretty">
              {content.formIntro}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={untouched}
          >
            <Undo aria-hidden="true" />
            {content.reset}
          </Button>
        </div>
        <FieldGroup className="gap-4">
          {template
            ? template.fields.map((field) => (
                <Field key={field.key} className="gap-1.5">
                  <FieldLabel htmlFor={`${id}-${field.key}`}>
                    {field.label}
                  </FieldLabel>
                  <TemplateInput
                    id={`${id}-${field.key}`}
                    field={field}
                    value={valueOf(field.key)}
                    onChange={(value) => setValue(field.key, value)}
                  />
                  <FieldDescription
                    id={`${id}-${field.key}-hint`}
                    className="text-xs"
                  >
                    {field.hint}
                  </FieldDescription>
                </Field>
              ))
            : DETAIL_KEYS.map((detail) => (
                <Field key={detail} className="gap-1.5">
                  <FieldLabel htmlFor={`${id}-${detail}`}>
                    {content.details[detail]}
                  </FieldLabel>
                  <DetailInput
                    id={`${id}-${detail}`}
                    detail={detail}
                    value={valueOf(detail)}
                    onChange={(value) => setValue(detail, value)}
                  />
                </Field>
              ))}
        </FieldGroup>
        <div className="flex flex-col gap-4 border-t border-dashed pt-4">
          <h3 className="text-sm font-medium">{content.dialsTitle}</h3>
          <DialSliders
            id={`${id}-dial`}
            dials={saved.dials}
            onChange={(dials) => save({ ...saved, dials })}
          />
        </div>
      </Card>
      <section
        className="flex min-w-0 flex-col gap-3"
        aria-labelledby={`${id}-result`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2
              id={`${id}-result`}
              className="text-base font-semibold tracking-tight"
            >
              {content.resultTitle}
            </h2>
            <p className="text-muted-foreground text-sm text-pretty">
              {template ? content.templateIntro : content.genericIntro}
            </p>
          </div>
          <CopyPromptButton text={text} analytics={analytics} />
        </div>
        <pre className="bg-muted rounded-xl p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap">
          {segments.map((segment, index) =>
            segment.field ? (
              <mark
                // Segments are rebuilt from the same template on every
                // keystroke; their position is their identity.
                // oxlint-disable-next-line react/no-array-index-key
                key={index}
                className={cn(
                  highlight,
                  // Defaults are marked too, more quietly, so every slot
                  // a field controls is visible before typing.
                  template &&
                    !valueOf(segment.field).trim() &&
                    "bg-primary/8 text-muted-foreground"
                )}
              >
                {segment.text}
              </mark>
            ) : (
              // oxlint-disable-next-line react/no-array-index-key
              <span key={index}>{segment.text}</span>
            )
          )}
        </pre>
        <p className="text-muted-foreground text-xs">
          {model ? (
            <>
              {content.runWith}{" "}
              <span className="text-foreground font-medium">{model}</span>.
            </>
          ) : (
            content.runWithAgent
          )}
        </p>
      </section>
    </div>
  );
};
