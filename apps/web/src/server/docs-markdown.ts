import type * as PageTree from "fumadocs-core/page-tree";

import { getDocsSource } from "./docs-source";
import type { DocsPage } from "./docs-source";
import { openApiPageMarkdown } from "./openapi-markdown";

// Docs pages as Markdown for agents and "Copy as Markdown" (served at
// `docsMarkdownPath`, see src/constants/routes.ts), and every page together
// in /llms-full.txt. English, like the MDX source; API reference pages are
// written from the OpenAPI document.

/** A docs page as one Markdown document: title, description, body. */
export const docsPageMarkdown = async (page: DocsPage) => {
  const body =
    page.data.type === "openapi"
      ? openApiPageMarkdown(page.data.getOpenAPIPageProps().operations)
      : await page.data.getText("processed");
  return `# ${page.data.title}\n\n> ${page.data.description}\n\n${body}`;
};

/** Every English docs page, in sidebar order (content/docs/meta.json). */
export const englishDocsPages = async () => {
  const source = await getDocsSource();
  const urls: string[] = [];
  const walk = (nodes: PageTree.Node[]) => {
    for (const node of nodes) {
      if (node.type === "page") {
        urls.push(node.url);
      } else if (node.type === "folder") {
        if (node.index) {
          urls.push(node.index.url);
        }
        walk(node.children);
      }
    }
  };
  walk(source.getPageTree("en").children);
  const pages = new Map(source.getPages("en").map((page) => [page.url, page]));
  return urls.flatMap((url) => {
    const page = pages.get(url);
    return page ? [page] : [];
  });
};

export const markdownResponse = (body: string) =>
  new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
