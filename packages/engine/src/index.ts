// @motionvideo/engine: the shared engine behind MotionVideo's creative
// tools. This entry is data only (schemas, templates, defaults, timing) and
// safe to import from server-rendered pages. The React/three.js composition
// lives in "@motionvideo/engine/composition" and browser rendering in
// "@motionvideo/engine/render"; both are browser-only.

export * from "./schema/common.ts";
export { deepMerge } from "./kit/merge.ts";
export type { DeepPartial } from "./kit/merge.ts";
export { SINGLE_WEIGHT_FONTS } from "./kit/font-weights.ts";

export {
  CARD_RATIOS,
  showcaseDocSchema,
  styleSchema,
} from "./showcase/schema.ts";
export type {
  CardRatio,
  ShowcaseDoc,
  ShowcaseDocInput,
  Style,
} from "./showcase/schema.ts";
export {
  allParams,
  commonParams,
  DEFAULT_TEMPLATE_ID,
  getTemplate,
  hasTemplate,
  resolveParams,
  TEMPLATES,
  templatesIn,
} from "./showcase/registry.ts";
export {
  applyLook,
  applyTemplate,
  BASE_STYLE,
  DEFAULT_BACKGROUND,
  LOOK_IDS,
  LOOKS,
  newShowcaseDoc,
  templateStyle,
} from "./showcase/defaults.ts";
export type { LookId } from "./showcase/defaults.ts";
export {
  outputSize,
  showcaseTiming,
  showcaseVideoConfig,
} from "./showcase/timing.ts";
export { COLLECTIONS } from "./showcase/types.ts";
export type {
  CardPose,
  CollectionId,
  LayoutContext,
  ParamDef,
  ParamValues,
  TemplateDef,
} from "./showcase/types.ts";
