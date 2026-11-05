import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { FONT, INK, LOGOMARK_BOX, LOGOMARK_PATH } from "../brand";
import film from "./shots.json";

// The launch film, shot on the light stage (the site's brand is light; see
// the cinematic-shot skill): hero shots of the site's real components,
// recorded by scripts/capture-film.mjs, set on a tilted slab with optical
// depth of field, a soft on-plane key and a lens vignette.
//
// Everything is laid out in a 1920×1080 design space and scaled to the
// composition. Grain is added after the render (see package.json).

const GROUND = "#e5e2dd";
const FRAME_W = 1920;
const FRAME_H = 1080;
const UI_W = film.ui.width;
const UI_H = film.ui.height;
const RADIUS = 14;
const LAYERS = 7;
const RACK_SECONDS = 0.6;
const LIGHT_LAG = 0.4;

type Mode = "preview" | "final";
type Scale = "extreme" | "macro" | "medium" | "wide";
type Shot = (typeof film.shots)[number] & { scale: Scale };
type FocusEntry = { at: number; x: number; y: number };
type Captured = {
  id: string;
  frames: number;
  focus: FocusEntry[];
  detail: { x: number; y: number; width: number; height: number } | null;
};
type Capture = { fps: number; shots: Captured[] };

export type LaunchFilmProps = {
  mode: Mode;
  samples: number;
  capture: Capture | null;
};

const SHOTS = film.shots as Shot[];

/**
 * Depth of field per scale, in UI px measured along the plane's depth axis
 * from the focal line: sharp out to `band`, blur ramps to `maxBlur`
 * (frame px at 1080p) by `ramp`.
 */
const FOCUS: Record<Scale, { band: number; ramp: number; maxBlur: number }> = {
  extreme: { band: 8, ramp: 70, maxBlur: 24 },
  macro: { band: 22, ramp: 150, maxBlur: 20 },
  medium: { band: 50, ramp: 260, maxBlur: 14 },
  wide: { band: 300, ramp: 700, maxBlur: 6 },
};

/** The key's spill on screen, along / across, as a share of frame width (1.6× the dark stage). */
const SPILL: Record<Scale, [number, number]> = {
  extreme: [0.56, 0.36],
  macro: [0.68, 0.45],
  medium: [0.82, 0.56],
  wide: [1.2, 0.88],
};

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Focus point (UI px) at shot time `t`: each new target racks in over 0.6 s. */
function focusAt(entries: FocusEntry[], t: number) {
  let { x, y } = entries[0];
  for (const entry of entries.slice(1)) {
    const k = easeInOut(clamp((t - entry.at) / RACK_SECONDS));
    x += (entry.x - x) * k;
    y += (entry.y - y) * k;
  }
  return { x, y };
}

/** The follow-spot: the subject averaged over the last 0.4 s, never leading. */
function lightAt(entries: FocusEntry[], t: number) {
  let x = 0;
  let y = 0;
  const n = 8;
  for (let i = 0; i < n; i++) {
    const p = focusAt(entries, Math.max(0, t - (LIGHT_LAG * i) / (n - 1)));
    x += p.x / n;
    y += p.y / n;
  }
  return { x, y };
}

/**
 * The plane's depth axis in UI coordinates: the z row of
 * rotateX(pitch)·rotateY(yaw)·rotateZ(roll), as CSS composes them.
 */
function depthAxis(pitch: number, yaw: number, roll: number) {
  const [a, b, c] = [rad(pitch), rad(yaw), rad(roll)];
  // Row 2 of Rx(a)·Ry(b)·Rz(c), first two columns (the plane's u, v axes).
  const zu = -Math.cos(a) * Math.sin(b) * Math.cos(c) + Math.sin(a) * Math.sin(c);
  const zv = Math.cos(a) * Math.sin(b) * Math.sin(c) + Math.sin(a) * Math.cos(c);
  const len = Math.hypot(zu, zv) || 1;
  return { x: zu / len, y: zv / len };
}

/** A mask keeping the band within `half` UI px of the focal line, feathered. */
function bandMask(axis: { x: number; y: number }, focus: { x: number; y: number }, half: number, feather: number) {
  const angle = (Math.atan2(axis.x, -axis.y) * 180) / Math.PI;
  const length = Math.abs(UI_W * axis.x) + Math.abs(UI_H * axis.y);
  const s = (focus.x - UI_W / 2) * axis.x + (focus.y - UI_H / 2) * axis.y;
  const at = (d: number) => `${50 + ((s + d) / length) * 100}%`;
  return `linear-gradient(${angle}deg, transparent ${at(-half - feather)}, #000 ${at(-half)}, #000 ${at(half)}, transparent ${at(half + feather)})`;
}

