import type { TemplateDef } from "../types.ts";
import { barrel } from "./barrel.ts";
import { bentoBuild } from "./bento-build.ts";
import { boxTurn } from "./box-turn.ts";
import { browserHero } from "./browser-hero.ts";
import { cameraGlide } from "./camera-glide.ts";
import { curveRail } from "./curve-rail.ts";
import { deckShuffle } from "./deck-shuffle.ts";
import { depthCorridor } from "./depth-corridor.ts";
import { doubleHelix } from "./double-helix.ts";
import { driftField } from "./drift-field.ts";
import { flipOver } from "./flip-over.ts";
import { handFan } from "./hand-fan.ts";
import { laptopOpen } from "./laptop-open.ts";
import { leanGrid } from "./lean-grid.ts";
import { lift } from "./lift.ts";
import { marquee } from "./marquee.ts";
import { phoneOrbit } from "./phone-orbit.ts";
import { planet } from "./planet.ts";
import { pushThrough } from "./push-through.ts";
import { shelf } from "./shelf.ts";
import { tiltedBand } from "./tilted-band.ts";

/** Every Showcase template, grouped by collection in gallery order. */
export const ALL_TEMPLATES: readonly TemplateDef[] = [
  shelf,
  curveRail,
  marquee,
  lift,
  tiltedBand,
  barrel,
  doubleHelix,
  planet,
  handFan,
  deckShuffle,
  leanGrid,
  bentoBuild,
  cameraGlide,
  depthCorridor,
  driftField,
  pushThrough,
  boxTurn,
  flipOver,
  browserHero,
  phoneOrbit,
  laptopOpen,
];
