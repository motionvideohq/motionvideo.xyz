import {
  Outlet,
  createFileRoute,
  getRouteApi,
  useParams,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { useIntlayer } from "react-intlayer";
import type { IconComponent } from "reicon-react";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { Code } from "reicon-react/icons/Code";
import { Layers } from "reicon-react/icons/Layers";
import { Search } from "reicon-react/icons/Search";
import { Text } from "reicon-react/icons/Text";
import { z } from "zod";

import {
  CollectionGrid,
  CollectionEmptyState,
} from "@/components/collection-grid";
import {
  CollectionIntro,
  SurpriseAndSubmit,
} from "@/components/collection-intro";
import {
  CategoryChip,
  CollectionToolbar,
} from "@/components/collection-toolbar";
import { ColorPicker } from "@/components/color-picker";
import { FadeScroller } from "@/components/fade-scroller";
import { Claude, Codex, ColorDots, Gemini } from "@/components/icons";
import { JobsWidget } from "@/components/jobs-widget";
import { MotionVideoCard, setMorphCard } from "@/components/motion-video";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SponsoredCard, sponsoredTileIndex } from "@/components/sponsored-card";
import { buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MasonryItem } from "@/components/virtual-masonry";
import catalog from "@/data/motion-catalog.json";
import { useLaneCount } from "@/hooks/use-lane-count";
import { useLocalizedNavigate as useNavigate } from "@/hooks/use-localized-navigate";
import type { LocalizedNavigate } from "@/hooks/use-localized-navigate";
import {
  galleryDestination,
  useVideoGalleryContext,
} from "@/lib/gallery-navigation";
import {
  MAX_FILTER_COLORS,
  MOTION_CATEGORIES,
  MOTION_MODELS,
  MOTION_TYPES,
  filterMotionVideos,
  findMotionCategory,
  findMotionColor,
  findMotionModel,
  findMotionType,
  motionModelSlug,
  parseFilterColors,
  scopeFilters,
} from "@/lib/motion-catalog";
import type {
  GalleryScope,
  GallerySearch,
  MotionCategory,
  MotionModel,
  MotionVideo,
} from "@/lib/motion-catalog";
import { findMotionCreator } from "@/lib/motion-creators";
import { COLOR_PAGES, fillTemplate } from "@/lib/motion-video-route";
import { cn } from "@/lib/utils";
import { getLandingData } from "@/server/functions";
import { getJobs } from "@/server/job-functions";

const routeApi = getRouteApi("/$locale/_gallery");
const videos: MotionVideo[] = catalog.videos;
// Only models some video was made with get a filter.
const MODELS = MOTION_MODELS.filter((model) =>
  videos.some((video) => video.model === model)
);

type Navigate = LocalizedNavigate;

/** The page a gallery URL is: its category, colour, model or type param, if any. */
const scopeOf = (params: {
  category?: string;
  color?: string;
  model?: string;
  type?: string;
  creator?: string;
}): GalleryScope | undefined => {
  const creator = findMotionCreator(params.creator);
  if (creator) {
    return { kind: "creator", creator: creator.handle };
  }
  const category = findMotionCategory(params.category);
  if (category) {
    return { kind: "category", category };
  }
  const color = findMotionColor(params.color);
  if (color) {
    return { kind: "color", color };
  }
  const model = findMotionModel(params.model);
  if (model) {
    return { kind: "model", model };
  }
  const type = findMotionType(params.type);
  return type ? { kind: "type", type } : undefined;
};

/** Navigates to a gallery page: Discover, or a category/colour/model/type page. */
const goToPage = (
  navigate: Navigate,
  scope: GalleryScope | undefined,
  search: GallerySearch
) =>
  navigate({
    ...galleryDestination(scope),
    search,
    resetScroll: false,
  });

