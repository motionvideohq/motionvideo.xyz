import { createFileRoute, notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { findDirectoryCategory, findDirectoryFilter } from "@/lib/directories";
import { localizedRedirect } from "@/lib/localized-redirect";
import { directoryFacetMetadata } from "@/seo/directory-facet";
import { createMetadata } from "@/seo/metadata";

// Former tool categories that became their own sections.
const MOVED_CATEGORIES = {
  skills: ROUTES.SKILLS,
  resources: ROUTES.EXTRAS,
} as const;

// The directory renders in the layout; this route owns category and facet URLs.
export const Route = createFileRoute("/$locale/tools/$category")({
  beforeLoad: ({ params, search }) => {
    const moved = Object.entries(MOVED_CATEGORIES).find(
      ([slug]) => slug === params.category
    )?.[1];
    if (moved) {
      throw localizedRedirect(moved, params.locale, { statusCode: 301 });
    }
    if (findDirectoryFilter("tool", params.category) && search.filter) {
      throw localizedRedirect(`/tools/${params.category}`, params.locale, {
        search: { sort: search.sort },
        replace: true,
        statusCode: 301,
      });
    }
  },
  loader: ({ params }) => {
    const category = findDirectoryCategory("tool", params.category);
    const facet = findDirectoryFilter("tool", params.category);
    if (!category && !facet) {
      throw notFound();
    }
    return { category, facet };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return createMetadata({});
    }
    if (loaderData.facet) {
      return directoryFacetMetadata("tool", loaderData.facet, params.locale);
    }
    if (!loaderData.category) {
      return createMetadata({});
    }
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).categories.tool[loaderData.category.slug];
    return createMetadata({
      title: meta.title,
      description: meta.description,
    });
  },
});
