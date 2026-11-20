import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ofKind, type Placed } from "./spec";
import { enter, leave, ramp, SETTLE, type Theme } from "./theme";

const STARS = 5;
/** Five-point star, outer radius 1, rounded by the stroke join. */
const STAR = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 1 : 0.47;
  const a = (Math.PI / 5) * i - Math.PI / 2;
  return `${(r * Math.cos(a)).toFixed(4)},${(r * Math.sin(a)).toFixed(4)}`;
}).join(" ");

/**
 * Wanted-level star meter, top right (top left with `hudSide: "left"`).
 * Escalation fills stars one by one with a pop and a ring burst; level 5
 * flickers heat/paper; a drop blinks the lost stars out (cool-down) and level 0
 * drains the meter, then hides it. The meter slides in once per contiguous run
 * of wanted cues.
 */
export function Wanted({ cues, theme }: { cues: Placed[]; theme: Theme }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, palette, s } = theme;
  const pin = theme.layout.wanted;
  // +1 pushes toward the pinned edge: entrances come from it, exits leave into it.
  const edge = pin.side === "right" ? 1 : -1;
  const wanted = ofKind(cues, "wanted");
  const index = wanted.findIndex((cue) => frame >= cue.begin && frame < cue.end);
  if (index < 0) return null;
  const cue = wanted[index];
  const level = Math.max(0, Math.min(STARS, Math.round(cue.level)));
  const before = wanted[index - 1];
  const joined = before !== undefined && before.end >= cue.begin;
  const previous = joined ? Math.max(0, Math.min(STARS, Math.round(before.level))) : 0;
  let start = index;
  while (start > 0 && wanted[start - 1].end >= wanted[start].begin) start -= 1;
  const after = wanted[index + 1];
  const last = after === undefined || after.begin > cue.end;

  const shown = enter(frame, wanted[start].begin, fps, SETTLE);
  const gone = last ? leave(frame, cue.exit, s(0.4)) : 0;
  // A small kick of the whole meter whenever the level changes.
  const kick = level === previous ? 0 : Math.sin(Math.PI * ramp(frame, cue.begin, cue.begin + s(0.3)));
  const size = 76 * u;
  const gap = 10 * u;
  const seconds = (frame - cue.begin) / fps;

  return (
    <div
      style={{
        position: "absolute",
        top: pin.y,
        [pin.side]: pin.inset,
        display: "flex",
        gap,
        opacity: Math.min(1, shown * 1.5) * (1 - gone),
        transform: `translateX(${edge * ((1 - shown) * 180 * u + gone * 120 * u)}px) scale(${1 + 0.08 * kick})`,
        transformOrigin: `${pin.side} center`,
      }}
    >
      {Array.from({ length: STARS }, (_, star) => {
        let fill = 0;
        let pop = 1;
        let burst = 0;
        if (star < level && star >= previous) {
          const at = cue.begin + (star - previous) * s(0.13);
          pop = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 220, mass: 0.6 } });
          fill = Math.min(1, pop * 2);
          burst = frame >= at ? ramp(frame, at, at + s(0.4)) : 0;
        } else if (star < level) {
          fill = 1;
        } else if (star < previous) {
          // Cool-down: the lost stars blink, slowing, then go dark.
          const blink = 0.5 + 0.5 * Math.cos(2 * Math.PI * (5 - 3 * Math.min(seconds / 1.2, 1)) * seconds);
          fill = (seconds < 1.2 ? blink : 1) * (1 - ramp(frame, cue.begin + s(1.2), cue.begin + s(1.45)));
        }
        const maxed = level === STARS && frame >= cue.begin + (STARS - previous) * s(0.13) + s(0.2);
        const flicker = maxed ? 0.5 + 0.5 * Math.sin(2 * Math.PI * 3.2 * seconds) : 0;
        const lit = interpolateColors(flicker, [0, 1], [palette.paper, palette.heat]);
        return (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="-1.3 -1.3 2.6 2.6"
            style={{
              overflow: "visible",
              filter: `drop-shadow(0 ${4 * u}px 0 ${palette.ink}) drop-shadow(0 0 ${(6 + 18 * flicker) * u}px color-mix(in srgb, ${palette.heat} ${Math.round(70 * fill)}%, transparent))`,
            }}
          >
            {burst > 0 && burst < 1 ? (
              <circle
                r={0.9 + burst * 0.9}
                fill="none"
                stroke={palette.heat}
                strokeWidth={0.22 * (1 - burst)}
                opacity={1 - burst}
              />
            ) : null}
            <polygon
              points={STAR}
              fill={palette.ink}
              fillOpacity={0.55}
              stroke={palette.paper}
              strokeOpacity={0.45}
              strokeWidth={0.12}
              strokeLinejoin="round"
            />
            <polygon
              points={STAR}
              transform={`scale(${interpolate(pop, [0, 1], [1.8, 1])})`}
              fill={lit}
              opacity={fill}
              stroke={palette.ink}
              strokeWidth={0.2}
              strokeLinejoin="round"
              paintOrder="stroke"
            />
          </svg>
        );
      })}
    </div>
  );
}
