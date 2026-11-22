import { AbsoluteFill, Audio, Easing, Freeze, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ofKind, type Box, type Placed } from "./spec";
import { hold, leave, pulse, ramp, type Theme } from "./theme";

type LayerProps = { cues: Placed[]; theme: Theme };

const CHROMA_FILTER = "gta-chroma";

/** Source pixel size plus the region of it (fractions) to show. */
export type Crop = { box: Box; sourceWidth: number; sourceHeight: number };

/**
 * The source video sized so `crop.box` covers (or fits inside) a `width` ×
 * `height` area, centred; without a crop the whole source covers the area.
 */
export function CropVideo({
  src,
  crop,
  width,
  height,
  fit = "cover",
  style,
}: {
  src: string;
  crop?: Crop;
  width: number;
  height: number;
  fit?: "cover" | "contain";
  style?: React.CSSProperties;
}) {
  if (!crop) {
    return <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />;
  }
  const { box, sourceWidth: sw, sourceHeight: sh } = crop;
  const pick = fit === "cover" ? Math.max : Math.min;
  const scale = pick(width / (box.w * sw), height / (box.h * sh));
  return (
    <OffthreadVideo
      src={staticFile(src)}
      muted
      style={{
        position: "absolute",
        left: -box.x * sw * scale + (width - box.w * sw * scale) / 2,
        top: -box.y * sh * scale + (height - box.h * sh * scale) / 2,
        width: sw * scale,
        height: sh * scale,
        maxWidth: "none",
        ...style,
      }}
    />
  );
}

/**
 * The source clip with the impact FX that act on the picture itself: zoom
 * punch, shake, chromatic split, the freeze of a `freeze` callout (with a push
 * toward its point) and the grade dip under title cards. The timeline stays 1:1
 * with the source: a freeze holds the picture while the source audio plays on,
 * then the picture rejoins the source at `until`. A source whose aspect differs
 * from `format` is scaled to cover, centered.
 */
export function Footage({ src, cues, theme, crop }: LayerProps & { src: string; crop?: Crop }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, u, intensity, s } = theme;

  let punch = 0;
  let shakeX = 0;
  let shakeY = 0;
  let shakeTurn = 0;
  let split = 0;
  for (const cue of ofKind(cues, "impact")) {
    if (frame < cue.begin || frame >= cue.end) continue;
    const strength = Math.min(cue.strength * intensity, 1.25);
    const t = frame - cue.begin;
    if (cue.effect === "zoom-punch") {
      // Snap in over ~2 frames, then a soft spring back that dips just under 1.
      const attack = s(0.06);
      const back = spring({ frame: t - attack, fps, config: { damping: 10, stiffness: 170, mass: 0.6 } });
      punch +=
        strength * 0.16 * ramp(frame, cue.begin, cue.begin + attack) * (1 - back) * (1 - leave(frame, cue.end, s(0.1)));
    }
    if (cue.effect === "shake") {
      const decay = (1 - t / (cue.end - cue.begin)) ** 1.6 * ramp(frame, cue.begin, cue.begin + s(0.04));
      const amp = strength * 34 * u * decay;
      shakeX += amp * (0.65 * Math.sin(t * 2.7 + 0.4) + 0.35 * Math.sin(t * 5.3 + 2.1));
      shakeY += amp * (0.6 * Math.sin(t * 3.4 + 1.7) + 0.4 * Math.sin(t * 6.1));
      shakeTurn += strength * 1.1 * decay * Math.sin(t * 2.2 + 0.9);
    }
    if (cue.effect === "chromatic") {
      split += strength * 26 * u * pulse(frame, cue.begin, cue.end, s(0.05));
    }
  }

  const freeze = ofKind(cues, "callout").find((cue) => cue.freeze && frame >= cue.begin && frame < cue.end);
  const push = freeze ? 0.07 * hold(frame, freeze, s(1.2), s(0.3)) : 0;
  const freezeGrade = freeze ? hold(frame, freeze, s(0.2), s(0.3)) : 0;
  const card = ofKind(cues, "card").find((cue) => frame >= cue.begin && frame < cue.end);
  const cardGrade = card ? hold(frame, card, s(0.45), s(0.4)) : 0;
  const cardPush = card ? 0.05 * ramp(frame, card.begin, card.end, Easing.inOut(Easing.sin)) : 0;

  // Shake moves the frame, so scale just past the travel to keep edges covered.
  const cover = 1 + (2.4 * (Math.abs(shakeX) + Math.abs(shakeY))) / Math.min(width, height);
  const px = freeze ? (freeze.x - 0.5) * width : 0;
  const py = freeze ? (freeze.y - 0.5) * height : 0;
  const transform = [
    `translate(${shakeX}px, ${shakeY}px) rotate(${shakeTurn}deg)`,
    `translate(${px}px, ${py}px) scale(${1 + push}) translate(${-px}px, ${-py}px)`,
    `scale(${(1 + punch) * (1 + cardPush) * cover})`,
  ].join(" ");
  const filter = [
    split > 0.05 ? `url(#${CHROMA_FILTER})` : "",
    theme.look.grade,
    `saturate(${1 - 0.5 * freezeGrade - 0.7 * cardGrade})`,
    `brightness(${(1 - 0.14 * freezeGrade - 0.48 * cardGrade) * (1 + punch * 0.6)})`,
    `contrast(${1 + 0.08 * freezeGrade + 0.06 * cardGrade})`,
  ].join(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: theme.palette.ink, overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <filter id={CHROMA_FILTER} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
          <feOffset in="red" dx={-split} dy={split * -0.25} result="redShift" />
          <feColorMatrix in="SourceGraphic" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
          <feColorMatrix in="SourceGraphic" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
          <feOffset in="blue" dx={split} dy={split * 0.25} result="blueShift" />
          <feBlend in="redShift" in2="green" mode="screen" result="redGreen" />
          <feBlend in="redGreen" in2="blueShift" mode="screen" />
        </filter>
      </svg>
      <AbsoluteFill style={{ transform, filter }}>
        <Freeze frame={freeze?.begin ?? 0} active={Boolean(freeze)}>
          <CropVideo src={src} crop={crop} width={width} height={height} />
        </Freeze>
      </AbsoluteFill>
      <Audio src={staticFile(src)} />
    </AbsoluteFill>
  );
}

