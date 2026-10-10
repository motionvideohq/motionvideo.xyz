import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import { communitySubmissionSchema } from "@/lib/community";
import type { SubmissionResult } from "@/lib/community";

import { getCurrentSession } from "./auth";
import { communitySubmissions } from "./db/community-schema";

const allowSubmission = async () => {
  const ip = getRequest().headers.get("cf-connecting-ip") ?? "unknown";
  const { success } = await env.CONTACT_LIMITER.limit({ key: ip });
  return success;
};

/** The signed-in account submissions are filed under; `null` when signed out. */
export const getSubmitter = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getCurrentSession();
    return session ? { email: session.user.email } : null;
  }
);

export const submitCommunityEntry = createServerFn({ method: "POST" })
  .validator(communitySubmissionSchema)
  .handler(async ({ data }): Promise<SubmissionResult> => {
    const session = await getCurrentSession();
    if (!session) {
      return { ok: false, error: "unauthorized" };
    }
    if (!(await allowSubmission())) {
      return { ok: false, error: "rate-limit" };
    }
    try {
      const now = new Date();
      await drizzle(env.DB)
        .insert(communitySubmissions)
        .values({
          id: crypto.randomUUID(),
          kind: data.kind,
          category: data.category ?? null,
          name: data.name,
          email: session.user.email,
          title: data.title,
          url: data.url,
          description: data.description,
          prompt: data.kind === "video" && data.prompt ? data.prompt : null,
          attributionConsentAt: now,
          createdAt: now,
          status: "pending",
        })
        .run();
      return { ok: true };
    } catch {
      return { ok: false, error: "storage" };
    }
  });
