import { Link, createFileRoute } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { z } from "zod";

import { CategoryChip } from "@/components/collection-toolbar";
import { PageHeader, PageMain } from "@/components/page";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import { MOTION_CATEGORIES } from "@/lib/motion-catalog";
import type { MotionCategory, MotionVideo } from "@/lib/motion-catalog";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import { createMetadata } from "@/seo/metadata";

const videos: MotionVideo[] = catalog.videos;
const promptVideos = videos.filter((video) => video.prompt);

const sectionTitle = "text-xl font-semibold tracking-tight";

const CustomizeIndex = () => {
  const content = useIntlayer("customize-page");
  const gallery = useIntlayer("motion-gallery");
  const { category } = Route.useSearch();
  const shown = category
    ? promptVideos.filter((video) => video.contentTags.includes(category))
    : promptVideos;
  const categories = MOTION_CATEGORIES.flatMap((entry) => {
    const count = promptVideos.filter((video) =>
      video.contentTags.includes(entry)
    ).length;
    return count > 0 ? [{ category: entry, count }] : [];
  });

  return (
    <PageMain width="full" className="gap-12">
      <PageHeader title={content.title.value} intro={content.intro} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className={sectionTitle}>{content.templatesTitle}</h2>
          <p className="text-muted-foreground text-sm">
            {content.templatesIntro}
          </p>
        </div>
        <ul className="grid gap-3 md:grid-cols-3">
          {PROMPT_TEMPLATES.map((template) => (
            <li key={template.id}>
              <Link
                to="/templates/$templateId/customize"
                params={{ templateId: template.id }}
                className="bg-card shadow-outline hover:bg-muted/60 group flex h-full flex-col gap-2 rounded-xl p-4 transition-colors"
              >
                <span className="font-medium">{template.title}</span>
                <span className="text-muted-foreground line-clamp-3 text-sm text-pretty">
                  {template.summary}
                </span>
                <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-medium">
                  {content.customize}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className={sectionTitle}>{content.galleryTitle}</h2>
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
                      @{video.handle}
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
