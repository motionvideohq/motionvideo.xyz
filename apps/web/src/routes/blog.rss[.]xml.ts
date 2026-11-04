import { createFileRoute } from "@tanstack/react-router";

import { BLOG_FEED } from "@/server/blog-feed";
import { rssResponse } from "@/server/feeds";

// The blog as RSS 2.0 (src/server/feeds.tsx).
export const Route = createFileRoute("/blog/rss.xml")({
  server: {
    handlers: {
      GET: () => rssResponse(BLOG_FEED),
    },
  },
});
