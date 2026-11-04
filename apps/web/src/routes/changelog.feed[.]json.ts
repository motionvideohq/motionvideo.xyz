import { createFileRoute } from "@tanstack/react-router";

import { CHANGELOG_FEED } from "@/server/changelog-feed";
import { jsonFeedResponse } from "@/server/feeds";

// The changelog as JSON Feed 1.1 (src/server/feeds.tsx).
export const Route = createFileRoute("/changelog/feed.json")({
  server: {
    handlers: {
      GET: () => jsonFeedResponse(CHANGELOG_FEED),
    },
  },
});
