import type { CSSProperties } from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ofKind, type Placed, type PhoneCue } from "./spec";
import { enter, leave, ramp, SETTLE, type Theme } from "./theme";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/**
 * Phone-UI overlay: an original handset rises in with a settling tilt; in
 * `messages` the lines arrive as alternating chat bubbles (incoming ones after
 * a typing indicator), in `social` as feed posts whose hearts pop and like
 * counts roll. It drops away on exit.
 */
export function Phones({ cues, theme }: { cues: Placed[]; theme: Theme }) {
  const frame = useCurrentFrame();
  const active = ofKind(cues, "phone").filter((cue) => frame >= cue.begin && frame < cue.end);
  return (
    <>
      {active.map((cue) => (
        <Phone key={cue.begin} cue={cue} theme={theme} frame={frame} />
      ))}
    </>
  );
}

function Phone({ cue, theme, frame }: { cue: Placed<PhoneCue>; theme: Theme; frame: number }) {
  const { fps } = useVideoConfig();
  const { u, palette, s, height } = theme;
  const { left, top, width: w, height: h } = theme.layout.phone;
  const rise = enter(frame, cue.begin, fps, { damping: 17, stiffness: 120, mass: 0.9 });
  const drop = leave(frame, cue.exit, s(0.42));
  const first = cue.begin + s(0.5);
  const slot = Math.min(s(1.3), Math.max(s(0.35), (cue.end - cue.begin - s(1.2)) / Math.max(1, cue.lines.length)));
  const social = cue.app === "social";
  const screen = social ? palette.ink : palette.paper;
  const ink = social ? palette.paper : palette.ink;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: w,
        height: h,
        borderRadius: 70 * u,
        padding: 14 * u,
        backgroundColor: "#16161B",
        border: `${4 * u}px solid ${palette.ink}`,
        boxShadow: `0 ${30 * u}px ${70 * u}px rgb(0 0 0 / 0.55), inset 0 0 0 ${3 * u}px rgb(255 255 255 / 0.12)`,
        transform: `translateY(${(1 - rise) * height * 0.75 + drop * height * 0.8}px) rotate(${interpolate(rise, [0, 1], [10, -3]) - drop * 7}deg)`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 56 * u,
          overflow: "hidden",
          backgroundColor: screen,
          fontFamily: theme.text,
          color: ink,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 16 * u,
            left: "50%",
            width: 120 * u,
            height: 34 * u,
            marginLeft: -60 * u,
            borderRadius: 20 * u,
            backgroundColor: "#000",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18 * u,
            padding: `${76 * u}px ${28 * u}px ${20 * u}px`,
            borderBottom: `${2 * u}px solid color-mix(in srgb, ${ink} 12%, transparent)`,
          }}
        >
          <Chevron color={ink} u={u} />
          <div
            style={{
              width: 64 * u,
              height: 64 * u,
              borderRadius: "50%",
              background: social
                ? `conic-gradient(from 200deg, ${palette.heat}, ${palette.sun}, ${palette.heat})`
                : `linear-gradient(135deg, ${palette.sky}, ${palette.heat})`,
              border: `${4 * u}px solid ${screen}`,
              boxShadow: `0 0 0 ${3 * u}px ${social ? palette.heat : palette.sky}`,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 * u }}>
            <Bar width={150 * u} u={u} color={ink} alpha={70} />
            <Bar width={90 * u} u={u} color={social ? palette.heat : palette.cash} alpha={90} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: (social ? 20 : 16) * u, padding: 24 * u }}>
          {cue.lines.map((line, index) => {
            const at = first + index * slot;
            const typing = !social && index % 2 === 0 && frame >= at - s(0.5) && frame < at && at - s(0.5) >= cue.begin + s(0.3);
            if (typing) return <Typing key={index} frame={frame} theme={theme} />;
            if (frame < at) return null;
            const pop = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 210, mass: 0.6 } });
            return social ? (
              <Post key={index} line={line} index={index} frame={frame} at={at} pop={pop} theme={theme} />
            ) : (
              <Bubble key={index} line={line} outgoing={index % 2 === 1} pop={pop} theme={theme} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Bar({ width, u, color, alpha }: { width: number; u: number; color: string; alpha: number }) {
  return (
    <div
      style={{
        width,
        height: 14 * u,
        borderRadius: 7 * u,
        backgroundColor: `color-mix(in srgb, ${color} ${alpha}%, transparent)`,
      }}
    />
  );
}

function Chevron({ color, u }: { color: string; u: number }) {
  return (
    <svg width={22 * u} height={36 * u} viewBox="0 0 22 36">
      <path d="M18 4 L 5 18 L 18 32" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const bubbleText = (theme: Theme): CSSProperties => ({
  fontSize: 34 * theme.u,
  fontWeight: 600,
  lineHeight: 1.22,
  padding: `${18 * theme.u}px ${26 * theme.u}px`,
  maxWidth: "80%",
});

function Bubble({ line, outgoing, pop, theme }: { line: string; outgoing: boolean; pop: number; theme: Theme }) {
  const { u, palette } = theme;
  const r = 34 * u;
  return (
    <div
      style={{
        ...bubbleText(theme),
        alignSelf: outgoing ? "flex-end" : "flex-start",
        borderRadius: outgoing ? `${r}px ${r}px ${8 * u}px ${r}px` : `${r}px ${r}px ${r}px ${8 * u}px`,
        backgroundColor: outgoing ? palette.sky : `color-mix(in srgb, ${palette.ink} 10%, ${palette.paper})`,
        color: palette.ink,
        opacity: Math.min(1, pop * 2.5),
        transform: `translateY(${(1 - pop) * 24 * u}px) scale(${interpolate(pop, [0, 1], [0.5, 1])})`,
        transformOrigin: outgoing ? "right bottom" : "left bottom",
      }}
    >
      {line}
    </div>
  );
}

function Typing({ frame, theme }: { frame: number; theme: Theme }) {
  const { u, palette, s } = theme;
  return (
    <div
      style={{
        ...bubbleText(theme),
        alignSelf: "flex-start",
        display: "flex",
        gap: 10 * u,
        borderRadius: 34 * u,
        backgroundColor: `color-mix(in srgb, ${palette.ink} 10%, ${palette.paper})`,
      }}
    >
      {[0, 1, 2].map((dot) => {
        const phase = ((frame + dot * s(0.12)) % s(0.6)) / s(0.6);
        return (
          <div
            key={dot}
            style={{
              width: 14 * u,
              height: 14 * u,
              margin: `${12 * u}px 0`,
              borderRadius: "50%",
              backgroundColor: palette.ink,
              opacity: 0.35 + 0.5 * Math.sin(Math.PI * phase),
              transform: `translateY(${-8 * u * Math.sin(Math.PI * phase)}px)`,
            }}
          />
        );
      })}
    </div>
  );
}

function Post({
  line,
  index,
  frame,
  at,
  pop,
  theme,
}: {
  line: string;
  index: number;
  frame: number;
  at: number;
  pop: number;
  theme: Theme;
}) {
  const { fps } = useVideoConfig();
  const { u, palette, s } = theme;
  const heart = spring({ frame: frame - at - s(0.35), fps, config: { damping: 8, stiffness: 240, mass: 0.5 } });
  const likes = Math.round(1200 + random(`likes-${index}-${line}`) * 48000);
  const rolled = Math.round(likes * ramp(frame, at + s(0.35), at + s(1.1)));
  return (
    <div
      style={{
        padding: 22 * u,
        borderRadius: 30 * u,
        backgroundColor: `color-mix(in srgb, ${palette.paper} 9%, ${palette.ink})`,
        border: `${2 * u}px solid color-mix(in srgb, ${palette.paper} 14%, transparent)`,
        opacity: Math.min(1, pop * 2),
        transform: `translateY(${(1 - pop) * 60 * u}px) scale(${interpolate(pop, [0, 1], [0.9, 1])})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 * u, marginBottom: 16 * u }}>
        <div
          style={{
            width: 46 * u,
            height: 46 * u,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${index % 2 ? palette.sky : palette.sun}, ${palette.heat})`,
          }}
        />
        <Bar width={(120 + 40 * random(`handle-${index}`)) * u} u={u} color={palette.paper} alpha={45} />
      </div>
      <div style={{ fontSize: 34 * u, fontWeight: 700, lineHeight: 1.22 }}>{line}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 * u, marginTop: 16 * u }}>
        <svg
          width={38 * u}
          height={34 * u}
          viewBox="0 0 24 22"
          style={{ transform: `scale(${frame >= at + s(0.35) ? interpolate(heart, [0, 1], [1.8, 1]) : 1})` }}
        >
          <path
            d="M12 21 C 5 15, 1 11.5, 1 7 A 5.5 5.5 0 0 1 12 4.5 A 5.5 5.5 0 0 1 23 7 C 23 11.5, 19 15, 12 21 Z"
            fill={heart > 0.05 ? palette.heat : "none"}
            fillOpacity={Math.min(1, heart * 2)}
            stroke={heart > 0.05 ? palette.heat : palette.paper}
            strokeWidth={2}
          />
        </svg>
        <div style={{ fontSize: 26 * u, fontWeight: 700, opacity: 0.8 }}>{compact.format(rolled)}</div>
      </div>
    </div>
  );
}
