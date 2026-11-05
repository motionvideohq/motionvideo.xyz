import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import film from "../src/film/shots.json" with { type: "json" };

// Records the launch film's takes from the site's real components: the
// dev-only stage at apps/web/src/routes/$locale/film.tsx (run `pnpm dev` in
// apps/web first). Each frame is a pure function of time: the fake clock
// is installed before navigation, CSS animations and videos are seeked by
// hand, and the UI is driven through `window.__film` and element.click().
//
// Two layers per frame (light stage: crop edges must never show):
//   context: the whole 1440×900 viewport, for the slab and its bokeh;
//   detail:  the region around the subject, at the shot's magnification.
//
//   node scripts/capture-film.mjs            preview: 30 fps, half scale
//   node scripts/capture-film.mjs --final    master: 60 fps, full scale
//   node scripts/capture-film.mjs --only=search   re-take one shot
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const final = process.argv.includes("--final");
const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice(7);
const mode = final ? "final" : "preview";
const fps = final ? 60 : 30;
// Output frame height over 1080: the preview renders 960×540.
const outputScale = final ? 1 : 0.5;
const contextScale = 1.5 * outputScale;
const url = process.env.FILM_URL ?? "http://localhost:3000/en/film";
const { width: W, height: H } = film.ui;
const dir = path.join(root, "public/film", mode);
const metaPath = path.join(dir, "capture.json");

const HERO = "lukasersil-0ed38e";
const HERO_TITLE = "Motion techniques showreel";
const QUERY = "motion techniques";

const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
  // GPU compositing drops isolated dialog/backdrop layers at high clip scales.
  args: ["--disable-gpu", "--autoplay-policy=no-user-gesture-required"],
});
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  colorScheme: "light",
  reducedMotion: "no-preference",
  permissions: ["clipboard-read", "clipboard-write"],
});
await context.route(/posthog|google-analytics|doubleclick/, (route) =>
  route.abort(),
);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);

await page.clock.install({ time: new Date("2026-11-05T12:00:00Z") });
// Site chrome that is not part of the story: the follow prompt (it stays away
// for a day after a dismissal) appears 15 s into a visit.
await context.addInitScript(() =>
  localStorage.setItem(
    "motionvideo:follow-prompt-dismissed",
    String(Date.parse("2026-11-05T12:30:00Z")),
  ),
);
await page.goto(url, { waitUntil: "load", timeout: 120_000 });
await page.waitForFunction(() => window.__film, null, { timeout: 120_000 });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({
  content: "*{cursor:none!important}html{scrollbar-width:none}",
});
// TanStack devtools' floating trigger is dev chrome, not product UI.
await page.evaluate(() => {
  for (const button of document.querySelectorAll('body > div button[class^="go"]')) {
    button.closest("body > div").style.display = "none";
  }
});
await page.clock.pauseAt(new Date("2026-11-05T13:00:00Z"));
await page.clock.runFor(1500);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Real time for network work (posters, video metadata), fake time held still.
async function settle(ms = 2500) {
  await page.evaluate(async () => {
    const images = [...document.images].filter((img) => !img.complete);
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }),
      ),
    );
  });
  await sleep(ms);
}

/** The bounding box of a focus target, in UI px. */
async function probe(target) {
  if (target.point) {
    return { x: target.point[0], y: target.point[1], w: 0, h: 0 };
  }
  const box = await page.evaluate((target) => {
    const scope =
      [...document.querySelectorAll('[role="dialog"]')].at(-1) ?? document.body;
    if (target.selector) {
      const r = scope.querySelector(target.selector).getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    }
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent.trim();
      const hit = target.text ? text === target.text : text.includes(target.contains);
      if (!hit) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      // The first line of a wrapped paragraph: the focal line sits on it.
      const r = range.getClientRects()[0];
      if (r && r.width && r.height && r.top >= 0 && r.bottom <= innerHeight)
        return { x: r.x, y: r.y, w: r.width, h: r.height };
    }
    return null;
  }, target);
  if (!box) throw new Error(`Focus target not visible: ${JSON.stringify(target)}`);
  if (target.align === "start") return { x: box.x + 24, y: box.y + box.h / 2, w: 0, h: 0 };
  return { x: box.x + box.w / 2, y: box.y + box.h / 2, w: box.w, h: box.h };
}

