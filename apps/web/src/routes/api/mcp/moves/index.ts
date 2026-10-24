import { createFileRoute } from "@tanstack/react-router";

import { proMovesResponse } from "@/server/pro-api";

// Every move with its copy-ready prompt, for the MotionVideo MCP server's Pro
// tools: an access token for an account with a Pro or Business plan. See
// src/server/pro-api.ts.
export const Route = createFileRoute("/api/mcp/moves/")({
  server: {
    handlers: {
      GET: ({ request }) => proMovesResponse(request),
    },
  },
});
