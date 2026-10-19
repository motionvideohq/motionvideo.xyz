import { requireMcpAuth } from "@better-auth/mcp";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { MCP_RESOURCE, MCP_SCOPE } from "@/constants/oauth";
import { absoluteUrl } from "@/constants/url";
import { findBookmarkItem } from "@/lib/bookmark-catalog";
import { auth } from "@/server/auth";
import { bookmarks } from "@/server/db/bookmark-schema";

// The MCP server's `list-bookmarks` tool reads through here with the access
// token Better Auth issued for it; `sub` is the user id. Items removed from
// the catalogs keep their rows but are not returned.
const handleBookmarks = requireMcpAuth(
  auth,
  async (_request, claims) => {
    if (!claims.sub) {
      return Response.json({ error: "missing_subject" }, { status: 401 });
    }
    const rows = await drizzle(env.DB)
      .select({ id: bookmarks.itemId, kind: bookmarks.kind })
      .from(bookmarks)
      .where(eq(bookmarks.userId, claims.sub))
      .orderBy(desc(bookmarks.createdAt))
      .all();
    const items = rows.flatMap((row) => {
      const item = findBookmarkItem(row.kind, row.id);
      if (!item) {
        return [];
      }
      return [
        item.kind === "video"
          ? {
              creator: `@${item.video.handle}`,
              description: item.video.description,
              id: item.video.slug,
              kind: item.kind,
              title: item.video.title,
              url: absoluteUrl(`/videos/${item.video.slug}`),
            }
          : {
              category: item.entry.category,
              description: item.entry.description,
              id: item.entry.id,
              kind: item.kind,
              title: item.entry.name,
              url: item.entry.url,
            },
      ];
    });
    return Response.json({ bookmarks: items });
  },
  { requiredScopes: [MCP_SCOPE], resource: MCP_RESOURCE }
);

export const Route = createFileRoute("/api/mcp/bookmarks")({
  server: {
    handlers: {
      GET: ({ request }) => handleBookmarks(request),
    },
  },
});
