import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ofKind, type CardCue, type Placed } from "./spec";
import { EASE_IN, leave, outline, ramp, textWidth, type Theme } from "./theme";

/**
 * Full-screen title card over the dipped, letterboxed footage (both drawn by
 * Footage/Letterbox). A dark band opens across the middle and the title lands
 * in the variant's own move: `passed` tracks in from wide, `failed` drops with
 * weight, `busted` slams down with a jolt. A rule draws out from the centre,
 * the subtitle follows, and the band collapses on exit.
 */
export function Cards({ cues, theme }: { cues: Placed[]; theme: Theme }) {
  const frame = useCurrentFrame();
  const active = ofKind(cues, "card").filter((cue) => frame >= cue.begin && frame < cue.end);
  return (
    <>
      {active.map((cue) => (
        <Card key={cue.begin} cue={cue} theme={theme} frame={frame} />
      ))}
    </>
  );
}

function Card({ cue, theme, frame }: { cue: Placed<CardCue>; theme: Theme; frame: number }) {
  const { fps } = useVideoConfig();
  const { u, width, palette, s } = theme;
  const accent = { passed: palette.sun, failed: palette.heat, busted: palette.sky }[cue.variant];
  // Fit the title at its resting tracking (0.03em) inside 86% of the frame width.
  const heading = cue.title.toUpperCase();
  const size = Math.min(
    176 * u,
    (176 * u * width * 0.86) / (textWidth(heading, theme.display, 176 * u, theme.look.weight) + heading.length * 0.03 * 176 * u),
  );
  const begin = cue.begin + s(0.2);
  const band = ramp(frame, cue.begin + s(0.1), cue.begin + s(0.45));
  const gone = leave(frame, cue.exit, s(0.45));
  const close = 1 - ramp(frame, cue.exit - s(0.45), cue.exit, EASE_IN);
  const rule = ramp(frame, begin + s(0.35), begin + s(0.8));
  const sub = spring({ frame: frame - begin - s(0.5), fps, config: { damping: 18, stiffness: 140, mass: 0.7 } });

  let title: { transform: string; opacity: number; letterSpacing: string; filter?: string };
  if (cue.variant === "passed") {
    const land = spring({ frame: frame - begin, fps, config: { damping: 22, stiffness: 90, mass: 0.9 } });
    title = {
      transform: `translateY(${(1 - land) * 40 * u}px)`,
      opacity: Math.min(1, land * 1.6),
      letterSpacing: `${interpolate(land, [0, 1], [0.32, 0.03])}em`,
      filter: `blur(${(1 - Math.min(1, land)) * 14 * u}px)`,
    };
  } else if (cue.variant === "failed") {
    const land = spring({ frame: frame - begin, fps, config: { damping: 9, stiffness: 150, mass: 1 } });
    title = {
      transform: `translateY(${(1 - land) * -220 * u}px) rotate(${(1 - land) * -4}deg)`,
      opacity: Math.min(1, land * 2.5),
      letterSpacing: "0.03em",
    };
  } else {
    const land = spring({ frame: frame - begin, fps, config: { damping: 14, stiffness: 320, mass: 0.7 } });
    const jolt = frame >= begin + s(0.12) ? Math.sin((frame - begin) * 2.9) * 10 * u * (1 - ramp(frame, begin + s(0.12), begin + s(0.5))) : 0;
    title = {
      transform: `translateX(${jolt}px) scale(${interpolate(land, [0, 1], [2.3, 1])})`,
      opacity: Math.min(1, land * 3),
      letterSpacing: "0.03em",
    };
  }

  // The title's centre sits on the layout's card point (x 46% / y 45% at 9:16);
  // the band is centred a little lower so it also holds the rule and subtitle.
  const spot = theme.layout.card;
  return (
    <AbsoluteFill style={{ opacity: 1 - gone }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: spot.y - size * 1.05,
          height: size * 2.5,
          background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${palette.ink} 78%, transparent) 18%, color-mix(in srgb, ${palette.ink} 78%, transparent) 82%, transparent)`,
          transform: `scaleY(${band * close})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: spot.y - size / 2,
          left: spot.x,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateX(-50%) scaleY(${0.4 + 0.6 * close})`,
          transformOrigin: `center ${size / 2}px`,
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
            color: accent,
            ...title,
            filter: `${title.filter ?? ""} drop-shadow(0 ${8 * u}px 0 ${palette.ink})`,
            ...outline(palette.ink, 14 * u),
          }}
        >
          {cue.title}
        </div>
        <div
          style={{
            width: width * 0.5,
            height: 8 * u,
            marginTop: 22 * u,
            backgroundColor: accent,
            boxShadow: `0 ${4 * u}px 0 ${palette.ink}`,
            transform: `scaleX(${rule})`,
          }}
        />
        {cue.subtitle ? (
          <div
            style={{
              marginTop: 26 * u,
              fontFamily: theme.text,
              fontWeight: 800,
              fontSize: 52 * u,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: cue.variant === "passed" ? palette.cash : palette.paper,
              opacity: Math.min(1, sub * 1.5),
              transform: `translateY(${(1 - sub) * 30 * u}px)`,
              textShadow: `0 ${4 * u}px 0 ${palette.ink}`,
            }}
          >
            {cue.subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}
