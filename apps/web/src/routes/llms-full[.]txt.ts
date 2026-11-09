import { createFileRoute } from "@tanstack/react-router";

import { CACHE_CONTROL } from "@/constants/cache-control";
import { ROUTES, docsMarkdownPath } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/constants/url";
import { designSource } from "@/lib/design";
import {
  designGuideMarkdown,
  designPageMarkdown,
} from "@/server/design-markdown";
import { docsPageMarkdown, englishDocsPages } from "@/server/docs-markdown";

// Every docs and design page, plus the agent-facing design guide, in one
// Markdown file (https://llmstxt.org), each headed by its source URL.
export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        const docsPages = await englishDocsPages();
        const pages = await Promise.all([
          ...docsPages.map(
            async (page) =>
              `<!-- ${absoluteUrl(docsMarkdownPath(page.url))} -->\n\n${await docsPageMarkdown(page)}`
          ),
          `<!-- ${absoluteUrl(ROUTES.DESIGN_MD)} -->\n\n${designGuideMarkdown}`,
          ...designSource
            .getPages()
            .map(
              async (page) =>
                `<!-- ${absoluteUrl(docsMarkdownPath(page.url))} -->\n\n${await designPageMarkdown(page)}`
            ),
        ]);
        return new Response(
          `# ${SITE.NAME} docs and design system\n\n> ${SITE.TAGLINE}\n\n${pages.join("\n\n---\n\n")}\n`,
          {
            headers: {
              "Cache-Control": CACHE_CONTROL.PUBLIC_HOUR,
              "Content-Type": "text/plain; charset=utf-8",
            },
          }
        );
      },
    },
  },
});
