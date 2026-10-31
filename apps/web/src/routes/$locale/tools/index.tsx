import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { localizedRedirect } from "@/lib/localized-redirect";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/tools` layout; this route only owns `/tools`.
export const Route = createFileRoute("/$locale/tools/")({
  beforeLoad: ({ params, search }) => {
    if (search.filter) {
      throw localizedRedirect(`/tools/${search.filter}`, params.locale, {
        search: { sort: search.sort },
        replace: true,
        statusCode: 301,
      });
    }
  },
  head: ({ params }) => {
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).tools;
    return createMetadata({
      title: meta.title,
      description: meta.description,
    });
  },
});
