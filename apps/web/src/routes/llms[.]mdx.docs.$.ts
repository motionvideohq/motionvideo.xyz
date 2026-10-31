import { createFileRoute } from "@tanstack/react-router";

import { docsSource } from "@/server/docs-source";

// A docs page as Markdown (/llms.mdx/docs/<slug>, the quickstart at
// /llms.mdx/docs): what "Copy as Markdown" copies and what "Open in chat"
// asks the assistant to read. English, like the MDX source.
export const Route = createFileRoute("/llms.mdx/docs/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const page = docsSource.getPage(
          params._splat?.split("/").filter(Boolean) ?? []
        );
        if (!page) {
          return new Response("Not found", { status: 404 });
        }
        const body = await page.data.getText("processed");
        return new Response(
          `# ${page.data.title}\n\n> ${page.data.description}\n\n${body}`,
          {
            headers: {
              "Cache-Control": "public, max-age=3600",
              "Content-Type": "text/markdown; charset=utf-8",
            },
          }
        );
      },
    },
  },
});
