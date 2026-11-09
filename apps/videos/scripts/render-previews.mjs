// Render every Showcase template's preview loop and poster, then upload them
// and refresh apps/web/src/data/create-showcase-previews.json.
//
//   pnpm showcase:previews            render all templates, upload
//   pnpm showcase:previews shelf ...  only these template ids
//
// Compositions come from src/showcase (one `showcase-<id>` per template, with
// the sample library). Upload needs `wrangler login` (see the web script).
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = fileURLToPath(new URL("..", import.meta.url));
const out = path.join(root, "out/previews");
const remotion = path.join(root, "node_modules/.bin/remotion");
const PREFIX = "showcase-";
// Preview size matches src/showcase PREVIEW_RESOLUTION at 16:9.
const SIZE = { width: 960, height: 540 };
const POSTER_FRAME = 45;

const listed = (
  await run(remotion, ["compositions", "src/index.ts"], { cwd: root, maxBuffer: 1 << 24 })
).stdout
  .split("\n")
  .map((line) => line.trim().split(/\s+/)[0])
  .filter((id) => id?.startsWith(PREFIX))
  .map((id) => id.slice(PREFIX.length));

const wanted = process.argv.slice(2);
const ids = wanted.length > 0 ? listed.filter((id) => wanted.includes(id)) : listed;
if (ids.length === 0) {
  throw new Error("No showcase compositions found.");
}

await mkdir(out, { recursive: true });
const sizes = {};
for (const id of ids) {
  const composition = `${PREFIX}${id}`;
  console.log(`rendering ${id}`);
  // ANGLE gives the headless browser a real WebGL implementation for three.js.
  await run(
    remotion,
    ["render", "src/index.ts", composition, path.join(out, `${id}.mp4`), "--gl=angle", "--muted", "--crf=24", "--overwrite"],
    { cwd: root, maxBuffer: 1 << 24 }
  );
  await run(
    remotion,
    ["still", "src/index.ts", composition, path.join(out, `${id}.jpg`), `--frame=${POSTER_FRAME}`, "--gl=angle", "--image-format=jpeg", "--overwrite"],
    { cwd: root, maxBuffer: 1 << 24 }
  );
  sizes[id] = SIZE;
}
await writeFile(path.join(out, "sizes.json"), `${JSON.stringify(sizes, null, 2)}\n`);

await run("node", ["scripts/create-previews.mjs", out], {
  cwd: path.join(root, "../web"),
  maxBuffer: 1 << 24,
});
console.log(`done: ${ids.length} previews`);
