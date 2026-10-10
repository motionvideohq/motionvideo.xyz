import {
  Link,
  createFileRoute,
  getRouteApi,
  redirect,
} from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { Bookmark } from "reicon-react/icons/Bookmark";

import { MotionVideoCard } from "@/components/motion-video";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { VirtualMasonry } from "@/components/virtual-masonry";
import type { MasonryItem } from "@/components/virtual-masonry";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import { useBookmarks } from "@/lib/bookmarks";
import type { MotionVideo } from "@/lib/motion-catalog";
import { createMetadata } from "@/seo/metadata";
import { getBookmarks } from "@/server/bookmark-functions";

const routeApi = getRouteApi("/bookmarks");
const videosBySlug = new Map<string, MotionVideo>(
  catalog.videos.map((video) => [video.slug, video])
);

const Bookmarks = () => {
  const content = useIntlayer("bookmarks-page");
  const slugs = routeApi.useLoaderData();
  const bookmarks = useBookmarks();
  // Cards leave as soon as they are unbookmarked; the loader keeps the order.
  const visible = bookmarks.loaded
    ? slugs.filter((slug) => bookmarks.slugs.has(slug))
    : slugs;
  const items: MasonryItem[] = visible.flatMap((slug) => {
    const video = videosBySlug.get(slug);
    return video
      ? [
          {
            key: video.slug,
            aspectRatio: video.width / video.height,
            // Opens the video overlay on Discover.
            node: (
              <MotionVideoCard
                video={video}
                paused={false}
                open={false}
                category={undefined}
                search={{}}
              />
            ),
          },
        ]
      : [];
  });

  return (
    <>
      <SiteHeader signedIn />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-[1800px] flex-1 flex-col gap-6 px-4 pt-6 pb-16 sm:px-6"
      >
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {content.title}
          </h1>
          <p className="text-muted-foreground text-sm">{content.intro}</p>
        </header>
        {items.length > 0 ? (
          <VirtualMasonry items={items} />
        ) : (
          <Empty className="bg-muted/40 rounded-2xl">
            <EmptyHeader>
              <EmptyMedia>
                <ReiconDuotone
                  icon={Bookmark}
                  aria-hidden="true"
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
      </main>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/bookmarks")({
  component: Bookmarks,
  head: () =>
    createMetadata({
      canonical: ROUTES.BOOKMARKS,
      noIndex: true,
      title: "Bookmarks",
    }),
  loader: async () => {
    const slugs = await getBookmarks();
    if (!slugs) {
      throw redirect({
        search: { redirect: ROUTES.BOOKMARKS },
        to: ROUTES.SIGN_IN,
      });
    }
    return slugs;
  },
});
