import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { BLOG_POSTS } from "@/lib/blog";
import { CHANGELOG_ENTRIES } from "@/lib/changelog";
import type { MoveFamily } from "@/lib/move-families";
import { MOVES } from "@/lib/moves";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";

import { getDocsSource } from "./docs-source";

// Server-only: what the ⌘K palette searches besides the catalog and the
// directories. Only names, summaries and URLs leave the server: no move
// bodies (most of moves.json) and never a prompt, which is Pro content.

export interface SearchMove {
  slug: string;
  family: MoveFamily;
  name: string;
  aka: string[];
  summary: string;
  goodFor: string[];
}

export interface SearchTemplate {
  id: string;
  name: string;
  summary: string;
}

/** A blog post or a changelog entry: `/blog/<slug>`, `/changelog/<slug>`. */
export interface SearchArticle {
  slug: string;
  title: string;
  description: string;
}

export interface SearchDocsHeading {
  /** Anchor on the page, without `#`. */
  id: string;
  title: string;
}

export interface SearchDocsPage {
  /** `/docs/<slugs>`; empty for the docs index. */
  slugs: string[];
  title: string;
  description: string;
  headings: SearchDocsHeading[];
}

export interface SearchIndex {
  moves: SearchMove[];
  templates: SearchTemplate[];
  blog: SearchArticle[];
  changelog: SearchArticle[];
  docs: SearchDocsPage[];
}

const article = (page: {
  slugs: string[];
  data: { title: string; description: string };
}): SearchArticle => ({
  slug: page.slugs.join("/"),
  title: page.data.title,
  description: page.data.description,
});

// English data, the same in every locale: computed once per worker.
const STATIC_INDEX = {
  moves: MOVES.map((move) => ({
    slug: move.slug,
    family: move.family,
    name: move.name,
    aka: move.aka,
    summary: move.summary,
    goodFor: move.goodFor,
  })),
  templates: PROMPT_TEMPLATES.map((template) => ({
    id: template.id,
    name: template.name,
    summary: template.summary,
  })),
  blog: BLOG_POSTS.map(article),
  changelog: CHANGELOG_ENTRIES.map(article),
} satisfies Omit<SearchIndex, "docs">;

/**
 * The palette's content index. Docs pages come in the requested locale where
 * translated (English otherwise), with their headings for deep links.
 */
export const getSearchIndex = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: requested }): Promise<SearchIndex> => {
    const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
    const source = await getDocsSource();
    const docs = await Promise.all(
      source.getPages(locale).map(async (page) => {
        // API reference pages carry their structured data; MDX loads it.
        const { headings } =
          page.data.type === "openapi"
            ? page.data.structuredData
            : await page.data.structuredData();
        return {
          slugs: page.slugs,
          // OpenAPI operations without a summary have no title.
          title: page.data.title ?? page.url,
          description: page.data.description ?? "",
          headings: headings.map((heading) => ({
            id: heading.id,
            title: heading.content,
          })),
        };
      })
    );
    return { ...STATIC_INDEX, docs };
  });
