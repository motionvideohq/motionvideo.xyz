import { createFileRoute } from "@tanstack/react-router";

import { MOVES } from "@/lib/moves";
import { jsonEndpoint } from "@/server/catalog-api";

// The public half of every move (no prompts), for the MCP server and other
// integrations. Prompts stay behind Pro: /api/mcp/moves serves them to the MCP
// server for a signed-in account with Pro or Business.
const endpoint = jsonEndpoint({ moves: MOVES });

export const Route = createFileRoute("/api/moves/")({
  server: {
    handlers: {
      GET: ({ request }) => endpoint(request),
    },
  },
});
