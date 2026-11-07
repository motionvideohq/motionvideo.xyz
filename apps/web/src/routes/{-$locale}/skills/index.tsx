import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/skills` layout; this route only owns `/skills`.
export const Route = createFileRoute("/{-$locale}/skills/")({
  head: ({ params }) => {
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).skills;
    return createMetadata({
      title: meta.title,
      description: meta.description,
    });
  },
});
