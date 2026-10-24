import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { hasPro } from "@/constants/plans";
import catalog from "@/data/motion-catalog.json";
import type { MotionVideo } from "@/lib/motion-catalog";
import { MOVES, findMove } from "@/lib/moves";
import type { MovePrompt } from "@/lib/moves";

import { getCurrentSession } from "./auth";
import movePrompts from "./data/move-prompts.json";
import { planAccessFor } from "./plans";

// Server-only: the prompts are Pro content, and the catalog is ~1 MB the
// moves pages should not ship to the browser just to show a few posters.
// Server function handlers (and their imports) stay out of the client bundle.

const PROMPTS = new Map<string, MovePrompt>(
  movePrompts.prompts.map((prompt): [string, MovePrompt] => [
    prompt.slug,
    prompt,
  ])
);

const VIDEOS = new Map<string, MotionVideo>(
  catalog.videos.map((video): [string, MotionVideo] => [video.slug, video])
);

export type MovePromptResult =
  | { locked: true }
  | { locked: false; prompt: MovePrompt };

/**
 * A move's copy-ready prompt for Pro and Business accounts; locked for
 * everyone else, so the snippet never reaches their page.
 */
export const getMovePrompt = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(100) }))
  .handler(async ({ data }): Promise<MovePromptResult> => {
    const session = await getCurrentSession();
    if (!session || !hasPro(await planAccessFor(session.user))) {
      return { locked: true };
    }
    const prompt = PROMPTS.get(data.slug);
    if (!prompt) {
      // Every public move ships with a prompt; a gap is a data bug, and
      // showing a paying account the upgrade panel would hide it.
      throw new Error(`No prompt for move "${data.slug}"`);
    }
    return { locked: false, prompt };
  });

/** The clip a move's card loops: one of its gallery examples. */
export type MoveCardMedia = Pick<
  MotionVideo,
  "poster" | "preview" | "width" | "height"
>;

// Each move's card plays its first example that no earlier move's card
// already shows (else its first example), so neighbouring cards in the grid
// don't repeat a clip. Moves without examples get a text card.
const shownVideos = new Set<string>();
const CARDS: Record<string, MoveCardMedia> = Object.fromEntries(
  MOVES.flatMap((move): [string, MoveCardMedia][] => {
    const videos = move.examples.flatMap((slug) => {
      const video = VIDEOS.get(slug);
      return video ? [video] : [];
    });
    const video =
      videos.find((entry) => !shownVideos.has(entry.slug)) ?? videos[0];
    if (!video) {
      return [];
    }
    shownVideos.add(video.slug);
    const { poster, preview, width, height } = video;
    return [[move.slug, { poster, preview, width, height }]];
  })
);

/** Card media for every move that has a gallery example, by move slug. */
export const getMoveCards = createServerFn({ method: "GET" }).handler(
  () => CARDS
);

/** The catalog videos a move lists as examples, in its order. */
export const getMoveExamples = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1).max(100) }))
  .handler(({ data }): MotionVideo[] =>
    (findMove(data.slug)?.examples ?? []).flatMap((slug) => {
      const video = VIDEOS.get(slug);
      return video ? [video] : [];
    })
  );
