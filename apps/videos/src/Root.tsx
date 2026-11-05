import "./index.css";
import { Composition, Folder } from "remotion";
import { DURATION, FPS, MotionVideoLaunch } from "./launch/MotionVideoLaunch";
import { LaunchFilm, calculateLaunchFilmMetadata } from "./film/LaunchFilm";
import film from "./film/shots.json";
import {
  OG_DURATION,
  OG_FPS,
  OG_HEIGHT,
  OG_WIDTH,
  OgVideo,
} from "./og/OgVideo";

/**
 * Every MotionVideo film, one folder per video in Studio. A new video (a
 * product update, a feature film) lives in its own `src/<video>/` directory
 * and registers its composition here.
 */
export const RemotionRoot = () => (
  <>
    <Folder name="film">
      <Composition
        id="LaunchFilmPreview"
        component={LaunchFilm}
        durationInFrames={film.duration * 30}
        fps={30}
        width={960}
        height={540}
        defaultProps={{ mode: "preview" as const, samples: 2, capture: null }}
        calculateMetadata={calculateLaunchFilmMetadata}
      />
      <Composition
        id="LaunchFilm"
        component={LaunchFilm}
        durationInFrames={film.duration * 60}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{ mode: "final" as const, samples: 4, capture: null }}
        calculateMetadata={calculateLaunchFilmMetadata}
      />
    </Folder>
    <Folder name="launch">
      <Composition
        id="MotionVideoLaunch"
        component={MotionVideoLaunch}
        durationInFrames={DURATION}
        fps={FPS}
        width={1280}
        height={720}
      />
    </Folder>
    <Folder name="og">
      <Composition
        id="OgVideo"
        component={OgVideo}
        durationInFrames={OG_DURATION}
        fps={OG_FPS}
        width={OG_WIDTH}
        height={OG_HEIGHT}
      />
    </Folder>
  </>
);
