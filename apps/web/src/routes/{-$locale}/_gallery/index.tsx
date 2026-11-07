import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { createMetadata } from "@/seo/metadata";

// The gallery itself renders in the `_gallery` layout; this route only owns `/`.
export const Route = createFileRoute("/{-$locale}/_gallery/")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const meta = getIntlayer("gallery-meta", locale).home;
    return createMetadata({
      title: meta.title,
      description: meta.description,
    });
  },
});
