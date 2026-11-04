import "./index.css";
import { Composition, Folder } from "remotion";
import { DURATION, FPS, MotionVideoLaunch } from "./launch/MotionVideoLaunch";
import { CINEMATIC_DURATION, CINEMATIC_FPS, CinematicLaunch } from "./cinematic/CinematicLaunch";
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
    <Folder name="cinematic">
      <Composition
        id="CinematicLaunch"
        component={CinematicLaunch}
        durationInFrames={CINEMATIC_DURATION}
        fps={CINEMATIC_FPS}
        width={3840}
        height={2160}
        defaultProps={{ samples: 2 }}
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
