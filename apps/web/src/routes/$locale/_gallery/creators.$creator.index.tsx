import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { findMotionCreator } from "@/lib/motion-creators";
import { fillTemplate } from "@/lib/motion-video-route";
import { createMetadata } from "@/seo/metadata";

export const Route = createFileRoute("/$locale/_gallery/creators/$creator/")({
  head: ({ params }) => {
    const creator = findMotionCreator(params.creator);
    if (!creator) {
      return {};
    }
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const copy = getIntlayer("motion-creator", locale);
    const values = {
      name: creator.name,
    };
    return createMetadata({
      title: fillTemplate(copy.title, values),
      description: fillTemplate(copy.description, values),
    });
  },
});
