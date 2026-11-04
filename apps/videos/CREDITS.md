# Credits

All credits live here and in the video description (CC BY credits are required there).

## Cinematic launch film

`CinematicLaunch` is a separate 50-second, **3840 × 2160, 30 fps** film;
the original `MotionVideoLaunch` is unchanged. It records the public site's real
light theme, gallery, category filter, search, photo-print launch-film prompt,
copy confirmation, and Spring animation detail. Gallery creators retain their
on-screen attribution.

The revised cut prioritizes readable panels: restrained camera angles, no added
depth-of-field blur, no grain, and no upscaled low-resolution preview footage.

### Music

- “minimal electronic grove _Techno loop track” by **frankum**:
  https://freesound.org/people/frankum/sounds/397166/
- **CC BY 4.0**: https://creativecommons.org/licenses/by/4.0/
- Found through Openverse:
  https://api.openverse.org/v1/audio/36a9cc52-92dc-447b-a6ab-7b6c86b46a22/
- Uses the public HQ MP3 preview, not the login-protected original. The source
  page and API license were independently checked. An excerpt is gain-adjusted,
  faded, and mixed with effects. Include the attribution and adaptation note
  from `audio/cinematic/music.json` in the published video's description.

### Sound effects

Fresh original-code bank takes from **Earshot 0.4.0**, by Leon Lin (MIT):
https://github.com/Leonxlnx/earshot/tree/v0.4.0

The palette is `pro_click/soft`, `typing_key/light`, `ui_pop/soft`, and
`whoosh_fast/crisp`: no fitted recordings, impacts, or risers. All 17 decoded takes
pass Earshot's model-free artifact audit. `audio/cinematic/sfx.json` retains the
complete MIT notice, pinned source revision, seeds, hashes, measured cue timing,
and audit results. These are model/measurement checks, not human listening approval.

`cinematic-soundtrack.mjs` mixes the approved music excerpt with the effects and
performs measured two-pass loudness normalization targeting −16 LUFS and −1.5 dBTP.
Music fades over the final logo, ending with half a second of silence. Mix evidence
is recorded in `audio/cinematic/mix.json`.

From `apps/videos`:

```sh
pnpm cinematic:capture
pnpm cinematic:audio
pnpm cinematic:preview
```

Capture requires Google Chrome and network access to `motionvideo.xyz`. Playwright's
clock is installed before navigation; CSS animations and media seeks are stepped
at 30 fps. The full viewport is captured at 6×: **8640 × 5400** source images.
The browser starts at that device pixel ratio and uses software compositing;
the GPU path dropped isolated modal/mask layers at this resolution. Time-based
animations retain their phase and completion lifecycle; scroll timelines follow geometry.
`--resume` reuses completed gallery/category captures only at the same frame rate
and capture scale. Assets are generated under ignored `public/cinematic/`;
measured camera coordinates are saved in `src/cinematic/capture.json`.

Audio acquisition requires ffmpeg/ffprobe and network access. SFX generation
bootstraps a pinned, isolated Earshot runtime under `out/earshot-0.4.0`; it needs
git and Python ≥3.12 with venv, and does not upgrade an existing user installation.

`pnpm cinematic:preview` renders `out/cinematic-preview.mp4` at 960 × 540, 30 fps.
`pnpm cinematic:render` renders **`out/cinematic-launch-4k.mp4`** at 3840 × 2160,
30 fps, with two camera exposure samples and no optical defocus or grain. The MP4
is rendered directly to the delivery file, avoiding a second encode and duplicate master.

The following music/SFX credits apply to the **original** launch film only.


## Music

- "What About Action?" by Diego Nava (https://mixkit.co/free-stock-music/tag/corporate/), licensed under Mixkit Stock Music Free License (https://mixkit.co/license/#musicFree).
  Edited for the film: cut and rearranged at bar lines to fit the picture, levels adjusted.

## Sound effects and ambience

Every effect was made in code for this film with earshot forge (audio/forge_sfx.py: physical-synthesis recipes, no recorded audio inside), searched against real CC0 Freesound references found through Openverse, then trimmed, level-adjusted, equalised, panned and pitch-shifted by resampling in the mix.


### CC0 1.0 (public domain dedication)

- "click_02.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "kalimba-Ab5.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "keypress_01.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "keypress_02.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "keypress_03.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "pop_01.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "whoosh_01.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)

## Tools

Edited, mixed and mastered with the real-sound skill (mix.py, master.py) using ffmpeg, NumPy/SciPy, soxr, librosa and pyloudnorm.

