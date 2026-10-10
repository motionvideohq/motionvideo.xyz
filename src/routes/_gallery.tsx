import {
  Link,
  Outlet,
  createFileRoute,
  getRouteApi,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { cn } from "cn";
import { useMemo, useState } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { Pause } from "reicon-react/icons/Pause";
import { Play } from "reicon-react/icons/Play";
import { Search } from "reicon-react/icons/Search";
import { Ufo } from "reicon-react/icons/Ufo";
import { z } from "zod";

import { FadeScroller } from "@/components/fade-scroller";
import { MotionVideoCard } from "@/components/motion-video";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { Separator } from "@/components/ui/separator";
import { VirtualMasonry } from "@/components/virtual-masonry";
import type { MasonryItem } from "@/components/virtual-masonry";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import {
  MOTION_CATEGORIES,
  filterMotionVideos,
  findMotionCategory,
} from "@/lib/motion-catalog";
import type { GallerySearch, MotionVideo } from "@/lib/motion-catalog";
import { getLandingData } from "@/server/functions";

const routeApi = getRouteApi("/_gallery");
const videos: MotionVideo[] = catalog.videos;
const TYPES = ["prompt", "skill"] as const;
const typeCounts = Object.fromEntries(
  TYPES.map((type) => [
    type,
    videos.filter((video) => video.tags.includes(type)).length,
  ])
);
// Pills are outline buttons with rounded-full: default choices read as plain
// white chips; any other choice turns yellow.
const chipClass = (active: boolean) =>
  cn(
    buttonVariants({ variant: active ? "default" : "outline" }),
    "rounded-full px-3"
  );

const Gallery = () => {
  const content = useIntlayer("motion-gallery");
  const { signedIn } = routeApi.useLoaderData();
  const search = routeApi.useSearch();
  const navigate = useNavigate();
  const [paused, setPaused] = useState(false);
  // The open video renders as a child route overlay on top of this gallery;
  // on `/category/$category` (and its video overlays) the grid is filtered.
  const params = useParams({ strict: false });
  const openSlug = params.slug;
  const category = findMotionCategory(params.category);
  const sort = search.sort ?? "popular";
  const sortLabels = {
    popular: content.popular,
    newest: content.newest,
    oldest: content.oldest,
  };

  const filtered = useMemo(
    () =>
      filterMotionVideos(videos, {
        type: search.type,
        category,
        sort: search.sort,
      }),
    [search.type, category, search.sort]
  );
  const categoryCounts = useMemo(() => {
    const matching = filterMotionVideos(videos, { type: search.type });
    return Object.fromEntries(
      MOTION_CATEGORIES.map((id) => [
        id,
        matching.filter((video) => video.contentTags.includes(id)).length,
      ])
    );
  }, [search.type]);
  const previewsPaused = paused || Boolean(openSlug);

  // Type and sort stay search params on whichever page is showing.
  const updateSearch = (patch: GallerySearch) => {
    const next = { ...search, ...patch };
    void (category
      ? navigate({
          to: "/category/$category",
          params: { category },
          search: next,
          resetScroll: false,
        })
      : navigate({ to: "/", search: next, resetScroll: false }));
  };

  const intro = (
    <section
      aria-labelledby="gallery-intro-title"
      className="flex flex-col gap-5 py-4"
    >
      <h1
        id="gallery-intro-title"
        className="text-2xl leading-tight font-semibold tracking-tight text-balance"
      >
        {category ? content.categoryTitles[category] : content.title}
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
        {category ? content.categoryIntros[category] : content.intro}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="lg"
          disabled={filtered.length === 0}
          onClick={() => {
            const video = filtered[Math.floor(Math.random() * filtered.length)];
            if (!video) {
              return;
            }
            const options = {
              search,
              resetScroll: false,
              viewTransition: true,
            };
            void (category
              ? navigate({
                  to: "/category/$category/videos/$slug",
                  params: { category, slug: video.slug },
                  ...options,
                })
              : navigate({
                  to: "/videos/$slug",
                  params: { slug: video.slug },
                  ...options,
                }));
          }}
        >
          <ReiconDuotone icon={Ufo} aria-hidden="true" />
          {content.surprise}
        </Button>
        <Link
          to={ROUTES.SUBMIT}
          search={{ kind: "video", category }}
          className={buttonVariants({ variant: "gradient", size: "lg" })}
        >
          {content.submitVideo}
          <ReiconDuotone icon={ArrowRightUp} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );

  const cards: MasonryItem[] = filtered.map((video) => ({
    key: video.slug,
    aspectRatio: video.width / video.height,
    node: (
      <MotionVideoCard
        video={video}
        paused={previewsPaused}
        open={video.slug === openSlug}
        category={category}
        search={search}
      />
    ),
  }));
  const items: MasonryItem[] = [{ key: "intro", node: intro }, ...cards];

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <div className="bg-background/90 sticky top-0 z-30 backdrop-blur-md">
        <div
          role="toolbar"
          aria-label={content.browse.value}
          className="mx-auto flex w-full max-w-[1800px] items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex-none lg:basis-[65%]">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={content.filterType.value}
                className={chipClass(Boolean(search.type))}
              >
                {search.type ? content[search.type] : content.all}
                <ReiconDuotone
                  icon={ChevronDown}
                  aria-hidden="true"
                  className="size-3.5"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44">
                <DropdownMenuRadioGroup
                  value={search.type ?? "all"}
                  onValueChange={(value) =>
                    updateSearch({
                      type: TYPES.find((type) => type === value),
                    })
                  }
                >
                  <DropdownMenuRadioItem value="all">
                    {content.all}
                    <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                      {videos.length}
                    </span>
                  </DropdownMenuRadioItem>
                  {TYPES.map((type) => (
                    <DropdownMenuRadioItem key={type} value={type}>
                      {content[type]}
                      <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                        {typeCounts[type]}
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Separator orientation="vertical" className="my-1.5" />
            <FadeScroller
              label={content.filterCategory.value}
              className="-mx-1 -my-1 min-w-0 flex-1 px-1 py-1"
            >
              {MOTION_CATEGORIES.map((id) => {
                const active = category === id;
                const chipProps = {
                  search,
                  resetScroll: false,
                  "aria-current": active ? ("page" as const) : undefined,
                  className: cn(
                    buttonVariants({
                      variant: active ? "default" : "secondary",
                    }),
                    "rounded-full px-3",
                    !active && "text-muted-foreground"
                  ),
                  children: (
                    <>
                      {content.categories[id]}
                      <span className="text-xs tabular-nums opacity-60">
                        {categoryCounts[id]}
                      </span>
                    </>
                  ),
                };
                // Each category is its own page; the active chip goes back to `/`.
                return active ? (
                  <Link key={id} to="/" {...chipProps} />
                ) : (
                  <Link
                    key={id}
                    to="/category/$category"
                    params={{ category: id }}
                    {...chipProps}
                  />
                );
              })}
            </FadeScroller>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={content.sort.value}
                className={chipClass(sort !== "popular")}
              >
                {sortLabels[sort]}
                <ReiconDuotone
                  icon={ChevronDown}
                  aria-hidden="true"
                  className="size-3.5"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) =>
                    updateSearch({
                      sort:
                        value === "newest" || value === "oldest"
                          ? value
                          : undefined,
                    })
                  }
                >
                  <DropdownMenuRadioItem value="popular">
                    {content.popular}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="newest">
                    {content.newest}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">
                    {content.oldest}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
              className={chipClass(paused)}
            >
              <ReiconDuotone icon={paused ? Play : Pause} aria-hidden="true" />
              <span className="max-sm:sr-only">
                {paused ? content.play : content.pause}
              </span>
            </button>
          </div>
        </div>
      </div>
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1800px] px-4 pt-2 pb-16 sm:px-6"
      >
        <VirtualMasonry items={items} />
        {filtered.length === 0 && (
          <div className="bg-muted/40 flex flex-col items-center gap-2 rounded-2xl py-14 text-center">
            <ReiconDuotone
              icon={Search}
              className="text-muted-foreground size-7"
              aria-hidden="true"
            />
            <h2 className="font-medium">{content.noResults}</h2>
            <p className="text-muted-foreground text-sm">{content.tryAgain}</p>
          </div>
        )}
      </main>
      <Outlet />
      <SiteFooter />
    </>
  );
};

// Pathless layout: `/`, `/category/$category`, and their `videos/$slug`
// overlays share the gallery, so a video opens as an overlay route while the
// grid (and its scroll position) stays mounted.
export const Route = createFileRoute("/_gallery")({
  component: Gallery,
  loader: () => getLandingData(),
  validateSearch: (search): GallerySearch => ({
    type: z.enum(["prompt", "skill"]).safeParse(search.type).data,
    sort: z.enum(["newest", "oldest"]).safeParse(search.sort).data,
  }),
});
