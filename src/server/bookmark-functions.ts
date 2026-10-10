import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";

import catalog from "@/data/motion-catalog.json";

import { getCurrentSession } from "./auth";
import { bookmarks } from "./db/bookmark-schema";

const catalogSlugs = new Set(catalog.videos.map((video) => video.slug));

const bookmarkInput = z.object({
  slug: z
    .string()
    .max(200)
    .refine((slug) => catalogSlugs.has(slug), "Unknown video"),
  saved: z.boolean(),
});

/** The signed-in user's bookmarked slugs, newest first; `null` when signed out. */
export const getBookmarks = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getCurrentSession();
    if (!session) {
      return null;
    }
    const rows = await drizzle(env.DB)
      .select({ slug: bookmarks.videoSlug })
      .from(bookmarks)
      .where(eq(bookmarks.userId, session.user.id))
      .orderBy(desc(bookmarks.createdAt))
      .all();
    // Videos removed from the catalog keep their rows but are not shown.
    return rows.map((row) => row.slug).filter((slug) => catalogSlugs.has(slug));
  }
);

/** Saves or removes one bookmark. Idempotent, so retries are safe. */
export const setBookmark = createServerFn({ method: "POST" })
  .validator(bookmarkInput)
  .handler(async ({ data }) => {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;
    const db = drizzle(env.DB);
    await (data.saved
      ? db
          .insert(bookmarks)
          .values({ userId, videoSlug: data.slug, createdAt: new Date() })
          .onConflictDoNothing()
          .run()
      : db
          .delete(bookmarks)
          .where(
            and(
              eq(bookmarks.userId, userId),
              eq(bookmarks.videoSlug, data.slug)
            )
          )
          .run());
    return { saved: data.saved };
  });
