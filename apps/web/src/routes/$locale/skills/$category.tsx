import { createFileRoute, notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { findDirectoryCategory, findDirectoryFilter } from "@/lib/directories";
import { localizedRedirect } from "@/lib/localized-redirect";
import { directoryFacetMetadata } from "@/seo/directory-facet";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the layout; this route owns category and facet URLs.
export const Route = createFileRoute("/$locale/skills/$category")({
  beforeLoad: ({ params, search }) => {
    if (findDirectoryFilter("skill", params.category) && search.filter) {
      throw localizedRedirect(`/skills/${params.category}`, params.locale, {
        search: { sort: search.sort },
        replace: true,
        statusCode: 301,
      });
    }
  },
  loader: ({ params }) => {
    const category = findDirectoryCategory("skill", params.category);
    const facet = findDirectoryFilter("skill", params.category);
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
      return directoryFacetMetadata("skill", loaderData.facet, params.locale);
    }
    if (!loaderData.category) {
      return createMetadata({});
    }
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).categories.skill[loaderData.category.slug];
    return createMetadata({
      title: meta.title,
      description: meta.description,
    });
  },
});
