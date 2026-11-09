import { useId, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "reicon-react/icons/ChevronDown";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Compact controls for the editor's panels: label on the left, value on the
// right, control underneath. Slider changes pass a `group` key upstream so a
// whole drag becomes one undo step.

export const Section = ({
  title,
  aside,
  defaultOpen = true,
  children,
}: {
  title: ReactNode;
  /** Shown in the header, e.g. an on/off switch. */
  aside?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="border-border/60 border-b py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2 px-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="text-foreground flex flex-1 items-center gap-1.5 text-left text-[13px] font-medium"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "text-muted-foreground size-3.5 transition-transform",
              !open && "-rotate-90"
            )}
          />
          {title}
        </button>
        {aside}
      </div>
      {open ? (
        <div id={id} className="mt-3 flex flex-col gap-3 px-4">
          {children}
        </div>
      ) : null}
    </section>
  );
};

const Row = ({
  label,
  value,
  htmlFor,
  children,
}: {
  label: ReactNode;
  value?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between gap-2 text-xs">
      <label htmlFor={htmlFor} className="text-muted-foreground">
        {label}
      </label>
      {value === undefined ? null : (
        <span className="text-foreground tabular-nums">{value}</span>
      )}
    </div>
    {children}
  </div>
);

const format = (value: number, step: number) => {
  // Whole steps show no decimals, tenths one, finer steps two.
  const decimals = Math.min(2, Math.max(0, Math.ceil(-Math.log10(step))));
  return value.toFixed(decimals);
};

export const SliderField = ({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) => (
  <Row label={label} value={`${format(value, step)}${unit}`}>
    <Slider
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(next) => {
        const [v] = [next].flat();
        onChange(v);
      }}
    />
  </Row>
);

export const SelectField = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: ReactNode;
  value: T;
  options: readonly { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
}) => {
  const id = useId();
  const current = options.find((o) => o.value === value);
  return (
    <Row label={label} htmlFor={id}>
      <Select
        value={value}
        onValueChange={(next) => {
          const match = options.find((o) => o.value === next);
          if (match) {
            onChange(match.value);
          }
        }}
      >
        <SelectTrigger id={id} size="sm" className="w-full">
          <SelectValue>{current?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  );
};

/** A row of small buttons for 2–5 short choices. */
export const SegmentedField = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: ReactNode;
  value: T;
  options: readonly {
    value: T;
    label: ReactNode;
    disabled?: boolean;
    badge?: ReactNode;
  }[];
  onChange: (value: T) => void;
}) => (
  <Row label={label}>
    <div className="bg-muted flex rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex h-7 flex-1 items-center justify-center gap-1 rounded-md px-1.5 text-xs transition-colors disabled:opacity-40",
            o.value === value
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
          {o.badge}
        </button>
      ))}
    </div>
  </Row>
);

export const ToggleField = ({
  label,
  checked,
  onChange,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <label htmlFor={id} className="text-muted-foreground">
        {label}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
};

export const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
}) => {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <label htmlFor={id} className="text-muted-foreground">
        {label}
      </label>
      <span className="flex items-center gap-2">
        <span className="text-foreground font-mono text-[11px] uppercase">
          {value}
        </span>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-border size-6 cursor-pointer rounded-md border bg-transparent p-0.5"
        />
      </span>
    </div>
  );
};

export const TextField = ({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: ReactNode;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
}) => {
  const id = useId();
  return (
    <Row label={label} htmlFor={id}>
      <Input
        id={id}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
      />
    </Row>
  );
};

/** An on/off switch for a section header; `label` names it for screen readers. */
export const SectionSwitch = ({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative h-4 w-7 shrink-0 rounded-full transition-colors",
      checked ? "bg-primary" : "bg-muted-foreground/30"
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 size-3 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-3.5" : "translate-x-0.5"
      )}
    />
  </button>
);
