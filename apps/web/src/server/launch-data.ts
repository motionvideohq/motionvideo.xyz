import { LAUNCH_FILMS, LAUNCH_SCENES } from "@/lib/launch-catalog";
import type { LaunchRecipes } from "@/lib/launch-videos";

import launchRecipes from "./data/launch-recipes.json";
import { indexLaunchData } from "./launch-compiler";

// Server-only: the one compiler index the server functions and the MCP API
// share, so the site and MCP return byte-identical prompts for the same
// request. Never import this from client code: it carries the recipes.

// SAFETY: launch-recipes.json is ours and checked by
// scripts/check-launch-videos.mjs; JSON imports widen the enums to string.
export const LAUNCH_INDEX = indexLaunchData({
  films: LAUNCH_FILMS,
  scenes: LAUNCH_SCENES,
  recipes: launchRecipes as LaunchRecipes,
});
