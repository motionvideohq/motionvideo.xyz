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

// Earshot renders every take from its original-code bank; no recordings,
// models, music or impacts enter the film's foley stem.
run(python, [path.join(root, "scripts/film-foley.py")]);
