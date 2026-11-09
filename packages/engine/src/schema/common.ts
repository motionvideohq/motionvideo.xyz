import { z } from "zod";

// Shapes shared by every MotionVideo Create tool. A project is one JSON
// document; the editor, project files and (later) the MCP tool, CLI and API
// all read and write the same shape.

export const ASPECTS = {
  "16:9": [16, 9],
  "9:16": [9, 16],
  "1:1": [1, 1],
  "4:5": [4, 5],
  "5:4": [5, 4],
  "4:3": [4, 3],
  "3:4": [3, 4],
  "21:9": [21, 9],
  "2:3": [2, 3],
} as const satisfies Record<string, readonly [number, number]>;

export type Aspect = keyof typeof ASPECTS;
// SAFETY: Object.keys of a const object literal lists exactly its keys.
export const ASPECT_IDS = Object.keys(ASPECTS) as [Aspect, ...Aspect[]];
export const aspectSchema = z.enum(ASPECT_IDS);

export const aspectRatio = (aspect: Aspect) => {
  const [w, h] = ASPECTS[aspect];
  return w / h;
};

/**
 * Social presets set the frame and suggest an output size; their safe zone
 * (fractions of the frame kept clear of platform UI) is drawn over the
 * preview only, never exported.
 */
export const SOCIAL_PRESETS = {
  reels: {
    aspect: "9:16",
    height: 1920,
    fps: 30,
    safe: { top: 0.14, bottom: 0.2, left: 0.06, right: 0.12 },
  },
  story: {
    aspect: "9:16",
    height: 1920,
    fps: 30,
    safe: { top: 0.12, bottom: 0.14, left: 0.06, right: 0.06 },
  },
  feed: { aspect: "4:5", height: 1350, fps: 30, safe: null },
  square: { aspect: "1:1", height: 1080, fps: 30, safe: null },
  linkedin: { aspect: "16:9", height: 1080, fps: 30, safe: null },
  youtube: { aspect: "16:9", height: 2160, fps: 30, safe: null },
  dribbble: { aspect: "4:3", height: 1200, fps: 30, safe: null },
} as const satisfies Record<
  string,
  {
    aspect: Aspect;
    height: number;
    fps: number;
    safe: { top: number; bottom: number; left: number; right: number } | null;
  }
>;

export type SocialPreset = keyof typeof SOCIAL_PRESETS;
export const socialPresetSchema = z.enum(
  // SAFETY: Object.keys of a const object literal lists exactly its keys.
  Object.keys(SOCIAL_PRESETS) as [SocialPreset, ...SocialPreset[]]
);

export const DEVICE_FRAMES = [
  "none",
  "browser",
  "phone",
  "tablet",
  "laptop",
] as const;
export type DeviceFrame = (typeof DEVICE_FRAMES)[number];
export const deviceFrameSchema = z.enum(DEVICE_FRAMES);

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/u);

/** Where a media item's bytes live; each surface resolves it to a URL. */
export const mediaRefSchema = z.discriminatedUnion("type", [
  // A blob in the editor's IndexedDB.
  z.object({ type: z.literal("local"), key: z.string().min(1) }),
  // A file in MotionVideo's sample library.
  z.object({ type: z.literal("library"), path: z.string().min(1) }),
  // Any CORS-enabled URL (API, CLI, cloud-synced projects).
  z.object({ type: z.literal("url"), url: z.url() }),
]);
export type MediaRef = z.infer<typeof mediaRefSchema>;

const unit = z.number().min(0).max(1);

export const mediaItemSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["image", "video"]),
  ref: mediaRefSchema,
  name: z.string().max(200).default(""),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Seconds; videos only. */
  duration: z.number().positive().optional(),
  fit: z.enum(["cover", "contain"]).default("cover"),
  /** Focal point for cover crops, 0–1 from the top left. */
  focus: z.object({ x: unit, y: unit }).default({ x: 0.5, y: 0.5 }),
  /** Crop rectangle in 0–1 of the source, applied before fitting. */
  crop: z
    .object({ x: unit, y: unit, w: unit, h: unit })
    .refine((c) => c.w > 0.01 && c.h > 0.01)
    .optional(),
  /** Seconds into the source; videos only. */
  trim: z
    .object({ start: z.number().min(0), end: z.number().positive() })
    .refine((t) => t.end > t.start)
    .optional(),
  /** Overrides the project's device frame for this item. */
  frame: deviceFrameSchema.optional(),
  /** A screenshot taller than its frame scrolls through it over the loop. */
  scroll: z.boolean().default(false),
  /** After the trimmed clip ends: start again, or hold its last frame. */
  end: z.enum(["loop", "hold"]).default("loop"),
});
export type MediaItem = z.infer<typeof mediaItemSchema>;

