import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import type { AnyRouteMatch } from "@tanstack/react-router";
import { getPathWithoutLocale } from "intlayer";

import { NotFound } from "@/components/not-found";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  localizedPath,
  ogLocale,
} from "@/constants/locales";
import { videoPath } from "@/constants/routes";
import { absoluteUrl } from "@/constants/url";
import {
  MIN_INDEXED_CREATOR_VIDEOS,
  findMotionCreator,
} from "@/lib/motion-creators";
import { websiteJsonLd } from "@/seo/json-ld";

export const Route = createFileRoute("/{-$locale}")({
  // Validate the prefix before anything renders. English has none; any other
  // first segment the optional param picks up (`/xx/…`, `/nope`) renders the
  // localized 404 instead of an untranslated or duplicate page at a URL search
  // engines could index. (intlayer's `validatePrefix` passes anything that
  // doesn't look like a locale code, which would turn `/nope` into the home
  // page.)
  beforeLoad: ({ params }) => {
    if (params.locale !== undefined && !isLocale(params.locale)) {
      throw notFound();
    }
  },
  component: Outlet,
  notFoundComponent: NotFound,
  // Canonical, hreflang and robots live on the locale layout so every page
  // gets them, including pages whose own head only sets a title and
  // description.
  head: ({ matches, params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    // Any route under the layout: its id and params aren't the layout's own.
    const leaf: AnyRouteMatch | undefined = matches.at(-1);
    const localeMeta = { content: ogLocale(locale), property: "og:locale" };
    // A 404 (unknown prefix, unmatched path, missing video) is not a page:
    // no canonical or alternates pointing at URLs that don't exist.
    if (
      !leaf ||
      leaf.routeId === "/{-$locale}/$" ||
      matches.some((match) => match.status === "notFound")
    ) {
      return { meta: [{ content: "noindex", name: "robots" }] };
    }
    // Account, admin and sign-in pages (`staticData.noIndex` on the route or
    // an ancestor) stay out of search, so they advertise no canonical or
    // translations either.
    if (matches.some((match) => match.staticData.noIndex)) {
      return {
        meta: [{ content: "noindex, nofollow", name: "robots" }, localeMeta],
      };
    }
    // Creators with only a video or two: the page works (the video sidebar
    // links every creator) but stays out of search, crawlable so the
    // directive is read. See MIN_INDEXED_CREATOR_VIDEOS.
    if (leaf.routeId.startsWith("/{-$locale}/_gallery/creators/$creator")) {
      const creator = findMotionCreator(String(leaf.params.creator));
      if (!creator || creator.count < MIN_INDEXED_CREATOR_VIDEOS) {
        return {
          meta: [{ content: "noindex, follow", name: "robots" }, localeMeta],
        };
      }
    }
    // Scoped video URLs (`/category/x/videos/slug`…) redirect to
    // `/videos/slug`; any that still render share its canonical.
    const path = leaf.routeId.endsWith("/videos/$slug")
      ? videoPath(String(leaf.params.slug))
      : getPathWithoutLocale(leaf.pathname);
    const canonical = absoluteUrl(localizedPath(path, locale));

    return {
      links: [
        { href: canonical, rel: "canonical" },
        ...LOCALES.map((alternate) => ({
          href: absoluteUrl(localizedPath(path, alternate)),
          hrefLang: alternate,
          rel: "alternate",
        })),
        {
          href: absoluteUrl(localizedPath(path, DEFAULT_LOCALE)),
          hrefLang: "x-default",
          rel: "alternate",
        },
      ],
      meta: [localeMeta, { content: canonical, property: "og:url" }],
      scripts: [websiteJsonLd(locale)],
    };
  },
});
