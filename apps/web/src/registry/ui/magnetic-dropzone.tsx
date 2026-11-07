import {
  animate,
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import * as React from "react";
import { CheckCircle } from "reicon-react/icons/CheckCircle";
import { File } from "reicon-react/icons/File";
import { FileError } from "reicon-react/icons/FileError";
import { FileUp } from "reicon-react/icons/FileUp";
import { Loader } from "reicon-react/icons/Loader";
import { Trash } from "reicon-react/icons/Trash";
import { Upload } from "reicon-react/icons/Upload";

import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";
import {
  fileColorFor,
  fileMarkFor,
  markOfExtension,
  MARKED_EXTENSIONS,
} from "@/registry/ui/file-badge";
import type { MarkedKind } from "@/registry/ui/file-badge";

const MAGNET_DISTANCE = 180;

const MAX_MAGNET_OFFSET = 10;

const MAGNET_SPRING = { damping: 24, mass: 0.65, stiffness: 280 };

const GRID = 11;
const DOT = 0.85;
const REST = { light: 0.11, dark: 0.09 } as const;

const WAVE = {
  speed: 740,
  width: 18,
  decay: 1.75,
  push: 7,
  swell: 2.4,
  halo: 64,
  glow: { light: 0.17, dark: 0.3 },
} as const;
const CATCH = 1.8;

const SPLASH = [
  { delay: 0, amp: 1 },
  { delay: 120, amp: 0.5 },
] as const;

const SHAKE = { x: [0, -7, 6, -4, 2.5, -1, 0], duration: 0.42 } as const;
const FLAG_MS = 900;
const FLAG_EASE_MS = 500;

const LENS = {
  reach: 48,
  pull: 2.5,
  swell: 0.5,
  lift: 0.22,
  near: 0.5,
} as const;

const REVEAL_LAG = 6;
const REVEAL_EDGE = 28;

const GROUND = {
  light: 0.045,
  dark: 0.055,
  lag: 10,
  edge: 18,
  fade: 220,
} as const;

type Ground =
  | { state: "rising"; x: number; y: number; start: number }
  | { state: "full" }
  | { state: "falling"; from: number }
  | null;
const ACTIONS_AFTER_MS = 80;
const ACTION_INTRO =
  "translate-y-1.5 opacity-0 transition-[opacity,translate] duration-300 ease-(--ease-out) group-data-shown/actions:translate-y-0 group-data-shown/actions:opacity-100 motion-reduce:translate-y-0";

const CARD_OUTRO_MS = 160;
const EXIT_EASE = "cubic-bezier(0.4, 0, 0.6, 1)";

const TINT_MS = 160;

const PROMPTS = [
  "Drop a file here",
  "Almost there",
  "Let go to upload",
] as const;

const promptFor = (isOver: boolean, isNear: boolean) => {
  if (isOver) {
    return PROMPTS[2];
  }
  if (isNear) {
    return PROMPTS[1];
  }
  return PROMPTS[0];
};

const TAU = Math.PI * 2;

const noCover = () => 0;

type Rgb = readonly [number, number, number];

interface Wave {
  x: number;
  y: number;
  start: number;
  amp: number;
  rgb: Rgb;
  from: Rgb;
  tinted: number;
}

const rgba = ([r, g, b]: Rgb, alpha: number) =>
  `rgb(${String(r)} ${String(g)} ${String(b)} / ${alpha.toFixed(3)})`;

const mix = (from: Rgb, to: Rgb, amount: number): Rgb => [
  Math.round(from[0] + (to[0] - from[0]) * amount),
  Math.round(from[1] + (to[1] - from[1]) * amount),
  Math.round(from[2] + (to[2] - from[2]) * amount),
];

let swatch: CanvasRenderingContext2D | null | undefined;
const toRgb = (color: string): Rgb => {
  swatch ??= document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  if (!swatch) {
    return [128, 128, 128];
  }
  swatch.clearRect(0, 0, 1, 1);
  swatch.fillStyle = "#808080";
  swatch.fillStyle = color.trim() || "#808080";
  swatch.fillRect(0, 0, 1, 1);
  const [r = 128, g = 128, b = 128] = swatch.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
};

const imageTint = async (file: File) => {
  try {
    const bitmap = await createImageBitmap(file, {
      resizeWidth: 12,
      resizeHeight: 12,
      resizeQuality: "low",
    });
    const canvas = document.createElement("canvas");
    canvas.width = 12;
    canvas.height = 12;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return null;
    }
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    const { data } = context.getImageData(0, 0, 12, 12);
    let [red, green, blue, weight] = [0, 0, 0, 0];
    for (let at = 0; at < data.length; at += 4) {
      const [r = 0, g = 0, b = 0, a = 0] = [
        data[at],
        data[at + 1],
        data[at + 2],
        data[at + 3],
      ];
      if (a < 128) {
        continue;
      }
      const high = Math.max(r, g, b);
      const each = 0.05 + (high === 0 ? 0 : (high - Math.min(r, g, b)) / high);
      red += r * each;
      green += g * each;
      blue += b * each;
      weight += each;
    }
    if (weight === 0) {
      return null;
    }
    return `rgb(${[red, green, blue].map((channel) => Math.round(channel / weight)).join(" ")})`;
  } catch {
    return null;
  }
};

