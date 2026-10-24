import { createFileRoute } from "@tanstack/react-router";

import { proMovesResponse } from "@/server/pro-api";

// One move with its copy-ready prompt, for the MotionVideo MCP server's
// `get-move-prompt` tool. See src/server/pro-api.ts.
export const Route = createFileRoute("/api/mcp/moves/$slug")({
  server: {
    handlers: {
      GET: ({ request, params }) => proMovesResponse(request, params.slug),
    },
  },
});
