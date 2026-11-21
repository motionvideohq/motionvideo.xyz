// Pulls MotionVideo's Pro prompts into gitignored `src/server/data/`:
// every move prompt, every template prompt and every Launch Videos recipe.
// They are what Pro sells, so they live in the private
// motionvideohq/motionvideo-pro repository, never in this public one. The
// server imports them from `src/server/data/` (server-only, bundled into the
// Worker, never shipped to browsers).
//
//   pnpm pro:pull                    pull the latest Pro content
//   PRO_CONTENT_DIR=../motionvideo-pro pnpm pro:pull
//                                    copy from a local checkout instead
//   pnpm pro:pull --require-real     fail unless the real content is in place
//                                    (deploy runs this)
//   pnpm pro:pull --write-samples    rewrite samples/ from the real files,
//                                    redacted (after adding moves or scenes)
//
// Access: a local checkout, or `git` over HTTPS with your GitHub credentials
// (or PRO_CONTENT_TOKEN, e.g. a build secret on Cloudflare Workers Builds).
// Without access, PRO_CONTENT_SAMPLES=1 installs the redacted samples in
// `src/server/data/samples/` so typecheck and build run (GitHub Actions sets
// it). It is an explicit opt-in, not `CI`: Workers Builds sets CI=true too,
// and a production build on samples would serve "Sample prompt" to Pro users.
// Workers Builds (WORKERS_CI=1) never uses samples; anywhere else a failed
// pull is an error.
import { execFile } from "node:child_process";
import {
  copyFile,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const DATA = path.join(import.meta.dirname, "..", "src", "server", "data");
const SAMPLES = path.join(DATA, "samples");
// Records what is in DATA: `real <commit>` or `sample`.
const MARKER = path.join(DATA, ".pro-content");
const REPO = "github.com/motionvideohq/motionvideo-pro";
/** Files in the private repo's `data/`, copied to DATA under the same name. */
const FILES = [
  "move-prompts.json",
  "template-prompts.json",
  "launch-recipes.json",
];

const args = new Set(process.argv.slice(2));
const log = (message) => console.log(`pro:pull: ${message}`);

const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

const marker = async () => {
  if (!(await exists(MARKER))) {
    return "";
  }
  const text = await readFile(MARKER, "utf-8");
  return text.trim();
};

/** Copies every Pro file from `sourceDir` into DATA. */
const copyAll = (sourceDir) =>
  Promise.all(
    FILES.map((file) =>
      copyFile(path.join(sourceDir, file), path.join(DATA, file))
    )
  );

// ── Samples ─────────────────────────────────────────────────────────────────

/**
 * The real files, redacted to their shape: every id the code and checkers
 * look up survives, no prompt text or recipe timing does.
 */
const redact = {
  "move-prompts.json": (data) => ({
    prompts: data.prompts.map(({ slug }) => ({
      slug,
      prompt: `Sample prompt for the ${slug} move. The real prompt is Pro content.`,
      parameters: [],
    })),
  }),
  "template-prompts.json": (data) => ({
    prompts: data.prompts.map(({ id }) => ({
      id,
      prompt: `Sample prompt for the ${id} template. The real prompt is Pro content.`,
    })),
  }),
  "launch-recipes.json": (data) => ({
    scenes: data.scenes.map((recipe) => ({
      sceneId: recipe.sceneId,
      version: recipe.version,
      minFrames: recipe.minFrames,
      maxFrames: recipe.maxFrames,
      aspects: recipe.aspects.slice(0, 1),
      inputs: [],
      layers: [{ id: "sample", kind: "text", description: "Sample layer." }],
      events: [
        {
          start: 0,
          layer: "sample",
          action: "Sample beat. The real recipe is Pro content.",
        },
      ],
      entry: { kind: "cut", frames: 0, description: "Sample entry." },
      exit: { kind: "cut", frames: 0, description: "Sample exit." },
      assets: [],
      substitutions: [],
      qa: [],
    })),
    films: data.films.map((recipe) => ({
      filmSlug: recipe.filmSlug,
      version: recipe.version,
      brief: {
        type: "Sample.",
        palette: "Sample.",
        layout: "Sample.",
        audio: "Sample.",
      },
      brandSource: {},
      scenes: recipe.scenes,
    })),
  }),
};

if (args.has("--write-samples")) {
  const current = await marker();
  if (!current.startsWith("real")) {
    console.error(
      "pro:pull: --write-samples needs the real content; run `pnpm pro:pull` first."
    );
    process.exit(1);
  }
  await Promise.all(
    FILES.map(async (file) => {
      const data = JSON.parse(await readFile(path.join(DATA, file), "utf-8"));
      await writeFile(
        path.join(SAMPLES, file),
        `${JSON.stringify(redact[file](data), null, 2)}\n`
      );
      log(`wrote samples/${file}`);
    })
  );
  process.exit(0);
}

// ── Pull ────────────────────────────────────────────────────────────────────

const install = async (sourceDir, label) => {
  await copyAll(sourceDir);
  await writeFile(MARKER, `${label}\n`);
};

const fromGit = async () => {
  const token = process.env.PRO_CONTENT_TOKEN;
  const url = token
    ? `https://x-access-token:${token}@${REPO}.git`
    : `https://${REPO}.git`;
  const dir = await mkdtemp(path.join(tmpdir(), "motionvideo-pro-"));
  try {
    // Never prompt for a password in scripts or CI.
    await run("git", ["clone", "--quiet", "--depth", "1", url, dir], {
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    const { stdout } = await run("git", [
      "-C",
      dir,
      "rev-parse",
      "--short",
      "HEAD",
    ]);
    await install(path.join(dir, "data"), `real ${stdout.trim()}`);
    return stdout.trim();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

const localDir = process.env.PRO_CONTENT_DIR;
try {
  if (localDir) {
    await install(
      path.join(path.resolve(localDir), "data"),
      `real local ${localDir}`
    );
    log(`copied Pro content from ${localDir}`);
  } else {
    log(`pulled Pro content at ${await fromGit()}`);
  }
} catch (error) {
  const reason = (error.stderr || error.message || String(error))
    .trim()
    .split("\n")
    .at(-1);
  const current = await marker();
  if (args.has("--require-real")) {
    if (current.startsWith("real")) {
      log(`couldn't refresh (${reason}); keeping ${current}`);
      process.exit(0);
    }
    console.error(
      `pro:pull: the real Pro content is required and couldn't be pulled (${reason}).`
    );
    process.exit(1);
  }
  if (current.startsWith("real")) {
    log(`couldn't refresh (${reason}); keeping ${current}`);
  } else if (
    process.env.PRO_CONTENT_SAMPLES === "1" &&
    !process.env.WORKERS_CI
  ) {
    await copyAll(SAMPLES);
    await writeFile(MARKER, "sample\n");
    log(
      `no access (${reason}); using the redacted samples (PRO_CONTENT_SAMPLES=1)`
    );
  } else {
    console.error(
      `pro:pull: couldn't pull ${REPO} (${reason}). Ask for access, set ` +
        "PRO_CONTENT_TOKEN, or point PRO_CONTENT_DIR at a local checkout."
    );
    process.exit(1);
  }
}

const finalMarker = await marker();
if (args.has("--require-real") && !finalMarker.startsWith("real")) {
  console.error(
    "pro:pull: the real Pro content is required; src/server/data holds samples."
  );
  process.exit(1);
}