class Surface {
  private readonly canvas: HTMLCanvasElement;
  private readonly zone: HTMLElement;
  private readonly context: CanvasRenderingContext2D;
  private dots: { x: number; y: number }[] = [];
  private width = 0;
  private height = 0;
  private rest: Rgb = [128, 128, 128];
  private dark = false;
  private waves: Wave[] = [];
  private crossing: {
    x: number;
    y: number;
    start: number;
    done: () => void;
  }[] = [];
  private lens = { x: 0, y: 0, strength: 0, toX: 0, toY: 0, toStrength: 0 };
  private reveal: {
    element: HTMLElement;
    start: number;
    reach: number;
  } | null = null;
  private ground: Ground = null;
  private readonly edge: HTMLElement | null;
  private edgeState: NonNullable<Ground>["state"] | null = null;
  private frame = 0;
  private last = 0;

  constructor(
    canvas: HTMLCanvasElement,
    zone: HTMLElement,
    context: CanvasRenderingContext2D
  ) {
    this.canvas = canvas;
    this.zone = zone;
    this.context = context;
    this.edge = zone.querySelector<HTMLElement>(".dropzone-edge");
    this.recolor();
    this.resize();
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    this.width = this.canvas.offsetWidth;
    this.height = this.canvas.offsetHeight;
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const columns = Math.floor(this.width / GRID);
    const rows = Math.floor(this.height / GRID);
    const left = (this.width - (columns - 1) * GRID) / 2;
    const top = (this.height - (rows - 1) * GRID) / 2;
    this.dots = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        this.dots.push({ x: left + column * GRID, y: top + row * GRID });
      }
    }
    if (!this.frame) {
      this.draw(performance.now());
    }
  }

  recolor() {
    this.rest = toRgb(getComputedStyle(this.zone).color);
    const [r, g, b] = this.rest;
    this.dark = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5;
    if (!this.frame && this.width > 0) {
      this.draw(performance.now());
    }
  }

  get text() {
    return this.rest;
  }

  point(x: number, y: number, strength: number) {
    const { lens } = this;
    if (lens.strength < 0.01) {
      lens.x = x;
      lens.y = y;
    }
    lens.toX = x;
    lens.toY = y;
    lens.toStrength = strength;
    this.kick();
  }

  release() {
    this.lens.toStrength = 0;
    this.kick();
  }

  splash(x: number, y: number, rgb: Rgb, amp: number, delay = 0) {
    const wave: Wave = {
      x,
      y,
      start: performance.now() + delay,
      amp,
      rgb,
      from: rgb,
      tinted: Number.NEGATIVE_INFINITY,
    };
    this.waves.push(wave);
    this.kick();
    return wave;
  }

  tint(wave: Wave, rgb: Rgb) {
    const now = performance.now();
    wave.from = Surface.colorOf(wave, now);
    wave.rgb = rgb;
    wave.tinted = now;
    this.kick();
  }

  uncover(element: HTMLElement, x: number, y: number, start: number) {
    const localX = x - element.offsetLeft;
    const localY = y - element.offsetTop;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const reach = Math.max(
      Math.hypot(localX, localY),
      Math.hypot(width - localX, localY),
      Math.hypot(localX, height - localY),
      Math.hypot(width - localX, height - localY)
    );
    element.style.setProperty("--reveal-x", `${localX.toFixed(1)}px`);
    element.style.setProperty("--reveal-y", `${localY.toFixed(1)}px`);
    element.style.setProperty("--reveal-r", "0px");
    element.style.setProperty("--reveal-solid", "0px");
    element.dataset.revealing = "";
    this.reveal = { element, start, reach };

    const towardX = width / 2 - localX;
    const towardY = height / 2 - localY;
    const distance = Math.max(Math.hypot(towardX, towardY), 1);
    const carried = element.animate(
      [
        { scale: "0.97", translate: "0 0" },
        {
          scale: "1.01",
          translate: `${((towardX / distance) * 4).toFixed(1)}px ${((towardY / distance) * 4).toFixed(1)}px`,
          offset: 0.4,
        },
        { scale: "1", translate: "0 0" },
      ],
      {
        duration: 560,
        delay: Math.max(
          0,
          start - performance.now() + (distance / WAVE.speed) * 1000 - 80
        ),
        easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        fill: "backwards",
      }
    );
    this.kick();
    const settle = async () => {
      try {
        await carried.finished;
      } catch {
        // The card may unmount before the animation settles.
      }
    };
    return settle();
  }

  crossed(x: number, y: number, start: number) {
    // eslint-disable-next-line promise/avoid-new -- The promise settles later, when the reveal edge crosses this point.
    return new Promise<void>((resolve) => {
      this.crossing.push({ x, y, start, done: resolve });
      this.kick();
    });
  }

  lay(x: number, y: number, start: number) {
    if (this.ground?.state === "full" || this.ground?.state === "rising") {
      return;
    }
    this.ground = { state: "rising", x, y, start };
    this.kick();
  }

  layAll() {
    this.ground = { state: "full" };
    if (!this.frame) {
      this.draw(performance.now());
    }
  }

  lift(instant: boolean) {
    if (!this.ground) {
      return;
    }
    if (instant) {
      this.ground = null;
      if (!this.frame) {
        this.draw(performance.now());
      }
      return;
    }
    this.ground = { state: "falling", from: performance.now() };
    this.kick();
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.finishReveal();
    for (const wait of this.crossing) {
      wait.done();
    }
    this.crossing = [];
  }

  private farFrom(x: number, y: number) {
    return Math.max(
      Math.hypot(x, y),
      Math.hypot(this.width - x, y),
      Math.hypot(x, this.height - y),
      Math.hypot(this.width - x, this.height - y)
    );
  }

  private static colorOf(wave: Wave, now: number) {
    return mix(
      wave.from,
      wave.rgb,
      Math.min(1, Math.max(0, (now - wave.tinted) / TINT_MS))
    );
  }

  private kick() {
    if (this.frame) {
      return;
    }
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private finishReveal() {
    const { reveal } = this;
    if (!reveal) {
      return;
    }
    delete reveal.element.dataset.revealing;
    for (const name of [
      "--reveal-x",
      "--reveal-y",
      "--reveal-r",
      "--reveal-solid",
    ]) {
      reveal.element.style.removeProperty(name);
    }
    this.reveal = null;
  }

  private readonly tick = (now: number) => {
    this.frame = 0;
    const seconds = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;

    const settled = this.advanceLens(seconds);
    this.advanceWaves(now);
    this.advanceGround(now);
    this.draw(now);
    this.advanceReveal(now);
    this.advanceCrossing(now);

    const groundMoving =
      this.ground?.state === "rising" || this.ground?.state === "falling";
    if (
      this.waves.length > 0 ||
      !settled ||
      this.reveal ||
      groundMoving ||
      this.crossing.length > 0
    ) {
      this.frame = requestAnimationFrame(this.tick);
    }
  };

  private advanceLens(seconds: number): boolean {
    const { lens } = this;
    const follow = 1 - Math.exp(-seconds * 22);
    const fade =
      1 - Math.exp(-seconds * (lens.toStrength > lens.strength ? 14 : 6));
    lens.x += (lens.toX - lens.x) * follow;
    lens.y += (lens.toY - lens.y) * follow;
    lens.strength += (lens.toStrength - lens.strength) * fade;
    const settled =
      Math.abs(lens.toX - lens.x) < 0.1 &&
      Math.abs(lens.toY - lens.y) < 0.1 &&
      Math.abs(lens.toStrength - lens.strength) < 0.002;
    if (settled) {
      lens.x = lens.toX;
      lens.y = lens.toY;
      lens.strength = lens.toStrength;
    }
    return settled;
  }

  private advanceWaves(now: number) {
    this.waves = this.waves.filter((wave) => {
      const t = (now - wave.start) / 1000;
      if (t < 0) {
        return true;
      }
      const far = Math.max(
        Math.hypot(wave.x, wave.y),
        Math.hypot(this.width - wave.x, wave.y),
        Math.hypot(wave.x, this.height - wave.y),
        Math.hypot(this.width - wave.x, this.height - wave.y)
      );
      return (
        wave.amp * Math.exp(-t * WAVE.decay) > 0.006 &&
        WAVE.speed * t < far + WAVE.halo + WAVE.width * 3
      );
    });
  }

  private advanceGround(now: number) {
    const { ground } = this;
    if (ground?.state === "rising") {
      const radius = (WAVE.speed * (now - ground.start)) / 1000 - GROUND.lag;
      const far = Math.max(
        Math.hypot(ground.x, ground.y),
        Math.hypot(this.width - ground.x, ground.y),
        Math.hypot(ground.x, this.height - ground.y),
        Math.hypot(this.width - ground.x, this.height - ground.y)
      );
      if (radius - GROUND.edge > far) {
        this.ground = { state: "full" };
      }
    } else if (
      ground?.state === "falling" &&
      now - ground.from >= GROUND.fade
    ) {
      this.ground = null;
    }
  }

  private advanceReveal(now: number) {
    const { reveal } = this;
    if (!reveal) {
      return;
    }
    const radius = (WAVE.speed * (now - reveal.start)) / 1000 - REVEAL_LAG;
    reveal.element.style.setProperty(
      "--reveal-r",
      `${Math.max(0, radius).toFixed(1)}px`
    );
    reveal.element.style.setProperty(
      "--reveal-solid",
      `${Math.max(0, radius - REVEAL_EDGE).toFixed(1)}px`
    );
    if (radius - REVEAL_EDGE > reveal.reach) {
      this.finishReveal();
    }
  }

  private advanceCrossing(now: number) {
    this.crossing = this.crossing.filter((wait) => {
      const edge =
        (WAVE.speed * (now - wait.start)) / 1000 - GROUND.lag - GROUND.edge;
      if (edge <= this.farFrom(wait.x, wait.y)) {
        return true;
      }
      wait.done();
      return false;
    });
  }

  private syncEdge(now: number) {
    const { edge } = this;
    if (!edge) {
      return;
    }
    const { ground } = this;
    const state = ground?.state ?? null;
    if (state !== this.edgeState) {
      if (state) {
        edge.dataset.ground = state;
      } else {
        delete edge.dataset.ground;
      }
      this.edgeState = state;
    }
    if (ground?.state === "rising") {
      const radius = Math.max(
        0,
        (WAVE.speed * (now - ground.start)) / 1000 - GROUND.lag
      );
      edge.style.setProperty("--ground-x", `${ground.x.toFixed(1)}px`);
      edge.style.setProperty("--ground-y", `${ground.y.toFixed(1)}px`);
      edge.style.setProperty("--ground-r", `${radius.toFixed(1)}px`);
      edge.style.setProperty(
        "--ground-solid",
        `${Math.max(0, radius - GROUND.edge).toFixed(1)}px`
      );
    } else if (ground?.state === "falling") {
      const left = 1 - Math.min(1, (now - ground.from) / GROUND.fade);
      edge.style.setProperty("--ground-left", left.toFixed(3));
    }
  }

  // eslint-disable-next-line complexity -- The painter draws ground, waves, glow, lens, and dots in a single pass.
  private draw(now: number) {
    this.syncEdge(now);
    const { context } = this;
    context.clearRect(0, 0, this.width, this.height);

    const { ground } = this;
    const solid = this.dark ? GROUND.dark : GROUND.light;
    let coverAt: (x: number, y: number) => number = noCover;
    if (ground?.state === "full") {
      context.fillStyle = rgba(this.rest, solid);
      context.fillRect(0, 0, this.width, this.height);
      coverAt = () => 1;
    } else if (ground?.state === "falling") {
      const left = 1 - Math.min(1, (now - ground.from) / GROUND.fade);
      context.fillStyle = rgba(this.rest, solid * left);
      context.fillRect(0, 0, this.width, this.height);
      coverAt = () => left;
    } else if (ground?.state === "rising") {
      const radius = (WAVE.speed * (now - ground.start)) / 1000 - GROUND.lag;
      if (radius > 0) {
        const fill = context.createRadialGradient(
          ground.x,
          ground.y,
          Math.max(0, radius - GROUND.edge),
          ground.x,
          ground.y,
          radius
        );
        fill.addColorStop(0, rgba(this.rest, solid));
        fill.addColorStop(1, rgba(this.rest, 0));
        context.fillStyle = fill;
        context.fillRect(0, 0, this.width, this.height);
      }
      coverAt = (x, y) =>
        Math.min(
          1,
          Math.max(
            0,
            (radius - Math.hypot(x - ground.x, y - ground.y)) / GROUND.edge
          )
        );
    }

    const live: { wave: Wave; radius: number; amp: number; rgb: Rgb }[] = [];
    for (const wave of this.waves) {
      const t = (now - wave.start) / 1000;
      if (t <= 0) {
        continue;
      }
      live.push({
        wave,
        radius: WAVE.speed * t,
        amp: wave.amp * Math.exp(-t * WAVE.decay),
        rgb: Surface.colorOf(wave, now),
      });
    }

    for (const { wave, radius, amp, rgb } of live) {
      const glow = context.createRadialGradient(
        wave.x,
        wave.y,
        Math.max(0, radius - WAVE.halo),
        wave.x,
        wave.y,
        radius + WAVE.halo * 0.5
      );
      glow.addColorStop(0, rgba(rgb, 0));
      glow.addColorStop(
        0.66,
        rgba(rgb, amp * (this.dark ? WAVE.glow.dark : WAVE.glow.light))
      );
      glow.addColorStop(1, rgba(rgb, 0));
      context.fillStyle = glow;
      context.fillRect(0, 0, this.width, this.height);
    }

    const restAlpha = this.dark ? REST.dark : REST.light;
    const clipping = ground?.state === "rising";
    const { x: lensX, y: lensY, strength } = this.lens;
    const moved: { x: number; y: number; radius: number; style: string }[] = [];
    const faded = new Map<number, Path2D>();

    context.beginPath();
    for (const dot of this.dots) {
      let dx = 0;
      let dy = 0;
      let swell = 0;
      let lit = 0;
      let lift = 0;
      let tint = this.rest;

      for (const { wave, radius, amp, rgb } of live) {
        const offX = dot.x - wave.x;
        const offY = dot.y - wave.y;
        const distance = Math.hypot(offX, offY) || 1;
        const off = distance - radius;
        if (Math.abs(off) > WAVE.width * 3) {
          continue;
        }
        const crest =
          Math.exp(-(off * off) / (2 * WAVE.width * WAVE.width)) * amp;
        dx += (offX / distance) * crest * WAVE.push;
        dy += (offY / distance) * crest * WAVE.push;
        swell += crest * WAVE.swell;
        const weight = Math.min(1, crest * CATCH);
        if (weight > lit) {
          lit = weight;
          tint = rgb;
        }
      }

      if (strength > 0) {
        const toX = lensX - dot.x;
        const toY = lensY - dot.y;
        const distance = Math.hypot(toX, toY);
        if (distance < LENS.reach * 3) {
          const pull =
            strength *
            Math.exp(-(distance * distance) / (2 * LENS.reach * LENS.reach));

          const step = Math.min(distance * 0.45, pull * LENS.pull);
          if (distance > 0.001) {
            dx += (toX / distance) * step;
            dy += (toY / distance) * step;
          }
          swell += pull * LENS.swell;
          lift = Math.max(lift, pull * LENS.lift);
        }
      }

      const cover = coverAt(dot.x, dot.y);
      if (clipping && cover >= 0.999) {
        continue;
      }
      const shown = clipping ? 1 - cover : 1;
      lit *= shown;
      swell *= shown;
      dx *= shown;
      dy *= shown;
      const resting = restAlpha * (1 - cover);
      if (
        lit < 0.01 &&
        lift < 0.01 &&
        swell < 0.02 &&
        Math.abs(dx) + Math.abs(dy) < 0.05
      ) {
        if (cover <= 0.001) {
          context.moveTo(dot.x + DOT, dot.y);
          context.arc(dot.x, dot.y, DOT, 0, TAU);
        } else if (cover < 0.999) {
          const step = Math.round((1 - cover) * 8);
          const path = faded.get(step) ?? new Path2D();
          path.moveTo(dot.x + DOT, dot.y);
          path.arc(dot.x, dot.y, DOT, 0, TAU);
          faded.set(step, path);
        }
        continue;
      }
      moved.push({
        x: dot.x + dx,
        y: dot.y + dy,
        radius: DOT + swell,
        style: rgba(
          lit > 0 ? mix(this.rest, tint, lit) : this.rest,
          Math.min(1, resting + (1 - restAlpha) * Math.max(lit, lift))
        ),
      });
    }
    context.fillStyle = rgba(this.rest, restAlpha);
    context.fill();
    for (const [step, path] of faded) {
      context.fillStyle = rgba(this.rest, (restAlpha * step) / 8);
      context.fill(path);
    }

    for (const dot of moved) {
      context.beginPath();
      context.arc(dot.x, dot.y, dot.radius, 0, TAU);
      context.fillStyle = dot.style;
      context.fill();
    }
  }
}

