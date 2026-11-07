import { createFileRoute, notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { findDirectoryCategory } from "@/lib/directories";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/creatives` layout; this route owns the
// category URL (`/creatives/studios`, `/creatives/designers`) and its head tags.
export const Route = createFileRoute("/{-$locale}/creatives/$category")({
  loader: ({ params }) => {
    const category = findDirectoryCategory("studio", params.category);
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
    ).categories.studio[loaderData.category.slug];
    return createMetadata({
      title: meta.title,
      description: meta.description,
    });
  },
});
