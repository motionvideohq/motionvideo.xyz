import { createFileRoute, notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { findDirectoryCategory } from "@/lib/directories";
import { localizedRedirect } from "@/lib/localized-redirect";
import { createMetadata } from "@/seo/metadata";

// Former tool categories that became their own sections.
const MOVED_CATEGORIES = {
  skills: ROUTES.SKILLS,
  resources: ROUTES.EXTRAS,
} as const;

// The directory renders in the `/tools` layout; this route owns the category
// URL (e.g. `/tools/ai`) and its head tags.
export const Route = createFileRoute("/{-$locale}/tools/$category")({
  beforeLoad: ({ params }) => {
    const moved = Object.entries(MOVED_CATEGORIES).find(
      ([slug]) => slug === params.category
    )?.[1];
    if (moved) {
      throw localizedRedirect(moved, params.locale, { statusCode: 301 });
    }
  },
  loader: ({ params }) => {
    const category = findDirectoryCategory("tool", params.category);
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
    ).categories.tool[loaderData.category.slug];
    return createMetadata({
      title: meta.title,
      description: meta.description,
    });
  },
});
