import { createFileRoute } from "@tanstack/react-router";

import { CHANGELOG_FEED } from "@/server/changelog-feed";
import { atomResponse } from "@/server/feeds";

// The changelog as Atom 1.0 (src/server/feeds.tsx).
export const Route = createFileRoute("/changelog/atom.xml")({
  server: {
    handlers: {
      GET: () => atomResponse(CHANGELOG_FEED),
    },
  },
});