/** Holds CSS animations and videos at shot time `t` (seconds). */
async function seek(t) {
  await page.evaluate((t) => {
    window.__filmAnimations ??= new WeakMap();
    for (const animation of document.getAnimations()) {
      if (
        typeof animation.currentTime !== "number" ||
        animation.playState === "finished" ||
        animation.playState === "idle"
      )
        continue;
      let track = window.__filmAnimations.get(animation);
      if (!track) {
        track = { base: animation.currentTime, start: t };
        window.__filmAnimations.set(animation, track);
        animation.pause();
      }
      const time = track.base + (t - track.start) * 1000 * animation.playbackRate;
      const end = animation.effect?.getComputedTiming().endTime;
      if (
        (animation.playbackRate >= 0 && Number.isFinite(end) && time >= end) ||
        (animation.playbackRate < 0 && time <= 0)
      ) {
        animation.finish();
      } else {
        animation.currentTime = time;
      }
    }
  }, t);
  // Every visible video, on the film's clock: started at a fixed offset per
  // video, so no two cards show the same moment of their loop. Waits run in
  // real time from Node; the page's timers are frozen by the fake clock.
  const deadline = Date.now() + 15_000;
  for (;;) {
    const pending = await page.evaluate((t) => {
      const surface = [...document.querySelectorAll('[role="dialog"]')].at(-1) ?? document;
      let pending = 0;
      [...surface.querySelectorAll("video")].forEach((v, i) => {
        const r = v.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= innerHeight || !r.width || !v.currentSrc) return;
        v.pause();
        v.preload = "auto";
        if (v.error) return;
        if (!Number.isFinite(v.duration)) {
          pending++;
          return;
        }
        const target = (t + 1.5 + i * 0.7) % v.duration;
        if (!v.seeking && Math.abs(v.currentTime - target) > 0.001) v.currentTime = target;
        if (v.seeking || v.readyState < 2) pending++;
      });
      return pending;
    }, t);
    if (pending === 0) break;
    if (Date.now() > deadline) {
      console.warn(`  ${pending} video(s) not ready at t=${t.toFixed(3)}`);
      break;
    }
    await sleep(20);
  }
}

async function capture(clip, scale, file) {
  // Clips are in document coordinates; the layers are of the viewport.
  const scroll = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
  const { data } = await cdp.send("Page.captureScreenshot", {
    format: "jpeg",
    quality: final ? 95 : 90,
    clip: { ...clip, x: clip.x + scroll.x, y: clip.y + scroll.y, scale },
    captureBeyondViewport: false,
  });
  await writeFile(path.join(dir, file), Buffer.from(data, "base64"));
}

/** The detail layer's region: the frame's footprint on the UI, with margin. */
function detailClip(shot, focus) {
  const w = Math.min(W, (1920 / shot.mag) * 1.5);
  const h = Math.min(H, (1080 / shot.mag) * 1.9);
  const x = Math.max(0, Math.min(W - w, focus.x - w / 2));
  const y = Math.max(0, Math.min(H - h, focus.y - h / 2));
  return { x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) };
}

