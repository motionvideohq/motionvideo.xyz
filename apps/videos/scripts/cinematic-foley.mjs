import { spawnSync } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "0.4.0";
const revision = "591fa3e028032e6dce56620a20e932e35667e8d8";
const runtime = path.join(root, `out/earshot-${version}`);
const python = path.join(runtime, ".venv/bin/python");
const repository = "https://github.com/Leonxlnx/earshot.git";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
    env: { ...process.env, EARSHOT_THREADS: "2" },
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited ${result.status}`);
  return result.stdout;
}

// Isolated, pinned runtime: never upgrade the user's existing Earshot installation.
// First run needs git, Python >=3.12, network for installation, and ffmpeg/ffprobe.
await mkdir(path.join(root, "out"), { recursive: true });
if (
  !(await access(path.join(runtime, "pyproject.toml")).then(
    () => true,
    () => false,
  ))
) {
  run("git", ["clone", "--depth", "1", "--branch", `v${version}`, repository, runtime]);
}
const actualRevision = run("git", ["-C", runtime, "rev-parse", "HEAD"], { stdio: "pipe" }).trim();
if (actualRevision !== revision)
  throw new Error(`Expected Earshot ${revision}, got ${actualRevision}`);
if (
  !(await access(python).then(
    () => true,
    () => false,
  ))
) {
  run(process.env.PYTHON ?? "python3", ["-m", "venv", path.join(runtime, ".venv")]);
  // Bank rendering and light meters do not need torch, transformers, librosa,
  // plotting, or model downloads. Install only their actual DSP/I/O dependencies.
  run(python, [
    "-m",
    "pip",
    "install",
    "--no-cache-dir",
    "numpy==2.5.4",
    "scipy==1.18.1",
    "soundfile==0.14.0",
    "pyloudnorm==0.2.0",
  ]);
  run(python, ["-m", "pip", "install", "--no-cache-dir", "--no-deps", "-e", runtime]);
}

// Earshot computes every take from its original-code bank; no fitted recordings,
// downloaded effects, models, music, stings or impacts enter this effects-only stem.
run(python, [
  "-c",
  String.raw`
import hashlib
import json
import math
from importlib.metadata import version as package_version
from pathlib import Path
import sys

import numpy as np
import soundfile as sf
import earshot
from earshot.forge import bank, sfx
from earshot.features import measure

root = Path(sys.argv[1])
runtime = Path(sys.argv[2])
assert earshot.__version__ == "0.4.0", earshot.__version__
sr = 48000
out = root / "public/cinematic/sfx"
out.mkdir(parents=True, exist_ok=True)
manifest_path = root / "audio/cinematic/sfx.json"
manifest_path.parent.mkdir(parents=True, exist_ok=True)
mix = np.zeros((50 * sr, 2), dtype=np.float64)

cues = [
    dict(name="category-click", sound="pro_click/soft", seed=531101, at=6 + 16/30, align="onset", peak_db=-20),
    dict(name="result-click", sound="pro_click/soft", seed=531102, at=17 + 16/30, align="onset", peak_db=-22),
    dict(name="copy-click", sound="pro_click/soft", seed=531103, at=36 + 20/30, align="onset", peak_db=-20),
    dict(name="copy-confirm", sound="ui_pop/soft", seed=531301, at=36.80, align="onset", peak_db=-25),
    dict(name="result-air", sound="whoosh_fast/crisp", seed=531401, at=17 + 16/30, align="peak", peak_db=-30, dur=0.32, apex=0.105),
    dict(name="ending-air", sound="whoosh_fast/crisp", seed=531402, at=41.0, align="peak", peak_db=-32, dur=0.32, apex=0.105),
]
# One fresh take per character, including the space. Match the first captured
# 30 fps frame that contains each character rather than the continuous UI timer.
for i, char in enumerate("launch film"):
    frame = 270 + math.ceil((0.5+(i+1)/12.5)*30)
    cues.append(dict(name=f"key-{i+1:02d}", sound="typing_key/light", seed=531201+i,
                     at=frame/30, align="onset", peak_db=-28+(i % 3)*0.65, character=char))
cues.sort(key=lambda cue: (cue["at"], cue["name"]))

