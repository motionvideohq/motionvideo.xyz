import { useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import type { IntlayerNode } from "react-intlayer";
import type { IconComponent } from "reicon-react";
import { Archive } from "reicon-react/icons/Archive";
import { Award } from "reicon-react/icons/Award";
import { BadgePercent } from "reicon-react/icons/BadgePercent";
import { Bolt } from "reicon-react/icons/Bolt";
import { BrowserCode } from "reicon-react/icons/BrowserCode";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { Clapperboard } from "reicon-react/icons/Clapperboard";
import { CodeCircle } from "reicon-react/icons/CodeCircle";
import { Compass } from "reicon-react/icons/Compass";
import { CreditCard } from "reicon-react/icons/CreditCard";
import { Folder } from "reicon-react/icons/Folder";
import { Gallery } from "reicon-react/icons/Gallery";
import { Gift } from "reicon-react/icons/Gift";
import { Layers } from "reicon-react/icons/Layers";
import { Library } from "reicon-react/icons/Library";
import { PenTool } from "reicon-react/icons/PenTool";
import { Pointer } from "reicon-react/icons/Pointer";
import { Presentation } from "reicon-react/icons/Presentation";
import { Search } from "reicon-react/icons/Search";
import { TerminalSquare } from "reicon-react/icons/TerminalSquare";
import { Text } from "reicon-react/icons/Text";
import { ThreeDCube } from "reicon-react/icons/ThreeDCube";
import { Video } from "reicon-react/icons/Video";
import { VideoFrame } from "reicon-react/icons/VideoFrame";

import {
  CollectionEmptyState,
  CollectionGrid,
} from "@/components/collection-grid";
import {
  CollectionIntro,
  SurpriseAndSubmit,
} from "@/components/collection-intro";
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
import { SponsoredCard, sponsoredTileIndex } from "@/components/sponsored-card";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MasonryItem } from "@/components/virtual-masonry";
import { useLaneCount } from "@/hooks/use-lane-count";
import { useLocalizedNavigate as useNavigate } from "@/hooks/use-localized-navigate";
import {
  DIRECTORY_CATEGORIES,
  DIRECTORY_ENTRIES,
  DIRECTORY_FILTERS,
  DIRECTORY_SORTS,
  directorySearch,
  filterValuesOf,
  sortDirectoryEntries,
} from "@/lib/directories";
import type {
  DirectoryCategory,
  DirectoryEntry,
  DirectoryFilter,
  DirectoryKind,
  DirectorySearch,
} from "@/lib/directories";
import {
  DIRECTORY_SECTION_PATHS,
  INDEXABLE_DIRECTORY_FILTERS,
} from "@/lib/directory-discovery";
import { cn } from "@/lib/utils";

// Category and standalone facet pages share each section's dynamic segment.
const SECTION_ROUTES = {
  tool: { all: "/tools", category: "/tools/$category" },
  studio: { all: "/creatives", category: "/creatives/$category" },
  skill: { all: "/skills", category: "/skills/$category" },
  extra: { all: "/extras", category: "/extras/$category" },
} as const satisfies Record<DirectoryKind, { all: string; category: string }>;

interface MenuSection {
  id: "filter" | "sort";
  label: ReactNode;
  value: string;
  options: {
    value: string;
    label: ReactNode;
    icon?: IconComponent;
    disabled?: boolean;
  }[];
  onSelect: (value: string) => void;
}

