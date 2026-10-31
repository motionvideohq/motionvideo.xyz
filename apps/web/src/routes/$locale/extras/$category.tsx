import { createFileRoute, notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { findDirectoryCategory, findDirectoryFilter } from "@/lib/directories";
import { localizedRedirect } from "@/lib/localized-redirect";
import { directoryFacetMetadata } from "@/seo/directory-facet";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the layout; this route owns category and facet URLs.
export const Route = createFileRoute("/$locale/extras/$category")({
  beforeLoad: ({ params, search }) => {
    if (findDirectoryFilter("extra", params.category) && search.filter) {
      throw localizedRedirect(`/extras/${params.category}`, params.locale, {
        search: { sort: search.sort },
        replace: true,
        statusCode: 301,
      });
    }
  },
  loader: ({ params }) => {
    const category = findDirectoryCategory("extra", params.category);
    const facet = findDirectoryFilter("extra", params.category);
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
      return directoryFacetMetadata("extra", loaderData.facet, params.locale);
    }
    if (!loaderData.category) {
      return createMetadata({});
    }
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).categories.extra[loaderData.category.slug];
    return createMetadata({
      title: meta.title,
      description: meta.description,
    });
  },
});
