import { createFileRoute } from "@tanstack/react-router";

import { findBlogPost } from "@/lib/blog";
import { blogPostMarkdown } from "@/server/blog-markdown";
import { markdownResponse } from "@/server/docs-markdown";

// Articles stay English, like their MDX sources, independent of UI locale.
export const Route = createFileRoute("/blog/{$slug}.md")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const post = findBlogPost(params.slug);
        return post
          ? markdownResponse(await blogPostMarkdown(post))
          : new Response("Not found", { status: 404 });
      },
    },
  },
});
