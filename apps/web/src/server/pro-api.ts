import { requireMcpAuth } from "@better-auth/mcp";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { MCP_RESOURCE, MCP_SCOPE } from "@/constants/oauth";
import { MOVES } from "@/lib/moves";
import type { Move, MovePrompt } from "@/lib/moves";

import { auth } from "./auth";
import movePrompts from "./data/move-prompts.json";
import { user } from "./db/schema";
import { hasLivePlan } from "./plans";

// Server-only: the Pro moves API (`/api/mcp/moves`) for the Pro tools of the
// MotionVideo MCP server. The MCP client signs in with the user's account
// (OAuth; this site is the authorization server) and the MCP server forwards
// the access token here. `requireMcpAuth` checks it is ours, bound to the
// MCP resource and carries the account scope; `sub` is the user id, and
// the account's plan (its own, or a Business seat) decides access.

/** A move with its Pro half: the copy-ready prompt and its parameters. */
export interface ProMove extends Move {
  prompt: string;
  parameters: string[];
}

const PROMPTS = new Map<string, MovePrompt>(
  movePrompts.prompts.map((prompt): [string, MovePrompt] => [
    prompt.slug,
    prompt,
  ])
);

const PRO_MOVES: ProMove[] = MOVES.flatMap((move) => {
  const entry = PROMPTS.get(move.slug);
  return entry
    ? [{ ...move, prompt: entry.prompt, parameters: entry.parameters }]
    : [];
});

const PRO_MOVES_BY_SLUG = new Map<string, ProMove>(
  PRO_MOVES.map((move): [string, ProMove] => [move.slug, move])
);

interface ProMovesList {
  moves: ProMove[];
}

interface ProMoveOne {
  move: ProMove;
}

interface ProMovesError {
  error: "missing_subject" | "no_plan" | "not_found" | "unavailable";
}

const json = (body: ProMovesList | ProMoveOne | ProMovesError, status = 200) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });

/** Whether the account behind a token's `sub` has a live Pro/Business plan. */
const subjectHasPlan = async (userId: string) => {
  const account = await drizzle(env.DB)
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .get();
  return account !== undefined && (await hasLivePlan(account));
};

/**
 * Every move with its prompt (no `slug`), or one move by slug. A missing or
 * invalid token gets `requireMcpAuth`'s 401 challenge; then 403 `no_plan`
 * without a live plan, 404 `not_found` for an unknown slug, 503
 * `unavailable` when D1 can't be reached.
 */
export const proMovesResponse = (request: Request, slug?: string) =>
  requireMcpAuth(
    auth,
    async (_request, claims) => {
      if (!claims.sub) {
        return json({ error: "missing_subject" }, 401);
      }
      let allowed: boolean;
      try {
        allowed = await subjectHasPlan(claims.sub);
      } catch (error) {
        console.error("Plan lookup failed", error);
        return json({ error: "unavailable" }, 503);
      }
      if (!allowed) {
        return json({ error: "no_plan" }, 403);
      }
      if (slug === undefined) {
        return json({ moves: PRO_MOVES });
      }
      const move = PRO_MOVES_BY_SLUG.get(slug);
      if (!move) {
        return json({ error: "not_found" }, 404);
      }
      return json({ move });
    },
    { requiredScopes: [MCP_SCOPE], resource: MCP_RESOURCE }
  )(request);
