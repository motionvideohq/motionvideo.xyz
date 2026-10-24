import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { and, count, desc, eq, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import catalog from "@/data/motion-catalog.json";
import { DIRECTORY_ENTRIES } from "@/lib/directories";
import type { DirectoryEntry } from "@/lib/directories";
import type { MotionVideo } from "@/lib/motion-catalog";

import { jobPosts } from "./db/job-schema";

// Server-only: what the header's Explore menu previews. The catalog and
// directory data stay here; the browser gets a few URLs, names and counts the
// first time the menu opens.

/** A catalog clip a menu preview loops. */
export interface NavVideo {
  title: string;
  poster: string;
  preview: string;
}

/** A directory section: its first cover image and how many entries it lists. */
export interface NavSection {
  count: number;
  cover: string | null;
}

export interface NavJob {
  id: string;
  title: string;
  company: string;
  logo: string | null;
}

export interface NavPreviews {
  discover: { count: number; video: NavVideo | null };
  tools: NavSection;
  creatives: NavSection;
  skills: NavSection;
  extras: NavSection;
  jobs: { count: number; listings: NavJob[] };
}

const JOBS_SHOWN = 3;

const toNavVideo = (video: MotionVideo): NavVideo => ({
  title: video.title,
  poster: video.poster,
  preview: video.preview,
});

const section = (entries: DirectoryEntry[]): NavSection => ({
  count: entries.length,
  cover: entries.find((entry) => entry.cover)?.cover ?? null,
});

// Discover leads with the gallery's first clip, in its default (curated) order.
const [leadVideo] = catalog.videos;

const STATIC_PREVIEWS = {
  discover: {
    count: catalog.videos.length,
    video: leadVideo ? toNavVideo(leadVideo) : null,
  },
  tools: section(DIRECTORY_ENTRIES.tool),
  creatives: section(DIRECTORY_ENTRIES.studio),
  skills: section(DIRECTORY_ENTRIES.skill),
  extras: section(DIRECTORY_ENTRIES.extra),
} satisfies Omit<NavPreviews, "jobs">;

/**
 * Previews for the header menus: static data computed once per worker, plus
 * the live job listings (as /jobs orders them: featured first, then newest).
 */
export const getNavPreviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<NavPreviews> => {
    const db = drizzle(env.DB);
    const live = and(
      eq(jobPosts.status, "approved"),
      gt(jobPosts.expiresAt, new Date())
    );
    const [listings, [total]] = await Promise.all([
      db
        .select({
          id: jobPosts.id,
          title: jobPosts.title,
          company: jobPosts.company,
          logo: jobPosts.logo,
        })
        .from(jobPosts)
        .where(live)
        .orderBy(
          sql`case when ${jobPosts.plan} = 'featured' then 0 else 1 end`,
          desc(jobPosts.publishedAt)
        )
        .limit(JOBS_SHOWN),
      db.select({ total: count() }).from(jobPosts).where(live),
    ]);
    return {
      ...STATIC_PREVIEWS,
      jobs: { count: total?.total ?? 0, listings },
    };
  }
);
