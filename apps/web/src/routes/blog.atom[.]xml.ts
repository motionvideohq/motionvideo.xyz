import { createFileRoute } from "@tanstack/react-router";

import { BLOG_FEED } from "@/server/blog-feed";
import { atomResponse } from "@/server/feeds";

// The blog as Atom 1.0 (src/server/feeds.tsx).
export const Route = createFileRoute("/blog/atom.xml")({
  server: {
    handlers: {
      GET: () => atomResponse(BLOG_FEED),
    },
  },
});
