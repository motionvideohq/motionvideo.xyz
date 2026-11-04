import { getIntlayer } from "intlayer";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";

import { DEFAULT_LOCALE } from "@/constants/locales";
import { ROUTES, videoPath } from "@/constants/routes";
import { absoluteUrl } from "@/constants/url";
import catalog from "@/data/motion-catalog.json";
import { BLOG_FEEDS, BLOG_POSTS } from "@/lib/blog";
import { pickVideos } from "@/lib/video-picks";
import type { VideoPick } from "@/lib/video-picks";
import {
  FEED_MDX_COMPONENTS,
  feedHtml,
  isSitePath,
  pageUrl,
} from "@/server/feeds";
import type { FeedSource } from "@/server/feeds";

const content = getIntlayer("blog", DEFAULT_LOCALE);

// Plain-HTML stand-ins for the post components in
// src/components/blog-content.tsx: no copy button, links at the default locale.
const postComponents = (videos: Record<string, VideoPick>): MDXComponents => ({
  ...FEED_MDX_COMPONENTS,
  Callout: ({
    href,
    label,
    children,
  }: {
    href: string;
    label: string;
    children: ReactNode;
  }) => (
    <aside>
      {children}
      <p>
        <a href={isSitePath(href) ? pageUrl(href) : href}>{label}</a>
      </p>
    </aside>
  ),
  Prompt: ({ caption, prompt }: { caption: string; prompt: string }) => (
    <figure>
      <figcaption>{caption}</figcaption>
      <pre>{prompt}</pre>
    </figure>
  ),
  Videos: ({ caption, slugs }: { caption?: string; slugs: string[] }) => {
    const found = slugs.flatMap((slug) => {
      const video = videos[slug];
      return video ? [video] : [];
    });
    return found.length > 0 ? (
      <figure>
        {found.map((video) => (
          <p key={video.slug}>
            <a href={pageUrl(videoPath(video.slug))}>
              <img
                loading="lazy"
                src={absoluteUrl(video.poster)}
                alt={video.title}
                width={video.width}
                height={video.height}
              />
            </a>
            <br />
            {video.title} {content.by} @{video.handle}
          </p>
        ))}
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    ) : null;
  },
});

/** The blog's feeds (src/server/feeds.tsx). */
export const BLOG_FEED: FeedSource = {
  feeds: BLOG_FEEDS,
  homePath: ROUTES.BLOG,
  // The page's English intro.
  description: content.intro,
  items: () => {
    // The same posters as the cards on /blog.
    const covers = pickVideos(
      BLOG_POSTS.map((post) => post.data.cover),
      catalog.videos
    );
    return Promise.all(
      BLOG_POSTS.map(async (post) => {
        // Bodies load lazily; once loaded they render without suspending.
        await post.data.preload();
        const { body: Body, date, description, title } = post.data;
        const cover: VideoPick | undefined = covers[post.data.cover];
        const videos = pickVideos(post.data.videos, catalog.videos);
        return {
          cover,
          date,
          html: feedHtml(cover, <Body components={postComponents(videos)} />),
          summary: description,
          title,
          url: pageUrl(post.url),
        };
      })
    );
  },
};
