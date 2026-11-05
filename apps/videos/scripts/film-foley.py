# Foley for the launch film (src/film): one quiet, tactile cue per visible
# action, over silence. No music, no impacts; the copy and logo play silent.
# Every take is a fresh seeded render from Earshot's original-code forge bank.
#
# Run through scripts/film-foley.mjs (`pnpm film:foley`), which sets up the
# pinned Earshot runtime in out/earshot-0.4.0 on first run.
import json
import math
from pathlib import Path

import numpy as np
import soundfile as sf
import earshot
from earshot.forge import bank, sfx

root = Path(__file__).resolve().parent.parent
film = json.loads((root / "src/film/shots.json").read_text())
shots = {shot["id"]: shot for shot in film["shots"]}
assert earshot.__version__ == "0.4.0", earshot.__version__

SR = 48000
mix = np.zeros((round(film["duration"] * SR), 2), dtype=np.float64)

# Action times mirror scripts/capture-film.mjs (shot-relative seconds).
QUERY = "motion techniques"
cues = [
    dict(name="chip", sound="pro_click/soft", seed=731101, at=shots["chip"]["start"] + 0.6, peak_db=-21),
    dict(name="result", sound="pro_click/soft", seed=731102, at=shots["search"]["start"] + 3.3, peak_db=-26),
    dict(name="show-all", sound="pro_click/soft", seed=731103, at=shots["prompt"]["start"] + 1.9, peak_db=-24),
    dict(name="copy", sound="pro_click/soft", seed=731104, at=shots["copy"]["start"] + 0.7, peak_db=-20),
    dict(name="copied", sound="ui_pop/soft", seed=731105, at=shots["copy"]["start"] + 0.82, peak_db=-27),
]
# A key tick per character, on the 60 fps frame where it first shows.
for i, char in enumerate(QUERY):
    at = shots["search"]["start"] + math.ceil((0.5 + (i + 1) / 12.5) * 60) / 60
    cues.append(dict(name=f"key-{i + 1:02d}", sound="typing_key/light", seed=731201 + i,
                     at=at, peak_db=-29 + (i % 3) * 0.6))

for cue in cues:
    if bank.get(cue["sound"])["type"] != "forge":
        raise RuntimeError(f"Refusing non-original-code bank entry {cue['sound']}")
    for reroll in range(16):
        y, meta = bank.render(cue["sound"], seed=cue["seed"] + reroll * 1000, peak_db=cue["peak_db"])
        if meta["checks"]["ok"]:
            break
    else:
        raise RuntimeError(f"No clean take for {cue['name']}")
    y = np.column_stack([y, y]) if y.ndim == 1 else (np.repeat(y, 2, axis=1) if y.shape[1] == 1 else y)
    audit = sfx.check(y, category=bank.get(cue["sound"])["category"], sound=cue["sound"])
    if not audit["ok"]:
        raise RuntimeError(f"Take failed audit: {cue['name']}: {audit['warnings']}")
    start = round((cue["at"] - bank.measure(y)["onset_s"]) * SR)
    mix[start:start + len(y)] += y[: len(mix) - start]

if np.max(np.abs(mix)) >= 0.7:
    raise RuntimeError("Foley mix lacks headroom")
out = root / "public/film/foley.wav"
out.parent.mkdir(parents=True, exist_ok=True)
sf.write(out, mix, SR, subtype="PCM_24")
print(f"{len(cues)} cues -> {out.relative_to(root)}")
