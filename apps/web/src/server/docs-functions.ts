import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { SerializedPageTree } from "fumadocs-core/source/client";
import { z } from "zod";

import { docsI18n, getDocsSource } from "./docs-source";
import type { DocsPage, DocsSource } from "./docs-source";
import { OPENAPI_SOURCE_PATH } from "./openapi";

/** A docs page in one locale, with the sidebar tree of that locale. */
export interface DocsPageVariant {
  /** Content path of the page, e.g. `mcp.mdx`, `mcp.es.mdx` or `api/get-catalog.mdx`. */
  path: string;
  /** The file it is built from, relative to apps/web, for the edit link. */
  source: string;
  title: string;
  description: string;
  tree: SerializedPageTree;
}

const variantOf = async (
  source: DocsSource,
  page: DocsPage,
  locale: string
): Promise<DocsPageVariant> => ({
  path: page.path,
  source:
    page.data.type === "openapi"
      ? OPENAPI_SOURCE_PATH
      : `content/docs/${page.path}`,
  title: page.data.title ?? "",
  description: page.data.description ?? "",
  tree: await source.serializePageTree(source.getPageTree(locale)),
});

// The page at /{-$locale}/docs/<slugs> in English plus every locale with
// translated docs (this page or any other, since the sidebar lists every
// title). The client picks the URL's locale with `useLocale()` and falls back
// to English. API reference pages are the same in every locale, so their
// render props (`openapi`, with the OpenAPI document) are sent once.
export const getDocsPage = createServerFn({ method: "GET" })
  .validator(z.array(z.string()))
  .handler(async ({ data: slugs }) => {
    const source = await getDocsSource();
    const english = source.getPage(slugs);
    if (!english) {
      throw notFound();
    }
    const englishPaths = new Set(
      source.getPages(docsI18n.defaultLanguage).map((page) => page.path)
    );
    const translatedLocales = docsI18n.languages.filter(
      (locale) =>
        locale !== docsI18n.defaultLanguage &&
        source.getPages(locale).some((page) => !englishPaths.has(page.path))
    );
    const translations: Partial<Record<string, DocsPageVariant>> =
      Object.fromEntries(
        await Promise.all(
          translatedLocales.map(
            async (locale) =>
              [
                locale,
                await variantOf(
                  source,
                  source.getPage(slugs, locale) ?? english,
                  locale
                ),
              ] as const
          )
        )
      );
    return {
      url: english.url,
      english: await variantOf(source, english, docsI18n.defaultLanguage),
      translations,
      openapi:
        english.data.type === "openapi"
          ? english.data.getOpenAPIPageProps()
          : undefined,
    };
  });
