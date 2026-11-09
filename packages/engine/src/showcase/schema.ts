import { z } from "zod";

import {
  backgroundSchema,
  deviceFrameSchema,
  frameSchema,
  mediaItemSchema,
  overlaysSchema,
  timingSchema,
} from "../schema/common.ts";

const unit = z.number().min(0).max(1);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/u);

export const CARD_RATIOS = {
  auto: null,
  "1:1": 1,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "4:5": 4 / 5,
  "16:10": 16 / 10,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
} as const;
export type CardRatio = keyof typeof CARD_RATIOS;

/** The shared look every Showcase template draws with. */
export const styleSchema = z.object({
  cards: z.object({
    /** Corner radius as a fraction of the card's short side. */
    radius: z.number().min(0).max(0.5),
    /** Border width as a fraction of the card's short side. */
    border: z.number().min(0).max(0.06),
    borderColor: hex,
    // SAFETY: Object.keys of a const object literal lists exactly its keys.
    ratio: z.enum(Object.keys(CARD_RATIOS) as [CardRatio, ...CardRatio[]]),
    /** What the back of a turned card shows. */
    back: z.enum(["mirror", "color"]),
    backColor: hex,
    brightness: z.number().min(0.4).max(1.6),
    frame: deviceFrameSchema,
    frameTone: z.enum(["light", "dark"]),
  }),
  shadow: z.object({
    on: z.boolean(),
    opacity: unit,
    softness: unit,
    offset: unit,
    color: hex,
  }),
  light: z.object({
    on: z.boolean(),
    /** Darkens cards as they turn away from the camera. */
    shade: unit,
    /** A soft highlight across the card. */
    glare: unit,
    /** Moves the highlight across the card over the loop. */
    sweep: z.boolean(),
  }),
  depth: z.object({
    on: z.boolean(),
    amount: unit,
    /** Distance of the sharp plane: 0 nearest card, 1 farthest. */
    focus: unit,
  }),
  camera: z.object({
    fov: z.number().min(10).max(80),
    zoom: z.number().min(0.4).max(2.5),
    /** Degrees around the vertical axis. */
    orbit: z.number().min(-60).max(60),
    /** Degrees around the horizontal axis. */
    tilt: z.number().min(-45).max(45),
    /** Slow seamless camera sway over the loop. */
    drift: unit,
  }),
  finish: z.object({
    grain: unit,
    vignette: unit,
    bloom: unit,
    contrast: z.number().min(0.5).max(1.5),
    saturation: z.number().min(0).max(2),
    exposure: z.number().min(0.5).max(1.5),
  }),
});
export type Style = z.infer<typeof styleSchema>;

export const paramValueSchema = z.union([z.number(), z.string(), z.boolean()]);

export const showcaseDocSchema = z.object({
  v: z.literal(1),
  tool: z.literal("showcase"),
  name: z.string().max(120).default("Untitled project"),
  template: z.string().min(1),
  params: z.record(z.string(), paramValueSchema),
  style: styleSchema,
  /** The one-click look last applied, for the UI only. */
  look: z.string().optional(),
  /** Media used outside the cards: the logo and a media background. */
  assets: z.array(mediaItemSchema).max(4).default([]),
  /** Keep the current style when switching templates. */
  keepLook: z.boolean().default(false),
  media: z.array(mediaItemSchema).max(60),
  mediaOrder: z.enum(["in-order", "shuffle"]).default("in-order"),
  seed: z.number().int().min(0).default(1),
  frame: frameSchema,
  timing: timingSchema,
  background: backgroundSchema,
  overlays: overlaysSchema,
});
export type ShowcaseDoc = z.infer<typeof showcaseDocSchema>;
export type ShowcaseDocInput = z.input<typeof showcaseDocSchema>;
