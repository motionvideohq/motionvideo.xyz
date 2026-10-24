import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { SerializedPageTree } from "fumadocs-core/source/client";
import { z } from "zod";

import { docsI18n, docsSource } from "./docs-source";

/** A docs page in one locale, with the sidebar tree of that locale. */
export interface DocsPageVariant {
  /** Content path of the MDX file, e.g. `mcp.mdx` or `mcp.es.mdx`. */
  path: string;
  title: string;
  description: string;
  tree: SerializedPageTree;
}

const variantOf = async (
  page: typeof docsSource.$inferPage,
  locale: string
): Promise<DocsPageVariant> => ({
  path: page.path,
  title: page.data.title,
  description: page.data.description,
  tree: await docsSource.serializePageTree(docsSource.getPageTree(locale)),
});

// The page at /docs/<slugs> in English plus every locale with translated
// docs (this page or any other, since the sidebar lists every title). The
// locale isn't in the URL, so the client picks with `useLocale()` and falls
// back to English.
export const getDocsPage = createServerFn({ method: "GET" })
  .validator(z.array(z.string()))
  .handler(async ({ data: slugs }) => {
    const english = docsSource.getPage(slugs);
    if (!english) {
      throw notFound();
    }
    const englishPaths = new Set(
      docsSource.getPages(docsI18n.defaultLanguage).map((page) => page.path)
    );
    const translatedLocales = docsI18n.languages.filter(
      (locale) =>
        locale !== docsI18n.defaultLanguage &&
        docsSource.getPages(locale).some((page) => !englishPaths.has(page.path))
    );
    const translations: Partial<Record<string, DocsPageVariant>> =
      Object.fromEntries(
        await Promise.all(
          translatedLocales.map(
            async (locale) =>
              [
                locale,
                await variantOf(
                  docsSource.getPage(slugs, locale) ?? english,
                  locale
                ),
              ] as const
          )
        )
      );
    return {
      url: english.url,
      english: await variantOf(english, docsI18n.defaultLanguage),
      translations,
    };
  });
