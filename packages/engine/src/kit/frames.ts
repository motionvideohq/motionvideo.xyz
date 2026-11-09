import type { DeviceFrame } from "../schema/common.ts";

// Device frames are drawn by the card shader (kit/card-shader.ts) inside the
// card's box. This module mirrors the shader's geometry in JS so shadows and
// "auto" card ratios match what the shader draws.

export const FRAME_IDS: Record<DeviceFrame, number> = {
  none: 0,
  browser: 1,
  phone: 2,
  tablet: 3,
  laptop: 4,
};

/** Natural width/height of each framed device, bezels included. */
export const FRAME_RATIOS: Record<Exclude<DeviceFrame, "none">, number> = {
  browser: 16 / 10.6,
  phone: 9 / 19.5,
  tablet: 3 / 4,
  laptop: 16 / 11.2,
};

/**
 * The device's outer box inside a card of `w`×`h` world units, centred, as
 * [width, height]. Browser windows fill the card; fixed-shape devices fit
 * inside it. Tablets turn to landscape in landscape cards.
 */
export const frameBox = (
  frame: DeviceFrame,
  w: number,
  h: number
): [number, number] => {
  if (frame === "none" || frame === "browser") {
    return [w, h];
  }
  const natural = FRAME_RATIOS[frame];
  const ratio = frame === "tablet" && w > h ? 1 / natural : natural;
  return w / h > ratio ? [h * ratio, h] : [w, w / ratio];
};
