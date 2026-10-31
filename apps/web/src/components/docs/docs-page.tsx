import browserCollections from "collections/browser";
import { findNeighbour } from "fumadocs-core/page-tree";
import type * as PageTree from "fumadocs-core/page-tree";
import { deserializePageTree } from "fumadocs-core/source/client";
import { AnchorProvider } from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import type { MDXProps } from "mdx/types";
import { Suspense, useMemo, useRef } from "react";
import type { FC } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowLeft } from "reicon-react/icons/ArrowLeft";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { DocsActions } from "@/components/docs/docs-actions";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsToc, DocsTocCollapsible } from "@/components/docs/docs-toc";
import { docsMdxComponents } from "@/components/docs/mdx-components";
import { LocalizedLink as Link } from "@/components/localized-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";
import { createMetadata } from "@/seo/metadata";
import { getDocsPage } from "@/server/docs-functions";
import type { DocsPageVariant } from "@/server/docs-functions";
import { getLandingData } from "@/server/functions";

export interface DocsLoaderData {
  signedIn: boolean;
  /** Path of the page, e.g. /docs/mcp. */
  url: string;
  english: DocsPageVariant;
  translations: Partial<Record<string, DocsPageVariant>>;
}

interface ArticleProps {
  tree: PageTree.Root;
  url: string;
  /** Content path of the MDX file, for the edit link. */
  path: string;
  /** Language of the shown file: the URL's locale, or `en` as fallback. */
  lang: string;
}

const neighbourClass =
  "group/neighbour bg-card shadow-outline hover:bg-muted/50 focus-visible:ring-ring flex flex-col gap-1 rounded-xl p-4 text-sm transition-colors outline-none focus-visible:ring-2";

const DocsArticle = ({
  body: Body,
  title,
  description,
  toc,
  tree,
  url,
  path,
  lang,
}: ArticleProps & {
  body: FC<MDXProps>;
  title: string;
  description: string;
  toc: TOCItemType[];
}) => {
  const content = useIntlayer("docs-layout");
  const { previous, next } = findNeighbour(tree, url);
  const hasToc = toc.length > 0;
  const body = useRef<HTMLDivElement>(null);
  const actions = (
    <DocsActions
      title={title}
      description={description}
      url={url}
      path={path}
      lang={lang}
      getArticle={() => body.current}
    />
  );
  return (
    <AnchorProvider toc={toc} single>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-180 min-w-0 flex-col gap-8 pt-6 pb-16 lg:pt-10"
      >
        {/* Below xl the contents and actions fold above the article. Below
            lg the docs pages are in the site's menu (the header's Docs
            section). */}
        <div className="xl:hidden">
          <DocsTocCollapsible toc={toc} actions={actions} />
        </div>
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg text-pretty">
            {description}
          </p>
        </header>
        <div
          ref={body}
          className="text-muted-foreground flex min-w-0 flex-col gap-5 leading-7"
        >
          <Body components={docsMdxComponents} />
        </div>
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
                    {previous.name}
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
                    {next.name}
                  </span>
                </Link>
              ) : null}
            </nav>
          </footer>
        ) : null}
      </main>
      {/* As tall as its contents, with the actions right under them, up to
          one viewport minus the site header (3.5rem from lg, not sticky);
          then only the contents between the heading and the actions scroll.
          The bottom padding (5rem) keeps the actions clear of the page's
          bottom blur (4.5rem, ProgressiveBlur). */}
      <aside className="sticky top-0 flex max-h-[calc(100svh-3.5rem)] flex-col gap-4 self-start pt-10 pb-20 max-xl:hidden print:hidden">
        {hasToc ? <DocsToc toc={toc} /> : null}
        <div className={cn("shrink-0", hasToc && "border-t pt-3")}>
          {actions}
        </div>
      </aside>
    </AnchorProvider>
  );
};

// Compiled MDX per content file, loaded lazily (one chunk per page) and
// preloaded by the route loader so SSR and navigation render synchronously.
const docsContent = browserCollections.docs.createClientLoader<ArticleProps>({
  id: "docs",
  component: ({ default: body, frontmatter, toc }, props) => (
    <DocsArticle
      body={body}
      title={frontmatter.title}
      description={frontmatter.description}
      toc={toc}
      {...props}
    />
  ),
});

/** Loader shared by /docs and /docs/$: the page in every locale, preloaded. */
export const loadDocsPage = async (
  slugs: string[]
): Promise<DocsLoaderData> => {
  const [{ signedIn }, page] = await Promise.all([
    getLandingData(),
    getDocsPage({ data: slugs }),
  ]);
  const paths = new Set([page.english.path]);
  for (const variant of Object.values(page.translations)) {
    if (variant) {
      paths.add(variant.path);
    }
  }
  await Promise.all([...paths].map((path) => docsContent.preload(path)));
  return { signedIn, ...page };
};

export const docsHead = (data: DocsLoaderData | undefined) =>
  createMetadata({
    title: data?.english.title ?? "Docs",
    description: data?.english.description,
  });

// Full width, three columns from lg (sidebar, article, and from xl the table
// of contents with the page actions); below lg the pages are listed in the
// site menu and the contents and actions fold above the article. Printing
// (Export → PDF) keeps only the article. The locale comes from the URL's `/$locale` prefix;
// pages without a translation show the English file.
export const DocsPage = ({ data }: { data: DocsLoaderData }) => {
  const { locale } = useLocale();
  const variant = data.translations[locale] ?? data.english;
  const tree = useMemo(() => deserializePageTree(variant.tree), [variant.tree]);
  const article = docsContent.useContent(variant.path, {
    tree,
    url: data.url,
    path: variant.path,
    lang: data.translations[locale] ? locale : "en",
  });
  return (
    <>
      <div className="contents print:hidden">
        <SiteHeader signedIn={data.signedIn} />
      </div>
      <div className="grid w-full flex-1 px-4 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-10 xl:grid-cols-[15rem_minmax(0,1fr)_15rem]">
        <aside className="no-scrollbar sticky top-0 max-h-svh self-start overflow-y-auto pt-10 pb-8 max-lg:hidden print:hidden">
          <DocsSidebar tree={tree} />
        </aside>
        <Suspense>{article}</Suspense>
      </div>
      <div className="contents print:hidden">
        <SiteFooter />
      </div>
    </>
  );
};
