import type { FontFamily } from "../schema/common.ts";

/** Families that only ship regular weight; the UI hides the weight control. */
export const SINGLE_WEIGHT_FONTS: Partial<Record<FontFamily, true>> = {
  "Instrument Serif": true,
};