export const backgroundSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solid"), color: hex }),
  z.object({
    type: z.literal("linear"),
    colors: z.array(hex).min(2).max(4),
    angle: z.number().min(0).max(360),
  }),
  z.object({
    type: z.literal("radial"),
    colors: z.array(hex).min(2).max(4),
    x: unit,
    y: unit,
  }),
  z.object({
    type: z.literal("mesh"),
    colors: z.array(hex).length(4),
    speed: z.number().min(0).max(3),
  }),
  z.object({
    type: z.literal("media"),
    media: z.string().min(1),
    dim: unit,
    blur: unit,
  }),
  z.object({ type: z.literal("transparent") }),
]);
export type Background = z.infer<typeof backgroundSchema>;

export const FONTS = [
  "Inter",
  "Geist",
  "Manrope",
  "DM Sans",
  "Space Grotesk",
  "Bricolage Grotesque",
  "Syne",
  "Unbounded",
  "Instrument Serif",
  "Playfair Display",
  "JetBrains Mono",
] as const;
export type FontFamily = (typeof FONTS)[number];
export const fontSchema = z.enum(FONTS);

export const CORNERS = ["tl", "tr", "bl", "br"] as const;
export type Corner = (typeof CORNERS)[number];

export const overlaysSchema = z.object({
  title: z
    .object({
      on: z.boolean(),
      text: z.string().max(140),
      font: fontSchema,
      weight: z.union([
        z.literal(400),
        z.literal(500),
        z.literal(600),
        z.literal(700),
      ]),
      /** Font size as a fraction of the frame height. */
      size: z.number().min(0.02).max(0.3),
      color: hex,
      /** Vertical centre, 0 top to 1 bottom. */
      y: unit,
    })
    .default({
      on: false,
      text: "Selected work",
      font: "Inter",
      weight: 600,
      size: 0.08,
      color: "#ffffff",
      y: 0.5,
    }),
  labels: z
    .object({
      on: z.boolean(),
      tl: z.string().max(60),
      tr: z.string().max(60),
      bl: z.string().max(60),
      br: z.string().max(60),
      font: fontSchema,
      size: z.number().min(0.01).max(0.06),
      /** "auto" picks black or white against the background. */
      color: z.union([z.literal("auto"), hex]),
    })
    .default({
      on: false,
      tl: "Studio",
      tr: "Selected work",
      bl: "2026",
      br: "motionvideo.xyz",
      font: "Inter",
      size: 0.022,
      color: "auto",
    }),
  logo: z
    .object({
      on: z.boolean(),
      media: z.string().optional(),
      corner: z.enum(CORNERS),
      /** Width as a fraction of the frame width. */
      size: z.number().min(0.04).max(0.4),
      opacity: unit,
    })
    .default({ on: false, corner: "br", size: 0.12, opacity: 1 }),
  /** Overlays animate in at the start and out at the end of the clip. */
  anim: z
    .object({
      on: z.boolean(),
      kind: z.enum(["rise", "fade", "blur"]),
    })
    .default({ on: false, kind: "rise" }),
});
export type Overlays = z.infer<typeof overlaysSchema>;

export const timingSchema = z.object({
  /** Whole loops of the template; keeps the clip seamless. */
  loops: z.number().int().min(1).max(4).default(1),
  /** Overrides `loops` with an exact length in seconds. */
  seconds: z.number().min(1).max(60).optional(),
});
export type Timing = z.infer<typeof timingSchema>;

export const frameSchema = z.object({
  aspect: aspectSchema.default("16:9"),
  social: socialPresetSchema.optional(),
});
