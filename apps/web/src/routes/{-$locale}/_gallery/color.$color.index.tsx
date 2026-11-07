import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { findMotionColor } from "@/lib/motion-catalog";
import { fillTemplate } from "@/lib/motion-video-route";
import { createMetadata } from "@/seo/metadata";

// Templates may open with the colour word ("red motion design videos").
const capitalize = (text: string) =>
  text.replace(/^./u, (letter) => letter.toUpperCase());

// Head tags for a colour page, e.g. `/color/red`: every motion design video
// with that colour in its palette. The parent route has rejected unknown
// colours.
export const Route = createFileRoute("/{-$locale}/_gallery/color/$color/")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const meta = getIntlayer("gallery-meta", locale).color;
    const slug = findMotionColor(params.color)?.slug;
    const values = { color: slug ? meta.names[slug] : params.color };
    return createMetadata({
      title: capitalize(fillTemplate(meta.title, values)),
      description: capitalize(fillTemplate(meta.description, values)),
    });
  },
});
