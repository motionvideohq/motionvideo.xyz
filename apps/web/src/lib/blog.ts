import { loader } from "fumadocs-core/source";
import { defineCollections } from "fumadocs-mdx/macro";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { defineFeeds } from "@/lib/feeds";

// Blog posts, written for MotionVideo: one MDX file per post in content/blog,
// the file name is the slug (/blog/<slug>). Post text stays in English in
// every locale, like the prompts in the gallery; only the page chrome is
// translated. Besides Markdown, a post can use <Prompt>, <Videos> and
// <Callout> (src/components/blog-content.tsx).
//
// `async`: only the frontmatter ships with the bundle, so the index lists
// every post without loading their bodies; a post's page preloads its own.
const posts = defineCollections({
  async: true,
  dir: "content/blog",
  schema: z.object({
    title: z.string(),
    /** One or two sentences for the list, meta description and JSON-LD. */
    description: z.string(),
    /** Publication date, `YYYY-MM-DD`; posts are listed newest first. */
    date: z.iso.date(),
    /** Gallery video slug whose poster is the post's card image on /blog. */
    cover: z.string(),
    /**
     * Every gallery video a <Videos> in the post shows. The page loads only
     * these from the catalog; a slug missing here doesn't render.
     */
    videos: z.array(z.string()).default([]),
  }),
  type: "doc",
});

export const blog = loader({
  baseUrl: ROUTES.BLOG,
  source: posts.toFumadocsSource(),
});

/** Every post, newest first. */
export const BLOG_POSTS = blog
  .getPages()
  .toSorted((a, b) => b.data.date.localeCompare(a.data.date));

/** The blog's feeds, in English like the posts. */
export const BLOG_FEEDS = defineFeeds(`${SITE.NAME} Blog`, {
  atom: ROUTES.BLOG_ATOM,
  json: ROUTES.BLOG_JSON_FEED,
  rss: ROUTES.BLOG_RSS,
});

export const findBlogPost = (slug: string | undefined) =>
  slug ? blog.getPage([slug]) : undefined;

/** A post's YYYY-MM-DD date, long form in the reader's locale. */
export const formatPostDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
