import { createFileRoute } from "@tanstack/react-router";

import { docsMarkdownPath } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/constants/url";
import { docsPageMarkdown, englishDocsPages } from "@/server/docs-markdown";

// Every docs page in one Markdown file (https://llmstxt.org), in sidebar
// order, each headed by its source URL.
export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        const pages = await Promise.all(
          englishDocsPages().map(
            async (page) =>
              `<!-- ${absoluteUrl(docsMarkdownPath(page.url))} -->\n\n${await docsPageMarkdown(page)}`
          )
        );
        return new Response(
          `# ${SITE.NAME} docs\n\n> ${SITE.TAGLINE}\n\n${pages.join("\n\n---\n\n")}\n`,
          {
            headers: {
              "Cache-Control": "public, max-age=3600",
              "Content-Type": "text/plain; charset=utf-8",
            },
          }
        );
      },
    },
  },
});
