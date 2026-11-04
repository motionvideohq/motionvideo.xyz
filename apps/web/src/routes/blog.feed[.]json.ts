import { createFileRoute } from "@tanstack/react-router";

import { BLOG_FEED } from "@/server/blog-feed";
import { jsonFeedResponse } from "@/server/feeds";

// The blog as JSON Feed 1.1 (src/server/feeds.tsx).
export const Route = createFileRoute("/blog/feed.json")({
  server: {
    handlers: {
      GET: () => jsonFeedResponse(BLOG_FEED),
    },
  },
});
