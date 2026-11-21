import { createFileRoute } from "@tanstack/react-router";

import { launchComposeResponse } from "@/server/launch-api";

// One prompt for an ordered storyboard of scenes from any films, for the
// MotionVideo MCP server's `compose-launch-prompt` tool. See
// src/server/launch-api.ts.
export const Route = createFileRoute("/api/mcp/launch-videos/compose")({
  server: {
    handlers: {
      POST: ({ request }) => launchComposeResponse(request),
    },
  },
});
