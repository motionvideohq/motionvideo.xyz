import { useSyncExternalStore } from "react";
import { TextMorph } from "torph/react";

import { currentOffer } from "@/lib/offers";
import { cn } from "@/lib/utils";

// The time left in a sale, for the offer banner. Unknown on the server and
// while hydrating (prerendered pages would otherwise carry a countdown frozen
// at build time), so it shows a skeleton of the same size, then ticks once a
// second while an offer runs, each change morphing in place. Every value sits
// over an invisible "00" of the same format, so neither the skeleton nor a
// changing digit ever moves the layout.

const subscribe = (tick: () => void) => {
  const id = currentOffer(Date.now())
    ? window.setInterval(tick, 1000)
    : undefined;
  return () => window.clearInterval(id);
};
const nowSecond = () => Math.floor(Date.now() / 1000);
const notYet = () => null;

/** The current second (Unix time), or null until hydrated. */
export const useNowSecond = (): number | null =>
  useSyncExternalStore(subscribe, nowSecond, notYet);

const MORPH = {
  duration: 400,
  ease: "cubic-bezier(0.19, 1, 0.22, 1)",
} as const;

const UNITS = ["day", "hour", "minute", "second"] as const;
type Unit = (typeof UNITS)[number];

const timeLeft = (endsAt: number, now: number): Record<Unit, number> => {
  const total = Math.max(0, Math.floor(endsAt / 1000) - now);
  return {
    day: Math.floor(total / 86_400),
    hour: Math.floor((total % 86_400) / 3600),
    minute: Math.floor((total % 3600) / 60),
    second: total % 60,
  };
};

/** "17", "d" (localized: "j" in French, "日" in Japanese); hours and smaller padded to two digits. */
const unitParts = (locale: string, unit: Unit, value: number, pad: boolean) => {
  const parts = new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    unitDisplay: "narrow",
    minimumIntegerDigits: pad && unit !== "day" ? 2 : 1,
  }).formatToParts(value);
  const join = (type: string) =>
    parts
      .filter((part) => part.type === type)
      .map((part) => part.value)
      .join("");
  return { number: join("integer"), unit: join("unit") };
};

/** `text` morphing in place over an invisible `ghost` that holds its width. */
const Slot = ({
  text,
  ghost,
  loading,
  className,
}: {
  text: string;
  ghost: string;
  loading: boolean;
  className?: string;
}) => (
  <span className={cn("inline-grid tabular-nums", className)}>
    <span aria-hidden="true" className="invisible col-start-1 row-start-1">
      {ghost}
    </span>
    <TextMorph
      as="span"
      numbers
      {...MORPH}
      className={cn("col-start-1 row-start-1", loading && "invisible")}
    >
      {text}
    </TextMorph>
  </span>
);

/** Countdown pills: days/hours on phones, all four units on desktop; skeleton until hydrated. */
export const CountdownPills = ({
  endsAt,
  now,
  locale,
  pillClassName,
}: {
  endsAt: number;
  now: number | null;
  locale: string;
  pillClassName: string;
}) => {
  const left = now === null ? null : timeLeft(endsAt, now);
  return (
    <span className="inline-flex gap-1">
      {UNITS.map((unit) => {
        const parts = unitParts(locale, unit, left?.[unit] ?? 0, true);
        return (
          <span
            key={unit}
            className={cn(
              "items-baseline rounded-md px-1.5 py-px",
              unit === "day" || unit === "hour"
                ? "inline-flex"
                : "hidden md:inline-flex",
              pillClassName,
              left === null && "skeleton-shimmer"
            )}
          >
            <Slot
              text={parts.number}
              ghost="00"
              loading={left === null}
              className="justify-items-end font-semibold"
            />
            <span
              className={cn(
                "text-[0.85em] opacity-60",
                left === null && "invisible"
              )}
            >
              {parts.unit}
            </span>
          </span>
        );
      })}
    </span>
  );
};
