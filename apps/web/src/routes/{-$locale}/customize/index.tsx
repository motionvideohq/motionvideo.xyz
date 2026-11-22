import { createFileRoute } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { Sliders } from "reicon-react/icons/Sliders";

import { CollectionGrid } from "@/components/collection-grid";
import {
  CollectionIntro,
  SurpriseAndSubmit,
} from "@/components/collection-intro";
import {
  CategoryChip,
  CollectionToolbar,
} from "@/components/collection-toolbar";
import { FadeScroller } from "@/components/fade-scroller";
import { LocalizedLink as Link } from "@/components/localized-link";
import { MotionPreview } from "@/components/motion-video";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import { useLocalizedNavigate } from "@/hooks/use-localized-navigate";
import { MOTION_CATEGORIES } from "@/lib/motion-catalog";
import type { MotionCategory, MotionVideo } from "@/lib/motion-catalog";
import type { MasonryItem } from "@/registry/components/virtual-masonry";
import { createMetadata } from "@/seo/metadata";

const videos: MotionVideo[] = catalog.videos;
const promptVideos = videos.filter((video) => video.prompt);
// Categories with at least one prompt, in gallery order.
const categories = MOTION_CATEGORIES.filter((category) =>
  promptVideos.some((video) => video.contentTags.includes(category))
);

/**
 * One prompt to customize, shown like a gallery card (the clip playing) but
 * opening the customizer, with the title, creator and a "Customize" mark.
 */
const CustomizeCard = ({
  video,
  category,
}: {
  video: MotionVideo;
  category?: MotionCategory;
}) => {
  const gallery = useIntlayer("motion-gallery");
  return (
    <Link
      to={ROUTES.CUSTOMIZE_PROMPT}
      params={{ slug: video.slug }}
      search={{ category }}
      className="group focus-visible:ring-ring relative block overflow-hidden rounded-xl outline-none focus-visible:ring-2"
    >
      <MotionPreview video={video} paused={false} />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 rounded-b-xl bg-linear-to-t from-black/70 to-transparent p-3 pt-10 text-white">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium tracking-tight">
            {video.title}
          </span>
          <span className="truncate text-[11px] text-white/70">
            {video.creatorName ?? `@${video.handle}`}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] font-medium backdrop-blur-sm transition-colors group-hover:bg-white/25">
          <Sliders aria-hidden="true" className="size-3" />
          {gallery.customize}
        </span>
      </span>
    </Link>
  );
};

const CustomizeIndex = () => {
  const content = useIntlayer("customize-page");
  const gallery = useIntlayer("motion-gallery");
  const { category } = Route.useSearch();
  const navigate = useLocalizedNavigate();
  const shown = category
    ? promptVideos.filter((video) => video.contentTags.includes(category))
    : promptVideos;

  const surprise = () => {
    const video = shown[Math.floor(Math.random() * shown.length)];
    if (video) {
      void navigate({
        to: ROUTES.CUSTOMIZE_PROMPT,
        params: { slug: video.slug },
        search: { category },
      });
    }
  };

  const items: MasonryItem[] = [
    {
      key: "intro",
      node: (
        <CollectionIntro
          titleId="customize-intro-title"
          title={content.title}
          description={content.intro}
          actions={
            <SurpriseAndSubmit
              onSurprise={surprise}
              surpriseDisabled={shown.length === 0}
              surpriseLabel={gallery.surprise}
              submitLabel={gallery.submitVideo}
              submitSearch={{ kind: "video", category }}
            />
          }
        />
      ),
    },
    ...shown.map((video) => ({
      key: video.slug,
      aspectRatio: video.width / video.height,
      node: <CustomizeCard video={video} category={category} />,
    })),
  ];

  return (
    <>
      <CollectionToolbar label={content.filterCategory.value}>
        <FadeScroller
          label={content.filterCategory.value}
          className="-mx-1 -my-1 min-w-0 flex-1 px-1 py-1"
        >
          <CategoryChip
            active={!category}
            label={gallery.all}
            to={ROUTES.CUSTOMIZE}
            search={{ category: undefined }}
          />
          {categories.map((entry) => (
            <CategoryChip
              key={entry}
              active={category === entry}
              label={gallery.categories[entry]}
              to={ROUTES.CUSTOMIZE}
              search={{ category: entry }}
            />
          ))}
        </FadeScroller>
      </CollectionToolbar>
      <CollectionGrid
        items={items}
        emptyState={
          shown.length === 0 ? (
            <p className="text-muted-foreground mt-6 text-sm">
              {content.noPrompts}
            </p>
          ) : undefined
        }
      />
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/customize/")({
  component: CustomizeIndex,
  head: () =>
    createMetadata({
      title: "Prompt customizer",
      description:
        "Make any motion video prompt from the gallery yours: add your subject, colors, size and typeface, and set creativity, pace and polish. Free, in the browser.",
    }),
});
