import { createFileRoute, notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { findDirectoryCategory } from "@/lib/directories";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/extras` layout; this route owns the category
// URL (e.g. `/extras/articles`) and its head tags.
export const Route = createFileRoute("/{-$locale}/extras/$category")({
  loader: ({ params }) => {
    const category = findDirectoryCategory("extra", params.category);
    if (!category) {
      throw notFound();
    }
    return { category };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
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
