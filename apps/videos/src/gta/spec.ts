/**
 * `overlay.json` version 1, the hand-off format of the MotionVideo GTA 6 Clip
 * Pack skills: times are seconds from the start of the source clip. The default
 * holds below are the pack's documented ones (skill `gta-clip`,
 * overlay-spec.md), so a spec without `until` renders here exactly as the
 * skill timed it.
 */
export type Palette = {
  ink: string;
  paper: string;
  heat: string;
  cash: string;
  sun: string;
  sky: string;
};

export type Intensity = "low" | "medium" | "high";

type Timed = { at: number; until?: number };

export type CaptionCue = Timed & { kind: "caption"; text: string; emphasis?: string[] };
export type WantedCue = Timed & { kind: "wanted"; level: number };
export type ImpactEffect = "zoom-punch" | "shake" | "flash" | "chromatic" | "letterbox";
export type ImpactCue = Timed & { kind: "impact"; effect: ImpactEffect; strength: number };
export type CalloutCue = Timed & { kind: "callout"; label: string; x: number; y: number; freeze?: boolean };
export type CounterCue = Timed & {
  kind: "counter";
  label: string;
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
};
export type MinimapCue = Timed & { kind: "minimap"; label: string };
export type PhoneCue = Timed & { kind: "phone"; app: "messages" | "social"; lines: string[] };
export type CardCue = Timed & {
  kind: "card";
  variant: "passed" | "failed" | "busted";
  title: string;
  subtitle?: string;
};

export type Cue =
  | CaptionCue
  | WantedCue
  | ImpactCue
  | CalloutCue
  | CounterCue
  | MinimapCue
  | PhoneCue
  | CardCue;

export type HudSide = "right" | "left";

/** The pack's looks: `vice` sunset stickers, `wasted` noir with red, `neon` glow, `clean` boxed captions. */
export const PRESETS = ["vice", "wasted", "neon", "clean"] as const;
export type Preset = (typeof PRESETS)[number];

/** A rectangle in fractions (0–1) of the source frame. */
export type Box = { x: number; y: number; w: number; h: number };

export type Overlay = {
  version: 1;
  source: {
    path: string;
    width: number;
    height: number;
    fps: number;
    durationSec: number;
    /** The streamer's facecam in the source; required by `layout: "stack"`. */
    facecam?: Box;
  };
  format: {
    aspect: string;
    width: number;
    height: number;
    fps: number;
    /**
     * Optional, default "full" (the source scaled to cover). "stack" is the
     * vertical clipper layout: the facecam in a top band, the gameplay crop
     * below, overlays inside the gameplay band, captions on the divider.
     */
    layout?: "full" | "stack";
    /** `camShare`: top band fraction of the output height (0.2–0.45, default 0.3); `gameplay`: source crop for the bottom band. */
    stack?: { camShare?: number; gameplay?: Box };
  };
  style: {
    /**
     * Optional, default "vice": the look. Sets the palette, faces, caption
     * treatment and footage grade; `palette`, `display` and `text` given here
     * override the preset's.
     */
    preset?: Preset;
    palette?: Partial<Palette>;
    display?: string;
    text?: string;
    intensity: Intensity;
    /**
     * Optional, default "right": the corner the HUD cluster (wanted meter,
     * counter) pins to. "left" mirrors it to the top left and moves the
     * minimap (and the phone in portrait) to the right, e.g. to keep a
     * top-right facecam clear.
     */
    hudSide?: HudSide;
  };
  cues: Cue[];
};

/**
 * A cue placed on the output timeline: `begin` inclusive, `end` exclusive, in
 * frames (named so they never collide with spec fields such as a counter's
 * `from`/`to`). `exit` is the frame its out-animation lands on: `end`, or one
 * second past the clip for cues that run to the last frame, so they hold.
 */
export type Placed<C extends Cue = Cue> = C & { begin: number; end: number; exit: number };

const IMPACT_HOLD: Record<ImpactEffect, number> = {
  "zoom-punch": 0.5,
  shake: 0.4,
  flash: 0.2,
  chromatic: 0.3,
  letterbox: 3,
};

/** Seconds a cue holds when it has no `until`; `next` is the next cue of the same kind. */
function defaultHold(cue: Cue, next: Cue | undefined, clipEnd: number): number {
  switch (cue.kind) {
    case "caption":
      return Math.min(
        Math.max(1, 0.6 + 0.3 * cue.text.split(/\s+/).filter(Boolean).length),
        (next?.at ?? clipEnd) - cue.at,
      );
    case "wanted":
      return cue.level === 0 ? 2 : (next?.at ?? clipEnd) - cue.at;
    case "impact":
      return IMPACT_HOLD[cue.effect];
    case "callout":
      return 1.5;
    case "counter":
      return 1.8;
    case "minimap":
      return 2.5;
    case "phone":
      return 0.8 + 1.4 * cue.lines.length;
    case "card":
      return 3;
  }
}

/** Resolves every cue's window on the output timeline, clamped to the clip. */
export function placeCues(overlay: Overlay, fps: number): Placed[] {
  const clipEnd = overlay.source.durationSec;
  const sorted = [...overlay.cues].sort((a, b) => a.at - b.at);
  return sorted.flatMap((cue, index) => {
    const next = sorted.slice(index + 1).find((other) => other.kind === cue.kind);
    const until = Math.min(cue.until ?? cue.at + defaultHold(cue, next, clipEnd), clipEnd);
    const begin = Math.round(cue.at * fps);
    const end = Math.round(until * fps);
    const exit = until < clipEnd ? end : end + fps;
    return end > begin ? [{ ...cue, begin, end, exit }] : [];
  });
}

export const ofKind = <K extends Cue["kind"]>(cues: Placed[], kind: K) =>
  cues.filter((cue): cue is Placed<Extract<Cue, { kind: K }>> => cue.kind === kind);

export const INTENSITY: Record<Intensity, number> = { low: 0.6, medium: 1, high: 1.35 };

/** Insets in px; `rail` is the right edge reserved for the platform's action buttons. */
export type SafeArea = { top: number; bottom: number; side: number; rail: number };

/**
 * Platform-safe insets in px for the output frame: 9:16 keeps clear of the
 * TikTok/Reels/Shorts caption block below and the action rail on the right.
 */
export function safeArea(width: number, height: number): SafeArea {
  const ratio = width / height;
  if (ratio < 0.7) {
    return { top: height * 0.11, bottom: height * 0.22, side: width * 0.07, rail: width * 0.16 };
  }
  if (ratio < 1.2) {
    return { top: height * 0.08, bottom: height * 0.14, side: width * 0.07, rail: width * 0.1 };
  }
  return { top: height * 0.08, bottom: height * 0.1, side: width * 0.05, rail: width * 0.05 };
}