const useSurface = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  zoneRef: React.RefObject<HTMLDivElement | null>
) => {
  const surface = React.useRef<Surface | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const zone = zoneRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !zone || !context) {
      return;
    }
    const field = new Surface(canvas, zone, context);
    surface.current = field;

    const sized = new ResizeObserver(() => {
      field.resize();
    });
    sized.observe(zone);

    let settle = 0;
    const recolor = () => {
      field.recolor();
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        field.recolor();
      }, 350);
    };
    const themed = new MutationObserver(recolor);
    themed.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", recolor);

    return () => {
      sized.disconnect();
      themed.disconnect();
      scheme.removeEventListener("change", recolor);
      window.clearTimeout(settle);
      field.dispose();
      surface.current = null;
    };
  }, [canvasRef, zoneRef]);

  const getSurface = React.useCallback(() => surface.current, []);

  return getSurface;
};

export interface DropzoneProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  /** A stored file URL shown when nothing new has been picked. */
  value?: string;
  /** Hide the remove action, e.g. when the file is required. */
  required?: boolean;
  /** Disables the actions while a picked file is uploading. */
  busy?: boolean;
  /** Shows a failed upload instead of the success state. */
  failed?: boolean;
  onFilesChange?: (files: File[]) => void;
  /** Icon shown in the empty state; defaults to a file-upload glyph. */
  icon?: React.ReactNode;
  /** Guidance shown inside the empty box, e.g. formats, size and limit. */
  helper?: React.ReactNode;
  animated?: boolean;
  className?: string;
}