/** Cinema bars: `letterbox` impacts, and the bars every title card closes in. */
export function Letterbox({ cues, theme }: LayerProps) {
  const frame = useCurrentFrame();
  const { s } = theme;
  let bar = 0;
  for (const cue of ofKind(cues, "impact")) {
    if (cue.effect !== "letterbox") continue;
    const depth = theme.height * 0.085 * (0.6 + 0.4 * Math.min(cue.strength * theme.intensity, 1.25));
    bar = Math.max(bar, depth * hold(frame, cue, s(0.5), s(0.45)));
  }
  for (const cue of ofKind(cues, "card")) {
    bar = Math.max(bar, theme.height * 0.11 * hold(frame, cue, s(0.4), s(0.4)));
  }
  if (bar < 0.5) return null;
  const style = { position: "absolute" as const, left: 0, right: 0, height: bar, backgroundColor: "#000" };
  return (
    <AbsoluteFill>
      <div style={{ ...style, top: 0 }} />
      <div style={{ ...style, bottom: 0 }} />
    </AbsoluteFill>
  );
}

/** White-out above every layer: `flash` impacts plus a shutter blink when a callout freezes. */
export function Flash({ cues, theme }: LayerProps) {
  const frame = useCurrentFrame();
  let light = 0;
  for (const cue of ofKind(cues, "impact")) {
    if (cue.effect !== "flash" || frame < cue.begin || frame >= cue.end) continue;
    light = Math.max(light, Math.min(cue.strength * theme.intensity, 1) * 0.9 * pulse(frame, cue.begin, cue.end, 1));
  }
  for (const cue of ofKind(cues, "callout")) {
    const end = cue.begin + theme.s(0.22);
    if (!cue.freeze || frame < cue.begin || frame >= end) continue;
    light = Math.max(light, 0.55 * pulse(frame, cue.begin, end, 1));
  }
  if (light < 0.005) return null;
  return <AbsoluteFill style={{ backgroundColor: "#FFFDF7", opacity: light }} />;
}

/** Film grain from the preset: fresh SVG turbulence every frame, overlaid on the footage. */
export function Grain({ theme }: { theme: Theme }) {
  const frame = useCurrentFrame();
  if (theme.look.grain <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: theme.look.grain, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%" aria-hidden>
        <filter id="gta-grain">
          <feTurbulence type="fractalNoise" baseFrequency={0.9 / theme.u} numOctaves={2} seed={frame % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#gta-grain)" />
      </svg>
    </AbsoluteFill>
  );
}
