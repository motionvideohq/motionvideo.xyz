import { deepMerge } from "../kit/merge.ts";
import type { DeepPartial } from "../kit/merge.ts";
import { overlaysSchema } from "../schema/common.ts";
import {
  DEFAULT_TEMPLATE_ID,
  defaultParams,
  getTemplate,
  resolveParams,
} from "./registry.ts";
import type { ShowcaseDoc, Style } from "./schema.ts";
import type { TemplateDef } from "./types.ts";

/** The look before a template or one-click look changes it. */
export const BASE_STYLE: Style = {
  cards: {
    radius: 0.05,
    border: 0,
    borderColor: "#ffffff",
    ratio: "auto",
    back: "mirror",
    backColor: "#1c1c1f",
    brightness: 1,
    frame: "none",
    frameTone: "dark",
  },
  shadow: {
    on: true,
    opacity: 0.28,
    softness: 0.4,
    offset: 0.35,
    color: "#000000",
  },
  light: { on: false, shade: 0.35, glare: 0, sweep: false },
  depth: { on: false, amount: 0.4, focus: 0 },
  camera: { fov: 30, zoom: 1, orbit: 0, tilt: 0, drift: 0 },
  finish: {
    grain: 0,
    vignette: 0,
    bloom: 0,
    contrast: 1,
    saturation: 1,
    exposure: 1,
  },
};

export const templateStyle = (template: TemplateDef): Style =>
  deepMerge(BASE_STYLE, template.style);

/** One-click looks, layered over whatever the template set up. */
interface Look {
  name: string;
  style: DeepPartial<Style>;
  background?: ShowcaseDoc["background"];
}

export const LOOKS = {
  plain: {
    name: "Plain",
    style: {
      light: { on: false, glare: 0 },
      depth: { on: false },
      finish: {
        grain: 0,
        vignette: 0,
        bloom: 0,
        contrast: 1,
        saturation: 1,
        exposure: 1,
      },
    },
  },
  mono: {
    name: "Mono",
    style: {
      finish: { saturation: 0, contrast: 1.12, grain: 0.25, vignette: 0.3 },
    },
    background: {
      type: "radial",
      colors: ["#2a2a2e", "#050506"],
      x: 0.5,
      y: 0.45,
    },
  },
  "soft-focus": {
    name: "Soft Focus",
    style: {
      depth: { on: true, amount: 0.55, focus: 0 },
      finish: { bloom: 0.35, grain: 0.1 },
    },
    background: {
      type: "mesh",
      colors: ["#fbf7ff", "#ffd6e7", "#cfe6ff", "#ffe9c7"],
      speed: 1,
    },
  },
  grain: {
    name: "Grain",
    style: {
      finish: { grain: 0.6, vignette: 0.45, contrast: 1.06, saturation: 0.9 },
    },
  },
  night: {
    name: "Night",
    style: {
      light: { on: true, shade: 0.5, glare: 0.5, sweep: true },
      finish: { bloom: 0.5, contrast: 1.1, saturation: 1.15 },
    },
    background: {
      type: "mesh",
      colors: ["#05050a", "#3b1d6e", "#0d2a5c", "#04161c"],
      speed: 1,
    },
  },
  pastel: {
    name: "Pastel",
    style: {
      shadow: { opacity: 0.16 },
      finish: { contrast: 0.95, saturation: 0.92, exposure: 1.04 },
    },
    background: {
      type: "linear",
      colors: ["#fdf2f8", "#eef2ff", "#ecfeff"],
      angle: 135,
    },
  },
} satisfies Record<string, Look>;

export type LookId = keyof typeof LOOKS;
export const LOOK_IDS = Object.keys(LOOKS).filter(
  (id): id is LookId => id in LOOKS
);

export const DEFAULT_BACKGROUND: ShowcaseDoc["background"] = {
  type: "linear",
  colors: ["#141417", "#26262b"],
  angle: 120,
};

/** A fresh project on the default template, with no media yet. */
export const newShowcaseDoc = (
  templateId = DEFAULT_TEMPLATE_ID
): ShowcaseDoc => {
  const template = getTemplate(templateId);
  return {
    v: 1,
    tool: "showcase",
    name: "Untitled project",
    template: template.id,
    params: defaultParams(template),
    style: templateStyle(template),
    keepLook: false,
    media: [],
    mediaOrder: "in-order",
    seed: 1,
    frame: { aspect: "16:9" },
    timing: { loops: 1 },
    assets: [],
    background: DEFAULT_BACKGROUND,
    overlays: overlaysSchema.parse({}),
  };
};

/**
 * Switches template: its own controls, and its look unless the user locked
 * theirs. Media, text, logo, frame and timing carry over.
 */
export const applyTemplate = (
  doc: ShowcaseDoc,
  templateId: string
): ShowcaseDoc => {
  const template = getTemplate(templateId);
  return {
    ...doc,
    template: template.id,
    params: resolveParams(template, {
      count: doc.params.count ?? template.slots.default,
    }),
    style: doc.keepLook ? doc.style : templateStyle(template),
    look: doc.keepLook ? doc.look : undefined,
  };
};

export const applyLook = (doc: ShowcaseDoc, lookId: LookId): ShowcaseDoc => {
  const look: Look = LOOKS[lookId];
  return {
    ...doc,
    look: lookId,
    style: deepMerge(templateStyle(getTemplate(doc.template)), look.style),
    background: look.background ?? doc.background,
  };
};