const DEFAULT_MAX_SIZE = 1024 * 1024;

const formatBytes = (bytes: number) => {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unit = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** unit;
  const shown = value >= 10 || unit === 0 ? value.toFixed(0) : value.toFixed(1);

  return `${shown.replace(/\.0$/u, "")} ${units[unit]}`;
};

const kindOf = (file: File) => {
  const dot = file.name.lastIndexOf(".");
  const extension = dot > 0 ? file.name.slice(dot + 1) : "";
  if (extension && extension.length <= 5) {
    return extension.toUpperCase();
  }
  const subtype = file.type.split("/")[1]?.split(/[.+]/u).pop() ?? "";
  return (subtype || "file").toUpperCase();
};

const nameOfUrl = (url: string) => {
  const tail = url.split(/[\\/]/u).pop() ?? url;
  const name = tail.split(/[?#]/u)[0] ?? tail;
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};

const kindOfName = (name: string) => {
  const dot = name.lastIndexOf(".");
  const extension = dot > 0 ? name.slice(dot + 1) : "";
  return extension && extension.length <= 5 ? extension.toUpperCase() : "FILE";
};

const statusOf = (isUploading: boolean, count: number, failed: boolean) => {
  if (isUploading) {
    return "Uploading…";
  }
  if (failed) {
    return "Upload failed";
  }
  if (count > 1) {
    return `${count} files uploaded`;
  }
  return "Uploaded successfully";
};

const isFileDrag = (transfer: DataTransfer | null) =>
  transfer ? [...transfer.types].includes("Files") : false;

const FAMILIES = new Map([
  ["image", "Images"],
  ["video", "Video"],
  ["audio", "Audio"],
  ["text", "Text"],
]);

const MARK_NAMES: Record<MarkedKind, string> = {
  pdf: "PDF",
  doc: "Docs",
  slides: "Slides",
  sheet: "Sheets",
  zip: "ZIP",
};

const DOCUMENTS = [
  ...MARKED_EXTENSIONS.pdf,
  ...MARKED_EXTENSIONS.doc,
  ...MARKED_EXTENSIONS.slides,
  ...MARKED_EXTENSIONS.sheet,
  "txt",
  "md",
];
const MEDIA = [
  "mp4",
  "mov",
  "m4v",
  "webm",
  "mkv",
  "avi",
  "mp3",
  "wav",
  "m4a",
  "aac",
  "flac",
  "ogg",
];
const ARCHIVES = [...MARKED_EXTENSIONS.zip, "rar", "7z", "tar", "gz", "tgz"];

const ACCEPT = [
  "image/*",
  ...[...DOCUMENTS, ...MEDIA, ...ARCHIVES].map((extension) => `.${extension}`),
].join(",");

const ACCEPT_NAMES = "Documents, media and archives";

const describeAccept = (accept: string) => {
  const names = accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .map((rule) => {
      if (rule.endsWith("/*")) {
        const family = rule.slice(0, -2);
        return (
          FAMILIES.get(family) ??
          `${family[0]?.toUpperCase() ?? ""}${family.slice(1)}`
        );
      }
      const tail = rule.includes("/")
        ? (rule.split("/")[1] ?? rule)
        : rule.replace(/^\./u, "");
      const mark = markOfExtension(tail);
      return mark ? MARK_NAMES[mark] : tail.toUpperCase();
    });

  const unique = [...new Set(names)];
  if (unique.length === 0) {
    return "Any file";
  }
  if (unique.length === 1) {
    return unique[0] ?? "Any file";
  }

  const last = unique.at(-1);
  if (last === undefined) {
    return "Any file";
  }
  return `${unique.slice(0, -1).join(", ")} and ${last}`;
};

const accepts = (file: File, accept: string) => {
  if (!accept.trim()) {
    return true;
  }

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return accept
    .split(",")
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) {
        return name.endsWith(rule);
      }
      if (rule.endsWith("/*")) {
        return type.startsWith(rule.slice(0, -1));
      }
      return type === rule;
    });
};

