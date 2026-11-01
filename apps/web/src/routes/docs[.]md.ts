import { createFileRoute } from "@tanstack/react-router";

import { docsPageMarkdown, markdownResponse } from "@/server/docs-markdown";
import { docsSource } from "@/server/docs-source";

// The docs quickstart (/docs) as Markdown.
export const Route = createFileRoute("/docs.md")({
  server: {
    handlers: {
      GET: async () => {
        const page = docsSource.getPage([]);
        return page
          ? markdownResponse(await docsPageMarkdown(page))
          : new Response("Not found", { status: 404 });
      },
    },
  },
});
