import { Link } from "@tanstack/react-router";
import browserCollections from "collections/browser";
import { findNeighbour } from "fumadocs-core/page-tree";
import type * as PageTree from "fumadocs-core/page-tree";
import { deserializePageTree } from "fumadocs-core/source/client";
import { AnchorProvider } from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import type { MDXProps } from "mdx/types";
import { Suspense, useMemo } from "react";
import type { FC } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowLeft } from "reicon-react/icons/ArrowLeft";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { Edit } from "reicon-react/icons/Edit";

import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsToc, DocsTocCollapsible } from "@/components/docs/docs-toc";
import { docsMdxComponents } from "@/components/docs/mdx-components";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
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
}

const EDIT_BASE = `${LINK.GITHUB_REPO}/edit/main/apps/web/content/docs`;

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
}: ArticleProps & {
  body: FC<MDXProps>;
  title: string;
  description: string;
  toc: TOCItemType[];
}) => {
  const content = useIntlayer("docs-layout");
  const { previous, next } = findNeighbour(tree, url);
  const hasToc = toc.length > 0;
  return (
    <AnchorProvider toc={toc} single>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-180 min-w-0 flex-col gap-8 pt-6 pb-16 lg:pt-10"
      >
        {/* Below xl the contents fold above the article. Below lg the docs
            pages are in the site's menu (the header's Docs section). */}
        {hasToc ? (
          <div className="xl:hidden">
            <DocsTocCollapsible toc={toc} />
          </div>
        ) : null}
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg text-pretty">
            {description}
          </p>
        </header>
        <div className="text-muted-foreground flex min-w-0 flex-col gap-5 leading-7">
          <Body components={docsMdxComponents} />
        </div>
        <footer className="border-border mt-4 flex flex-col gap-6 border-t pt-6">
          <a
            href={`${EDIT_BASE}/${path}`}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm transition-colors"
          >
            <Edit aria-hidden="true" className="size-3.5" />
            {content.editPage}
            <span className="sr-only"> {content.opensInNewTab}</span>
          </a>
          {previous || next ? (
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
          ) : null}
        </footer>
      </main>
      {hasToc ? (
        <aside className="sticky top-0 max-h-svh self-start overflow-y-auto pt-10 pb-8 max-xl:hidden">
          <DocsToc toc={toc} />
        </aside>
      ) : null}
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
    canonical: data?.url ?? ROUTES.DOCS,
    title: data?.english.title ?? "Docs",
    description: data?.english.description,
  });

// Three columns from lg (sidebar, article, and from xl the table of
// contents); below lg the pages are listed in the site menu and the contents
// fold above the article. The locale comes from intlayer (SSR renders English);
// pages without a translation show the English file.
export const DocsPage = ({ data }: { data: DocsLoaderData }) => {
  const { locale } = useLocale();
  const variant = data.translations[locale] ?? data.english;
  const tree = useMemo(() => deserializePageTree(variant.tree), [variant.tree]);
  const article = docsContent.useContent(variant.path, {
    tree,
    url: data.url,
    path: variant.path,
  });
  return (
    <>
      <SiteHeader signedIn={data.signedIn} />
      <div className="mx-auto grid w-full max-w-7xl flex-1 px-4 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-10 xl:grid-cols-[14rem_minmax(0,1fr)_13rem]">
        <aside className="sticky top-0 max-h-svh self-start overflow-y-auto pt-10 pb-8 max-lg:hidden">
          <DocsSidebar tree={tree} />
        </aside>
        <Suspense>{article}</Suspense>
      </div>
      <SiteFooter />
    </>
  );
};
