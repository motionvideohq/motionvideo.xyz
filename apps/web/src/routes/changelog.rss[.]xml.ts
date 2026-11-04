import { createFileRoute } from "@tanstack/react-router";

import { CHANGELOG_FEED } from "@/server/changelog-feed";
import { rssResponse } from "@/server/feeds";

// The changelog as RSS 2.0 (src/server/feeds.tsx).
export const Route = createFileRoute("/changelog/rss.xml")({
  server: {
    handlers: {
      GET: () => rssResponse(CHANGELOG_FEED),
    },
  },
});
