import { createFileRoute } from "@tanstack/react-router";

import skill from "../../content/skill.md?raw";

// The free onboarding skill: a coding agent reads it to set itself up with
// MotionVideo (MCP server, catalog, Moves, API). Not the paid motion-design
// skill, which lives in a private repository for Pro and Business.
export const Route = createFileRoute("/skill.md")({
  server: {
    handlers: {
      GET: () =>
        new Response(skill, {
          headers: {
            "Cache-Control": "public, max-age=3600",
            "Content-Type": "text/markdown; charset=utf-8",
          },
        }),
    },
  },
});
