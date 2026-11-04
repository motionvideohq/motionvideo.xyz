import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

// Deterministic capture of the public site, retaining its real theme and UI.
// Install the fake clock before navigation; manually seek CSS and media per frame.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public/cinematic");
await mkdir(dir, { recursive: true });
const fps = 30;
const captureScale = 6;
// GPU compositing drops isolated modal/mask layers at this capture resolution.
const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
  args: ["--disable-gpu"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: captureScale,
  permissions: ["clipboard-read", "clipboard-write"],
});
await context.route(/posthog|google-analytics|doubleclick/, (route) => route.abort());
let page;
const meta = [];
const saved = process.argv.includes("--resume")
  ? JSON.parse(await readFile(path.join(dir, "capture.json"), "utf8"))
  : null;
const previous = saved?.fps === fps && saved.scale === captureScale ? saved.shots : [];
async function navigate(url, selector) {
  if (page) await page.close();
  page = await context.newPage();
  await page.clock.install({ time: new Date("2026-11-03T12:00:00Z") });
  await page.goto("https://motionvideo.xyz/en" + url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(selector);
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll("video").forEach((v) => {
      v.pause();
      v.muted = true;
    });
  });
  await page.addStyleTag({ content: "*{cursor:none!important}" });
  await page.clock.pauseAt(new Date("2026-11-03T13:00:00Z"));
  await page.evaluate(() =>
    document.querySelector('dialog[aria-labelledby="follow-prompt-title"] button')?.click(),
  );
  await page.clock.runFor(1000);
  console.log("Ready", url);
}
async function textBox(text) {
  return page.evaluate((text) => {
    const scope = document.querySelector('[role="dialog"]') ?? document.body;
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.textContent.trim() !== text) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      if (r.width && r.height && r.top >= 0 && r.top < 900)
        return { x: r.x, y: r.y, w: r.width, h: r.height };
    }
    throw new Error("Visible text not found: " + text);
  }, text);
}
async function shot(id, seconds, focusText, action) {
  const box = await textBox(focusText);
  const focus = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
  const animations = await page.evaluate(() => {
    window.__filmAnimations = new WeakMap();
    return document.getAnimations().length;
  });
  for (let f = 0; f < seconds * fps; f++) {
    const t = f / fps;
    if (action) await action(t, f);
    await page.evaluate(async (t) => {
      for (const animation of document.getAnimations()) {
        // Scroll timelines follow geometry, not elapsed milliseconds.
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
          // Deliver the native completion lifecycle; seeking past fill:none
          // would otherwise leave framework starting styles in place.
          animation.finish();
        } else {
          animation.currentTime = time;
        }
      }
      // A modal occludes the gallery and can unload its preview videos.
      // Seek only the active surface, never a background player awaiting teardown.
      const surface = document.querySelector('[role="dialog"]') ?? document;
      const videos = [...surface.querySelectorAll("video")].filter((v) => {
        const r = v.getBoundingClientRect();
        return (
          r.bottom > 0 &&
          r.top < 900 &&
          r.width > 0 &&
          v.readyState >= 2 &&
          Number.isFinite(v.duration)
        );
      });
      await Promise.all(
        videos.map(
          (v) =>
            new Promise((resolve) => {
              v.pause();
              const target = (t + 0.5) % v.duration;
              if (Math.abs(v.currentTime - target) < 0.001) return resolve();
              v.addEventListener("seeked", resolve, { once: true });
              v.currentTime = target;
            }),
        ),
      );
    }, t);
    await page.clock.runFor(0);
    const image = await page.screenshot({
      type: "jpeg",
      quality: 90,
      scale: "device",
      caret: "initial",
    });
    await writeFile(path.join(dir, `${id}-${String(f).padStart(3, "0")}.jpg`), image);
    await page.clock.runFor(Math.round(((f + 1) * 1000) / fps) - Math.round((f * 1000) / fps));
  }
  meta.push({ id, seconds, focus, animations });
  await writeFile(
    path.join(dir, "capture.json"),
    JSON.stringify(
      {
        fps,
        scale: captureScale,
        width: 1440,
        height: 900,
        source: "https://motionvideo.xyz",
        shots: meta,
      },
      null,
      2,
    ),
  );
  console.log("Captured", id, seconds * fps, "frames", focus);
}
try {
  for (const id of ["gallery", "category"]) {
    const cached = previous.find((s) => s.id === id);
    if (cached) {
      meta.push(cached);
      continue;
    }
    await navigate("", 'a[aria-label^="Watch video"]');
    if (id === "gallery") await shot("gallery", 7, "Motion worth making.");
    else
      await shot("category", 3, "Kinetic type", async (t, f) => {
        if (f === Math.round((8 * fps) / 15))
          await page.evaluate(() =>
            [...document.querySelectorAll("a")]
              .find((a) => a.textContent === "Kinetic type")
              .click(),
          );
      });
  }
  await navigate("", 'button[aria-label="Search MotionVideo"]');
  await page.evaluate(() =>
    document.querySelector('button[aria-label="Search MotionVideo"]').click(),
  );
  await page.clock.runFor(500);
  await page.waitForSelector('[role="combobox"]');
  let typed = -1;
  await shot("search", 6, "Go to", async (t) => {
    const n = Math.max(0, Math.min(11, Math.floor((t - 0.5) * 12.5)));
    if (n !== typed) {
      typed = n;
      await page.evaluate(
        (value) => {
          const input = document.querySelector('[role="combobox"]');
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(
            input,
            value,
          );
          input.dispatchEvent(new Event("input", { bubbles: true }));
        },
        "launch film".slice(0, n),
      );
    }
  });
  await page.waitForSelector('[cmdk-item][data-value*="Photo print app launch film"]');
  await shot("selection", 3, "Photo print app launch film", async (t, f) => {
    if (f === Math.round((38 * fps) / 15))
      await page.evaluate(() =>
        [...document.querySelectorAll("[cmdk-item]")]
          .find((a) => a.textContent.includes("Photo print app launch film"))
          .click(),
      );
  });
  await page.waitForSelector('[role="dialog"] video');
  await page.clock.runFor(600);
  await shot("detail", 6, "Prompt");
  await shot("copy", 5, "Copy", async (t, f) => {
    if (f === Math.round((10 * fps) / 15))
      await page.evaluate(() =>
        [...document.querySelectorAll('[role="dialog"] button')]
          .find((b) => b.textContent.trim() === "Copy")
          .click(),
      );
  });
  await navigate("/moves/timing/spring-animation", '[role="dialog"]');
  await shot("moves", 5, "Spring animation");
  await writeFile(
    path.join(root, "src/cinematic/capture.json"),
    JSON.stringify(
      {
        fps,
        scale: captureScale,
        width: 1440,
        height: 900,
        source: "https://motionvideo.xyz",
        shots: meta,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
