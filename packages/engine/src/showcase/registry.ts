import { z } from "zod";

import { ALL_TEMPLATES } from "./templates/index.ts";
import type {
  CollectionId,
  ParamDef,
  ParamValues,
  TemplateDef,
} from "./types.ts";

/** Every Showcase template, in gallery order within each collection. */
export const TEMPLATES: readonly TemplateDef[] = ALL_TEMPLATES;

const BY_ID: Record<string, TemplateDef> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t])
);

export const DEFAULT_TEMPLATE_ID = "shelf";

/** A template by id; unknown ids fall back to the default template. */
export const getTemplate = (id: string): TemplateDef =>
  BY_ID[id] ?? BY_ID[DEFAULT_TEMPLATE_ID];

export const hasTemplate = (id: string) => id in BY_ID;

export const templatesIn = (collection: CollectionId) =>
  TEMPLATES.filter((t) => t.collection === collection);

/** Controls every template has: card count, speed and direction. */
export const commonParams = (template: TemplateDef): ParamDef[] => [
  {
    type: "range",
    key: "count",
    label: "Cards",
    min: template.slots.min,
    max: template.slots.max,
    step: 1,
    default: template.slots.default,
  },
  {
    type: "range",
    key: "speed",
    label: "Speed",
    min: 0.25,
    max: 3,
    step: 0.05,
    default: 1,
    unit: "×",
  },
  {
    type: "select",
    key: "direction",
    label: "Direction",
    options: [
      { value: "forward", label: "Forward" },
      { value: "backward", label: "Backward" },
    ],
    default: "forward",
  },
];

export const allParams = (template: TemplateDef): ParamDef[] => [
  ...commonParams(template),
  ...template.params,
];

/** A stored value is kept only if it is still valid for this control. */
const fits = (def: ParamDef, value: ParamValues[string] | undefined) => {
  switch (def.type) {
    case "range": {
      return z.number().min(def.min).max(def.max).safeParse(value).success;
    }
    case "select": {
      return def.options.some((o) => o.value === value);
    }
    default: {
      return z.boolean().safeParse(value).success;
    }
  }
};

/** The template's defaults with every valid stored value applied. */
export const resolveParams = (
  template: TemplateDef,
  stored: ParamValues
): ParamValues =>
  Object.fromEntries(
    allParams(template).map((def) => [
      def.key,
      fits(def, stored[def.key]) ? stored[def.key] : def.default,
    ])
  );

/** Default values for a template's controls. */
export const defaultParams = (template: TemplateDef): ParamValues =>
  resolveParams(template, {});
