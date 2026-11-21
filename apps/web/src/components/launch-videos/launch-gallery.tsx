import { useEffect, useMemo, useRef, useState } from "react";
import { useIntlayer } from "react-intlayer";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { Clapperboard } from "reicon-react/icons/Clapperboard";
import { Search } from "reicon-react/icons/Search";
import { Xmark } from "reicon-react/icons/Xmark";

import {
  CollectionEmptyState,
  CollectionGrid,
} from "@/components/collection-grid";
import { CollectionIntro } from "@/components/collection-intro";
import {
  CategoryChip,
  CollectionToolbar,
} from "@/components/collection-toolbar";
import { LocalizedLink as Link } from "@/components/localized-link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { MasonryItem } from "@/components/virtual-masonry";
import { ROUTES } from "@/constants/routes";
import {
  LAUNCH_FILMS,
  LAUNCH_SCENES,
  findLaunchFilm,
} from "@/lib/launch-catalog";
import { LAUNCH_SORTS, searchLaunch } from "@/lib/launch-search";
import type { LaunchSort } from "@/lib/launch-search";
import { MOTION_COLORS } from "@/lib/motion-catalog";
import { fillTemplate } from "@/lib/motion-video-route";
import { cn } from "@/lib/utils";

import { useLaunchDraft } from "./draft";
import { FilmCard, SceneCard } from "./launch-cards";
import {
  LAUNCH_FACETS,
  clearedSearch,
  facetValues,
  hasFilters,
  launchQueryOf,
  listOf,
  toggleFacet,
} from "./search-params";
import type { LaunchFacet, LaunchVideosSearch } from "./search-params";

const PAGE_SIZE = 24;

const chipClass = (active: boolean) =>
  cn(
    buttonVariants({ variant: active ? "default" : "outline" }),
    "rounded-full px-3",
    active && "shadow-outline"
  );

// Category slugs are catalog data (`developer-tools`), shown as words.
const humanize = (slug: string) =>
  slug.charAt(0).toLocaleUpperCase("en") + slug.slice(1).replaceAll("-", " ");

/** A facet value's label in the page's language. */
const useFacetLabel = () => {
  const content = useIntlayer("launch-videos");
  return (facet: LaunchFacet, value: string): string => {
    switch (facet) {
      case "kind": {
        // SAFETY: an unknown value reads undefined and falls back via `??`.
        return (
          content.kinds[value as keyof typeof content.kinds]?.value ?? value
        );
      }
      case "style": {
        // SAFETY: an unknown value reads undefined and falls back via `??`.
        return (
          content.styles[value as keyof typeof content.styles]?.value ?? value
        );
      }
      case "role": {
        // SAFETY: an unknown value reads undefined and falls back via `??`.
        return (
          content.roles[value as keyof typeof content.roles]?.value ?? value
        );
      }
      case "duration": {
        // SAFETY: an unknown value reads undefined and falls back via `??`.
        return (
          content.durations[value as keyof typeof content.durations]?.value ??
          value
        );
      }
      case "color": {
        // SAFETY: an unknown value reads undefined and falls back via `??`.
        return (
          content.colors[value as keyof typeof content.colors]?.value ?? value
        );
      }
      case "category": {
        return humanize(value);
      }
      default: {
        // "creator" and "aspect" values are already words.
        return value;
      }
    }
  };
};

// Leaving the search box idle this long writes it to the URL.
const SEARCH_DELAY = 250;

/** The text search; the URL keeps the last settled value. */
const SearchBox = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const content = useIntlayer("launch-videos");
  const [draft, setDraft] = useState(value);
  const timer = useRef(0);
  // Back/forward or "Clear all" changes the URL under the box.
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div className="relative w-full max-w-64 min-w-36">
      <Search
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        type="search"
        aria-label={content.search.value}
        placeholder={content.searchPlaceholder.value}
        value={draft}
        maxLength={100}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          clearTimeout(timer.current);
          timer.current = window.setTimeout(() => onChange(next), SEARCH_DELAY);
        }}
        className="rounded-full pl-9"
      />
    </div>
  );
};

