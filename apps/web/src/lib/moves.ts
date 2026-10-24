import { ROUTES } from "@/constants/routes";
import moves from "@/data/moves.json";
import type { MoveFamily } from "@/lib/move-families";

// Moves: MotionVideo's own library of motion design techniques. Each move's
// public part (this module, shipped to the browser and indexed) explains what
// it is, when to use it and where it appears in the gallery. Its copy-ready
// prompt snippet is Pro-only: it lives in src/server/data/move-prompts.json
// and is only read by server functions after an access check.

export interface Move {
  /** URL slug: `/moves/<family>/<slug>`. Never a family name. */
  slug: string;
  name: string;
  family: MoveFamily;
  /** Other names people search for. */
  aka: string[];
  /** One sentence: what it looks like. Used as the meta description. */
  summary: string;
  /** Markdown, ~100–200 words: how it reads, when it works, common mistakes. */
  body: string;
  /** Short "good for" tags, e.g. "logo stings", "counters". */
  goodFor: string[];
  /** Catalog video slugs (src/data/motion-catalog.json) that show this move. */
  examples: string[];
  /** Related move slugs. */
  related: string[];
}

// SAFETY: moves.json is ours and checked by scripts/check-moves.mjs (family in
// MOVE_FAMILIES, unique slugs, known examples and related slugs); JSON imports
// widen `family` to string.
export const MOVES: Move[] = moves.moves as Move[];

export const findMove = (slug: string | undefined) =>
  MOVES.find((move) => move.slug === slug);

/** A move's page: `/moves/<family>/<slug>`. */
export const movePath = (move: Pick<Move, "family" | "slug">) =>
  `${ROUTES.MOVES}/${move.family}/${move.slug}`;

/** The moves a grid shows: every move, or one family's. */
export const movesIn = (family: MoveFamily | undefined) =>
  family ? MOVES.filter((move) => move.family === family) : MOVES;

/** The moves before and after one in the grid behind its overlay. */
export interface MoveNeighbours {
  previous?: string;
  next?: string;
}

export const moveNeighbours = (
  slug: string,
  family?: MoveFamily
): MoveNeighbours => {
  const list = movesIn(family);
  const index = list.findIndex((move) => move.slug === slug);
  if (index === -1) {
    return {};
  }
  return { previous: list[index - 1]?.slug, next: list[index + 1]?.slug };
};

/** The Pro-only half of a move, served by `getMovePrompt` after an access check. */
export interface MovePrompt {
  slug: string;
  /** The copy-ready prompt snippet that asks an agent for this move. */
  prompt: string;
  /** Knobs worth naming in a prompt, e.g. "stagger 40–80 ms". */
  parameters: string[];
}
