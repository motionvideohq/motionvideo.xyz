import { findDesignPage } from "@/lib/design";
import type { DesignPage } from "@/lib/design";
import { markdownResponse } from "@/server/docs-markdown";

/** Agent-facing guidance, separate from the overview article's Markdown. */
export { default as designGuideMarkdown } from "../../content/design.md?raw";

export const designPageMarkdown = async (page: DesignPage) => {
  const body = await page.data.getText("processed");
  return `# ${page.data.title}\n\n> ${page.data.description}\n\n${body}`;
};

/** The same compiled MDX used by the design page, without UI chrome. */
export const designMarkdownResponse = async (slugs: string[]) => {
  const page = findDesignPage(slugs);
  if (!page) {
    return new Response("Not found", { status: 404 });
  }
  return markdownResponse(await designPageMarkdown(page));
};