// One icon per facet value, so every filter option is distinct at a glance.
// Sort options carry no icon: they read as a radio group instead.
const FILTER_ICONS: Record<DirectoryKind, Record<string, IconComponent>> = {
  tool: {
    free: Gift,
    freemium: BadgePercent,
    "open-source": CodeCircle,
    paid: CreditCard,
  },
  studio: {
    "product-films": Clapperboard,
    explainers: Presentation,
    "3d": ThreeDCube,
    brand: Award,
    "ui-motion": Pointer,
  },
  skill: {
    remotion: VideoFrame,
    hyperframes: Bolt,
    html: BrowserCode,
    manim: Compass,
    adobe: PenTool,
    blender: ThreeDCube,
    "video-models": Video,
    ffmpeg: TerminalSquare,
  },
  extra: {
    library: Library,
    examples: Gallery,
    prompts: Text,
    directory: Folder,
    archive: Archive,
  },
};
// The section's facet and its order in one menu, like Discover's filters:
// "All" and "Featured" (the curated order) are the defaults, and the pill
// turns yellow once either moves off them. A facet value with no entries in
// the current category is disabled.
const DirectoryFilters = ({
  kind,
  search,
  inView,
  onChange,
}: {
  kind: DirectoryKind;
  search: DirectorySearch;
  /** Entries of the current category, before the facet is applied. */
  inView: DirectoryEntry[];
  onChange: (search: DirectorySearch) => void;
}) => {
  const content = useIntlayer("resource-directory");
  const sortLabels: Record<string, IntlayerNode<string>> = content.sorts;
  const filterLabels: Record<string, IntlayerNode<string>> = content.filters[
    kind
  ];
  const available = useMemo(
    () => new Set(inView.flatMap((entry) => filterValuesOf(kind, entry))),
    [kind, inView]
  );
  const sections: MenuSection[] = [
    {
      id: "filter",
      label: content.filterLabels[kind],
      value: search.filter ?? "all",
      onSelect: (value) =>
        onChange({
          ...search,
          filter: DIRECTORY_FILTERS[kind].find((filter) => filter === value),
        }),
      options: [
        { value: "all", label: content.all, icon: Layers },
        ...DIRECTORY_FILTERS[kind].map((value) => ({
          value,
          label: filterLabels[value],
          icon: FILTER_ICONS[kind][value],
          disabled: !available.has(value) && search.filter !== value,
        })),
      ],
    },
    {
      id: "sort",
      label: content.sort,
      value: search.sort ?? "featured",
      onSelect: (value) =>
        onChange({
          ...search,
          sort: DIRECTORY_SORTS[kind].find((sort) => sort === value),
        }),
      options: ["featured", ...DIRECTORY_SORTS[kind]].map((value) => ({
        value,
        label: sortLabels[value],
      })),
    },
  ];
  const active = Boolean(search.filter ?? search.sort);
  const FilterIcon = search.filter
    ? FILTER_ICONS[kind][search.filter]
    : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={content.filtersMenu.value}
        className={cn(
          buttonVariants({ variant: active ? "default" : "outline" }),
          "rounded-full px-3",
          active && "shadow-outline"
        )}
      >
        {search.filter && FilterIcon && (
          <>
            <span title={filterLabels[search.filter]?.value}>
              <FilterIcon aria-hidden="true" />
            </span>
            <span aria-hidden="true" className="opacity-60">
              ·
            </span>
          </>
        )}
        <span className="whitespace-nowrap">
          {sortLabels[search.sort ?? "featured"]}
        </span>
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex w-auto max-w-[calc(100vw-1rem)] flex-col gap-1"
      >
        {sections.map((section) => (
          <div key={section.id} className="contents">
            <DropdownMenuRadioGroup
              className="min-w-44"
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

export const ResourceDirectory = ({
  kind,
  category,
  facet,
}: {
  kind: DirectoryKind;
  /** Content category; absent on the section root and standalone facet pages. */
  category: DirectoryCategory | undefined;
  /** Facet encoded in the pathname rather than `?filter=`. */
  facet?: DirectoryFilter;
}) => {
  const content = useIntlayer("resource-directory");
  const { locale } = useLocale();
  const entries = DIRECTORY_ENTRIES[kind];
  const categories: DirectoryCategory[] = DIRECTORY_CATEGORIES[kind];
  // Category copy for this section, keyed by slug.
  const labels: Partial<Record<string, IntlayerNode<string>>> =
    content.labels[kind];
  const headings: Partial<Record<string, IntlayerNode<string>>> =
    content.headings[kind];
  const descriptions: Partial<Record<string, IntlayerNode<string>>> =
    content.descriptions[kind];
  // The path facet wins over query filters. Queries remain useful when a
  // category and facet are combined.
  const query = directorySearch(kind).parse(useSearch({ strict: false }));
  const search: DirectorySearch = { ...query, filter: facet ?? query.filter };
  const navigate = useNavigate();
  const inCategory = useMemo(
    () =>
      category
        ? entries.filter((entry) => entry.category === category.id)
        : entries,
    [entries, category]
  );
  const filtered = sortDirectoryEntries(
    search.filter
      ? inCategory.filter((entry) =>
          filterValuesOf(kind, entry).includes(search.filter ?? "")
        )
      : inCategory,
    search.sort
  );
  const compact = new Intl.NumberFormat(locale, { notation: "compact" });
  const facetLabels: Record<string, IntlayerNode<string>> = content.filters[
    kind
  ];
  const facetLabel = facet ? facetLabels[facet]?.value : undefined;

  const surprise = () => {
    const entry = filtered[Math.floor(Math.random() * filtered.length)];
    if (entry) {
      window.open(entry.url, "_blank", "noopener,noreferrer");
    }
  };

  const intro = (
    <CollectionIntro
      titleId="directory-intro-title"
      title={
        facetLabel
          ? `${facetLabel} · ${content.titles[kind].value}`
          : ((category && headings[category.slug]) ?? content.titles[kind])
      }
      description={
        facetLabel
          ? content.facetIntros[kind].value.replace("{filter}", facetLabel)
          : ((category && descriptions[category.slug]) ?? content.intros[kind])
      }
      actions={
        <SurpriseAndSubmit
          onSurprise={surprise}
          surpriseLabel={content.surprise}
          submitLabel={content.submit[kind]}
          submitSearch={{ kind, category: category?.slug }}
        />
      }
    />
  );

  const cards: MasonryItem[] = filtered.map((entry) => {
    const entryCategory = categories.find(({ id }) => id === entry.category);
    // Sections without chips show no badge.
    const categoryLabel =
      categories.length > 0
        ? ((entryCategory && labels[entryCategory.slug]?.value) ??
          entry.category)
        : undefined;
    return {
      key: entry.id,
      aspectRatio: DIRECTORY_COVER_RATIO,
      node: (
        <DirectoryCard
          kind={kind}
          entry={entry}
          categoryLabel={categoryLabel}
          label={`${entry.name}${entry.stars === undefined ? "" : ` (${compact.format(entry.stars)} ${content.stars.value})`}: ${content.visit.value} (${content.newTab.value})`}
        />
      ),
    };
  });
  const items: MasonryItem[] = [{ key: "intro", node: intro }, ...cards];
  const lanes = useLaneCount();
  const sponsoredIndex = sponsoredTileIndex(lanes, cards.length);
  items.splice(sponsoredIndex, 0, {
    key: "sponsored",
    aspectRatio: DIRECTORY_COVER_RATIO,
    node: <SponsoredCard placement="feed" />,
  });

  return (
    <>
      {categories.length > 0 && (
        <CollectionToolbar>
          <FadeScroller
            label={content.categories.value}
            className="-mx-1 -my-1 min-w-0 flex-1 px-1 py-1 lg:flex-none lg:basis-[65%]"
          >
            {[undefined, ...categories].map((value) => {
              const selected = value?.slug === category?.slug && !facet;
              const linkProps = value
                ? {
                    to: SECTION_ROUTES[kind].category,
                    params: { category: value.slug },
                  }
                : { to: SECTION_ROUTES[kind].all };
              return (
                <CategoryChip
                  key={value?.slug ?? "all"}
                  {...linkProps}
                  // Categories retain the facet; "All" clears it completely.
                  search={{
                    filter: value ? search.filter : undefined,
                    sort: search.sort,
                  }}
                  activeOptions={{ exact: true, includeSearch: false }}
                  active={selected}
                  label={value ? labels[value.slug] : content.all}
                />
              );
            })}
          </FadeScroller>
          <div className="ml-auto flex shrink-0 items-center">
            <DirectoryFilters
              kind={kind}
              search={search}
              inView={inCategory}
              onChange={(next) => {
                const standaloneFacet = category ? undefined : next.filter;
                void navigate({
                  to:
                    category || standaloneFacet
                      ? SECTION_ROUTES[kind].category
                      : SECTION_ROUTES[kind].all,
                  params:
                    category || standaloneFacet
                      ? { category: category?.slug ?? standaloneFacet }
                      : undefined,
                  search: {
                    filter: category ? next.filter : undefined,
                    sort: next.sort,
                  },
                  replace: true,
                  resetScroll: false,
                });
              }}
            />
          </div>
        </CollectionToolbar>
      )}
      {INDEXABLE_DIRECTORY_FILTERS[kind].length > 0 && (
        <nav
          aria-label={content.filterLabels[kind].value}
          className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-sm sm:px-6"
        >
          <span className="text-muted-foreground">
            {content.filterLabels[kind]}
          </span>
          {INDEXABLE_DIRECTORY_FILTERS[kind].map((filter) => (
            <Link
              key={filter}
              to={`${DIRECTORY_SECTION_PATHS[kind]}/${filter}`}
              search={{}}
              aria-current={facet === filter ? "page" : undefined}
              className="hover:text-foreground text-muted-foreground aria-[current=page]:text-foreground underline-offset-4 hover:underline aria-[current=page]:underline"
            >
              {facetLabels[filter]}
            </Link>
          ))}
        </nav>
      )}
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
    </>
  );
};
