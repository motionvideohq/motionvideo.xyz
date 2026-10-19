import { requireMcpAuth } from "@better-auth/mcp";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { MCP_RESOURCE, MCP_SCOPE } from "@/constants/oauth";
import { absoluteUrl } from "@/constants/url";
import { findBookmarkItem } from "@/lib/bookmark-catalog";
import type { SubmissionKind } from "@/lib/community";
import { auth } from "@/server/auth";
import { communitySubmissions } from "@/server/db/community-schema";
import { user } from "@/server/db/schema";

// The MCP server's `my-featured` tool reads through here with the access
// token Better Auth issued for it; `sub` is the user id. Submissions are
// filed under the account email, so resolve it from the id in the token.

/** Where a featured submission ended up: its video page or directory entry. */
const featuredUrlOf = (row: {
  featuredItemId: string | null;
  kind: SubmissionKind;
}): string | undefined => {
  if (!row.featuredItemId) {
    return undefined;
  }
  const item = findBookmarkItem(row.kind, row.featuredItemId);
  if (!item) {
    return undefined;
  }
  return item.kind === "video"
    ? absoluteUrl(`/videos/${item.video.slug}`)
    : item.entry.url;
};

const handleFeatured = requireMcpAuth(
  auth,
  async (_request, claims) => {
    if (!claims.sub) {
      return Response.json({ error: "missing_subject" }, { status: 401 });
    }
    const db = drizzle(env.DB);
    const account = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, claims.sub))
      .get();
    if (!account) {
      return Response.json({ submissions: [] });
    }
    const rows = await db
      .select({
        featuredItemId: communitySubmissions.featuredItemId,
        kind: communitySubmissions.kind,
        title: communitySubmissions.title,
        url: communitySubmissions.url,
        description: communitySubmissions.description,
        createdAt: communitySubmissions.createdAt,
      })
      .from(communitySubmissions)
      .where(
        and(
          eq(communitySubmissions.email, account.email),
          eq(communitySubmissions.status, "featured")
        )
      )
      .orderBy(desc(communitySubmissions.createdAt))
      .all();
    const submissions = rows.map((row) => ({
      description: row.description,
      featuredItemId: row.featuredItemId ?? undefined,
      featuredUrl: featuredUrlOf(row),
      kind: row.kind,
      status: "featured",
      submittedAt: row.createdAt.toISOString(),
      title: row.title,
      url: row.url,
    }));
    return Response.json({ submissions });
  },
  { requiredScopes: [MCP_SCOPE], resource: MCP_RESOURCE }
);

export const Route = createFileRoute("/api/mcp/featured")({
  server: {
    handlers: {
      GET: ({ request }) => handleFeatured(request),
    },
  },
});
