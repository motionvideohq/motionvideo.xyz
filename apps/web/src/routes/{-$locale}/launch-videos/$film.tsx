import { createFileRoute, notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { z } from "zod";

import { LaunchFilmPage } from "@/components/launch-videos/launch-film";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES, launchFilmPath } from "@/constants/routes";
import { useLocalizedNavigate } from "@/hooks/use-localized-navigate";
import { findLaunchFilm, scenesOfFilm } from "@/lib/launch-catalog";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

interface FilmSearch {
  /** A scene slug: the chapter to open on. */
  scene?: string;
}

const LaunchFilm = () => {
  const { film, scenes } = Route.useLoaderData();
  const { scene } = Route.useSearch();
  const navigate = useLocalizedNavigate();
  const selected = scenes.find((entry) => entry.slug === scene);
  return (
    <LaunchFilmPage
      // A new film starts fresh: no seek or loop carried over.
      key={film.slug}
      film={film}
      scenes={scenes}
      selected={selected}
      onSelect={(next) => {
        void navigate({
          to: ROUTES.LAUNCH_VIDEO_FILM,
          params: { film: film.slug },
          search: { scene: next.slug },
          replace: true,
          resetScroll: false,
        });
      }}
    />
  );
};

// A film: `/launch-videos/<film>`, `?scene=<slug>` to open on a chapter.
// Public metadata only; prompts are fetched when someone copies one.
export const Route = createFileRoute("/{-$locale}/launch-videos/$film")({
  component: LaunchFilm,
  validateSearch: (search): FilmSearch => ({
    scene: z.string().max(100).safeParse(search.scene).data,
  }),
  loader: ({ params }) => {
    const film = findLaunchFilm(params.film);
    if (!film) {
      throw notFound();
    }
    return { film, scenes: scenesOfFilm(film) };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {};
    }
    const { film } = loaderData;
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    return {
      ...createMetadata({ title: film.title, description: film.summary }),
      scripts: [
        breadcrumbJsonLd(
          [
            {
              name: getIntlayer("launch-videos", locale).title,
              path: ROUTES.LAUNCH_VIDEOS,
            },
            { name: film.title, path: launchFilmPath(film.slug) },
          ],
          locale
        ),
      ],
    };
  },
});