/** Every facet in one menu, each a submenu of checkboxes (any of them). */
const FacetMenu = ({
  search,
  onChange,
}: {
  search: LaunchVideosSearch;
  onChange: (next: LaunchVideosSearch) => void;
}) => {
  const content = useIntlayer("launch-videos");
  const label = useFacetLabel();
  const view = search.view ?? "videos";
  const count = LAUNCH_FACETS.reduce(
    (sum, facet) =>
      sum + listOf(search[facet], facetValues(facet, view)).length,
    0
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={chipClass(count > 0)}>
        {content.filters}
        {count > 0 && <span className="tabular-nums">· {count}</span>}
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {LAUNCH_FACETS.map((facet) => {
          const picked = listOf(search[facet], facetValues(facet, view));
          return (
            <DropdownMenuSub key={facet}>
              <DropdownMenuSubTrigger>
                {content.facets[facet]}
                {picked.length > 0 && (
                  <span className="text-muted-foreground flex-1 pl-2 text-right tabular-nums">
                    {picked.length}
                  </span>
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="max-h-80 min-w-44 overflow-y-auto">
                {facetValues(facet, view).map((value) => {
                  const hex = MOTION_COLORS.find(
                    (color) => color.slug === value
                  )?.hex;
                  return (
                    <DropdownMenuCheckboxItem
                      key={value}
                      checked={picked.includes(value)}
                      onCheckedChange={() =>
                        onChange(toggleFacet(search, facet, value))
                      }
                    >
                      {facet === "color" && hex && (
                        <span
                          aria-hidden="true"
                          className="shadow-outline size-3 rounded-full"
                          style={{ background: `#${hex}` }}
                        />
                      )}
                      {label(facet, value)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SortMenu = ({
  sort,
  onChange,
}: {
  sort: LaunchSort;
  onChange: (sort: LaunchSort) => void;
}) => {
  const content = useIntlayer("launch-videos");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={content.sort.value}
        className={chipClass(sort !== "featured")}
      >
        {content.sorts[sort]}
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          className="min-w-40"
          value={sort}
          onValueChange={(value) =>
            onChange(
              LAUNCH_SORTS.find((entry) => entry === value) ?? "featured"
            )
          }
        >
          <DropdownMenuLabel>{content.sort}</DropdownMenuLabel>
          {LAUNCH_SORTS.map((entry) => (
            <DropdownMenuRadioItem key={entry} value={entry} indicator="radio">
              {content.sorts[entry]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/** The picked facet values as removable chips, the count and Clear all. */
const AppliedFilters = ({
  search,
  count,
  onChange,
}: {
  search: LaunchVideosSearch;
  count: number;
  onChange: (next: LaunchVideosSearch) => void;
}) => {
  const content = useIntlayer("launch-videos");
  const label = useFacetLabel();
  const view = search.view ?? "videos";
  const picked = LAUNCH_FACETS.flatMap((facet) =>
    listOf(search[facet], facetValues(facet, view)).map((value) => ({
      facet,
      value,
    }))
  );
  return (
    <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center gap-2 px-4 pt-1 sm:px-6">
      <output className="text-muted-foreground text-sm tabular-nums">
        {fillTemplate(
          (view === "scenes" ? content.sceneCount : content.videoCount).value,
          { count: String(count) }
        )}
      </output>
      {hasFilters(search) && (
        <ul aria-label={content.applied.value} className="contents">
          {search.q && (
            <li>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                aria-label={fillTemplate(content.removeFilter.value, {
                  label: search.q,
                })}
                onClick={() =>
                  onChange({ ...search, q: undefined, page: undefined })
                }
              >
                “{search.q}”
                <Xmark aria-hidden="true" />
              </Button>
            </li>
          )}
          {picked.map(({ facet, value }) => (
            <li key={`${facet}:${value}`}>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full"
                aria-label={fillTemplate(content.removeFilter.value, {
                  label: `${content.facets[facet].value}: ${label(facet, value)}`,
                })}
                onClick={() => onChange(toggleFacet(search, facet, value))}
              >
                {label(facet, value)}
                <Xmark aria-hidden="true" />
              </Button>
            </li>
          ))}
          <li>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(clearedSearch(search))}
            >
              {content.clearAll}
            </Button>
          </li>
        </ul>
      )}
    </div>
  );
};

/**
 * /launch-videos: Videos (films) or Scenes, filtered by the URL's facets.
 * The grid and its intro tile follow the Moves page; cards preview on hover.
 */
export const LaunchGallery = ({
  search,
  onSearch,
}: {
  search: LaunchVideosSearch;
  onSearch: (next: LaunchVideosSearch, options?: { replace?: boolean }) => void;
}) => {
  const content = useIntlayer("launch-videos");
  const draft = useLaunchDraft();
  const view = search.view ?? "videos";
  const results = useMemo(
    () => searchLaunch(LAUNCH_FILMS, LAUNCH_SCENES, launchQueryOf(search)),
    [search]
  );
  const total =
    results.view === "films" ? results.films.length : results.scenes.length;
  const shown = (search.page ?? 1) * PAGE_SIZE;

  // The chips' targets: the other view keeps every facet but duration (its
  // ranges differ per view) and starts on the first page.
  const viewSearch = (next: "videos" | "scenes") => ({
    ...search,
    view: next === "scenes" ? "scenes" : undefined,
    duration: next === view ? search.duration : undefined,
    page: undefined,
  });

  const intro = (
    <CollectionIntro
      titleId="launch-videos-intro-title"
      title={content.title}
      description={content.intro}
      actions={
        <>
          <Link
            to={ROUTES.LAUNCH_VIDEOS_COMPOSE}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <Clapperboard aria-hidden="true" />
            {content.storyboard}
            {draft.items.length > 0 && (
              <span className="text-muted-foreground tabular-nums">
                {draft.items.length}
              </span>
            )}
          </Link>
          <Link
            to={ROUTES.PRO}
            data-track="launch_unlock"
            data-track-surface="grid"
            className={buttonVariants({ variant: "gradient", size: "lg" })}
          >
            {content.unlock}
          </Link>
        </>
      }
    />
  );

  const cards: MasonryItem[] =
    results.view === "films"
      ? results.films.slice(0, shown).map((film) => ({
          key: film.slug,
          node: <FilmCard film={film} />,
        }))
      : results.scenes.slice(0, shown).flatMap((scene) => {
          const film = findLaunchFilm(scene.filmSlug);
          return film
            ? [{ key: scene.id, node: <SceneCard scene={scene} film={film} /> }]
            : [];
        });

  return (
    <>
      <CollectionToolbar label={content.browse.value}>
        <nav aria-label={content.view.value} className="flex shrink-0 gap-2">
          <CategoryChip
            to={ROUTES.LAUNCH_VIDEOS}
            search={viewSearch("videos")}
            activeOptions={{ includeSearch: true }}
            active={view === "videos"}
            label={content.videos}
          />
          <CategoryChip
            to={ROUTES.LAUNCH_VIDEOS}
            search={viewSearch("scenes")}
            activeOptions={{ includeSearch: true }}
            active={view === "scenes"}
            label={content.scenes}
          />
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <SearchBox
            value={search.q ?? ""}
            onChange={(q) =>
              onSearch(
                { ...search, q: q.trim() || undefined, page: undefined },
                { replace: true }
              )
            }
          />
          <FacetMenu search={search} onChange={onSearch} />
          <SortMenu
            sort={search.sort ?? "featured"}
            onChange={(sort) =>
              onSearch({
                ...search,
                sort: sort === "featured" ? undefined : sort,
                page: undefined,
              })
            }
          />
        </div>
      </CollectionToolbar>
      <AppliedFilters search={search} count={total} onChange={onSearch} />
      <CollectionGrid
        items={[{ key: "intro", node: intro }, ...cards]}
        emptyState={
          <>
            {total === 0 && (
              <CollectionEmptyState
                icon={Clapperboard}
                title={content.emptyTitle}
                description={content.emptyDescription}
              />
            )}
            {total > shown && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    onSearch(
                      { ...search, page: (search.page ?? 1) + 1 },
                      { replace: true }
                    )
                  }
                >
                  {content.showMore}
                </Button>
              </div>
            )}
          </>
        }
      />
    </>
  );
};
