import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import type { IntlayerNode } from "react-intlayer";
import { z } from "zod";

import {
  CategoryChip,
  CollectionToolbar,
} from "@/components/collection-toolbar";
import {
  DIRECTORY_COVER_RATIO,
  DirectoryCard,
} from "@/components/directory-card";
import { FadeScroller } from "@/components/fade-scroller";
import { LocalizedLink as Link } from "@/components/localized-link";
import { MotionVideoCard, MotionVideoOverlay } from "@/components/motion-video";
import { AccountPageHeader, pageContainerClass } from "@/components/page";
import { SectionIcon } from "@/components/section-icon";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeParam,
  localizedPath,
} from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import type { Section } from "@/constants/section-icons";
import { findBookmarkItem } from "@/lib/bookmark-catalog";
import { BOOKMARK_KINDS, bookmarkKey } from "@/lib/bookmark-items";
import type { BookmarkKind } from "@/lib/bookmark-items";
import { useBookmarks } from "@/lib/bookmarks";
import { DIRECTORY_CATEGORIES } from "@/lib/directories";
import type { DirectoryCategory } from "@/lib/directories";
import { localizedRedirect } from "@/lib/localized-redirect";
import { cn } from "@/lib/utils";
import { VirtualMasonry } from "@/registry/components/virtual-masonry";
import type { MasonryItem } from "@/registry/components/virtual-masonry";
import { buttonVariants } from "@/registry/ui/button";
import { createMetadata } from "@/seo/metadata";
import { getBookmarks } from "@/server/bookmark-functions";
import { getLandingData } from "@/server/functions";

interface BookmarksSearch {
  kind?: BookmarkKind;
  /** A saved video open in the overlay, over this page. */
  video?: string;
}

const routeApi = getRouteApi("/{-$locale}/dashboard/bookmarks");

// Each bookmark kind's chip is named after its section.
const BOOKMARK_KIND_SECTION = {
  video: "videos",
  tool: "tools",
  studio: "creatives",
  skill: "skills",
  extra: "extras",
} as const satisfies Record<BookmarkKind, Section>;