function Exposure({ shot, data, mode, t, sourceT, capFps }: {
  shot: Shot;
  data: Captured;
  mode: Mode;
  t: number;
  sourceT: number;
  capFps: number;
}) {
  const p = t / shot.seconds;
  const anchor = data.focus[0];
  const focus = focusAt(data.focus, t);
  const light = lightAt(data.focus, t);
  const index = clamp(Math.round(sourceT * capFps), 0, data.frames - 1);
  const name = `${String(index).padStart(4, "0")}.jpg`;
  const context = staticFile(`film/${mode}/${shot.id}-context/${name}`);
  const detail = data.detail && staticFile(`film/${mode}/${shot.id}-detail/${name}`);
  const dof = FOCUS[shot.scale];
  const axis = depthAxis(shot.pitch, shot.yaw, shot.roll);
  const mag = shot.mag * (1 + shot.push * p);
  const roll = shot.roll + shot.turn * p;
  const [aimX, aimY] = shot.aim;
  const [driftX, driftY] = shot.drift;
  const plane: CSSProperties = {
    position: "absolute",
    left: FRAME_W / 2 + aimX * FRAME_W - anchor.x,
    top: FRAME_H / 2 + aimY * FRAME_H - anchor.y,
    width: UI_W,
    height: UI_H,
    transformOrigin: `${anchor.x}px ${anchor.y}px`,
    transform: `translate3d(${driftX * FRAME_W * p}px, ${driftY * FRAME_H * p}px, 0) rotateX(${shot.pitch}deg) rotateY(${shot.yaw}deg) rotateZ(${roll}deg) scale(${mag})`,
    borderRadius: RADIUS,
  };
  const ui = (
    <>
      <Img src={context} style={{ position: "absolute", inset: 0, width: UI_W, height: UI_H }} />
      {detail && data.detail ? (
        <Img
          src={detail}
          style={{
            position: "absolute",
            left: data.detail.x,
            top: data.detail.y,
            width: data.detail.width,
            height: data.detail.height,
            // Feathered into the context layer, except along the slab's own edges.
            maskImage: [
              `linear-gradient(90deg, ${data.detail.x > 0 ? "transparent" : "#000"}, #000 24px, #000 calc(100% - 24px), ${data.detail.x + data.detail.width < UI_W ? "transparent" : "#000"})`,
              `linear-gradient(180deg, ${data.detail.y > 0 ? "transparent" : "#000"}, #000 24px, #000 calc(100% - 24px), ${data.detail.y + data.detail.height < UI_H ? "transparent" : "#000"})`,
            ].join(", "),
            maskComposite: "intersect",
          }}
        />
      ) : null}
    </>
  );
  // Most blurred first, everywhere; each sharper copy only nearer the focal line.
  const layers = Array.from({ length: LAYERS }, (_, i) => {
    const level = 1 - i / (LAYERS - 1); // 1 → 0
    const blur = (dof.maxBlur * level) / mag;
    const half = dof.band + (dof.ramp - dof.band) * level;
    const feather = (dof.ramp - dof.band) / (LAYERS - 1);
    return (
      <div
        key={i}
        style={{
          ...plane,
          overflow: "hidden",
          background: "#fff",
          filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
          maskImage: i === 0 ? undefined : bandMask(axis, focus, half, feather),
        }}
      >
        {ui}
      </div>
    );
  });
  const [along, across] = SPILL[shot.scale];
  const sw = (along * FRAME_W) / shot.mag;
  const sh = (across * FRAME_W) / shot.mag;
  return (
    <AbsoluteFill style={{ perspective: shot.perspective, perspectiveOrigin: "50% 50%" }}>
      {/* The slab's cast and contact shadows on the ground. */}
      <div
        style={{
          ...plane,
          background: "#fff",
          boxShadow: "0 26px 40px rgb(0 0 0 / 0.18), 0 1px 6px rgb(0 0 0 / 0.1)",
        }}
      />
      {layers}
      {/* The key: on the plane, trailing the subject, at most 12% down. */}
      <div
        style={{
          ...plane,
          overflow: "hidden",
          background: `radial-gradient(ellipse ${sw}px ${sh}px at ${light.x}px ${light.y}px, transparent 0%, rgb(0 0 0 / 0.005) 8%, rgb(0 0 0 / 0.017) 20%, rgb(0 0 0 / 0.036) 35%, rgb(0 0 0 / 0.058) 50%, rgb(0 0 0 / 0.079) 65%, rgb(0 0 0 / 0.098) 80%, rgb(0 0 0 / 0.113) 92%, rgb(0 0 0 / 0.12) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
}

function Camera({ shot, data, mode, samples, capFps }: {
  shot: Shot;
  data: Captured;
  mode: Mode;
  samples: number;
  capFps: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 180° shutter: sub-frames spread over half a frame, averaged by opacity.
  const exposures = Array.from({ length: samples }, (_, i) => {
    const offset = ((i + 0.5) / samples - 0.5) * 0.5;
    return (
      <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
        <Exposure
          shot={shot}
          data={data}
          mode={mode}
          t={(frame + offset) / fps}
          sourceT={frame / fps}
          capFps={capFps}
        />
      </AbsoluteFill>
    );
  });
  // The last UI shot leaves through a 0.4 s blur into the ground.
  const exit = film.outro.exit;
  const left = shot.seconds - frame / fps;
  const k = shot.id === SHOTS.at(-1)?.id ? clamp(1 - left / exit) : 0;
  return (
    <AbsoluteFill style={{ filter: k > 0 ? `blur(${12 * k}px)` : undefined }}>
      {exposures}
      <AbsoluteFill style={{ background: GROUND, opacity: k }} />
    </AbsoluteFill>
  );
}

function Outro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const copyIn = easeOut(clamp(t / 0.8));
  const logo = t >= film.outro.logoAt - film.outro.copyAt;
  const mark = 115;
  return (
    <AbsoluteFill style={{ background: GROUND, justifyContent: "center", alignItems: "center", fontFamily: FONT, color: INK }}>
      {logo ? (
        <div style={{ display: "flex", alignItems: "center", gap: mark * 0.4 }}>
          <svg
            height={mark}
            width={(mark * LOGOMARK_BOX.width) / LOGOMARK_BOX.height}
            viewBox={`0 0 ${LOGOMARK_BOX.width} ${LOGOMARK_BOX.height}`}
            aria-label="MotionVideo"
          >
            <path d={LOGOMARK_PATH} fill={INK} />
          </svg>
          <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: "-0.03em" }}>MotionVideo</div>
        </div>
      ) : (
        <div
          style={{
            fontSize: 88,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            opacity: copyIn,
            filter: `blur(${16 * (1 - copyIn)}px)`,
          }}
        >
          Motion design, written in code.
        </div>
      )}
    </AbsoluteFill>
  );
}

export function LaunchFilm({ mode, samples, capture }: LaunchFilmProps) {
  const { fps, width } = useVideoConfig();
  if (!capture) {
    throw new Error(`No capture for "${mode}": run scripts/capture-film.mjs first.`);
  }
  return (
    <AbsoluteFill style={{ background: GROUND }}>
      <div
        style={{
          position: "absolute",
          width: FRAME_W,
          height: FRAME_H,
          transform: `scale(${width / FRAME_W})`,
          transformOrigin: "0 0",
          overflow: "hidden",
        }}
      >
        {SHOTS.map((shot) => {
          const data = capture.shots.find((s) => s.id === shot.id);
          if (!data) throw new Error(`Shot not captured: ${shot.id}`);
          return (
            <Sequence
              key={shot.id}
              name={shot.id}
              from={Math.round(shot.start * fps)}
              durationInFrames={Math.round(shot.seconds * fps)}
            >
              <Camera shot={shot} data={data} mode={mode} samples={samples} capFps={capture.fps} />
            </Sequence>
          );
        })}
        <Sequence
          name="outro"
          from={Math.round(film.outro.copyAt * fps)}
          durationInFrames={Math.round((film.duration - film.outro.copyAt) * fps)}
        >
          <Outro />
        </Sequence>
        {/* The lens: a faint vignette toward grey, centred and constant. */}
        <AbsoluteFill
          style={{
            background: "radial-gradient(120% 95% at 50% 50%, transparent 55%, rgb(120 115 108 / 0.14) 100%)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

export const calculateLaunchFilmMetadata: CalculateMetadataFunction<LaunchFilmProps> = async ({ props }) => {
  const response = await fetch(staticFile(`film/${props.mode}/capture.json`));
  return { props: { ...props, capture: response.ok ? ((await response.json()) as Capture) : null } };
};
