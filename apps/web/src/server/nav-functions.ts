import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { and, count, desc, eq, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import catalog from "@/data/motion-catalog.json";
import { BLOG_POSTS } from "@/lib/blog";
import { CHANGELOG_ENTRIES } from "@/lib/changelog";
import { DIRECTORY_ENTRIES } from "@/lib/directories";
import type { DirectoryEntry } from "@/lib/directories";
import type { MotionVideo } from "@/lib/motion-catalog";
import { MOVES } from "@/lib/moves";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";

import { jobPosts } from "./db/job-schema";

// Server-only: what the header menus preview. The catalog and directory data
// stay here; the browser gets a few URLs, names and counts the first time a
// menu is about to open.

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

/** A page that lists entries (moves, posts…): how many, and one to show. */
export interface NavShowcase {
  count: number;
  video: NavVideo | null;
}

/** The blog or changelog: its newest entry's title and cover clip. */
export interface NavLatest extends NavShowcase {
  title: string | null;
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
  moves: NavShowcase;
  templates: NavShowcase;
  blog: NavLatest;
  changelog: NavLatest;
}

// Two fit above the caption at the panel's height.
const JOBS_SHOWN = 2;

const toNavVideo = (video: MotionVideo): NavVideo => ({
  title: video.title,
  poster: video.poster,
  preview: video.preview,
});

const section = (entries: DirectoryEntry[]): NavSection => ({
  count: entries.length,
  cover: entries.find((entry) => entry.cover)?.cover ?? null,
});

const videoBySlug = (slug: string | undefined) => {
  const video = catalog.videos.find((entry) => entry.slug === slug);
  return video ? toNavVideo(video) : null;
};

const latest = (
  pages: readonly { data: { title: string; cover: string } }[]
): NavLatest => {
  const [newest] = pages;
  return {
    count: pages.length,
    title: newest?.data.title ?? null,
    video: videoBySlug(newest?.data.cover),
  };
};

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
  // The first move's and template's first gallery example.
  moves: { count: MOVES.length, video: videoBySlug(MOVES[0]?.examples[0]) },
  templates: {
    count: PROMPT_TEMPLATES.length,
    video: videoBySlug(PROMPT_TEMPLATES[0]?.examples[0]),
  },
  blog: latest(BLOG_POSTS),
  changelog: latest(CHANGELOG_ENTRIES),
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