// Each take: its setup, then an action per frame at shot time `t`.
const TAKES = {
  async gallery() {
    await page.evaluate(() => {
      window.__film.openVideo(null);
      window.__film.setCategory(null);
      scrollTo(0, 0);
    });
  },
  async chip() {
    await page.evaluate(() => {
      window.__film.openVideo(null);
      window.__film.setCategory(null);
      scrollTo(0, 0);
    });
    let done = false;
    return async (t) => {
      if (!done && t >= 0.6) {
        done = true;
        await page.evaluate(() => window.__film.setCategory("kinetic-type"));
      }
    };
  },
  async search() {
    await page.evaluate(() => {
      window.__film.setCategory(null);
      scrollTo(0, 0);
      document.querySelector('button[aria-keyshortcuts^="Meta+K"]').click();
    });
    await page.clock.runFor(600);
    await page.waitForSelector("[cmdk-input]");
    await settle(1500);
    let typed = -1;
    let stepped = false;
    return async (t) => {
      // 12.5 characters per second from 0.5 s.
      const n = Math.max(0, Math.min(QUERY.length, Math.floor((t - 0.5) * 12.5)));
      if (n !== typed) {
        typed = n;
        await page.evaluate((value) => {
          const input = document.querySelector("[cmdk-input]");
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(
            input,
            value,
          );
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }, QUERY.slice(0, n));
      }
      // The highlight lands on the hero once the list has settled.
      if (!stepped && t >= 3.3) {
        stepped = true;
        await page.evaluate((title) => {
          const items = [...document.querySelectorAll("[cmdk-item]")];
          const hero = items.find((item) => item.textContent.includes(title));
          const selected = items.find((item) => item.dataset.selected === "true");
          if (hero && hero !== selected) {
            const input = document.querySelector("[cmdk-input]");
            const steps = items.indexOf(hero) - items.indexOf(selected);
            for (let i = 0; i < Math.abs(steps); i++)
              input.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: steps > 0 ? "ArrowDown" : "ArrowUp",
                  bubbles: true,
                }),
              );
          }
        }, HERO_TITLE);
      }
    };
  },
  async prompt() {
    await page.keyboard.press("Escape");
    await page.clock.runFor(400);
    await page.evaluate((slug) => window.__film.openVideo(slug), HERO);
    await page.clock.runFor(800);
    await page.waitForSelector('[role="dialog"] video');
    await settle(3000);
    let expanded = false;
    return async (t) => {
      if (!expanded && t >= 1.9) {
        expanded = true;
        await page.evaluate(() =>
          [...document.querySelectorAll('[role="dialog"] button')]
            .find((b) => b.textContent.trim() === "Show all")
            ?.click(),
        );
      }
    };
  },
  async copy() {
    // Continues the prompt take's overlay; a lone re-take opens it first.
    if (!(await page.$('[role="dialog"] video'))) {
      await page.evaluate((slug) => window.__film.openVideo(slug), HERO);
      await page.clock.runFor(800);
      await page.waitForSelector('[role="dialog"] video');
      await settle(3000);
    }
    let pressed = false;
    return async (t) => {
      if (!pressed && t >= 0.7) {
        pressed = true;
        await page.evaluate(() =>
          [...document.querySelectorAll('[role="dialog"] button')]
            .find((b) => b.textContent.trim() === "Copy")
            .click(),
        );
      }
    };
  },
  async wide() {
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      window.__film.openVideo(null);
      window.__film.setCategory(null);
      scrollTo(0, 0);
    });
    await page.clock.runFor(800);
    await settle(3000);
    return async (t) => {
      // Reading-speed scroll: eases in over the first second, then 150 px/s.
      const y = t < 1 ? 75 * t * t : 75 + 150 * (t - 1);
      await page.evaluate((y) => scrollTo(0, y), y);
    };
  },
};

await mkdir(dir, { recursive: true });
const meta = { mode, fps, outputScale, contextScale, shots: [] };
try {
  for (const shot of film.shots) {
    if (only && shot.id !== only) {
      continue;
    }
    for (const file of ["context", "detail"]) {
      await rm(path.join(dir, `${shot.id}-${file}`), { recursive: true, force: true });
      await mkdir(path.join(dir, `${shot.id}-${file}`), { recursive: true });
    }
    const action = (await TAKES[shot.id]()) ?? (async () => {});
    await page.evaluate(() => {
      window.__filmAnimations = new WeakMap();
    });
    // One frame past the cut: the last frame's shutter reaches into it.
    const frames = Math.round(shot.seconds * fps) + 1;
    const focus = [];
    const wide = shot.scale === "wide";
    let clip = null;
    const detailScale = shot.mag * outputScale * 1.15;
    for (let f = 0; f < frames; f++) {
      const t = f / fps;
      await action(t);
      await seek(t);
      await page.clock.runFor(0);
      for (const target of shot.focus) {
        if (t >= target.at && !focus.some((entry) => entry.at === target.at)) {
          focus.push({ at: target.at, t, ...(await probe(target)) });
        }
      }
      clip ??= wide ? null : detailClip(shot, focus[0]);
      const name = `${String(f).padStart(4, "0")}.jpg`;
      await capture({ x: 0, y: 0, width: W, height: H }, contextScale, `${shot.id}-context/${name}`);
      if (clip) await capture(clip, detailScale, `${shot.id}-detail/${name}`);
      await page.clock.runFor(Math.round(((f + 1) * 1000) / fps) - Math.round((f * 1000) / fps));
      if (f % fps === 0) console.log(`  ${shot.id} ${f}/${frames}`);
    }
    meta.shots.push({ id: shot.id, frames, focus, detail: clip, detailScale });
    console.log("Captured", shot.id, frames, "frames", JSON.stringify(focus));
  }
} finally {
  await browser.close();
}
if (only) {
  // A re-take replaces its shot; every other shot keeps its previous take.
  const previous = await readFile(metaPath, "utf8").then(JSON.parse, () => ({ shots: [] }));
  meta.shots = film.shots
    .map(({ id }) => meta.shots.find((s) => s.id === id) ?? previous.shots.find((s) => s.id === id))
    .filter(Boolean);
}
await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
