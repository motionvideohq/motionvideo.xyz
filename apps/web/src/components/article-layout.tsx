import { AnchorProvider } from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowLeft } from "reicon-react/icons/ArrowLeft";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { DocsToc, DocsTocCollapsible } from "@/components/docs/docs-toc";
import { LocalizedLink as Link } from "@/components/localized-link";
import { PAGE_TOP } from "@/components/page";
import { cn } from "@/lib/utils";

interface ArticleEntry {
  url: string;
  data: { title: string };
}

interface ArticleLayoutProps {
  entries: readonly ArticleEntry[];
  currentUrl: string;
  navigationLabel: string;
  toc: TOCItemType[];
  children: ReactNode;
  renderActions?: (inline: boolean) => ReactNode;
}

const neighbourClass =
  "group/neighbour bg-card shadow-outline hover:bg-muted/50 focus-visible:ring-ring flex flex-col gap-1 rounded-xl p-4 text-sm transition-colors outline-none focus-visible:ring-2";

/** Docs-style article shell: desktop entry sidebar, TOC/tools, then previous/next. */
export const ArticleLayout = ({
  entries,
  currentUrl,
  navigationLabel,
  toc,
  children,
  renderActions,
}: ArticleLayoutProps) => {
  const content = useIntlayer("docs-layout");
  const index = entries.findIndex((entry) => entry.url === currentUrl);
  const previous = entries[index - 1];
  let next: ArticleEntry | undefined;
  if (index !== -1) {
    next = entries[index + 1];
  }

  return (
    <AnchorProvider toc={toc} single>
      <div className="grid w-full flex-1 px-4 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-10 xl:grid-cols-[15rem_minmax(0,1fr)_15rem]">
        <aside className="no-scrollbar sticky top-0 max-h-svh self-start overflow-y-auto pt-10 pb-8 max-lg:hidden print:hidden">
          <p className="text-muted-foreground mb-3 px-2.5 text-xs font-medium">
            {navigationLabel}
          </p>
          <nav aria-label={navigationLabel}>
            <ul className="flex flex-col gap-0.5">
              {entries.map((entry) => (
                <li key={entry.url}>
                  <Link
                    to={entry.url}
                    activeOptions={{ exact: true, includeHash: false }}
                    aria-current={entry.url === currentUrl ? "page" : undefined}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/60 aria-[current=page]:bg-muted aria-[current=page]:text-foreground focus-visible:ring-ring block rounded-lg px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 aria-[current=page]:font-medium"
                  >
                    {entry.data.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main
          id="main-content"
          className={cn(
            "mx-auto flex w-full max-w-180 min-w-0 flex-col gap-8 pb-16 [&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20 [&_h4]:scroll-mt-20 [&_h5]:scroll-mt-20 [&_h6]:scroll-mt-20",
            PAGE_TOP.document
          )}
        >
          {toc.length > 0 || renderActions ? (
            <div className="xl:hidden print:hidden">
              <DocsTocCollapsible toc={toc} actions={renderActions?.(true)} />
            </div>
          ) : null}
          {children}
          {previous || next ? (
            <footer className="border-border mt-4 border-t pt-6 print:hidden">
              <nav
                aria-label={content.pagination.value}
                className="grid gap-3 sm:grid-cols-2"
              >
                {previous ? (
                  <Link to={previous.url} className={neighbourClass}>
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <ArrowLeft
                        aria-hidden="true"
                        className="size-3.5 transition-transform group-hover/neighbour:-translate-x-0.5"
                      />
                      {content.previous}
                    </span>
                    <span className="text-foreground font-medium">
                      {previous.data.title}
                    </span>
                  </Link>
                ) : null}
                {next ? (
                  <Link
                    to={next.url}
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
                    <span className="text-foreground font-medium">
                      {next.data.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            </footer>
          ) : null}
        </main>
        {toc.length > 0 || renderActions ? (
          <aside className="sticky top-0 flex max-h-[calc(100svh-3.5rem)] flex-col gap-4 self-start py-10 max-xl:hidden print:hidden">
            {toc.length > 0 ? <DocsToc toc={toc} /> : null}
            {renderActions ? (
              <div
                className={cn("shrink-0", toc.length > 0 && "border-t pt-3")}
              >
                {renderActions(false)}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </AnchorProvider>
  );
};