rows = []
for cue in cues:
    entry = bank.get(cue["sound"])
    if entry["type"] != "forge":
        raise RuntimeError(f"Refusing non-original-code bank entry {cue['sound']}")
    attempts = []
    for reroll in range(16):
        seed = cue["seed"] + reroll * 1000
        y, meta = bank.render(cue["sound"], seed=seed, peak_db=cue["peak_db"],
                              dur=cue.get("dur"), apex=cue.get("apex"))
        attempts.append(dict(seed=seed, ok=meta["checks"]["ok"], warnings=meta["checks"]["warnings"]))
        if meta["checks"]["ok"]:
            break
    else:
        raise RuntimeError(f"No clean take for {cue['name']}: {attempts}")
    if y.ndim == 1:
        y = np.column_stack([y, y])
    elif y.shape[1] == 1:
        y = np.repeat(y, 2, axis=1)
    file = out / (cue["name"] + ".wav")
    sf.write(file, y, sr, subtype="PCM_24")
    # Audit the actual decoded 24-bit file rather than claiming the float render is the deliverable.
    decoded, rate = sf.read(file, dtype="float64", always_2d=True)
    assert rate == sr
    audit = sfx.check(decoded, category=entry["category"], sound=cue["sound"])
    if not audit["ok"]:
        raise RuntimeError(f"Decoded take failed audit: {file}: {audit['warnings']}")
    timing = bank.measure(decoded)
    start_sample = round((cue["at"] - timing[cue["align"] + "_s"]) * sr)
    if start_sample < 0 or start_sample + len(decoded) > len(mix):
        raise RuntimeError(f"Out-of-range placement: {cue['name']}")
    mix[start_sample:start_sample+len(decoded)] += decoded
    actual_sync = start_sample / sr + timing[cue["align"] + "_s"]
    rows.append(dict(
        name=cue["name"], file=file.relative_to(root).as_posix(), bank_id=cue["sound"],
        recipe=entry["recipe"], bank_type=entry["type"], planned_seed=cue["seed"], seed=seed,
        character=cue.get("character"), edits=meta["edits"], sample_peak_target_dbfs=cue["peak_db"],
        source_entry_sha256=hashlib.sha256(json.dumps(entry, sort_keys=True).encode()).hexdigest(),
        sha256=hashlib.sha256(file.read_bytes()).hexdigest(), cue_s=cue["at"], align=cue["align"],
        cue_frame=round(cue["at"]*30),
        start_sample=start_sample, start_s=start_sample/sr, measured_sync_s=actual_sync,
        sync_error_ms=round((actual_sync-cue["at"])*1000, 6),
        measured_onset_s=start_sample/sr+timing["onset_s"],
        measured_peak_s=start_sample/sr+timing["peak_s"],
        measured_end_s=start_sample/sr+timing["end_s"], take_measurements=timing,
        attempts=attempts, audit=audit,
    ))
    print(f"{cue['name']}: {cue['sound']} seed {seed}, clean, {cue['align']} {actual_sync:.6f}s, peak {timing['peak_db']:.2f} dBFS")

mix_file = root / "public/cinematic/foley.wav"
if np.max(np.abs(mix)) >= 1:
    raise RuntimeError("Foley mix would clip")
sf.write(mix_file, mix, sr, subtype="PCM_24")
decoded_mix, rate = sf.read(mix_file, dtype="float64", always_2d=True)
assert decoded_mix.shape == (50*sr, 2) and rate == sr
meters = measure(decoded_mix, light=True)
if meters["clipped_samples"] or meters["true_peak_dbtp"] >= -3:
    raise RuntimeError(f"Insufficient mix headroom: {meters}")
manifest = dict(
    schema=1, duration_s=50, sample_rate=sr, channels=2, format="WAV PCM_24",
    effects_only=True, music_included=False,
    source=dict(site="https://leonxlnx.github.io/earshot-site/", repository="https://github.com/Leonxlnx/earshot",
                version=earshot.__version__, revision="591fa3e028032e6dce56620a20e932e35667e8d8",
                bank_version=bank.VERSION, bank_files=["forge_v2.json", "forge04.json"],
                synthesis="Fresh seeded original-code forge bank takes; no fit-derived entries or recorded samples.",
                license="MIT", license_url="https://github.com/Leonxlnx/earshot/blob/v0.4.0/LICENSE",
                license_notice=(runtime / "LICENSE").read_text()),
    reproduction=dict(command="node scripts/cinematic-foley.mjs", working_directory="apps/videos",
                      interpreter=f"out/earshot-0.4.0/.venv/bin/python ({sys.version.split()[0]})",
                      dependencies={name: package_version(name) for name in ("numpy", "scipy", "soundfile", "pyloudnorm")},
                      setup="The generator clones tag v0.4.0 into out/earshot-0.4.0, verifies its pinned revision, creates an isolated Python >=3.12 venv, installs numpy==2.5.4 scipy==1.18.1 soundfile==0.14.0 pyloudnorm==0.2.0 with --no-cache-dir, then installs Earshot editable with --no-deps. Model-free bank rendering and light measurements need no torch, transformers, librosa, models, or optional JIT acceleration. Set PYTHON to select the bootstrap interpreter. User installation is untouched.",
                      prerequisites=["Node.js", "Python >=3.12 with venv", "git", "ffmpeg", "ffprobe", "network on first setup only"],
                      seed_policy="Each planned seed is fresh; deterministic +1000 rerolls are allowed only until the Earshot artifact audit passes; all attempts are recorded."),
    timing=dict(fps=30, units="seconds", key_text="launch film", key_timer_start_s=9.58, key_timer_interval_s=1/12.5,
                key_frame_formula="270 + ceil((0.5 + (i+1)/12.5)*30), i=0..10",
                method="Earshot bank.measure on decoded 24-bit takes: onset = first 1 ms RMS frame within 30 dB of maximum (0.25 ms hop); peak = loudest 5 ms frame (1 ms hop). File start is rounded to the nearest 48 kHz sample to align that measured feature with the visual cue.",
                max_abs_sync_error_ms=max(abs(row["sync_error_ms"]) for row in rows)),
    audit=dict(method="Earshot 0.4.0 model-free sfx.check on every decoded take, plus features.measure(light=True) on decoded mix",
               clean_takes=sum(row["audit"]["ok"] for row in rows), total_takes=len(rows),
               limits="Artifact heuristics and objective meters only; no human listening, semantic-model description, aesthetic approval, or realness comparison is claimed. Sparse effects silence is intentional; whole-stem single-effect tail audits are not applicable."),
    cues=rows,
    output=dict(file=mix_file.relative_to(root).as_posix(), sha256=hashlib.sha256(mix_file.read_bytes()).hexdigest(),
                frames=len(decoded_mix), measurements=meters),
)
manifest_path.write_text(json.dumps(manifest, indent=2, allow_nan=False)+"\n")
print(json.dumps(dict(manifest=manifest_path.relative_to(root).as_posix(), clean_takes=len(rows), mix=meters), indent=2))
`,
  root,
  runtime,
]);
