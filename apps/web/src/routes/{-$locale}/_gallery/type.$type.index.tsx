import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { findMotionType } from "@/lib/motion-catalog";
import { createMetadata } from "@/seo/metadata";

// Head tags for a type page, `/type/prompt` or `/type/skill`. The parent
// route has rejected unknown types.
export const Route = createFileRoute("/{-$locale}/_gallery/type/$type/")({
  head: ({ params }) => {
    const type = findMotionType(params.type);
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const page = type && getIntlayer("gallery-meta", locale).types[type];
    return createMetadata({
      title: page?.title,
      description: page?.description,
    });
  },
});
