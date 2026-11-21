import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { LaunchCompose } from "@/components/launch-videos/launch-compose";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { createMetadata } from "@/seo/metadata";

// The storyboard composer. Its state is local to the browser, so the page
// itself is the same for everyone and not one to index.
export const Route = createFileRoute("/{-$locale}/launch-videos/compose")({
  staticData: { noIndex: true },
  component: LaunchCompose,
  head: ({ params }) => {
    const content = getIntlayer(
      "launch-compose",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    );
    return createMetadata({
      title: content.title,
      description: content.intro,
    });
  },
});
