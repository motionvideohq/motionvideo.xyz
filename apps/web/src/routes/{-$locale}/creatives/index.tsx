import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/creatives` layout; this route only owns
// `/creatives`.
export const Route = createFileRoute("/{-$locale}/creatives/")({
  head: ({ params }) => {
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).creatives;
    return createMetadata({
      title: meta.title,
      description: meta.description,
    });
  },
});
