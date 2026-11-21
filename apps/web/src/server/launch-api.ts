import { requireMcpAuth } from "@better-auth/mcp";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { z } from "zod";

import { CACHE_CONTROL } from "@/constants/cache-control";
import { LAUNCH_VIDEOS_LIVE } from "@/constants/launch-videos";
import { MCP_RESOURCE, MCP_SCOPE } from "@/constants/oauth";
import { LAUNCH_FILMS, LAUNCH_SCENES } from "@/lib/launch-catalog";

import { getAuth } from "./auth";
import { user } from "./db/schema";
import {
  LaunchError,
  compileFilmPrompt,
  composePrompt,
} from "./launch-compiler";
import type {
  CompiledPrompt,
  LaunchErrorCode,
  LaunchErrorDetails,
} from "./launch-compiler";
import { LAUNCH_INDEX } from "./launch-data";
import {
  MAX_BODY_BYTES,
  composeBody,
  filmPromptBody,
  invalidRequest,
  parseBody,
  parseSearchParams,
  searchBody,
} from "./launch-requests";
import type {
  InvalidRequest,
  LaunchSearchBody,
  Parsed,
} from "./launch-requests";
import { hasLivePlan } from "./plans";

// Server-only: the Launch Videos API (`/api/mcp/launch-videos`) behind the
// MotionVideo MCP server's `search-launch-scenes`, `get-launch-prompt` and
// `compose-launch-prompt` tools. Auth and D1 handling follow
// src/server/pro-api.ts (read its note on `jwksUrl`): the token's `sub` is
// the account, and every call needs a live Pro or Business plan, its own or
// a Business seat. Requests and prompts are never logged.

interface LaunchApiError {
  error: LaunchErrorCode | "missing_subject" | "no_plan" | "unavailable";
  message?: string;
  details?: LaunchErrorDetails;
}

const json = (
  body:
    | LaunchSearchBody
    | { prompt: CompiledPrompt }
    | LaunchApiError
    | InvalidRequest,
  status = 200
) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": CACHE_CONTROL.PRIVATE },
  });

/** Whether a token's `sub` is an account with a live plan or seat. */
const subjectHasPlan = async (userId: string): Promise<boolean> => {
  const account = await drizzle(env.DB)
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .get();
  return account !== undefined && (await hasLivePlan(account));
};

/**
 * Runs `handle` for an account with a live plan. 404 `not_found` while
 * the release flag is off; a missing or invalid token gets `requireMcpAuth`'s
 * 401 challenge; then 403 `no_plan` without a live plan, 503 `unavailable`
 * when D1 can't be reached.
 */
const gated = (
  request: Request,
  handle: (request: Request) => Promise<Response> | Response
) => {
  if (!LAUNCH_VIDEOS_LIVE) {
    return Promise.resolve(json({ error: "not_found" }, 404));
  }
  return requireMcpAuth(
    getAuth(),
    async (authorized, claims) => {
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
      return handle(authorized);
    },
    { requiredScopes: [MCP_SCOPE], resource: MCP_RESOURCE }
  )(request);
};

/** A body under the size cap, checked against a strict schema. */
const readBody = async <T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<Parsed<T>> => {
  // A declared length over the cap is refused unread; parseBody checks the
  // bytes actually sent.
  if (Number(request.headers.get("Content-Length") ?? "0") > MAX_BODY_BYTES) {
    return {
      ok: false,
      error: invalidRequest(`The body is over ${MAX_BODY_BYTES} bytes.`),
    };
  }
  return parseBody(schema, await request.arrayBuffer());
};

/** Compile, mapping a compiler refusal to its status (404 or 422). */
const promptResponse = (compile: () => CompiledPrompt) => {
  try {
    return json({ prompt: compile() });
  } catch (error) {
    if (error instanceof LaunchError) {
      const { status, code, message, details } = error;
      return json({ error: code, message, details }, status);
    }
    throw error;
  }
};

/** `GET /search`: public summaries of films or scenes, one page at a time. */
export const launchSearchResponse = (request: Request) =>
  gated(request, (authorized) => {
    const parsed = parseSearchParams(new URL(authorized.url).searchParams);
    if (!parsed.ok) {
      return json(parsed.error, 422);
    }
    return json(searchBody(LAUNCH_FILMS, LAUNCH_SCENES, parsed.value));
  });

/** `POST /prompt`: a film's prompt, or one of its scenes'. */
export const launchPromptResponse = (request: Request) =>
  gated(request, async (authorized) => {
    const parsed = await readBody(authorized, filmPromptBody);
    if (!parsed.ok) {
      return json(parsed.error, 422);
    }
    return promptResponse(() => compileFilmPrompt(LAUNCH_INDEX, parsed.value));
  });

/** `POST /compose`: one prompt for 1–16 ordered scenes from any films. */
export const launchComposeResponse = (request: Request) =>
  gated(request, async (authorized) => {
    const parsed = await readBody(authorized, composeBody);
    if (!parsed.ok) {
      return json(parsed.error, 422);
    }
    return promptResponse(() => composePrompt(LAUNCH_INDEX, parsed.value));
  });