/** Opens a video's overlay over a gallery page. */
const goToVideo = (
  navigate: Navigate,
  scope: GalleryScope | undefined,
  search: GallerySearch,
  slug: string
) =>
  navigate({
    to: "/videos/$slug",
    params: { slug },
    search: {},
    state: { videoGallery: { scope, search } },
    resetScroll: false,
    viewTransition: true,
  });

/**
 * Where a Type/Model menu or colour pick goes. On Discover and category pages
 * it is a search param, as before. On a colour, model or type page, changing
 * that page's own filter moves to the matching page (or Discover for "All",
 * or for colours no page is named after); the other filters stay search
 * params.
 */
const pickFilter = (
  navigate: Navigate,
  scope: GalleryScope | undefined,
  search: GallerySearch,
  patch: GallerySearch
) => {
  if (scope?.kind === "color" && "color" in patch) {
    const color = COLOR_PAGES.find((page) => page.hex === patch.color);
    return goToPage(navigate, color ? { kind: "color", color } : undefined, {
      ...search,
      color: color ? undefined : patch.color,
    });
  }
  if (scope?.kind === "model" && "model" in patch) {
    const model = findMotionModel(patch.model);
    return goToPage(navigate, model ? { kind: "model", model } : undefined, {
      ...search,
      model: undefined,
    });
  }
  if (scope?.kind === "type" && "type" in patch) {
    return goToPage(
      navigate,
      patch.type ? { kind: "type", type: patch.type } : undefined,
      { ...search, type: undefined }
    );
  }
  return goToPage(navigate, scope, { ...search, ...patch });
};
// Pills are outline buttons with rounded-full: default choices read as plain
// white chips; any other choice turns yellow, keeping the same hairline edge
// so the pill doesn't look smaller when it fills.
const chipClass = (active: boolean) =>
  cn(
    buttonVariants({ variant: active ? "default" : "outline" }),
    "rounded-full px-3",
    active && "shadow-outline"
  );

const SORTS = ["featured", "newest", "oldest"] as const;
type Sort = (typeof SORTS)[number];

// The filter chip shows icons only for selected type/model filters, followed
// by the sort order, which always has a value.
const TYPE_ICONS: Record<"all" | (typeof MOTION_TYPES)[number], IconComponent> =
  { all: Layers, prompt: Text, skill: Code };

// Model options carry standalone brand marks; sort options carry no icon.
const MODEL_ICONS: Record<
  MotionModel,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  "Opus 5.5": Claude,
  "Fable 5.5": Claude,
  "Gemini 4 Argon": Gemini,
  "GPT-6 Astra": Codex,
};

interface FilterOption {
  value: string;
  label: ReactNode;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
}

interface FilterSection {
  id: "type" | "model" | "sort";
  label: ReactNode;
  value: string;
  options: FilterOption[];
  onSelect: (value: string) => void;
}

