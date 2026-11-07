# Credits

All credits live here and in the video description (CC BY credits are required there).

## Launch film

`LaunchFilm` shows the site's real components on the dev-only `/film` stage
(`apps/web/src/routes/{-$locale}/film.tsx`), fed a fixed set of catalog videos.
Gallery creators keep their on-screen attribution (avatars and handles).

There is no music.

### Sound effects

Fresh original-code bank takes from **Earshot 0.4.0**, by Leon Lin (MIT):
https://github.com/Leonxlnx/earshot/tree/v0.4.0

`scripts/film-foley.py` renders `pro_click/soft`, `typing_key/light` and
`ui_pop/soft` takes from fixed seeds. Every take passes Earshot's model-free
artifact audit. No recordings, models or impacts are used.

## Original launch film (`MotionVideoLaunch`)

The following music and sound credits apply to `MotionVideoLaunch` only.

### Music

- "What About Action?" by Diego Nava (https://mixkit.co/free-stock-music/tag/corporate/), licensed under Mixkit Stock Music Free License (https://mixkit.co/license/#musicFree).
  Edited for the film: cut and rearranged at bar lines to fit the picture, levels adjusted.

### Sound effects and ambience

Every effect was made in code for this film with earshot forge (audio/forge_sfx.py: physical-synthesis recipes, no recorded audio inside), searched against real CC0 Freesound references found through Openverse, then trimmed, level-adjusted, equalised, panned and pitch-shifted by resampling in the mix.


### CC0 1.0 (public domain dedication)

- "click_02.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "kalimba-Ab5.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "keypress_01.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "keypress_02.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "keypress_03.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "pop_01.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)
- "whoosh_01.wav" by MotionVideo (made in code with earshot forge) (audio/forge_sfx.py), licensed under CC0 1.0 (public domain dedication) (https://creativecommons.org/publicdomain/zero/1.0/)

### Tools

Edited, mixed and mastered with the real-sound skill (mix.py, master.py) using ffmpeg, NumPy/SciPy, soxr, librosa and pyloudnorm.

