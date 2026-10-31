import {
  DIRECTORY_ENTRIES,
  filterValuesOf,
  findDirectoryCategory,
  findDirectoryFilter,
} from "@/lib/directories";
import type {
  DirectoryFilter,
  DirectoryKind,
  DirectorySearch,
} from "@/lib/directories";

// Editorial landing pages, not every available filter or filter combination.
// A selected page must have matching inventory before it is promoted.
const LANDING_FILTERS = {
  tool: ["free", "open-source", "freemium"],
  studio: ["brand", "3d", "product-films"],
  skill: ["blender", "remotion", "manim", "hyperframes"],
  extra: ["prompts", "examples", "library"],
} as const satisfies Record<DirectoryKind, readonly DirectoryFilter[]>;

export const INDEXABLE_DIRECTORY_FILTERS: Record<
  DirectoryKind,
  readonly DirectoryFilter[]
> = {
  tool: [],
  studio: [],
  skill: [],
  extra: [],
};
for (const kind of ["tool", "studio", "skill", "extra"] as const) {
  INDEXABLE_DIRECTORY_FILTERS[kind] = LANDING_FILTERS[kind].filter((filter) =>
    DIRECTORY_ENTRIES[kind].some((entry) =>
      filterValuesOf(kind, entry).includes(filter)
    )
  );
}

/** Compound filters and uncurated/empty facets stay usable, but out of search. */
export const directoryPageNoIndex = (
  kind: DirectoryKind,
  slug: string | undefined,
  search: DirectorySearch
) => {
  const category = findDirectoryCategory(kind, slug);
  if (category && search.filter) {
    return true;
  }
  const facet = findDirectoryFilter(kind, slug);
  return facet ? !INDEXABLE_DIRECTORY_FILTERS[kind].includes(facet) : false;
};

export const DIRECTORY_SECTION_PATHS = {
  tool: "/tools",
  studio: "/creatives",
  skill: "/skills",
  extra: "/extras",
} as const satisfies Record<DirectoryKind, string>;