// One control for type, model and order: a single dropdown at every size,
// with the groups stacked vertically. Picks apply at once and the menu stays
// open, so all three can be set in one go. A type or model with no videos on
// the current page (category) under the other's pick is disabled.
const GalleryFilters = ({
  search,
  category,
  onChange,
}: {
  search: GallerySearch;
  category: MotionCategory | undefined;
  onChange: (patch: GallerySearch) => void;
}) => {
  const content = useIntlayer("motion-gallery");
  const model = findMotionModel(search.model);
  const sort: Sort = search.sort ?? "featured";
  const typesInView = useMemo(
    () =>
      new Set(
        filterMotionVideos(videos, {
          model: search.model,
          color: search.color,
          category,
        }).flatMap((video) => video.tags)
      ),
    [search.model, search.color, category]
  );
  const modelsInView = useMemo(
    () =>
      new Set(
        filterMotionVideos(videos, {
          type: search.type,
          color: search.color,
          category,
        }).map((video) => video.model)
      ),
    [search.type, search.color, category]
  );

  const sections: FilterSection[] = [
    {
      id: "type",
      label: content.type,
      value: search.type ?? "all",
      onSelect: (value) => onChange({ type: findMotionType(value) }),
      options: [
        { value: "all", label: content.all, icon: TYPE_ICONS.all },
        ...MOTION_TYPES.map((type) => ({
          value: type,
          label: content[type],
          icon: TYPE_ICONS[type],
          disabled: !typesInView.has(type) && search.type !== type,
        })),
      ],
    },
    {
      id: "model",
      label: content.model,
      value: search.model ?? "all",
      onSelect: (value) => onChange({ model: findMotionModel(value) && value }),
      options: [
        { value: "all", label: content.all, icon: Layers },
        ...MODELS.map((id) => ({
          value: motionModelSlug(id),
          label: id,
          icon: MODEL_ICONS[id],
          disabled: !modelsInView.has(id) && model !== id,
        })),
      ],
    },
    {
      id: "sort",
      label: content.sort,
      value: sort,
      onSelect: (value) =>
        onChange({
          sort: value === "newest" || value === "oldest" ? value : undefined,
        }),
      options: SORTS.map((id) => ({ value: id, label: content[id] })),
    },
  ];

  const TypeIcon = search.type ? TYPE_ICONS[search.type] : undefined;
  const ModelIcon = model ? MODEL_ICONS[model] : undefined;
  const triggerClass = chipClass(Boolean(search.type || model || search.sort));
  const summary = (
    <>
      {TypeIcon && (
        <>
          <TypeIcon aria-hidden="true" />
          <span aria-hidden="true" className="opacity-60">
            ·
          </span>
        </>
      )}
      {ModelIcon && (
        <>
          <span title={model}>
            <ModelIcon aria-hidden="true" />
          </span>
          <span aria-hidden="true" className="opacity-60">
            ·
          </span>
        </>
      )}
      <span className="whitespace-nowrap">{content[sort]}</span>
      <ChevronDown aria-hidden="true" className="size-3.5" />
    </>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={content.filters.value}
        className={triggerClass}
      >
        {summary}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex w-auto max-w-[calc(100vw-1rem)] flex-col gap-1"
      >
        {sections.map((section) => (
          <div key={section.id} className="contents">
            <DropdownMenuRadioGroup
              className={section.id === "model" ? "min-w-44" : "min-w-40"}
              value={section.value}
              onValueChange={(value) => section.onSelect(String(value))}
            >
              <DropdownMenuLabel>{section.label}</DropdownMenuLabel>
              {section.options.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    indicator={section.id === "sort" ? "radio" : "check"}
                  >
                    {Icon && (
                      <Icon
                        aria-hidden="true"
                        className="text-muted-foreground"
                      />
                    )}
                    {option.label}
                  </DropdownMenuRadioItem>
                );
              })}
            </DropdownMenuRadioGroup>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// The first half of the filters' button group: an icon-only colour trigger.
// It shows the palette mark, or the picked colours once a filter is set.
const ColorFilter = ({
  color,
  onChange,
}: {
  color: string | undefined;
  onChange: (color: string | undefined) => void;
}) => {
  const content = useIntlayer("motion-gallery");
  const [open, setOpen] = useState(false);
  const colors = parseFilterColors(color);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={content.filterColor.value}
        className={cn(chipClass(colors.length > 0), "px-2.5")}
      >
        {colors.length > 0 ? (
          <span aria-hidden="true" className="flex -space-x-1.5">
            {colors.map((hex) => (
              <span
                key={hex}
                // Inset edge: black still shows on the dark chip.
                className="ring-primary inset-ring-foreground/20 size-4 rounded-full ring-2 inset-ring"
                style={{ backgroundColor: `#${hex}` }}
              />
            ))}
          </span>
        ) : (
          <ColorDots aria-hidden="true" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        {/* Keyed so each opening starts from the applied colours. */}
        <ColorPicker
          key={color ?? ""}
          colors={colors}
          max={MAX_FILTER_COLORS}
          onApply={(picked) => {
            setOpen(false);
            onChange(picked.length > 0 ? picked.join(",") : undefined);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

/** The intro tile's title and copy for the page: Discover or its scope. */
const GalleryIntro = ({
  scope,
  actions,
}: {
  scope: GalleryScope | undefined;
  actions: ReactNode;
}) => {
  const content = useIntlayer("motion-gallery");
  const creatorContent = useIntlayer("motion-creator");
  let title: ReactNode = content.title;
  let description: ReactNode = content.intro;
  if (scope?.kind === "category") {
    title = content.categoryTitles[scope.category];
    description = content.categoryIntros[scope.category];
  } else if (scope?.kind === "color") {
    title = content.colorTitles[scope.color.slug];
    description = content.colorIntros[scope.color.slug];
  } else if (scope?.kind === "model") {
    title = content.modelTitles[scope.model];
    description = content.modelIntros[scope.model];
  } else if (scope?.kind === "type") {
    title = content.typeTitles[scope.type];
    description = content.typeIntros[scope.type];
  } else if (scope?.kind === "creator") {
    const creator = findMotionCreator(scope.creator);
    if (creator) {
      title = fillTemplate(creatorContent.title.value, { name: creator.name });
      description = fillTemplate(creatorContent.description.value, {
        name: creator.name,
      });
    }
  }
  return (
    <CollectionIntro
      titleId="gallery-intro-title"
      title={title}
      description={description}
      actions={actions}
    />
  );
};

const Gallery = () => {
  const content = useIntlayer("motion-gallery");
  const { signedIn, jobs } = routeApi.useLoaderData();
  const routeSearch = routeApi.useSearch();
  const videoGallery = useVideoGalleryContext();
  const navigate = useNavigate();
  // The gallery stays mounted while a canonical video route opens over it.
  // Its source collection and filters travel in history state, not the URL.
  const params = useParams({ strict: false });
  const openSlug = params.slug;
  const scope = openSlug ? videoGallery?.scope : scopeOf(params);
  const search = openSlug ? (videoGallery?.search ?? {}) : routeSearch;
  const category =
    scope?.kind === "category" ? scope.category : search.category;
  const filters = { ...search, ...scopeFilters(scope) };

  const filtered = useMemo(
    () =>
      filterMotionVideos(videos, {
        type: filters.type,
        model: filters.model,
        color: filters.color,
        category,
        creator: filters.creator,
        sort: search.sort,
      }),
    [
      filters.type,
      filters.model,
      filters.color,
      filters.creator,
      category,
      search.sort,
    ]
  );
  // Previews pause while a video's overlay covers the grid.
  const previewsPaused = Boolean(openSlug);
  const lanes = useLaneCount();

  // Type, model, colour and sort stay search params on whichever page is
  // showing, except a colour, model or type page's own filter (see
  // pickFilter).
  const updateSearch = (patch: GallerySearch) => {
    void pickFilter(navigate, scope, search, patch);
  };
  // Category chips keep the page's colour, model or type filter as a search
  // param.
  const chipSearch = {
    ...search,
    type: filters.type,
    model: filters.model,
    color: filters.color,
  };

  const surprise = () => {
    const video = filtered[Math.floor(Math.random() * filtered.length)];
    if (!video) {
      return;
    }
    // Morphs from its card when that card is rendered; fades in otherwise.
    setMorphCard(video.slug);
    void goToVideo(navigate, scope, search, video.slug);
  };

  const intro = (
    <GalleryIntro
      scope={scope}
      actions={
        <SurpriseAndSubmit
          onSurprise={surprise}
          surpriseDisabled={filtered.length === 0}
          surpriseLabel={content.surprise}
          submitLabel={content.submitVideo}
          submitSearch={{ kind: "video", category }}
        />
      }
    />
  );

  const cards: MasonryItem[] = filtered.map((video) => ({
    key: video.slug,
    aspectRatio: video.width / video.height,
    node: (
      <MotionVideoCard
        video={video}
        paused={previewsPaused}
        open={video.slug === openSlug}
        scope={scope}
        search={search}
      />
    ),
  }));
  const items: MasonryItem[] = [{ key: "intro", node: intro }, ...cards];
  const sponsoredIndex = sponsoredTileIndex(lanes, cards.length);
  items.splice(sponsoredIndex, 0, {
    key: "sponsored",
    aspectRatio: 16 / 9,
    node: <SponsoredCard placement="feed" />,
  });
  // Open roles right after the sponsored card: in the same lane on desktop,
  // next in the single column on phones. Only when there are open roles; the
  // header's Jobs link covers the rest.
  const hasJobs = jobs.length > 0;
  if (hasJobs && lanes >= 3 && sponsoredIndex === lanes - 1) {
    items.splice(sponsoredIndex + 1, 0, {
      key: "jobs",
      lane: lanes - 1,
      node: <JobsWidget jobs={jobs} />,
    });
  } else if (hasJobs && lanes < 2) {
    items.splice(sponsoredIndex + 1, 0, {
      key: "jobs",
      node: <JobsWidget jobs={jobs} />,
    });
  }

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <CollectionToolbar label={content.browse.value}>
        <FadeScroller
          label={content.filterCategory.value}
          className="-mx-1 -my-1 min-w-0 flex-1 px-1 py-1 lg:flex-none lg:basis-[65%]"
        >
          <CategoryChip
            to={scope?.kind === "creator" ? "/creators/$creator" : "/"}
            params={
              scope?.kind === "creator" ? { creator: scope.creator } : undefined
            }
            search={{ ...chipSearch, category: undefined }}
            active={!category}
            label={content.all}
          />
          {MOTION_CATEGORIES.map((id) => {
            if (scope?.kind === "creator") {
              return (
                <CategoryChip
                  key={id}
                  to="/creators/$creator"
                  params={{ creator: scope.creator }}
                  search={{
                    ...chipSearch,
                    category: category === id ? undefined : id,
                  }}
                  active={category === id}
                  label={content.categories[id]}
                />
              );
            }
            const active = category === id;
            return active ? (
              <CategoryChip
                key={id}
                to="/"
                search={chipSearch}
                active
                label={content.categories[id]}
              />
            ) : (
              <CategoryChip
                key={id}
                to="/category/$category"
                params={{ category: id }}
                search={chipSearch}
                active={false}
                label={content.categories[id]}
              />
            );
          })}
        </FadeScroller>
        {/* The chips are pills: the group's last button (Featured) keeps a
            fully rounded right end instead of the group's default radius. */}
        <ButtonGroup className="ml-auto shrink-0 [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-full!">
          {/* A colour page shows its colour as the applied filter. */}
          <ColorFilter
            color={filters.color}
            onChange={(color) => updateSearch({ color })}
          />
          <GalleryFilters
            search={filters}
            category={category}
            onChange={updateSearch}
          />
        </ButtonGroup>
      </CollectionToolbar>
      <CollectionGrid
        items={items}
        emptyState={
          filtered.length === 0 ? (
            <CollectionEmptyState
              icon={Search}
              title={content.noResults}
              description={content.tryAgain}
            />
          ) : undefined
        }
      />
      <Outlet />
      <SiteFooter />
    </>
  );
};

// Collection pages and the canonical `/videos/$slug` overlay share this
// pathless layout, keeping the grid and its scroll position mounted.
export const Route = createFileRoute("/$locale/_gallery")({
  component: Gallery,
  loader: async () => {
    const [landing, jobs] = await Promise.all([getLandingData(), getJobs()]);
    return { ...landing, jobs };
  },
  validateSearch: (search): GallerySearch => {
    const colors = parseFilterColors(z.string().safeParse(search.color).data);
    return {
      category: findMotionCategory(z.string().safeParse(search.category).data),
      type: findMotionType(z.string().safeParse(search.type).data),
      model: MODELS.map(motionModelSlug).find((slug) => slug === search.model),
      sort: z.enum(["newest", "oldest"]).safeParse(search.sort).data,
      color: colors.length > 0 ? colors.join(",") : undefined,
    };
  },
});
