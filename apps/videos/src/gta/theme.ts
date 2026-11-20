import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Easing, interpolate, spring, type SpringConfig } from "remotion";
import { INTENSITY, safeArea, type Box, type HudSide, type Overlay, type Palette, type Placed, type Preset, type SafeArea } from "./spec";

// Loaded through @remotion/google-fonts so the mp4 gets the real face, not a
// fallback. Only open (OFL) faces: the pack never ships Pricedown or Rockstar art.
const { fontFamily: ANTON } = loadAnton("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: BEBAS_NEUE } = loadBebasNeue("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: INTER } = loadInter("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

/** The faces `style.display` / `style.text` may name; anything else renders in the preset's. */
const FACES: Record<string, string> = { Anton: ANTON, "Bebas Neue": BEBAS_NEUE, Inter: INTER };

/** How captions are drawn: ink-outlined stickers, neon glow, or solid boxes. */
export type CaptionLook = "sticker" | "glow" | "box";

/** What a preset sets; the spec's `palette`, `display` and `text` override it. */
type Look = {
  palette: Palette;
  display: string;
  text: string;
  caption: CaptionLook;
  /** Display weight for captions and cards. */
  weight: number;
  /** Extra CSS filter on the gameplay footage. */
  grade: string;
  /** Film-grain opacity over the footage (0 = none). */
  grain: number;
};

export const LOOKS: Record<Preset, Look> = {
  // Vice City sunset: sticker captions with a thick ink outline, warm accents.
  vice: {
    palette: { ink: "#0B0B0F", paper: "#F5F1E8", heat: "#FF3B6B", cash: "#7CFF6B", sun: "#FF9E3D", sky: "#38C6FF" },
    display: ANTON,
    text: INTER,
    caption: "sticker",
    weight: 400,
    grade: "",
    grain: 0,
  },
  // Noir: near-monochrome grade with grain, one red accent.
  wasted: {
    palette: { ink: "#0A0A0A", paper: "#FFFFFF", heat: "#E10600", cash: "#E10600", sun: "#E10600", sky: "#FFFFFF" },
    display: BEBAS_NEUE,
    text: INTER,
    caption: "sticker",
    weight: 400,
    grade: "grayscale(0.85) contrast(1.18) brightness(0.96)",
    grain: 0.14,
  },
  // Night drive: magenta and cyan glow, punchier saturation.
  neon: {
    palette: { ink: "#07041A", paper: "#F4F0FF", heat: "#FF2BD6", cash: "#3CFFB4", sun: "#00E5FF", sky: "#8A5CFF" },
    display: ANTON,
    text: INTER,
    caption: "glow",
    weight: 400,
    grade: "saturate(1.3) contrast(1.06)",
    grain: 0,
  },
  // Clean: heavy sans in solid boxes, yellow emphasis; the footage untouched.
  clean: {
    palette: { ink: "#111111", paper: "#FFFFFF", heat: "#FFD400", cash: "#2BD96B", sun: "#FFD400", sky: "#4DA3FF" },
    display: INTER,
    text: INTER,
    caption: "box",
    weight: 800,
    grade: "",
    grain: 0,
  },
};

export type Theme = {
  palette: Palette;
  display: string;
  text: string;
  /** Caption treatment, display weight, footage grade and grain from `style.preset`. */
  look: Pick<Look, "caption" | "weight" | "grade" | "grain">;
  /** Impact multiplier from `style.intensity`. */
  intensity: number;
  /** One design unit: 1px on a 1080-short-side frame. */
  u: number;
  width: number;
  height: number;
  safe: SafeArea;
  /** Seconds → frames at the output fps, never below one frame. */
  s: (seconds: number) => number;
  /** Corner the HUD cluster takes (`style.hudSide`, default "right"). */
  hud: HudSide;
  layout: Layout;
};

/** An element pinned to one vertical edge: `inset` px from that edge, `y` px from the frame top. */
type Pin = { side: HudSide; inset: number; y: number };

/**
 * Where every overlay sits, in px, per aspect and `hudSide`: the pack's layout
 * table (gta-clip references/platforms.md, "Where each overlay goes").
 * Captions, callouts and cards do not move with `hudSide`.
 */
export type Layout = {
  /** Top edge at `y`. */
  wanted: Pin;
  /** Top edge at `y`; always left, under the meter's slot when the HUD is left. */
  counter: Pin;
  /** Bottom edge at `y` px from the frame top; the tag sits on the inner side of the map. */
  minimap: Pin;
  phone: { left: number; top: number; width: number; height: number };
  /** Caption block: horizontal centre, and its last line's bottom in px from the top. */
  caption: { x: number; bottom: number };
  /** Title-card title centre. */
  card: { x: number; y: number };
};

/** Handset width : height. */
const PHONE_RATIO = 0.525;

function makeLayout(width: number, height: number, hud: HudSide): Layout {
  const ratio = width / height;
  const left = hud === "left";
  const W = (fraction: number) => fraction * width;
  const H = (fraction: number) => fraction * height;
  if (ratio < 0.7) {
    const w = W(0.46);
    return {
      wanted: left ? { side: "left", inset: W(0.06), y: H(0.13) } : { side: "right", inset: W(0.14), y: H(0.13) },
      counter: { side: "left", inset: W(0.06), y: H(left ? 0.18 : 0.13) },
      minimap: left ? { side: "right", inset: W(0.14), y: H(0.76) } : { side: "left", inset: W(0.06), y: H(0.76) },
      phone: { left: W(0.06), top: H(0.47) - w / PHONE_RATIO / 2, width: w, height: w / PHONE_RATIO },
      caption: { x: W(0.46), bottom: H(0.69) },
      card: { x: W(0.46), y: H(0.45) },
    };
  }
  const square = ratio < 1.2;
  const tall = H(square ? 0.72 : 0.76);
  return {
    wanted: { side: hud, inset: W(0.05), y: H(0.06) },
    counter: { side: "left", inset: W(0.05), y: H(left ? 0.15 : 0.06) },
    minimap: { side: left ? "right" : "left", inset: W(square ? 0.05 : 0.04), y: H(0.95) },
    phone: {
      left: left ? W(0.05) : W(0.95) - tall * PHONE_RATIO,
      top: H(square ? 0.5 : 0.52) - tall / 2,
      width: tall * PHONE_RATIO,
      height: tall,
    },
    caption: { x: W(0.5), bottom: H(square ? 0.81 : 0.85) },
    card: { x: W(0.5), y: H(square ? 0.5 : 0.46) },
  };
}

export function makeTheme(overlay: Overlay): Theme {
  const { width, height, fps } = overlay.format;
  const hud = overlay.style.hudSide ?? "right";
  const look = LOOKS[overlay.style.preset ?? "vice"];
  return {
    palette: { ...look.palette, ...overlay.style.palette },
    display: (overlay.style.display && FACES[overlay.style.display]) || look.display,
    text: (overlay.style.text && FACES[overlay.style.text]) || look.text,
    look: { caption: look.caption, weight: look.weight, grade: look.grade, grain: look.grain },
    intensity: INTENSITY[overlay.style.intensity] ?? 1,
    u: Math.min(width, height) / 1080,
    width,
    height,
    safe: safeArea(width, height),
    s: (seconds) => Math.max(1, Math.round(seconds * fps)),
    hud,
    layout: makeLayout(width, height, hud),
  };
}

/** The vertical clipper layout (`format.layout: "stack"`): facecam band on top, gameplay band below. */
export type Stack = {
  /** Full frame: captions (on the divider), cards, letterbox, flash. */
  frame: Theme;
  /** Gameplay band: footage, callouts and HUD, in coordinates local to the band. */
  band: Theme;
  /** Height of the facecam band; the gameplay band starts here. */
  camH: number;
  facecam: Box;
  /** Source crop shown in the gameplay band. */
  gameplay: Box;
};

/** A source crop with the band's aspect, full height, centred, moved off the facecam when it overlaps. */
function defaultGameplay(overlay: Overlay, aspect: number, facecam: Box): Box {
  const { width: sw, height: sh } = overlay.source;
  const w = Math.min(1, (sh * aspect) / sw);
  const h = Math.min(1, (sw * w) / aspect / sh);
  let x = (1 - w) / 2;
  const overlaps = x < facecam.x + facecam.w && x + w > facecam.x;
  if (overlaps) {
    const before = facecam.x - w;
    const after = facecam.x + facecam.w;
    if (facecam.x + facecam.w / 2 > 0.5 && before >= 0) x = before;
    else if (after + w <= 1) x = after;
  }
  return { x, y: (1 - h) / 2, w, h };
}

export function makeStack(overlay: Overlay): Stack | null {
  if (overlay.format.layout !== "stack") return null;
  const facecam = overlay.source.facecam;
  if (!facecam) throw new Error('overlay.json format.layout "stack" needs source.facecam');
  const frame = makeTheme(overlay);
  const { width, height } = overlay.format;
  const { u, safe } = frame;
  const share = Math.min(0.45, Math.max(0.2, overlay.format.stack?.camShare ?? 0.3));
  const camH = Math.round(height * share);
  const bandH = height - camH;
  const gameplay = overlay.format.stack?.gameplay ?? defaultGameplay(overlay, width / bandH, facecam);
  const left = frame.hud === "left";
  // The band ends at the frame bottom, so the platform's caption block and
  // action rail still apply; its top only clears the divider caption.
  const bandSafe: SafeArea = { top: 120 * u, bottom: safe.bottom, side: safe.side, rail: safe.rail };
  const hudY = 120 * u;
  const phoneH = Math.min((width * 0.42) / PHONE_RATIO, bandH - safe.bottom - hudY - 20 * u);
  const bandLayout: Layout = {
    wanted: left ? { side: "left", inset: safe.side, y: hudY } : { side: "right", inset: safe.rail, y: hudY },
    counter: { side: "left", inset: safe.side, y: left ? hudY + 100 * u : hudY },
    minimap: left
      ? { side: "right", inset: safe.rail, y: bandH - safe.bottom }
      : { side: "left", inset: safe.side, y: bandH - safe.bottom },
    phone: { left: safe.side, top: hudY + 10 * u, width: phoneH * PHONE_RATIO, height: phoneH },
    caption: frame.layout.caption,
    card: frame.layout.card,
  };
  // Captions straddle the divider: the last line's centre sits on it.
  const captionSize = 118 * u;
  return {
    frame: {
      ...frame,
      layout: { ...frame.layout, caption: { x: width / 2, bottom: camH + captionSize * 0.55 } },
    },
    band: { ...frame, height: bandH, safe: bandSafe, layout: bandLayout },
    camH,
    facecam,
    gameplay,
  };
}

/** Decelerating entrance curve (expo-like) and its accelerating exit mirror. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

export const SNAP: Partial<SpringConfig> = { damping: 14, stiffness: 190, mass: 0.6 };
export const SETTLE: Partial<SpringConfig> = { damping: 20, stiffness: 120, mass: 0.8 };

/** 0 → 1 spring that starts `delay` frames after `from`. */
export const enter = (
  frame: number,
  from: number,
  fps: number,
  config: Partial<SpringConfig> = SNAP,
  delay = 0,
) => spring({ frame: frame - from - delay, fps, config });

/** 0 → 1 over the `frames` before `to`: how far a layer has left. */
export const leave = (frame: number, to: number, frames: number) =>
  interpolate(frame, [to - frames, to], [0, 1], {
    easing: EASE_IN,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Eased 0 → 1 between two frames. */
export const ramp = (frame: number, start: number, end: number, easing = EASE_OUT) =>
  interpolate(frame, [start, end], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Thick ink outline drawn behind the fill, the sticker look every overlay shares. */
export const outline = (ink: string, width: number) => ({
  WebkitTextStroke: `${width}px ${ink}`,
  paintOrder: "stroke fill" as const,
});

/** Hit envelope: eased rise over `attack` frames, then a decelerating fall that lands on 0 at `to`. */
export const pulse = (frame: number, from: number, to: number, attack: number) =>
  ramp(frame, from, from + attack) * (1 - ramp(frame, from + attack, to, Easing.out(Easing.cubic)));

/** 0 → 1 while a cue's window is open: eased in over `inFrames`, eased out over its last `outFrames`. */
export const hold = (frame: number, cue: Placed, inFrames: number, outFrames: number) =>
  frame < cue.begin || frame >= cue.end
    ? 0
    : ramp(frame, cue.begin, cue.begin + inFrames) * (1 - leave(frame, cue.exit, outFrames));

let ruler: CanvasRenderingContext2D | null = null;

/** Rendered width of one line of text in a loaded face, so layouts can fit and flip labels exactly. */
export function textWidth(text: string, family: string, size: number, weight = 400): number {
  ruler ??= document.createElement("canvas").getContext("2d");
  if (!ruler) return text.length * size * 0.5;
  ruler.font = `${weight} ${size}px "${family}"`;
  return ruler.measureText(text).width;
}
