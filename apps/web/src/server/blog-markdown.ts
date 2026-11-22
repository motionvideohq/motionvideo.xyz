import { asMarkdown } from "fumadocs-core/server";
import type { MDXComponents } from "mdx/types";
import { createElement } from "react";
import type { ReactNode } from "react";

import { videoPath } from "@/constants/routes";
import { absoluteUrl } from "@/constants/url";
import catalog from "@/data/motion-catalog.json";
import type { BlogPost } from "@/lib/blog";
import { pickVideos } from "@/lib/video-picks";
import type { VideoPick } from "@/lib/video-picks";

// Markdown forms of the components in blog-content.tsx. Fumadocs preserves
// authored Markdown and evaluates component props without exposing MDX imports.
const postComponents = (videos: Record<string, VideoPick>): MDXComponents => ({
  Prompt: ({ caption, prompt }: { caption: string; prompt: string }) => {
    asMarkdown();
    return createElement(
      "figure",
      null,
      createElement("figcaption", null, caption),
      createElement("pre", null, prompt)
    );
  },
  Callout: ({
    href,
    label,
    children,
  }: {
    href: string;
    label: string;
    children: ReactNode;
  }) => {
    asMarkdown();
    return createElement(
      "aside",
      null,
      children,
      createElement("p", null, createElement("a", { href }, label))
    );
  },
  Videos: ({ caption, slugs }: { caption?: string; slugs: string[] }) => {
    asMarkdown();
    const found = slugs.flatMap((slug) => {
      const video = videos[slug];
      return video ? [video] : [];
    });
    return found.length > 0
      ? createElement(
          "figure",
          null,
          found.map((video) =>
            createElement(
              "p",
              { key: video.slug },
              createElement(
                "a",
                { href: absoluteUrl(videoPath(video.slug)) },
                video.title
              ),
              ` by @${video.handle}`,
              createElement("br"),
              createElement("img", {
                src: absoluteUrl(video.poster),
                alt: video.title,
              })
            )
          ),
          caption && createElement("figcaption", null, caption)
        )
      : null;
  },
});

/** Full English article, compiled with its lazy MDX body for Workers. */
export const blogPostMarkdown = async (post: BlogPost) => {
  const videos = pickVideos(post.data.videos, catalog.videos);
  const body = await post.data.getText("processed", {
    components: postComponents(videos),
  });
  return `# ${post.data.title}\n\n> ${post.data.description}\n\nPublished: ${post.data.date}\n\nSource: ${absoluteUrl(post.url)}\n\n${body}\n`;
};
