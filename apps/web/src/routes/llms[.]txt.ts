import { createFileRoute } from "@tanstack/react-router";

import { DEFAULT_LOCALE, localizedPath } from "@/constants/locales";
import { ROUTES, STATIC_PAGES, docsMarkdownPath } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/constants/url";
import { englishDocsPages } from "@/server/docs-markdown";

// The file is per-site, so its page links point at the default locale.
const pageUrl = (path: string) =>
  absoluteUrl(localizedPath(path, DEFAULT_LOCALE));

// A map of the public site for LLM agents (https://llmstxt.org). Signed-in
// pages are intentionally absent; the JSON catalog endpoints below are the
// machine-readable way in.
const body = () => `# ${SITE.NAME}

> ${SITE.TAGLINE} ${SITE.DESCRIPTION.LONG}

## Pages

- [Gallery](${pageUrl(ROUTES.HOME)}): Motion videos grouped by category (product UI, kinetic type, charts, diagrams…), each with the prompt and skill behind it.
- [Quickstart](${pageUrl(ROUTES.DOCS)}): How to use ${SITE.NAME} with a coding agent: the MCP server, the gallery prompts, Moves, plans, and the public API.
- [skill.md](${absoluteUrl(ROUTES.SKILL_MD)}): A skill a coding agent can read to set itself up with ${SITE.NAME}.
- [MotionVideo MCP](${pageUrl(ROUTES.MOTIONVIDEO_MCP)}): The free MCP server: search the gallery and pull prompts from Claude, ChatGPT, Cursor and other MCP clients. Setup reference: ${pageUrl(ROUTES.DOCS_MCP)}
- [MotionVideo Skill](${pageUrl(ROUTES.MOTIONVIDEO_SKILL)}): The motion design skill pack included in Pro and Business. Install reference: ${pageUrl(ROUTES.DOCS_SKILL)}
- [Moves](${pageUrl(ROUTES.MOVES)}): Named motion design techniques with gallery examples; each move's copy-ready prompt is in Pro.
- [Templates](${pageUrl(ROUTES.TEMPLATES)}): Prompt templates with fill-in fields (concept, palette, length, size); each template's full prompt is in Pro.
- [MotionVideo Pro](${pageUrl(ROUTES.PRO)}): Pro and Business plans: what they include and what they cost. As Markdown: ${absoluteUrl(ROUTES.PRICING_MD)}
- [Tools](${pageUrl(ROUTES.TOOLS)}): Agent tools and plugins for motion design, by category.
- [Creatives](${pageUrl(ROUTES.CREATIVES)}): Studios, designers, and agencies that make motion work.
- [Skills](${pageUrl(ROUTES.SKILLS)}): Agent skills for motion design, by category.
- [Extras](${pageUrl(ROUTES.EXTRAS)}): Extra resources: assets, libraries, and references.
- [Jobs](${pageUrl(ROUTES.JOBS)}): Motion design job board.
- [Sponsor](${pageUrl(ROUTES.SPONSOR)}): Sponsorship placements on the site.
${STATIC_PAGES.map(
  (page) =>
    `- [${page.slice(1).replace(/^./u, (letter) => letter.toUpperCase())}](${pageUrl(page)})`
).join("\n")}

## Docs

Each page as Markdown; all of them in one file: ${absoluteUrl(ROUTES.LLMS_FULL_TXT)}

${englishDocsPages()
  .map(
    (page) =>
      `- [${page.data.title}](${absoluteUrl(docsMarkdownPath(page.url))}): ${page.data.description}`
  )
  .join("\n")}

## Data

- [Motion catalog](${absoluteUrl("/api/catalog/")}): JSON of every gallery video with its prompt, model, stack, effort, and media URLs.
- [Directories](${absoluteUrl("/api/catalog/directories")}): JSON of the tools, studios, skills, and extras directories.
- [Moves](${absoluteUrl("/api/moves/")}): JSON of every move's public fields (no prompts).

## Optional

- [Pricing](${absoluteUrl(ROUTES.PRICING_MD)}): Plans and prices as Markdown.
- [Full docs](${absoluteUrl(ROUTES.LLMS_FULL_TXT)}): Every docs page in one Markdown file.
- [Sitemap](${absoluteUrl("/sitemap.xml")})
`;

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(body(), {
          headers: {
            "Cache-Control": "public, max-age=3600",
            "Content-Type": "text/plain; charset=utf-8",
          },
        }),
    },
  },
});
