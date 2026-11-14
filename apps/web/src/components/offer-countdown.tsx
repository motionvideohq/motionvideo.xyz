import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

// The time left in a sale, for the offer banner and the /pro hero. Rendered
// empty on the server and while hydrating (prerendered pages would otherwise
// carry a countdown frozen at build time), then ticking once a second while
// an offer runs (`<html data-offer>`, see src/server.ts).

const subscribe = (tick: () => void) => {
  const id = document.documentElement.dataset.offer
    ? window.setInterval(tick, 1000)
    : undefined;
  return () => window.clearInterval(id);
};
const nowSecond = () => Math.floor(Date.now() / 1000);
const notYet = () => null;

/** The current second (Unix time), or null until hydrated. */
export const useNowSecond = (): number | null =>
  useSyncExternalStore(subscribe, nowSecond, notYet);

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

/** "17d 00h 09m 35s" as one pill per unit. */
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
    <span
      className={cn(
        "inline-flex gap-1 tabular-nums",
        left === null && "invisible"
      )}
    >
      {UNITS.map((unit) => {
        const parts = unitParts(locale, unit, left?.[unit] ?? 0, true);
        return (
          <span
            key={unit}
            className={cn(
              "inline-flex items-baseline rounded-md px-1.5 py-px",
              pillClassName
            )}
          >
            <span className="font-semibold">{parts.number}</span>
            <span className="text-[0.85em] opacity-60">{parts.unit}</span>
          </span>
        );
      })}
    </span>
  );
};

/**
 * The two largest units left, for tight spaces: "3d 10h", then "10h 5m",
 * then "5m 30s". Empty until hydrated.
 */
export const shortTimeLeft = (
  endsAt: number,
  now: number | null,
  locale: string
): string => {
  if (now === null) {
    return "";
  }
  const left = timeLeft(endsAt, now);
  // From the largest non-zero unit; at least minutes and seconds.
  const start = Math.max(
    0,
    Math.min(
      UNITS.findIndex((unit) => left[unit] > 0),
      UNITS.length - 2
    )
  );
  return UNITS.slice(start, start + 2)
    .map((unit) => {
      const parts = unitParts(locale, unit, left[unit], false);
      return `${parts.number}${parts.unit}`;
    })
    .join(" ");
};
