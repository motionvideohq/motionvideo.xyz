import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import type { IntlayerNode } from "react-intlayer";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { Ufo } from "reicon-react/icons/Ufo";

import { FadeScroller } from "@/components/fade-scroller";
import { Button, buttonVariants } from "@/components/ui/button";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { VirtualMasonry } from "@/components/virtual-masonry";
import type { MasonryItem } from "@/components/virtual-masonry";
import { ROUTES } from "@/constants/routes";
import { DIRECTORY_CATEGORIES, DIRECTORY_ENTRIES } from "@/lib/directories";
import type {
  DirectoryCategory,
  DirectoryEntry,
  DirectoryKind,
} from "@/lib/directories";

// Covers are imported at 960×540.
const COVER_RATIO = 16 / 9;

// "All" and each category are their own pages: /tools, /tools/ai, /skills…
// Exact matching keeps "All" from reading as current on a category page.
const SECTION_ROUTES = {
  tool: { all: "/tools", category: "/tools/$category" },
  studio: { all: "/creatives", category: "/creatives/$category" },
  skill: { all: "/skills", category: "/skills/$category" },
  extra: { all: "/extras", category: "/extras/$category" },
} as const satisfies Record<DirectoryKind, { all: string; category: string }>;

const CategoryLink = ({
  kind,
  category,
  ...props
}: {
  kind: DirectoryKind;
  category: DirectoryCategory | undefined;
  className: string;
  children: ReactNode;
}) => {
  const linkProps = {
    ...props,
    resetScroll: false,
    activeOptions: { exact: true, includeSearch: false },
  };
  return category ? (
    <Link
      to={SECTION_ROUTES[kind].category}
      params={{ category: category.slug }}
      {...linkProps}
    />
  ) : (
    <Link to={SECTION_ROUTES[kind].all} {...linkProps} />
  );
};

const DirectoryCard = ({
  entry,
  categoryLabel,
  label,
}: {
  entry: DirectoryEntry;
  /** Hover badge; omitted on sections without categories. */
  categoryLabel: string | undefined;
  label: string;
}) => {
  const [broken, setBroken] = useState(false);

  return (
    <a
      href={entry.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group bg-muted ring-foreground/5 focus-visible:ring-ring relative block aspect-video overflow-hidden rounded-xl ring-1 outline-none ring-inset focus-visible:ring-2"
    >
      {entry.cover && !broken ? (
        <img
          src={entry.cover}
          alt=""
          width={960}
          height={540}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="size-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.025]"
        />
      ) : (
        <span
          className="flex size-full items-center justify-center"
          aria-hidden="true"
        >
          <span className="bg-background text-muted-foreground flex size-12 items-center justify-center rounded-full text-lg font-medium">
            {entry.name.slice(0, 1).toUpperCase()}
          </span>
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-linear-to-t from-black/75 via-transparent to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="flex items-start justify-between gap-2">
          {categoryLabel && (
            <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {categoryLabel}
            </span>
          )}
          <ReiconDuotone
            icon={ArrowRightUp}
            aria-hidden="true"
            className="ml-auto size-4 text-white"
          />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium tracking-tight text-white">
            {entry.name}
          </span>
          <span lang="en" className="truncate text-xs text-white/75">
            {entry.description}
          </span>
        </span>
      </span>
    </a>
  );
};

export const ResourceDirectory = ({
  kind,
  category,
}: {
  kind: DirectoryKind;
  /** The category page being shown; `undefined` on the "All" page. */
  category: DirectoryCategory | undefined;
}) => {
  const content = useIntlayer("resource-directory");
  const entries = DIRECTORY_ENTRIES[kind];
  const categories: DirectoryCategory[] = DIRECTORY_CATEGORIES[kind];
  // Category copy for this section, keyed by slug.
  const labels: Partial<Record<string, IntlayerNode<string>>> =
    content.labels[kind];
  const headings: Partial<Record<string, IntlayerNode<string>>> =
    content.headings[kind];
  const descriptions: Partial<Record<string, IntlayerNode<string>>> =
    content.descriptions[kind];
  const filtered = category
    ? entries.filter((entry) => entry.category === category.id)
    : entries;

  const intro = (
    <section
      aria-labelledby="directory-intro-title"
      className="flex flex-col gap-5 py-4"
    >
      <h1
        id="directory-intro-title"
        className="text-2xl leading-tight font-semibold tracking-tight text-balance"
      >
        {(category && headings[category.slug]) ?? content.titles[kind]}
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
        {(category && descriptions[category.slug]) ?? content.intros[kind]}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            const entry = filtered[Math.floor(Math.random() * filtered.length)];
            if (entry) {
              window.open(entry.url, "_blank", "noopener,noreferrer");
            }
          }}
        >
          <ReiconDuotone icon={Ufo} aria-hidden="true" />
          {content.surprise}
        </Button>
        <Link
          to={ROUTES.SUBMIT}
          search={{ kind, category: category?.slug }}
          className={buttonVariants({ variant: "gradient", size: "lg" })}
        >
          {content.submit[kind]}
          <ReiconDuotone icon={ArrowRightUp} aria-hidden="true" />
        </Link>
      </div>
    </section>
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
      aspectRatio: COVER_RATIO,
      node: (
        <DirectoryCard
          entry={entry}
          categoryLabel={categoryLabel}
          label={`${entry.name}: ${content.visit.value} (${content.newTab.value})`}
        />
      ),
    };
  });
  const items: MasonryItem[] = [{ key: "intro", node: intro }, ...cards];

  return (
    <>
      {categories.length > 0 && (
        <div className="bg-background/90 sticky top-0 z-30 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[1800px] items-center px-4 py-2.5 sm:px-6">
            <FadeScroller
              label={content.categories.value}
              className="-mx-1 -my-1 min-w-0 basis-full px-1 py-1 lg:basis-[65%]"
            >
              {[undefined, ...categories].map((value) => {
                const selected = value?.slug === category?.slug;
                const count = value
                  ? entries.filter((entry) => entry.category === value.id)
                      .length
                  : entries.length;
                // "All" stays a white outline when chosen; a chosen category turns yellow.
                let variant: "default" | "outline" | "secondary" = "secondary";
                if (selected) {
                  variant = value ? "default" : "outline";
                }
                return (
                  <CategoryLink
                    key={value?.slug ?? "all"}
                    kind={kind}
                    category={value}
                    className={cn(
                      buttonVariants({ variant }),
                      "rounded-full px-3",
                      !selected && "text-muted-foreground"
                    )}
                  >
                    {value ? labels[value.slug] : content.all}
                    <span className="text-xs tabular-nums opacity-60">
                      {count}
                    </span>
                  </CategoryLink>
                );
              })}
            </FadeScroller>
          </div>
        </div>
      )}
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1800px] px-4 pt-2 pb-16 sm:px-6"
      >
        <VirtualMasonry items={items} />
      </main>
    </>
  );
};
