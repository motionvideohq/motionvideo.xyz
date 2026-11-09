import type { DeepPartial } from "../kit/merge.ts";
import type { CardRatio, Style } from "./schema.ts";

/** A template control, rendered by the editor from this description. */
export type ParamDef =
  | {
      type: "range";
      key: string;
      label: string;
      min: number;
      max: number;
      step: number;
      default: number;
      unit?: string;
    }
  | {
      type: "select";
      key: string;
      label: string;
      options: readonly { value: string; label: string }[];
      default: string;
    }
  | { type: "toggle"; key: string; label: string; default: boolean };

export type ParamValues = Record<string, number | string | boolean>;

/** Everything a template's layout can read for the current frame. */
export interface LayoutContext {
  /** Number of cards on screen. */
  n: number;
  /** Loop progress in [0, 1); the clip ends exactly where it starts. */
  p: number;
  /** 1 forwards, -1 backwards. */
  dir: 1 | -1;
  params: ParamValues;
  /** Frame size in world units: the frame is 2 units tall at z = 0. */
  frameW: number;
  frameH: number;
  /** Card size in world units at scale 1. */
  cardW: number;
  cardH: number;
  seed: number;
}

/** Where one card is on this frame. Rotations are radians, XYZ order. */
export interface CardPose {
  position: [number, number, number];
  rotation?: [number, number, number];
  /** Uniform scale on top of the card size. */
  scale?: number;
  /** Non-uniform scale, multiplied with `scale`. */
  stretch?: [number, number];
  opacity?: number;
  /** Multiplies the card's brightness, e.g. to dim cards in the back. */
  brightness?: number;
  /** Extra blur on top of depth of field, 0–1. */
  blur?: number;
  /** Which media item to show; defaults to the card's own slot. */
  media?: number;
  /** Draw order for cards at the same depth; higher draws later. */
  order?: number;
}

export interface TemplateDef {
  id: string;
  name: string;
  collection: CollectionId;
  description: string;
  tier: "free" | "pro";
  /** Card count range; the `count` control moves within it. */
  slots: { min: number; default: number; max: number };
  /** One loop at speed 1, in seconds. */
  baseLoopSeconds: number;
  /** Card ratio used when the style's ratio is "auto". */
  cardRatio: Exclude<CardRatio, "auto">;
  /** Card height in world units at scale 1 (the frame is 2 tall). */
  cardHeight: number;
  params: readonly ParamDef[];
  /** The look this template starts with, layered over the base style. */
  style?: DeepPartial<Style>;
  /** The MotionVideo move the template is built on. */
  move?: string;
  /**
   * Cards to draw this frame. Return one pose per card; templates that show
   * more cards than `n` (walls, rows) return as many as they need and set
   * `media` on each.
   */
  layout: (ctx: LayoutContext) => CardPose[];
}

export const COLLECTIONS = [
  "carousel",
  "orbit",
  "stack",
  "depth",
  "sequence",
  "device",
] as const;
export type CollectionId = (typeof COLLECTIONS)[number];
