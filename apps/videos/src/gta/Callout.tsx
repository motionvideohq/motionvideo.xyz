import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ofKind, type CalloutCue, type Placed } from "./spec";
import { leave, ramp, textWidth, type Theme } from "./theme";

/**
 * Freeze-frame callout: a ring snaps onto the point (x/y normalized to the
 * output frame) and keeps pulsing, an arrow draws from the label to the ring,
 * then the label wipes in from the arrow's side. The footage freeze and push-in
 * live in Footage.
 */
export function Callouts({ cues, theme }: { cues: Placed[]; theme: Theme }) {
  const frame = useCurrentFrame();
  const active = ofKind(cues, "callout").filter((cue) => frame >= cue.begin && frame < cue.end);
  return (
    <>
      {active.map((cue) => (
        <Callout key={`${cue.begin}-${cue.label}`} cue={cue} theme={theme} frame={frame} />
      ))}
    </>
  );
}

function Callout({ cue, theme, frame }: { cue: Placed<CalloutCue>; theme: Theme; frame: number }) {
  const { fps } = useVideoConfig();
  const { u, width, height, safe, palette, s } = theme;
  const px = cue.x * width;
  const py = cue.y * height;
  const radius = 58 * u;

  // The label box, measured: text + padding + border, plus what the -8° skew
  // pushes out at the corners and the hard shadow.
  const label = cue.label.toUpperCase();
  const area = { left: safe.side, right: width - safe.rail, top: safe.top, bottom: height - safe.bottom };
  const pad = 2 * 30 * u + 2 * 6 * u;
  const size = Math.min(78 * u, (78 * u * (area.right - area.left - pad - 80 * u)) / textWidth(label, theme.display, 78 * u, theme.look.weight));
  const boxW = textWidth(label, theme.display, size, theme.look.weight) + pad;
  const boxH = size + 26 * u + 12 * u;
  const lean = (boxH / 2) * Math.tan((8 * Math.PI) / 180);
  const reachW = boxW + 2 * lean + 10 * u;

  // Toward the open side of the frame; flip to the other side of the target
  // when the label would leave the safe area, clamp when neither side fits.
  const gapX = 200 * u;
  const leftOf = (dir: number) => (dir > 0 ? px + gapX : px - gapX - boxW);
  const fitsX = (dir: number) => leftOf(dir) - lean >= area.left && leftOf(dir) + boxW + lean + 10 * u <= area.right;
  const preferX = cue.x > 0.55 ? -1 : 1;
  const side = fitsX(preferX) || !fitsX(-preferX) ? preferX : -preferX;
  const boxLeft = Math.min(Math.max(leftOf(side), area.left + lean), area.right - reachW + lean);
  const gapY = 200 * u;
  const fitsY = (dir: number) => {
    const centre = py + dir * gapY;
    return centre - boxH / 2 >= area.top && centre + boxH / 2 + 10 * u <= area.bottom;
  };
  const preferY = cue.y > 0.58 ? -1 : 1;
  const lift = fitsY(preferY) || !fitsY(-preferY) ? preferY : -preferY;
  const ly = Math.min(Math.max(py + lift * gapY, area.top + boxH / 2), area.bottom - boxH / 2 - 10 * u);
  // The arrow leaves from the label's edge nearest the target.
  const lx = side > 0 ? boxLeft + 8 * u : boxLeft + boxW - 8 * u;
  const angle = Math.atan2(ly - py, lx - px);
  const tipX = px + Math.cos(angle) * (radius + 14 * u);
  const tipY = py + Math.sin(angle) * (radius + 14 * u);
  const length = Math.hypot(lx - tipX, ly - tipY);

  const gone = leave(frame, cue.exit, s(0.3));
  const snap = spring({ frame: frame - cue.begin - s(0.06), fps, config: { damping: 12, stiffness: 200, mass: 0.6 } });
  const ring = ramp(frame, cue.begin + s(0.06), cue.begin + s(0.42));
  const arrow = ramp(frame, cue.begin + s(0.3), cue.begin + s(0.62)) * (1 - gone);
  const shown = spring({ frame: frame - cue.begin - s(0.52), fps, config: { damping: 16, stiffness: 180, mass: 0.6 } });
  // Wipe in from the arrow's side; at rest the clip sits well outside the skewed box.
  const clip = 120 * (1 - Math.min(1, shown) * (1 - gone)) - 20;
  const period = s(0.9);
  const since = frame - cue.begin - s(0.45);
  const echo = since >= 0 ? (since % period) / period : -1;
  const headAngle = (angle * 180) / Math.PI + 180;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", overflow: "visible" }}>
        <g
          transform={`translate(${px} ${py}) scale(${interpolate(snap, [0, 1], [1.7, 1]) * (1 - 0.4 * gone)})`}
          opacity={(1 - gone) * Math.min(1, snap * 2)}
        >
          {echo >= 0 ? (
            <circle r={radius * (1 + echo * 0.9)} fill="none" stroke={palette.sun} strokeWidth={6 * u * (1 - echo)} opacity={1 - echo} />
          ) : null}
          <circle r={radius} fill="none" stroke={palette.ink} strokeWidth={16 * u} opacity={0.6} />
          <circle
            r={radius}
            fill="none"
            stroke={palette.sun}
            strokeWidth={9 * u}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - ring}
            transform="rotate(-90)"
          />
          <circle r={9 * u} fill={palette.sun} stroke={palette.ink} strokeWidth={4 * u} />
        </g>
        {arrow > 0 ? (
          <g strokeLinecap="round" strokeLinejoin="round">
            <line
              x1={lx}
              y1={ly}
              x2={lx + (tipX - lx) * arrow}
              y2={ly + (tipY - ly) * arrow}
              stroke={palette.ink}
              strokeWidth={16 * u}
            />
            <line
              x1={lx}
              y1={ly}
              x2={lx + (tipX - lx) * arrow}
              y2={ly + (tipY - ly) * arrow}
              stroke={palette.sun}
              strokeWidth={8 * u}
            />
            <g
              transform={`translate(${lx + (tipX - lx) * arrow} ${ly + (tipY - ly) * arrow}) rotate(${headAngle}) scale(${ramp(frame, cue.begin + s(0.5), cue.begin + s(0.68))})`}
              opacity={length > 0 ? 1 : 0}
            >
              <path d={`M0 0 L${-30 * u} ${-20 * u} L${-30 * u} ${20 * u} Z`} fill={palette.sun} stroke={palette.ink} strokeWidth={6 * u} />
            </g>
          </g>
        ) : null}
      </svg>
      <div
        style={{
          position: "absolute",
          top: ly - boxH / 2,
          left: boxLeft,
          width: boxW,
          // Slides out of the arrow (toward the label's resting place), never past it.
          transform: `translateX(${-side * (1 - Math.min(1, shown)) * 40 * u}px) skewX(-8deg)`,
          clipPath: side > 0 ? `inset(-40% ${clip}% -40% -20%)` : `inset(-40% -20% -40% ${clip}%)`,
        }}
      >
        <div
          style={{
            boxSizing: "border-box",
            width: boxW,
            height: boxH,
            fontFamily: theme.display,
            fontWeight: theme.look.weight,
            fontSize: size,
            lineHeight: 1,
            whiteSpace: "nowrap",
            textAlign: "center",
            color: palette.ink,
            backgroundColor: palette.sun,
            padding: `${14 * u}px 0 ${12 * u}px`,
            border: `${6 * u}px solid ${palette.ink}`,
            boxShadow: `${10 * u}px ${10 * u}px 0 ${palette.ink}`,
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
}
