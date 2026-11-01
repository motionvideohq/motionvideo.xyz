import { createFileRoute } from "@tanstack/react-router";

import { docsPageMarkdown, markdownResponse } from "@/server/docs-markdown";
import { docsSource } from "@/server/docs-source";

// /docs/<slug>.md: a docs page as Markdown. Only `.md` paths reach this
// route; the server sends every other unprefixed /docs/… to its locale.
export const Route = createFileRoute("/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = params._splat ?? "";
        const page = splat.endsWith(".md")
          ? docsSource.getPage(splat.slice(0, -3).split("/").filter(Boolean))
          : undefined;
        return page
          ? markdownResponse(await docsPageMarkdown(page))
          : new Response("Not found", { status: 404 });
      },
    },
  },
});
