import { createServerFn } from "@tanstack/react-start";

import { LAUNCH_VIDEOS_LIVE } from "@/constants/launch-videos";
import { hasPro } from "@/constants/plans";
import type { PublicSlot } from "@/lib/launch-videos";

import { getCurrentSession } from "./auth";
import {
  LaunchError,
  compileFilmPrompt,
  composePrompt,
  publicSlots,
} from "./launch-compiler";
import type { CompiledPrompt, LaunchErrorCode } from "./launch-compiler";
import { LAUNCH_INDEX } from "./launch-data";
import { composeInput, filmPromptInput, slotsInput } from "./launch-requests";
import { planAccessFor } from "./plans";

// Server-only: Launch Videos prompts for the site. The prompt is fetched on
// a user action only, never in a loader, so it stays out of page hydration
// and CDN caches. The MCP API (src/server/launch-api.ts) compiles from the
// same index, so both return the same markdown for the same request.

/** JSON a LaunchError's details hold: ids, indexes, versions, joins. */
type LaunchErrorDetail =
  | string
  | number
  | boolean
  | null
  | LaunchErrorDetail[]
  | { [key: string]: LaunchErrorDetail };

export type LaunchPromptResult =
  | { status: "locked"; reason: "signed_out" | "no_plan" }
  | { status: "ok"; prompt: CompiledPrompt }
  | {
      status: "error";
      error: {
        code: LaunchErrorCode;
        message: string;
        details: Record<string, LaunchErrorDetail>;
      };
    };

const NOT_LIVE: LaunchPromptResult = {
  status: "error",
  error: {
    code: "not_found",
    message: "Launch Videos is not live.",
    details: {},
  },
};

/** Locked unless the account has a Pro or Business plan or seat. */
const lockedReason = async (): Promise<LaunchPromptResult | null> => {
  const session = await getCurrentSession();
  if (!session) {
    return { status: "locked", reason: "signed_out" };
  }
  if (hasPro(await planAccessFor(session.user))) {
    return null;
  }
  return { status: "locked", reason: "no_plan" };
};

/** A compiler refusal as a result the page can show; anything else throws. */
const compiled = (compile: () => CompiledPrompt): LaunchPromptResult => {
  try {
    return { status: "ok", prompt: compile() };
  } catch (error) {
    if (error instanceof LaunchError) {
      const { code, message } = error;
      // SAFETY: the compiler only puts JSON values in `details` (the MCP API
      // sends the same object with Response.json).
      const details = error.details as Record<string, LaunchErrorDetail>;
      return { status: "error", error: { code, message, details } };
    }
    throw error;
  }
};

/** A film's prompt, or one of its scenes', in the chosen mode and renderer. */
export const getLaunchPrompt = createServerFn({ method: "POST" })
  .validator(filmPromptInput)
  .handler(async ({ data }): Promise<LaunchPromptResult> => {
    if (!LAUNCH_VIDEOS_LIVE) {
      return NOT_LIVE;
    }
    return (
      (await lockedReason()) ??
      compiled(() => compileFilmPrompt(LAUNCH_INDEX, data))
    );
  });

/** One prompt for an ordered storyboard of scenes from any films. */
export const composeLaunchPrompt = createServerFn({ method: "POST" })
  .validator(composeInput)
  .handler(async ({ data }): Promise<LaunchPromptResult> => {
    if (!LAUNCH_VIDEOS_LIVE) {
      return NOT_LIVE;
    }
    return (
      (await lockedReason()) ??
      compiled(() => composePrompt(LAUNCH_INDEX, data))
    );
  });

/**
 * What the selected scenes ask the user for (keys, labels, types,
 * required), without any values. Public: the brief form shows it to
 * everyone. Throws LaunchError `not_found` for an unknown scene.
 */
export const getLaunchSlots = createServerFn({ method: "GET" })
  .validator(slotsInput)
  .handler(({ data }): PublicSlot[] => {
    if (!LAUNCH_VIDEOS_LIVE) {
      throw new LaunchError("not_found", "Launch Videos is not live.");
    }
    return publicSlots(LAUNCH_INDEX, data.sceneIds);
  });
