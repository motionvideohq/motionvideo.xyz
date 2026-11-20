import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { ofKind, type MinimapCue, type Placed } from "./spec";
import { enter, leave, outline, ramp, SETTLE, textWidth, type Theme } from "./theme";

/** An abstract street plan in a 400×400 box centered on 0: blocks, two arterials, a coastline. */
const STREETS = Array.from({ length: 9 }, (_, i) => -200 + i * 50 + Math.round((random(`street-${i}`) - 0.5) * 18));
const AVENUES = Array.from({ length: 9 }, (_, i) => -200 + i * 50 + Math.round((random(`avenue-${i}`) - 0.5) * 18));
const COAST = "M120 -220 C 90 -120, 150 -60, 110 20 S 140 160, 100 230 L 240 230 L 240 -220 Z";

/**
 * Location tag: a rounded minimap flies in bottom left, above the caption
 * block (bottom right, clear of the action rail, with `hudSide: "left"`),
 * its plan drifting and turning as if driving, with a player arrow
 * and a pulsing blip; then the location name wipes out beside it on a
 * `sky` underline.
 */
export function Minimaps({ cues, theme }: { cues: Placed[]; theme: Theme }) {
  const frame = useCurrentFrame();
  const active = ofKind(cues, "minimap").filter((cue) => frame >= cue.begin && frame < cue.end);
  return (
    <>
      {active.map((cue) => (
        <Minimap key={`${cue.begin}-${cue.label}`} cue={cue} theme={theme} frame={frame} />
      ))}
    </>
  );
}

function Minimap({ cue, theme, frame }: { cue: Placed<MinimapCue>; theme: Theme; frame: number }) {
  const { fps } = useVideoConfig();
  const { u, safe, width, height, palette, s } = theme;
  const pin = theme.layout.minimap;
  const away = pin.side;
  // +1 points at the minimap's own edge: it flies in from there and leaves into it.
  const edge = away === "right" ? 1 : -1;
  const map = (width > theme.height ? 260 : 300) * u;
  const fly = enter(frame, cue.begin, fps, SETTLE);
  const zoom = ramp(frame, cue.begin, cue.begin + s(0.9));
  const reveal = ramp(frame, cue.begin + s(0.35), cue.begin + s(0.85));
  const bar = ramp(frame, cue.begin + s(0.3), cue.begin + s(0.7));
  const tagOut = leave(frame, cue.exit - s(0.12), s(0.28));
  const mapOut = leave(frame, cue.exit, s(0.32));
  const t = (frame - cue.begin) / fps;
  const blip = (t % 1.1) / 1.1;
  // The tag sits on the map's inner side and stops at the far safe edge (the action rail at 9:16).
  const room = width - pin.inset - map - 36 * u - (away === "left" ? safe.rail : safe.side);
  // Fit the tag (plus its outline) into the room beside the map.
  const size = Math.min(84 * u, (84 * u * (room - 24 * u)) / textWidth(cue.label.toUpperCase(), theme.display, 84 * u, theme.look.weight));

  return (
    <div
      style={{
        position: "absolute",
        [away]: pin.inset,
        flexDirection: away === "right" ? "row-reverse" : "row",
        bottom: height - pin.y,
        display: "flex",
        alignItems: "flex-end",
        gap: 36 * u,
      }}
    >
      <div
        style={{
          width: map,
          height: map,
          borderRadius: 44 * u,
          overflow: "hidden",
          border: `${8 * u}px solid ${palette.ink}`,
          boxShadow: `0 0 0 ${3 * u}px color-mix(in srgb, ${palette.paper} 55%, transparent), 0 ${10 * u}px 0 ${palette.ink}`,
          backgroundColor: `color-mix(in srgb, ${palette.ink} 82%, ${palette.sky})`,
          opacity: Math.min(1, fly * 2) * (1 - mapOut),
          transform: `translateX(${edge * ((1 - fly) * 260 * u + mapOut * 200 * u)}px) scale(${interpolate(fly, [0, 1], [0.7, 1])}) rotate(${edge * (1 - fly) * 8}deg)`,
          transformOrigin: `${away} bottom`,
        }}
      >
        <svg width="100%" height="100%" viewBox="-130 -130 260 260">
          <g transform={`scale(${1.5 - 0.5 * zoom}) rotate(${-14 + t * 7}) translate(${-t * 6} ${t * 14})`}>
            <path d={COAST} fill={palette.sky} fillOpacity={0.4} />
            {STREETS.map((y) => (
              <line key={`s${y}`} x1={-240} x2={240} y1={y} y2={y} stroke={palette.paper} strokeOpacity={0.2} strokeWidth={5} />
            ))}
            {AVENUES.map((x) => (
              <line key={`a${x}`} y1={-240} y2={240} x1={x} x2={x} stroke={palette.paper} strokeOpacity={0.2} strokeWidth={5} />
            ))}
            <path d="M-240 40 L 240 -10" stroke={palette.paper} strokeOpacity={0.6} strokeWidth={11} />
            <path d="M-30 -240 L 10 240" stroke={palette.paper} strokeOpacity={0.6} strokeWidth={11} />
            <path
              d="M0 0 L 8 -60 L 70 -66"
              fill="none"
              stroke={palette.sun}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - reveal}
            />
            <circle cx={70} cy={-66} r={9 + blip * 22} fill="none" stroke={palette.heat} strokeWidth={4 * (1 - blip)} opacity={1 - blip} />
            <circle cx={70} cy={-66} r={9} fill={palette.heat} stroke={palette.ink} strokeWidth={3} />
          </g>
          <path d="M0 -15 L 12 13 L 0 6 L -12 13 Z" fill={palette.sun} stroke={palette.ink} strokeWidth={4} strokeLinejoin="round" />
          <text x={0} y={-104} textAnchor="middle" fontFamily={theme.text} fontWeight={800} fontSize={20} fill={palette.paper} opacity={0.8}>
            N
          </text>
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: away === "right" ? "flex-end" : "flex-start",
          paddingBottom: 10 * u,
          opacity: 1 - tagOut,
        }}
      >
        <div
          style={{
            fontFamily: theme.display,
            fontWeight: theme.look.weight,
            fontSize: size,
            lineHeight: 1,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            color: palette.paper,
            // Wipes out of the map's side.
            clipPath:
              away === "right"
                ? `inset(-20% -5% -20% ${(1 - reveal * (1 - tagOut)) * 100}%)`
                : `inset(-20% ${(1 - reveal * (1 - tagOut)) * 100}% -20% -5%)`,
            transform: `translateX(${edge * (1 - reveal) * 30 * u}px)`,
            filter: `drop-shadow(0 ${6 * u}px 0 ${palette.ink})`,
            ...outline(palette.ink, 12 * u),
          }}
        >
          {cue.label}
        </div>
        <div
          style={{
            marginTop: 10 * u,
            width: "100%",
            height: 10 * u,
            backgroundColor: palette.sky,
            border: `${3 * u}px solid ${palette.ink}`,
            transform: `scaleX(${bar * (1 - tagOut)})`,
            transformOrigin: `${away} center`,
          }}
        />
      </div>
    </div>
  );
}
