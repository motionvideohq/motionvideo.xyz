import { Link, createFileRoute } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { z } from "zod";

import { CategoryChip } from "@/components/collection-toolbar";
import { PageHeader, PageMain } from "@/components/page";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import { MOTION_CATEGORIES } from "@/lib/motion-catalog";
import type { MotionCategory, MotionVideo } from "@/lib/motion-catalog";
import { createMetadata } from "@/seo/metadata";

const videos: MotionVideo[] = catalog.videos;
const promptVideos = videos.filter((video) => video.prompt);
// Categories with at least one prompt, in gallery order.
const categories = MOTION_CATEGORIES.flatMap((category) => {
  const count = promptVideos.filter((video) =>
    video.contentTags.includes(category)
  ).length;
  return count > 0 ? [{ category, count }] : [];
});

const CustomizeIndex = () => {
  const content = useIntlayer("customize-page");
  const gallery = useIntlayer("motion-gallery");
  const { category } = Route.useSearch();
  const shown = category
    ? promptVideos.filter((video) => video.contentTags.includes(category))
    : promptVideos;

  return (
    <PageMain width="full" className="gap-12">
      <PageHeader title={content.title.value} intro={content.intro} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight">
            {content.galleryTitle}
          </h2>
          <p className="text-muted-foreground text-sm">
            {content.galleryIntro}
          </p>
        </div>
        <nav
          aria-label={content.filterCategory.value}
          className="flex flex-wrap gap-2"
        >
          <CategoryChip
            active={!category}
            activeVariant="outline"
            label={gallery.all}
            count={promptVideos.length}
            to={ROUTES.CUSTOMIZE}
            search={{ category: undefined }}
          />
          {categories.map((entry) => (
            <CategoryChip
              key={entry.category}
              active={category === entry.category}
              label={gallery.categories[entry.category]}
              count={entry.count}
              to={ROUTES.CUSTOMIZE}
              search={{ category: entry.category }}
            />
          ))}
        </nav>
        {shown.length > 0 ? (
          <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((video) => (
              <li key={video.slug}>
                <Link
                  to="/customize/$slug"
                  params={{ slug: video.slug }}
                  className="hover:bg-muted/60 flex items-center gap-3 rounded-lg p-2 transition-colors"
                >
                  <img
                    src={video.poster}
                    alt=""
                    width={video.width}
                    height={video.height}
                    loading="lazy"
                    decoding="async"
                    className="bg-muted aspect-video w-24 shrink-0 rounded-md object-cover"
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      {video.title}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {video.creatorName ?? `@${video.handle}`}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">{content.noPrompts}</p>
        )}
      </section>
    </PageMain>
  );
};

interface CustomizeSearch {
  category?: MotionCategory;
}

export const Route = createFileRoute("/customize/")({
  component: CustomizeIndex,
  validateSearch: (search): CustomizeSearch => ({
    category: z.enum(MOTION_CATEGORIES).safeParse(search.category).data,
  }),
  head: () =>
    createMetadata({
      canonical: ROUTES.CUSTOMIZE,
      title: "Customize a prompt",
      description:
        "Make any motion video prompt from the gallery yours: add your subject, colors, size and typeface, and set creativity, pace and polish. Free, in the browser.",
    }),
});
