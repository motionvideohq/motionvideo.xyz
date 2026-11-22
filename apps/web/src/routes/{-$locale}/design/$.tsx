import { createFileRoute, notFound } from "@tanstack/react-router";

import { designMarkdownResponse } from "@/server/design-markdown";

// Fixed design page routes win normal matches. This catches their .md
// representations; unknown ordinary paths retain the normal 404 behavior.
export const Route = createFileRoute("/{-$locale}/design/$")({
  beforeLoad: () => {
    throw notFound();
  },
  server: {
    handlers: {
      GET: ({ params, next }) => {
        const splat = params._splat ?? "";
        if (params.locale !== undefined || !splat.endsWith(".md")) {
          return next();
        }
        return designMarkdownResponse(
          splat === "index.md"
            ? []
            : splat.slice(0, -3).split("/").filter(Boolean)
        );
      },
    },
  },
});
