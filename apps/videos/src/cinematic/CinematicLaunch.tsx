import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT, LOGOMARK_BOX, LOGOMARK_PATH } from "../brand";
import capture from "./capture.json";

export const CINEMATIC_FPS = 30;
export const CINEMATIC_DURATION = 50 * CINEMATIC_FPS;
const GROUND = "#eae7e2";

type Shot = {
  id: string;
  source: string;
  start: number;
  seconds: number;
  mag: number;
  pitch: number;
  roll: number;
  yaw: number;
  offsetX?: number;
  offsetY?: number;
  trackX: number;
  trackY: number;
};

// Readable panels replace the former extreme macros and shallow focal bands.
// Coordinates are in the 1920×1080 design space; the composition renders at 4K.
const SHOTS: Shot[] = [
  {
    id: "discovery",
    source: "gallery",
    start: 0,
    seconds: 6,
    mag: 1.9,
    pitch: 4,
    roll: -1,
    yaw: 0.5,
    offsetX: 100,
    offsetY: 40,
    trackX: -40,
    trackY: -12,
  },
  {
    id: "category",
    source: "category",
    start: 6,
    seconds: 3,
    mag: 2.2,
    pitch: 3,
    roll: 1.5,
    yaw: -1,
    offsetX: -50,
    offsetY: 100,
    trackX: 32,
    trackY: 0,
  },
  {
    id: "search",
    source: "search",
    start: 9,
    seconds: 6,
    mag: 2.05,
    pitch: 0,
    roll: 0,
    yaw: 0,
    offsetX: 192,
    offsetY: 120,
    trackX: -24,
    trackY: -8,
  },
  {
    id: "selection",
    source: "selection",
    start: 15,
    seconds: 3,
    mag: 2.1,
    pitch: 2,
    roll: -0.5,
    yaw: 0.5,
    offsetX: 122,
    offsetY: 60,
    trackX: 20,
    trackY: -8,
  },
  {
    id: "prompt",
    source: "detail",
    start: 18,
    seconds: 6,
    mag: 1.9,
    pitch: 3,
    roll: 1,
    yaw: -1,
    offsetX: 130,
    offsetY: 89,
    trackX: -24,
    trackY: -30,
  },
  {
    id: "technique",
    source: "moves",
    start: 24,
    seconds: 5,
    mag: 2.4,
    pitch: 2,
    roll: -1,
    yaw: 0.5,
    offsetX: 85,
    offsetY: 110,
    trackX: 28,
    trackY: -16,
  },
  {
    id: "payoff",
    source: "gallery",
    start: 29,
    seconds: 7,
    mag: 1.08,
    pitch: 2,
    roll: 0,
    yaw: 0,
    trackX: 0,
    trackY: -12,
  },
  {
    id: "copy",
    source: "copy",
    start: 36,
    seconds: 5,
    mag: 2.7,
    pitch: 3,
    roll: 1,
    yaw: -0.5,
    offsetX: -110,
    offsetY: 36,
    trackX: -28,
    trackY: 6,
  },
];

function Exposure({
  shot,
  frame,
  sourceFrame,
}: {
  shot: Shot;
  frame: number;
  sourceFrame: number;
}) {
  const { fps } = useVideoConfig();
  const p = Math.max(0, Math.min(1, frame / (shot.seconds * fps)));
  const data = capture.shots.find((s) => s.id === shot.source)!;
  const wide = shot.id === "payoff";
  const fx = wide ? 720 : data.focus.x + (shot.offsetX ?? 0);
  const fy = wide ? 450 : data.focus.y + (shot.offsetY ?? 0);
  const index = Math.max(
    0,
    Math.min(data.seconds * capture.fps - 1, Math.round((sourceFrame * capture.fps) / fps)),
  );
  const image = `${shot.source}-${String(index).padStart(3, "0")}.jpg`;
  return (
    <AbsoluteFill style={{ perspective: 5000, perspectiveOrigin: "50% 50%" }}>
      <div
        style={{
          position: "absolute",
          left: 960 - fx,
          top: 540 - fy,
          width: 1440,
          height: 900,
          transformOrigin: `${fx}px ${fy}px`,
          transform: `translate3d(${shot.trackX * (p - 0.5)}px,${shot.trackY * (p - 0.5)}px,0) rotateX(${shot.pitch}deg) rotateY(${shot.yaw}deg) rotateZ(${shot.roll}deg) scale(${shot.mag * (1 + 0.018 * p)})`,
          overflow: "hidden",
          borderRadius: 14,
          background: "white",
          boxShadow: "0 18px 45px #00000020, 0 1px 5px #00000015",
        }}
      >
        <Img src={staticFile(`cinematic/${image}`)} style={{ width: 1440, height: 900 }} />
      </div>
    </AbsoluteFill>
  );
}

function Camera({ shot, samples }: { shot: Shot; samples: number }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: samples }, (_, i) => (
        <AbsoluteFill key={i} style={{ opacity: 1 / (i + 1) }}>
          <Exposure
            shot={shot}
            sourceFrame={frame}
            frame={frame + ((i + 0.5) / samples - 0.5) * 0.5}
          />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
}

export function CinematicLaunch({ samples = 2 }: { samples?: number }) {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const copyProgress = Math.max(0, Math.min(1, (frame - 41 * fps) / (0.6 * fps)));
  return (
    <AbsoluteFill style={{ background: GROUND, fontFamily: FONT, color: "#171715" }}>
      <div
        style={{
          position: "absolute",
          width: 1920,
          height: 1080,
          transform: `scale(${width / 1920})`,
          transformOrigin: "0 0",
          overflow: "hidden",
        }}
      >
        {SHOTS.map((shot) => (
          <Sequence
            key={shot.id}
            from={shot.start * fps}
            durationInFrames={shot.seconds * fps}
            name={shot.id}
          >
            <Camera shot={shot} samples={samples} />
          </Sequence>
        ))}
        {frame >= 41 * fps && frame < 45 * fps ? (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <div
              style={{
                fontSize: 78,
                fontWeight: 500,
                letterSpacing: "-.035em",
                opacity: copyProgress,
              }}
            >
              MotionVideo. Motion worth making.
            </div>
          </AbsoluteFill>
        ) : null}
        {frame >= 45 * fps ? (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <svg
              width={240}
              height={115}
              viewBox={`0 0 ${LOGOMARK_BOX.width} ${LOGOMARK_BOX.height}`}
              aria-label="MotionVideo"
            >
              <path d={LOGOMARK_PATH} fill="#ffbe25" />
            </svg>
          </AbsoluteFill>
        ) : null}
      </div>
      <Audio src={staticFile("cinematic/soundtrack.wav")} />
    </AbsoluteFill>
  );
}
