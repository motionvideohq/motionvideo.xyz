import { createFileRoute } from "@tanstack/react-router";

import { launchPromptResponse } from "@/server/launch-api";

// A launch film's prompt, or one of its scenes', for the MotionVideo MCP
// server's `get-launch-prompt` tool. See src/server/launch-api.ts.
export const Route = createFileRoute("/api/mcp/launch-videos/prompt")({
  server: {
    handlers: {
      POST: ({ request }) => launchPromptResponse(request),
    },
  },
});
