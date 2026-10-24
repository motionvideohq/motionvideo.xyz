import { createFileRoute } from "@tanstack/react-router";

import { ROUTES, STATIC_PAGES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { absoluteUrl } from "@/constants/url";

// A map of the public site for LLM agents (https://llmstxt.org). Signed-in
// pages are intentionally absent; the JSON catalog endpoints below are the
// machine-readable way in.
const body = `# ${SITE.NAME}

> ${SITE.TAGLINE} ${SITE.DESCRIPTION.LONG}

## Pages

- [Gallery](${absoluteUrl(ROUTES.HOME)}): Motion videos grouped by category (product UI, kinetic type, charts, diagrams…), each with the prompt and skill behind it.
- [Quickstart](${absoluteUrl(ROUTES.DOCS)}): How to use ${SITE.NAME} with a coding agent: the MCP server, the gallery prompts, Moves, plans, and the public API.
- [skill.md](${absoluteUrl(ROUTES.SKILL_MD)}): A skill a coding agent can read to set itself up with ${SITE.NAME}.
- [MotionVideo MCP](${absoluteUrl(ROUTES.MOTIONVIDEO_MCP)}): The free MCP server: search the gallery and pull prompts from Claude, ChatGPT, Cursor and other MCP clients. Setup reference: ${absoluteUrl(ROUTES.DOCS_MCP)}
- [MotionVideo Skill](${absoluteUrl(ROUTES.MOTIONVIDEO_SKILL)}): The motion design skill pack included in Pro and Business. Install reference: ${absoluteUrl(ROUTES.DOCS_SKILL)}
- [Moves](${absoluteUrl(ROUTES.MOVES)}): Named motion design techniques with gallery examples; each move's copy-ready prompt is in Pro.
- [Templates](${absoluteUrl(ROUTES.TEMPLATES)}): Prompt templates with fill-in fields (concept, palette, length, size); each template's full prompt is in Pro.
- [MotionVideo Pro](${absoluteUrl(ROUTES.PRO)}): Pro and Business plans: what they include and what they cost.
- [Tools](${absoluteUrl(ROUTES.TOOLS)}): Agent tools and plugins for motion design, by category.
- [Creatives](${absoluteUrl(ROUTES.CREATIVES)}): Studios, designers, and agencies that make motion work.
- [Skills](${absoluteUrl(ROUTES.SKILLS)}): Agent skills for motion design, by category.
- [Extras](${absoluteUrl(ROUTES.EXTRAS)}): Extra resources: assets, libraries, and references.
- [Jobs](${absoluteUrl(ROUTES.JOBS)}): Motion design job board.
- [Sponsor](${absoluteUrl(ROUTES.SPONSOR)}): Sponsorship placements on the site.
${STATIC_PAGES.map(
  (page) =>
    `- [${page.slice(1).replace(/^./u, (letter) => letter.toUpperCase())}](${absoluteUrl(page)})`
).join("\n")}

## Data

- [Motion catalog](${absoluteUrl("/api/catalog/")}): JSON of every gallery video with its prompt, model, stack, effort, and media URLs.
- [Directories](${absoluteUrl("/api/catalog/directories")}): JSON of the tools, studios, skills, and extras directories.
- [Moves](${absoluteUrl("/api/moves/")}): JSON of every move's public fields (no prompts).

## Optional

- [Sitemap](${absoluteUrl("/sitemap.xml")})
`;

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(body, {
          headers: {
            "Cache-Control": "public, max-age=3600",
            "Content-Type": "text/plain; charset=utf-8",
          },
        }),
    },
  },
});
