import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction } from "remotion";
import { Callouts } from "./Callout";
import { Captions } from "./Caption";
import { Cards } from "./Card";
import { Counters } from "./Counter";
import { CropVideo, Flash, Footage, Grain, Letterbox, type Crop } from "./Footage";
import { Minimaps } from "./Minimap";
import { Phones } from "./Phone";
import { ofKind, placeCues, type Overlay, type Placed } from "./spec";
import { hold, makeStack, makeTheme, type Stack, type Theme } from "./theme";
import { Wanted } from "./Wanted";
import sample from "./sample.overlay.json";

export type GtaClipProps = {
  /** The source clip, relative to `public/` (scripts/render-gta.mjs passes `gta/in/<clip>`). */
  src: string;
  overlay: Overlay;
};

export const GTA_SAMPLE: GtaClipProps = { src: "gta/in/sample.mp4", overlay: sample as Overlay };

/**
 * Renders a MotionVideo GTA 6 Clip Pack `overlay.json` (spec v1) over the
 * source clip. Layers bottom → top: footage (zoom punch, shake, chromatic,
 * freeze, grade dip), letterbox bars, callouts, HUD (wanted, counter, minimap,
 * phone; hidden under title cards), captions, cards, flash. With
 * `format.layout: "stack"` the footage, callouts and HUD live in the gameplay
 * band and the facecam band sits above it, untouched by impacts and freezes.
 */
export function GtaClip({ src, overlay }: GtaClipProps) {
  const { fps } = useVideoConfig();
  const cues = useMemo(() => placeCues(overlay, fps), [overlay, fps]);
  const stack = useMemo(() => makeStack(overlay), [overlay]);
  const theme = useMemo(() => stack?.frame ?? makeTheme(overlay), [overlay, stack]);
  const { width: sourceWidth, height: sourceHeight } = overlay.source;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.palette.ink }}>
      {stack ? (
        <>
          <Facecam src={src} cues={cues} stack={stack} crop={{ box: stack.facecam, sourceWidth, sourceHeight }} />
          <div style={{ position: "absolute", left: 0, top: stack.camH, width: theme.width, height: stack.band.height, overflow: "hidden" }}>
            <Gameplay src={src} cues={cues} theme={stack.band} crop={{ box: stack.gameplay, sourceWidth, sourceHeight }} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: stack.camH - 3 * theme.u,
              height: 6 * theme.u,
              backgroundColor: theme.palette.ink,
            }}
          />
        </>
      ) : (
        <Gameplay src={src} cues={cues} theme={theme} />
      )}
      <Letterbox cues={cues} theme={theme} />
      <Captions cues={cues} theme={theme} />
      <Cards cues={cues} theme={theme} />
      <Flash cues={cues} theme={theme} />
    </AbsoluteFill>
  );
}

/** Footage, callouts and the HUD (hidden under title cards), in `theme`'s frame. */
function Gameplay({ src, cues, theme, crop }: { src: string; cues: Placed[]; theme: Theme; crop?: Crop }) {
  const frame = useCurrentFrame();
  const card = ofKind(cues, "card").find((cue) => frame >= cue.begin && frame < cue.end);
  const hud = 1 - (card ? hold(frame, card, theme.s(0.25), theme.s(0.3)) : 0);
  return (
    <AbsoluteFill>
      <Footage src={src} cues={cues} theme={theme} crop={crop} />
      <Grain theme={theme} />
      <Callouts cues={cues} theme={theme} />
      <AbsoluteFill style={{ opacity: hud }}>
        <Wanted cues={cues} theme={theme} />
        <Counters cues={cues} theme={theme} />
        <Minimaps cues={cues} theme={theme} />
        <Phones cues={cues} theme={theme} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/**
 * The facecam band: the cam fitted to the band's height over a blurred,
 * darkened cover of itself. It keeps playing through freezes (the reaction is
 * the point) and only takes the title cards' grade dip.
 */
function Facecam({ src, cues, stack, crop }: { src: string; cues: Placed[]; stack: Stack; crop: Crop }) {
  const frame = useCurrentFrame();
  const { width, s } = stack.frame;
  const card = ofKind(cues, "card").find((cue) => frame >= cue.begin && frame < cue.end);
  const dip = card ? hold(frame, card, s(0.45), s(0.4)) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height: stack.camH,
        overflow: "hidden",
        filter: `${stack.frame.look.grade} saturate(${1 - 0.7 * dip}) brightness(${1 - 0.48 * dip})`,
      }}
    >
      <CropVideo
        src={src}
        crop={crop}
        width={width}
        height={stack.camH}
        style={{ filter: "blur(28px) brightness(0.55)", transform: "scale(1.08)" }}
      />
      <CropVideo src={src} crop={crop} width={width} height={stack.camH} fit="contain" />
    </div>
  );
}

/** Size, fps and length come from the spec: `format` for the frame, `source.durationSec` for the timeline. */
export const calculateGtaClipMetadata: CalculateMetadataFunction<GtaClipProps> = ({ props }) => {
  const { format, source } = props.overlay;
  if (props.overlay.version !== 1) throw new Error(`overlay.json version ${String(props.overlay.version)} is not supported (expected 1)`);
  const { hudSide } = props.overlay.style;
  if (hudSide !== undefined && hudSide !== "right" && hudSide !== "left") {
    throw new Error(`overlay.json style.hudSide must be "right" or "left", got ${JSON.stringify(hudSide)}`);
  }
  return {
    width: format.width,
    height: format.height,
    fps: format.fps,
    durationInFrames: Math.max(1, Math.round(source.durationSec * format.fps)),
  };
};
