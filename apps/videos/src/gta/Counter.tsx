import { Easing, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { ofKind, type CounterCue, type Placed } from "./spec";
import { enter, leave, outline, ramp, SETTLE, type Theme } from "./theme";

const decimals = (value: number) => (Number.isInteger(value) ? 0 : Math.min(2, String(value).split(".")[1]?.length ?? 0));

/**
 * Cash/kill counter, top left (in a fixed slot under the wanted meter when the
 * HUD is left): slides in from its edge, rolls from `from` to `to` on a
 * decelerating curve (fixed-width digits, so nothing jitters), then lands with
 * a bump and a bright tick.
 */
export function Counters({ cues, theme }: { cues: Placed[]; theme: Theme }) {
  const frame = useCurrentFrame();
  const active = ofKind(cues, "counter").filter((cue) => frame >= cue.begin && frame < cue.end);
  return (
    <>
      {active.map((cue) => (
        <Counter key={`${cue.begin}-${cue.label}`} cue={cue} theme={theme} frame={frame} />
      ))}
    </>
  );
}

function Counter({ cue, theme, frame }: { cue: Placed<CounterCue>; theme: Theme; frame: number }) {
  const { fps } = useVideoConfig();
  const { u, palette, s } = theme;
  const pin = theme.layout.counter;
  const edge = pin.side === "right" ? 1 : -1;
  const shown = enter(frame, cue.begin, fps, SETTLE);
  const tag = enter(frame, cue.begin, fps, SETTLE, s(0.08));
  const gone = leave(frame, cue.exit, s(0.3));
  const start = cue.begin + s(0.25);
  const land = start + Math.min(s(1.1), Math.max(s(0.3), Math.round(0.6 * (cue.end - cue.begin))));
  const progress = ramp(frame, start, land, Easing.out(Easing.cubic));
  const places = Math.max(decimals(cue.from), decimals(cue.to));
  const value = (cue.from + (cue.to - cue.from) * progress).toLocaleString("en-US", {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });
  const bump = Math.sin(Math.PI * ramp(frame, land, land + s(0.28)));
  const text = `${cue.prefix ?? ""}${value}${cue.suffix ?? ""}`;

  return (
    <div
      style={{
        position: "absolute",
        top: pin.y,
        [pin.side]: pin.inset,
        display: "flex",
        flexDirection: "column",
        alignItems: pin.side === "right" ? "flex-end" : "flex-start",
        opacity: Math.min(1, shown * 1.6) * (1 - gone),
        transform: `translateX(${edge * ((1 - shown) * 120 * u + gone * 80 * u)}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: pin.side === "right" ? "row" : "row-reverse",
          alignItems: "center",
          gap: 12 * u,
          fontFamily: theme.text,
          fontWeight: 800,
          fontSize: 30 * u,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: palette.paper,
          opacity: tag,
          transform: `translateX(${edge * (1 - tag) * 40 * u}px)`,
          textShadow: `0 ${3 * u}px 0 ${palette.ink}`,
        }}
      >
        <span style={{ width: 34 * u * tag, height: 6 * u, backgroundColor: palette.cash, boxShadow: `0 ${3 * u}px 0 ${palette.ink}` }} />
        {cue.label}
      </div>
      <div
        style={{
          fontFamily: theme.display,
          fontWeight: theme.look.weight,
          fontSize: 116 * u,
          lineHeight: 1.05,
          color: interpolateColors(bump, [0, 1], [palette.cash, palette.paper]),
          transform: `scale(${1 + 0.1 * bump})`,
          transformOrigin: `${pin.side} center`,
          filter: `drop-shadow(0 ${7 * u}px 0 ${palette.ink})`,
          whiteSpace: "nowrap",
          ...outline(palette.ink, 14 * u),
        }}
      >
        {[...text].map((char, index) => (
          <span
            key={index}
            style={/\d/.test(char) ? { display: "inline-block", width: "0.5em", textAlign: "center" } : undefined}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