const Bookmarks = () => {
  const content = useIntlayer("bookmarks-page");
  const sections = useIntlayer("site-header");
  const directory = useIntlayer("resource-directory");
  const { saved } = routeApi.useLoaderData();
  const search = routeApi.useSearch();
  const bookmarks = useBookmarks();
  const navigate = routeApi.useNavigate();
  // Cards leave as soon as they are unbookmarked; the loader keeps the order.
  const visible = saved.flatMap(({ kind, id }) => {
    const key = bookmarkKey(kind, id);
    const item = findBookmarkItem(kind, id);
    return item && (!bookmarks.loaded || bookmarks.keys.has(key))
      ? [{ key, item }]
      : [];
  });
  const counts = new Map<BookmarkKind, number>();
  for (const { item } of visible) {
    counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1);
  }
  // A kind whose last bookmark was just removed loses its chip, so fall back
  // to "All" rather than an empty filter.
  const kind = search.kind && counts.has(search.kind) ? search.kind : undefined;
  const shown = kind
    ? visible.filter(({ item }) => item.kind === kind)
    : visible;

  // Videos open over this page, stepping through the saved videos shown.
  const videos = shown.flatMap(({ item }) =>
    item.kind === "video" ? [item.video] : []
  );
  const openIndex = videos.findIndex((video) => video.slug === search.video);
  const openVideo = (slug?: string, replace = false) =>
    navigate({
      search: (previous) => ({ ...previous, video: slug }),
      replace,
      resetScroll: false,
    });

  const items: MasonryItem[] = shown.map(({ key, item }) => {
    if (item.kind === "video") {
      return {
        key,
        aspectRatio: item.video.width / item.video.height,
        node: (
          <MotionVideoCard
            video={item.video}
            paused={openIndex !== -1}
            open={false}
            scope={undefined}
            search={{}}
            onOpen={() => openVideo(item.video.slug)}
            bookmarkAlwaysVisible
          />
        ),
      };
    }
    const { entry } = item;
    const categories: DirectoryCategory[] = DIRECTORY_CATEGORIES[item.kind];
    const labels: Partial<Record<string, IntlayerNode<string>>> =
      directory.labels[item.kind];
    const category = categories.find(({ id }) => id === entry.category);
    return {
      key,
      aspectRatio: DIRECTORY_COVER_RATIO,
      node: (
        <DirectoryCard
          kind={item.kind}
          entry={entry}
          // Sections without chips show no badge, as in the directories.
          categoryLabel={
            categories.length > 0
              ? ((category && labels[category.slug]?.value) ?? entry.category)
              : undefined
          }
          label={`${entry.name}: ${directory.visit.value} (${directory.newTab.value})`}
          bookmarkAlwaysVisible
        />
      ),
    };
  });

  return (
    <>
      <main id="main-content" className="flex flex-1 flex-col">
        <AccountPageHeader
          title={sections.bookmarks}
          intro={content.intro}
          className={cn(pageContainerClass("full"), "pt-6 pb-3.5")}
        />
        {visible.length > 0 && (
          <CollectionToolbar>
            <FadeScroller
              label={content.filterKind.value}
              className="-mx-1 -my-1 min-w-0 basis-full px-1 py-1"
            >
              {[undefined, ...BOOKMARK_KINDS.filter((k) => counts.has(k))].map(
                (value) => (
                  <CategoryChip
                    key={value ?? "all"}
                    to={ROUTES.DASHBOARD_BOOKMARKS}
                    search={{ kind: value }}
                    active={value === kind}
                    label={
                      value
                        ? sections[BOOKMARK_KIND_SECTION[value]]
                        : content.all
                    }
                  />
                )
              )}
            </FadeScroller>
          </CollectionToolbar>
        )}
        <div className="mx-auto flex w-full max-w-[1800px] flex-1 flex-col px-4 pt-2.5 pb-16 sm:px-6">
          {items.length > 0 ? (
            <VirtualMasonry items={items} />
          ) : (
            <Empty className="bg-muted/40 rounded-2xl">
              <EmptyHeader>
                <EmptyMedia>
                  <SectionIcon
                    section="bookmarks"
                    className="text-muted-foreground size-7"
                  />
                </EmptyMedia>
                <EmptyTitle>{content.emptyTitle}</EmptyTitle>
                <EmptyDescription>{content.emptyDescription}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link to={ROUTES.HOME} className={buttonVariants()}>
                  {content.discover}
                </Link>
              </EmptyContent>
            </Empty>
          )}
        </div>
      </main>
      {openIndex !== -1 && (
        <MotionVideoOverlay
          video={videos[openIndex]}
          previous={
            openIndex > 0
              ? () => openVideo(videos[openIndex - 1].slug, true)
              : undefined
          }
          next={
            openIndex < videos.length - 1
              ? () => openVideo(videos[openIndex + 1].slug, true)
              : undefined
          }
          onClose={() => openVideo()}
        />
      )}
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/dashboard/bookmarks")({
  component: Bookmarks,
  head: ({ params }: LocaleHeadContext) =>
    createMetadata({
      title: getIntlayer(
        "site-header",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).bookmarks,
    }),
  validateSearch: (search): BookmarksSearch => ({
    kind: z.enum(BOOKMARK_KINDS).safeParse(search.kind).data,
    video: z.string().min(1).max(200).safeParse(search.video).data,
  }),
  // `sponsors` feeds the video overlay's Diamond sidebar row (useSponsors).
  loader: async ({ params }) => {
    const [saved, { sponsors }] = await Promise.all([
      getBookmarks(),
      getLandingData(),
    ]);
    if (!saved) {
      throw localizedRedirect(ROUTES.SIGN_IN, params.locale, {
        search: {
          redirect: localizedPath(
            ROUTES.DASHBOARD_BOOKMARKS,
            localeParam(params.locale)
          ),
        },
      });
    }
    return { saved, sponsors };
  },
});
