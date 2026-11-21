import { createFileRoute } from "@tanstack/react-router";

import { launchSearchResponse } from "@/server/launch-api";

// Public summaries of launch films or scenes, for the MotionVideo MCP
// server's `search-launch-scenes` tool. See src/server/launch-api.ts.
export const Route = createFileRoute("/api/mcp/launch-videos/search")({
  server: {
    handlers: {
      GET: ({ request }) => launchSearchResponse(request),
    },
  },
});