const rejectionOf = (files: File[], accept: string, maxSize: number) => {
  const unsupported = files.find((file) => !accepts(file, accept));
  if (unsupported) {
    return `${unsupported.name} is not a supported file type.`;
  }
  const oversized = files.find((file) => file.size > maxSize);
  if (oversized) {
    return `${oversized.name} is larger than ${formatBytes(maxSize)}.`;
  }
  return null;
};

// eslint-disable-next-line complexity -- The dropzone coordinates drag state, upload animation, and file views.
const Dropzone = ({
  accept = ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  multiple = false,
  value,
  required = false,
  busy = false,
  failed = false,
  onFilesChange,
  icon,
  helper,
  animated = true,
  className,
}: DropzoneProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const zoneRef = React.useRef<HTMLDivElement>(null);

  const [files, setFiles] = React.useState<File[]>([]);

  const [error, setError] = React.useState<{
    id: number;
    message: string;
  } | null>(null);
  const errors = React.useRef(0);
  const messageId = React.useId();
  const [flag, setFlag] = React.useState<"on" | "easing" | null>(null);
  const flagTimer = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(flagTimer.current), []);
  const easeFlag = React.useCallback(() => {
    window.clearTimeout(flagTimer.current);
    setFlag((current) => (current ? "easing" : current));
    flagTimer.current = window.setTimeout(() => {
      setFlag(null);
    }, FLAG_EASE_MS);
  }, []);
  const [near, setNear] = React.useState(false);
  const [over, setOver] = React.useState(false);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const getSurface = useSurface(canvasRef, zoneRef);
  const [arrivals, setArrivals] = React.useState(0);
  const arrivalCount = React.useRef(0);
  const [landing, setLanding] = React.useState<{
    x: number;
    y: number;
    start: number;
    arrival: number;
  } | null>(null);
  const [settled, setSettled] = React.useState(0);
  const actionsTimer = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(actionsTimer.current), []);

  const reduced = useReducedMotion();

  const still = reduced || !animated;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const shake = useMotionValue(0);

  const springX = useSpring(x, MAGNET_SPRING);
  const springY = useSpring(y, MAGNET_SPRING);
  const springScale = useSpring(scale, MAGNET_SPRING);

  const transform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0) translateX(${shake}px) scale(${springScale})`;

  const surfacePoint = React.useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }
    const box = canvas.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) {
      return null;
    }
    return {
      x: ((clientX - box.left) * canvas.offsetWidth) / box.width,
      y: ((clientY - box.top) * canvas.offsetHeight) / box.height,
    };
  }, []);

  const turnAway = React.useCallback(
    (message: string) => {
      errors.current += 1;
      setError({ id: errors.current, message });
      setFlag("on");
      window.clearTimeout(flagTimer.current);
      flagTimer.current = window.setTimeout(() => {
        setFlag("easing");
        flagTimer.current = window.setTimeout(() => {
          setFlag(null);
        }, FLAG_EASE_MS);
      }, FLAG_MS);
      if (!still) {
        void animate(shake, [...SHAKE.x], {
          duration: SHAKE.duration,
          ease: "easeOut",
        });
      }
    },
    [shake, still]
  );

  const rest = React.useCallback(() => {
    x.set(0);
    y.set(0);
    scale.set(1);
    getSurface()?.release();
    setNear(false);
    setOver(false);
  }, [getSurface, scale, x, y]);

  React.useEffect(() => {
    const onDragOver = (event: globalThis.DragEvent) => {
      const zone = zoneRef.current;
      if (!zone || !isFileDrag(event.dataTransfer)) {
        return;
      }

      const rect = zone.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const edgeX = Math.max(
        Math.abs(event.clientX - centerX) - rect.width / 2,
        0
      );
      const edgeY = Math.max(
        Math.abs(event.clientY - centerY) - rect.height / 2,
        0
      );
      const proximity = Math.max(
        0,
        1 - Math.hypot(edgeX, edgeY) / MAGNET_DISTANCE
      );

      if (proximity === 0) {
        rest();
        return;
      }

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;

      const length = Math.max(Math.hypot(deltaX, deltaY), 1);

      const offset = inside ? 0 : proximity * MAX_MAGNET_OFFSET;

      let nextScale = 1;
      if (!still) {
        nextScale = inside ? 1.025 : 1.01;
      }

      x.set(still ? 0 : (deltaX / length) * offset);
      y.set(still ? 0 : (deltaY / length) * offset);
      scale.set(nextScale);
      const at = still ? null : surfacePoint(event.clientX, event.clientY);
      if (at) {
        getSurface()?.point(at.x, at.y, inside ? 1 : proximity * LENS.near);
      }
      setError((current) => (current ? null : current));
      setNear(true);
      setOver(inside);
    };

    const onDragLeave = (event: globalThis.DragEvent) => {
      if (event.relatedTarget === null) {
        rest();
      }
    };

    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragend", rest);
    window.addEventListener("drop", rest);

    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragend", rest);
      window.removeEventListener("drop", rest);
    };
  }, [still, rest, scale, getSurface, surfacePoint, x, y]);

  const [preview, setPreview] = React.useState<string | null>(null);
  const previewUrl = React.useRef<string | null>(null);
  React.useEffect(
    () => () => {
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current);
      }
    },
    []
  );
  const showPreview = React.useCallback((file?: File) => {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }
    const url =
      file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    previewUrl.current = url;
    setPreview(url);
  }, []);

  const take = React.useCallback(
    (incoming: File[], dropped?: { clientX: number; clientY: number }) => {
      if (busy) {
        return;
      }
      const next = multiple ? incoming : incoming.slice(0, 1);
      if (next.length === 0) {
        return;
      }

      const rejection = rejectionOf(next, accept, maxSize);
      if (rejection) {
        turnAway(rejection);
        return;
      }

      const canvas = canvasRef.current;
      const field = still ? null : getSurface();
      let at: { x: number; y: number } | null = null;
      if (canvas) {
        at = dropped
          ? surfacePoint(dropped.clientX, dropped.clientY)
          : { x: canvas.offsetWidth / 2, y: canvas.offsetHeight / 2 };
      }

      const [landed] = next;
      setFiles(next);
      setError(null);
      showPreview(landed);
      easeFlag();
      onFilesChange?.(next);
      arrivalCount.current += 1;
      const arrival = arrivalCount.current;
      setArrivals(arrival);

      if (!landed) {
        return;
      }
      if (!field || !at) {
        getSurface()?.layAll();
        setSettled(arrival);
        return;
      }
      const mark = fileColorFor(landed);
      const waves = SPLASH.map(({ delay, amp }) =>
        field.splash(at.x, at.y, mark ? toRgb(mark) : field.text, amp, delay)
      );
      const start = waves[0]?.start ?? performance.now();
      field.lay(at.x, at.y, start);
      setLanding({ x: at.x, y: at.y, start, arrival });
      if (!mark && landed.type.startsWith("image/")) {
        void (async () => {
          const color = await imageTint(landed);
          if (!color) {
            return;
          }
          const rgb = toRgb(color);
          for (const wave of waves) {
            field.tint(wave, rgb);
          }
        })();
      }
    },
    [
      accept,
      busy,
      easeFlag,
      getSurface,
      maxSize,
      multiple,
      onFilesChange,
      showPreview,
      still,
      surfacePoint,
      turnAway,
    ]
  );

  React.useLayoutEffect(() => {
    const land = landing;
    const card = cardRef.current;
    const field = getSurface();
    if (!land || !card || !field) {
      return;
    }
    const settle = async () => {
      await Promise.all([
        field.uncover(card, land.x, land.y, land.start),
        field.crossed(land.x, land.y, land.start),
      ]);
      window.clearTimeout(actionsTimer.current);
      actionsTimer.current = window.setTimeout(() => {
        setSettled(land.arrival);
      }, ACTIONS_AFTER_MS);
    };
    void settle();
  }, [landing, getSurface]);

  const open = () => inputRef.current?.click();

  const promptRef = React.useRef<HTMLButtonElement>(null);
  const returning = React.useRef(false);
  const leaving = React.useRef(false);
  const [returned, setReturned] = React.useState(false);
  const remove = () => {
    if (leaving.current) {
      return;
    }
    setError(null);
    easeFlag();
    onFilesChange?.([]);
    getSurface()?.lift(Boolean(still));
    const done = () => {
      leaving.current = false;
      setFiles([]);
      setReturned(true);
      returning.current = true;
      showPreview();
    };
    const card = cardRef.current;
    if (still || !card) {
      done();
      return;
    }
    leaving.current = true;
    const finish = async () => {
      try {
        await card.animate(
          [
            { opacity: 1, scale: "1", filter: "blur(0px)" },
            { opacity: 0, scale: "0.97", filter: "blur(2px)" },
          ],
          { duration: CARD_OUTRO_MS, easing: EXIT_EASE, fill: "forwards" }
        ).finished;
      } catch {
        // The card may unmount before the outro animation finishes.
      }
      done();
    };
    void finish();
  };

  const [first] = files;
  const stored = first ? "" : (value?.trim() ?? "");
  const shownName = first?.name ?? (stored ? nameOfUrl(stored) : "");
  const shownKind = first ? kindOf(first) : kindOfName(shownName);
  const mark = first ? (
    fileMarkFor(first)
  ) : (
    <File strokeWidth={1.8} aria-hidden />
  );
  React.useEffect(() => {
    if (first || stored || !returning.current) {
      return;
    }
    returning.current = false;
    promptRef.current?.focus();
  }, [first, stored]);

  const prompt = promptFor(over, near);

  let dropState = "border-input bg-card";
  if (flag === "on") {
    dropState = "border-destructive/70 bg-destructive/5";
  } else if (over) {
    dropState = "border-foreground/40 bg-muted";
  } else if (near) {
    dropState = "border-ring/70 bg-muted/60";
  }

  let statusIcon = (
    <CheckCircle
      weight="Filled"
      className="size-4 text-emerald-600 dark:text-emerald-400"
      aria-hidden
    />
  );
  if (busy) {
    statusIcon = <Loader className="size-4 animate-spin" aria-hidden />;
  } else if (failed) {
    statusIcon = <FileError className="text-destructive size-4" aria-hidden />;
  }

  let promptInitial:
    | false
    | { opacity: number; scale?: number; filter?: string } = false;
  if (returned && !still) {
    promptInitial = reduced
      ? { opacity: 0 }
      : { opacity: 0, scale: 0.97, filter: "blur(2px)" };
  }

  let flagState = "text-muted-foreground";
  if (flag === "on") {
    flagState = "border-destructive/40 bg-destructive/10 text-destructive";
  } else if (near) {
    flagState = "border-foreground/30 text-foreground";
  }

  const previewSrc = preview ?? stored;

  return (
    <motion.div
      ref={zoneRef}
      onDragOver={(event) => {
        if (!isFileDrag(event.dataTransfer)) {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        take([...event.dataTransfer.files], event);
        rest();
      }}

      aria-busy={busy || undefined}
      style={{ transform: animated ? transform : undefined }}
      className={cn(
        "relative flex min-h-64 w-full max-w-lg flex-col items-center justify-center overflow-hidden rounded-2xl px-6 py-8 text-center transition-[border-color,background-color] duration-200 ease-(--ease-out) outline-none motion-reduce:transition-none",
        dropState,
        flag === "easing" && "duration-500",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={busy}
        className="hidden"
        onChange={(event) => {
          take([...(event.target.files ?? [])]);

          event.target.value = "";
        }}
      />

      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
      />

      <span
        aria-hidden
        className="dropzone-edge pointer-events-none absolute inset-0 rounded-[inherit] border-inherit"
      >
        <span className="dropzone-edge-dashed absolute inset-0 rounded-[inherit] border border-dashed border-inherit" />
        <span className="dropzone-edge-solid absolute inset-0 rounded-[inherit] border border-inherit" />
      </span>

      {first || stored ? (
        <div
          key={`${first ? "file" : "stored"}-${String(arrivals)}-${stored}`}
          ref={cardRef}
          className="dropzone-card relative flex w-full flex-col items-center"
        >
          <div className="bg-background text-foreground flex size-14 items-center justify-center overflow-hidden rounded-xl border [&_svg:not([class*='size-'])]:size-5.5">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt=""
                decoding="async"
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              mark
            )}
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold">
            {statusIcon}
            {statusOf(busy, files.length, failed)}
          </p>

          <p
            dir="auto"
            className="text-muted-foreground mt-1 max-w-full truncate text-sm"
          >
            {shownName}
            {files.length > 1 ? ` +${files.length - 1}` : ""}
          </p>
          <p className="text-muted-foreground mt-0.5 font-mono text-xs tabular-nums">
            {shownKind}
            {first ? ` · ${formatBytes(first.size)}` : ""}
          </p>

          <div
            inert={settled !== arrivals}
            data-shown={settled === arrivals || undefined}
            className="group/actions mt-5 flex items-center justify-center gap-2"
          >
            {required ? null : (
              <span className={ACTION_INTRO}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={remove}
                  disabled={busy}
                  aria-label={`Remove ${shownName}`}
                >
                  <Trash data-icon="inline-start" aria-hidden />
                  Remove
                </Button>
              </span>
            )}
            <span className={cn(ACTION_INTRO, "delay-60")}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={open}
                disabled={busy}
              >
                <Upload data-icon="inline-start" aria-hidden />
                Upload another
              </Button>
            </span>
          </div>
        </div>
      ) : (
        <motion.button
          ref={promptRef}
          initial={promptInitial}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          type="button"
          onClick={open}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? messageId : undefined}
          className="transition-ring focus-visible:ring-ring/50 relative flex cursor-pointer flex-col items-center rounded-xl outline-none focus-visible:ring-3 focus-visible:outline-1"
        >
          <div
            className={cn(
              "bg-background mb-4 flex size-12 items-center justify-center rounded-xl border transition-[border-color,background-color,color] duration-200 ease-(--ease-out) motion-reduce:transition-none",
              flagState,
              flag === "easing" && "duration-500"
            )}
          >
            <span className="grid place-items-center *:col-start-1 *:row-start-1">
              <AnimatePresence initial={false}>
                <motion.span
                  key={flag === "on" ? "turned-away" : "upload"}
                  className="flex"
                  initial={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
                  }
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
                  }
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                >
                  {flag === "on" ? (
                    <FileError
                      className="size-5.5"
                      strokeWidth={1.8}
                      aria-hidden
                    />
                  ) : (
                    (icon ?? (
                      <FileUp
                        className="size-5.5"
                        strokeWidth={1.8}
                        aria-hidden
                      />
                    ))
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>

          <p className="grid text-base font-semibold">
            {PROMPTS.map((label) => (
              <motion.span
                key={label}
                aria-hidden={label === prompt ? undefined : true}
                className="col-start-1 row-start-1"
                initial={false}

                animate={
                  label === prompt
                    ? { opacity: 1, y: [4, 0], filter: "blur(0px)" }
                    : { opacity: 0, y: -4, filter: "blur(3px)" }
                }
                transition={
                  reduced
                    ? {
                        type: "spring",
                        duration: 0.22,
                        bounce: 0,
                        y: { duration: 0 },
                        filter: { duration: 0 },
                      }
                    : { type: "spring", duration: 0.22, bounce: 0 }
                }
              >
                {label}
              </motion.span>
            ))}
          </p>
          <div className="text-muted-foreground mt-0.5 flex flex-col text-xs leading-5">
            {helper ?? (
              <span>
                {accept === ACCEPT ? ACCEPT_NAMES : describeAccept(accept)} ·{" "}
                {formatBytes(maxSize)} limit
              </span>
            )}
          </div>
        </motion.button>
      )}

      <div id={messageId} role="alert" className="relative w-full max-w-72">
        <AnimatePresence initial={false}>
          {error ? (
            <motion.div
              key={error.message}
              className="overflow-hidden"
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, height: 0, y: -4, filter: "blur(2px)" }
              }
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
                filter: "blur(0px)",
              }}
              exit={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, height: 0, filter: "blur(2px)" }
              }
              transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            >
              <p className="text-destructive pt-4 text-xs leading-5">
                {error.message}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export { Dropzone };
