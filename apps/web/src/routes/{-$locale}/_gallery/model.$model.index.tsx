import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { MOTION_MODEL_NAMES, findMotionModel } from "@/lib/motion-catalog";
import { fillTemplate } from "@/lib/motion-video-route";
import { createMetadata } from "@/seo/metadata";

// Head tags for a model page, e.g. `/model/opus-5-5`: every motion design
// video made with that model. The parent route has rejected unknown models.
export const Route = createFileRoute("/{-$locale}/_gallery/model/$model/")({
  head: ({ params }) => {
    const model = findMotionModel(params.model);
    const name = model ? MOTION_MODEL_NAMES[model] : params.model;
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const meta = getIntlayer("gallery-meta", locale).model;
    return createMetadata({
      title: fillTemplate(meta.title, { name }),
      description: fillTemplate(meta.description, { name }),
    });
  },
});
