import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { findMotionCategory } from "@/lib/motion-catalog";
import { createMetadata } from "@/seo/metadata";

// Head tags for a Discover category page, e.g. `/category/product-ui`. The
// parent route has already rejected unknown categories.
export const Route = createFileRoute(
  "/{-$locale}/_gallery/category/$category/"
)({
  head: ({ params }) => {
    const category = findMotionCategory(params.category);
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const page =
      category && getIntlayer("gallery-meta", locale).categories[category];
    return createMetadata({
      title: page?.title,
      description: page?.description,
    });
  },
});
