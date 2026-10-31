import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import type { AnyRouteMatch } from "@tanstack/react-router";
import { getPathWithoutLocale, validatePrefix } from "intlayer";

import { NotFound } from "@/components/not-found";
import {
  DEFAULT_LOCALE,
  I18N_ROUTING,
  LOCALES,
  isLocale,
  localizedPath,
  ogLocale,
} from "@/constants/locales";
import { absoluteUrl } from "@/constants/url";
import { directorySearch } from "@/lib/directories";
import {
  DIRECTORY_SECTION_PATHS,
  directoryPageNoIndex,
} from "@/lib/directory-discovery";
import { websiteJsonLd } from "@/seo/json-ld";

export const Route = createFileRoute("/$locale")({
  // Validate the prefix before anything renders. An unknown prefix (`/xx/…`)
  // renders the localized 404 instead of an untranslated page at a URL search
  // engines could index.
  beforeLoad: ({ params }) => {
    const { isValid } = validatePrefix(params.locale, I18N_ROUTING);
    if (!isValid) {
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
      leaf.routeId === "/$locale/$" ||
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
    const path = getPathWithoutLocale(leaf.pathname);
    const directoryKind = (["tool", "studio", "skill", "extra"] as const).find(
      (kind) =>
        path === DIRECTORY_SECTION_PATHS[kind] ||
        path.startsWith(`${DIRECTORY_SECTION_PATHS[kind]}/`)
    );
    if (
      directoryKind &&
      directoryPageNoIndex(
        directoryKind,
        path.split("/")[2],
        directorySearch(directoryKind).parse(leaf.search)
      )
    ) {
      // These are browsing utilities, not aliases of the unfiltered collection.
      // Allow crawling so search engines can read the noindex directive.
      return {
        meta: [{ content: "noindex, follow", name: "robots" }, localeMeta],
      };
    }
    // Sorting only changes order: canonical and alternates omit query params.
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
