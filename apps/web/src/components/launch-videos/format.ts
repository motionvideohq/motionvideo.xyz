import { filmFps, framesToSeconds } from "@/lib/launch-videos";
import type { LaunchFilm, LaunchScene } from "@/lib/launch-videos";

/** `0:07.4`: minutes, then seconds to a tenth, for chapter boundaries. */
export const clock = (seconds: number) => {
  const tenths = Math.round(seconds * 10);
  const minutes = Math.floor(tenths / 600);
  const rest = (tenths % 600) / 10;
  return `${minutes}:${rest.toFixed(1).padStart(4, "0")}`;
};

/** `29s`, or `3.2s` under ten seconds. */
export const lengthLabel = (seconds: number) =>
  seconds < 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`;

/**
 * The film frame showing at `seconds`. Players report currentTime rounded to
 * microseconds (frame 329 at 30 fps reads 10.966666), so a hair of slack
 * keeps a seek to a frame's start from landing on the frame before it.
 */
export const frameAt = (seconds: number, film: LaunchFilm) =>
  Math.floor((seconds * film.fpsNum) / film.fpsDen + 1e-3);

/** A scene's half-open range on its film, in seconds. */
export const sceneRange = (scene: LaunchScene, film: LaunchFilm) => {
  const fps = filmFps(film);
  return {
    start: framesToSeconds(scene.startFrame, fps),
    end: framesToSeconds(scene.endFrame, fps),
  };
};
