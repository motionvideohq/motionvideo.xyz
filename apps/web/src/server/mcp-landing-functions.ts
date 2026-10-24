import { createServerFn } from "@tanstack/react-start";

import type { MotionVideo } from "@/lib/motion-catalog";

// Server-only: the /motionvideo-mcp page's mock conversation shows what the
// MCP tools return for a real query, read from the same catalog the server
// serves. The catalog is ~1 MB, so only a few posters, titles and one prompt
// excerpt reach the browser.

/** The `search-videos` arguments the mock conversation calls the tool with. */
export interface McpDemoSearch {
  category: "kinetic-type";
  type: "prompt";
  limit: number;
}

export type McpDemoVideo = Pick<
  MotionVideo,
  "slug" | "title" | "handle" | "poster"
>;

/** What `get-video` returns for the first result, prompt cut to an excerpt. */
export interface McpDemoDetail extends McpDemoVideo {
  excerpt: string;
}

export interface McpDemo {
  search: McpDemoSearch;
  videos: McpDemoVideo[];
  detail: McpDemoDetail | null;
}

const SEARCH: McpDemoSearch = {
  category: "kinetic-type",
  type: "prompt",
  limit: 4,
};

const EXCERPT_LENGTH = 220;

// Cut at the last word break before the limit so the excerpt never ends
// mid-word.
const excerpt = (prompt: string) => {
  const text = prompt.replaceAll(/\s+/gu, " ").trim();
  if (text.length <= EXCERPT_LENGTH) {
    return text;
  }
  const cut = text.slice(0, EXCERPT_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};

// Mirrors the MCP server's `search-videos` filter for these arguments: entries
// that shared a prompt in the category, newest first (a stable sort, so
// same-day entries keep catalog order).
const buildDemo = (videos: MotionVideo[]): McpDemo => {
  const matches = videos
    .filter(
      (video) =>
        video.tags.includes(SEARCH.type) &&
        video.contentTags.includes(SEARCH.category)
    )
    .toSorted((a, b) => b.date.localeCompare(a.date))
    .slice(0, SEARCH.limit);
  const cards = matches.map(
    ({ slug, title, handle, poster }): McpDemoVideo => ({
      slug,
      title,
      handle,
      poster,
    })
  );
  const [first] = matches;
  const [firstCard] = cards;
  return {
    search: SEARCH,
    videos: cards,
    detail:
      first?.prompt && firstCard
        ? { ...firstCard, excerpt: excerpt(first.prompt) }
        : null,
  };
};

// Built once per worker, on first use. The catalog is imported dynamically:
// with a static import, TanStack Start's dev server-function compiler follows
// it from this module and fails parsing the JSON as code.
let demo: Promise<McpDemo> | undefined;
const loadDemo = async () => {
  const { default: catalog } = await import("@/data/motion-catalog.json");
  return buildDemo(catalog.videos);
};

/** Real catalog entries for the landing page's mock conversation. */
export const getMcpDemo = createServerFn({ method: "GET" }).handler(() => {
  demo ??= loadDemo();
  return demo;
});
