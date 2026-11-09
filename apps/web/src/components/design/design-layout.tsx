import { Outlet, useRouterState } from "@tanstack/react-router";
import { AnchorProvider } from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import { getPathWithoutLocale } from "intlayer";
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowLeft } from "reicon-react/icons/ArrowLeft";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { ChevronDown } from "reicon-react/icons/ChevronDown";

import { DocsActions } from "@/components/docs/docs-actions";
import { DocsToc, DocsTocCollapsible } from "@/components/docs/docs-toc";
import { LocalizedLink as Link } from "@/components/localized-link";
import { PAGE_TOP, PageHeader } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ROUTES } from "@/constants/routes";
import { DESIGN_COMPONENT_PAGES, DESIGN_FOUNDATIONS } from "@/lib/design";
import { cn } from "@/lib/utils";

interface DesignNavItem {
  title: string;
  path: string;
}

const useDesignNavigation = () => {
  const content = useIntlayer("design-system");
  const design = useIntlayer("design");
  return [
    {
      title: content.foundations.value,
      items: [
        { title: content.introduction.value, path: ROUTES.DESIGN },
        ...DESIGN_FOUNDATIONS.map(({ slug }) => ({
          title: content[slug].value,
          path: `${ROUTES.DESIGN}/${slug}`,
        })),
        { title: content.brand.value, path: ROUTES.DESIGN_BRAND },
      ],
    },
    {
      title: design.components.value,
      items: [
        { title: content.overview.value, path: ROUTES.DESIGN_COMPONENTS },
        ...DESIGN_COMPONENT_PAGES.map((page) => ({
          title: page.data.title,
          path: page.url,
        })),
      ],
    },
  ];
};

const DesignNavigation = ({ onNavigate }: { onNavigate?: () => void }) => {
  const content = useIntlayer("design-system");
  const groups = useDesignNavigation();
  return (
    <nav aria-label={content.navigation.value} className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <p className="text-muted-foreground px-2.5 text-xs font-medium">
            {group.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) =>
              item.path === ROUTES.DESIGN_COMPONENTS ? null : (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onNavigate}
                    activeOptions={{ exact: true, includeHash: false }}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/60 aria-[current=page]:bg-muted aria-[current=page]:text-foreground focus-visible:ring-ring block rounded-lg px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 aria-[current=page]:font-medium"
                  >
                    {item.title}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export const DesignLayout = () => {
  const content = useIntlayer("design-system");
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="contents print:hidden">
        <SiteHeader />
      </div>
      <div className="grid w-full flex-1 px-4 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-10 print:block">
        <aside className="no-scrollbar sticky top-0 max-h-svh self-start overflow-y-auto pt-10 pb-8 max-lg:hidden print:hidden">
          <DesignNavigation />
        </aside>
        <div className="min-w-0">
          <Collapsible
            open={menuOpen}
            onOpenChange={setMenuOpen}
            className="bg-card shadow-outline mt-6 rounded-xl lg:hidden print:hidden"
          >
            <CollapsibleTrigger className="focus-visible:ring-ring flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus-visible:ring-2">
              {content.name}
              <ChevronDown
                aria-hidden="true"
                className="text-muted-foreground size-4 transition-transform in-aria-expanded:rotate-180"
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-2 pb-3">
                <DesignNavigation onNavigate={() => setMenuOpen(false)} />
              </div>
            </CollapsibleContent>
          </Collapsible>
          <Outlet />
        </div>
      </div>
      <div className="contents print:hidden">
        <SiteFooter />
      </div>
    </>
  );
};

const neighbourClass =
  "group/neighbour bg-card shadow-outline hover:bg-muted/50 focus-visible:ring-ring flex flex-col gap-1 rounded-xl p-4 text-sm transition-colors outline-none focus-visible:ring-2";

const DesignPagination = () => {
  const content = useIntlayer("docs-layout");
  const pathname = useRouterState({
    select: (state) =>
      getPathWithoutLocale(state.location.pathname).replace(/\/$/u, ""),
  });
  const pages: DesignNavItem[] = useDesignNavigation().flatMap(
    (group) => group.items
  );
  const index = pages.findIndex(
    (page) => page.path.replace(/\/$/u, "") === pathname
  );
  if (index === -1) {
    return null;
  }
  const previous = pages[index - 1];
  const next = pages[index + 1];
  return (
    <footer className="border-border mt-4 border-t pt-6 print:hidden">
      <nav
        aria-label={content.pagination.value}
        className="grid gap-3 sm:grid-cols-2"
      >
        {previous ? (
          <Link to={previous.path} className={neighbourClass}>
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <ArrowLeft
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover/neighbour:-translate-x-0.5"
              />
              {content.previous}
            </span>
            <span className="text-foreground font-medium">
              {previous.title}
            </span>
          </Link>
        ) : null}
        {next ? (
          <Link
            to={next.path}
            className={cn(
              neighbourClass,
              "items-end text-right sm:col-start-2"
            )}
          >
            <span className="text-muted-foreground inline-flex items-center gap-1">
              {content.next}
              <ArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover/neighbour:translate-x-0.5"
              />
            </span>
            <span className="text-foreground font-medium">{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </footer>
  );
};

const EMPTY_TOC: TOCItemType[] = [];

export const DesignArticle = ({
  title,
  description,
  children,
  url,
  source,
  lang,
  toc = EMPTY_TOC,
  eyebrow,
  actions,
  wide = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  url: string;
  source: string;
  lang: string;
  toc?: TOCItemType[];
  eyebrow?: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
}) => {
  const body = useRef<HTMLDivElement>(null);
  const hasToc = toc.length > 0;
  const pageActions = {
    title,
    description,
    url,
    path: source,
    lang,
    getArticle: () => body.current,
  };
  return (
    <AnchorProvider toc={toc} single>
      <div className="grid min-w-0 gap-x-10 xl:grid-cols-[minmax(0,1fr)_15rem]">
        <main
          id="main-content"
          className={cn(
            "mx-auto flex w-full min-w-0 flex-col gap-8 pb-16",
            PAGE_TOP.document,
            wide ? "max-w-5xl" : "max-w-180"
          )}
        >
          <div className="xl:hidden print:hidden">
            <DocsTocCollapsible
              toc={toc}
              actions={<DocsActions {...pageActions} inline />}
            />
          </div>
          <div className="flex flex-col gap-3">
            {eyebrow ? (
              <div className="text-muted-foreground text-xs font-medium">
                {eyebrow}
              </div>
            ) : null}
            <PageHeader title={title} intro={description} actions={actions} />
          </div>
          <div
            ref={body}
            className="text-muted-foreground flex min-w-0 flex-col gap-5 leading-7"
          >
            {children}
          </div>
          <DesignPagination />
        </main>
        <aside className="sticky top-0 flex max-h-[calc(100svh-3.5rem)] flex-col gap-4 self-start py-10 max-xl:hidden print:hidden">
          {hasToc ? <DocsToc toc={toc} /> : null}
          <div className={cn("shrink-0", hasToc && "border-t pt-3")}>
            <DocsActions {...pageActions} />
          </div>
        </aside>
      </div>
    </AnchorProvider>
  );
};
