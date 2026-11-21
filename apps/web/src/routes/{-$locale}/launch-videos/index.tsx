import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { LaunchGallery } from "@/components/launch-videos/launch-gallery";
import {
  RAW_LAUNCH_SEARCH,
  parseLaunchSearch,
} from "@/components/launch-videos/search-params";
import type { LaunchVideosSearch } from "@/components/launch-videos/search-params";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { useLocalizedNavigate } from "@/hooks/use-localized-navigate";
import { createMetadata } from "@/seo/metadata";

const LaunchVideos = () => {
  const search = Route.useSearch();
  const navigate = useLocalizedNavigate();
  return (
    <LaunchGallery
      search={search}
      onSearch={(next: LaunchVideosSearch, options) => {
        void navigate({
          to: ROUTES.LAUNCH_VIDEOS,
          search: next,
          replace: options?.replace,
          resetScroll: false,
        });
      }}
    />
  );
};

// `/launch-videos`: Videos or Scenes, with every facet in the URL.
export const Route = createFileRoute("/{-$locale}/launch-videos/")({
  component: LaunchVideos,
  validateSearch: (search) =>
    parseLaunchSearch(RAW_LAUNCH_SEARCH.parse(search)),
  head: ({ params }) => {
    const content = getIntlayer(
      "launch-videos",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    );
    return createMetadata({
      title: content.title,
      description: content.intro,
    });
  },
});
