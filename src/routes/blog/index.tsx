import { Link, createFileRoute } from "@tanstack/react-router";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { PageHeader, PageMain } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import { BLOG_POSTS, blogCovers, formatPostDate } from "@/lib/blog";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

// Cards match /templates: cover poster, title, description, then the date.
const Blog = () => {
  const content = useIntlayer("blog");
  const { locale } = useLocale();
  const { covers } = Route.useLoaderData();
  return (
    <>
      <SiteHeader signedIn={false} />
      <PageMain width="narrow" className="gap-10">
        <PageHeader
          title={content.title.value}
          intro={
            locale === "en"
              ? content.intro.value
              : `${content.intro.value} ${content.englishOnly.value}`
          }
        />
        <ol className="flex flex-col gap-4">
          {BLOG_POSTS.map((post) => {
            const cover = covers[post.cover];
            return (
              <li key={post.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group bg-card shadow-outline hover:bg-muted/60 flex flex-col gap-4 overflow-hidden rounded-xl p-3 transition-colors sm:flex-row"
                >
                  <span className="bg-muted aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:w-56">
                    {cover && (
                      <img
                        src={cover.poster}
                        alt=""
                        width={cover.width}
                        height={cover.height}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover"
                      />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col gap-2 py-1 sm:pr-2">
                    <h2 className="text-lg font-semibold tracking-tight text-balance">
                      {post.title}
                    </h2>
                    <span className="text-muted-foreground text-sm text-pretty">
                      {post.description}
                    </span>
                    <span className="text-muted-foreground mt-auto flex items-center gap-1.5 pt-1 text-xs">
                      <time dateTime={post.date}>
                        {formatPostDate(post.date, locale)}
                      </time>
                      <ArrowRight className="group-hover:text-foreground ml-auto size-4 transition-colors" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/blog/")({
  component: Blog,
  // Only the cover posters' fields, not the catalog.
  loader: () => ({ covers: blogCovers(catalog.videos) }),
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.BLOG,
      description:
        "Notes on making motion graphics with AI coding agents: prompt structure, rendering, launch films, and what the prompts in the gallery have in common.",
      title: "Blog",
    }),
    scripts: [breadcrumbJsonLd({ name: "Blog", path: ROUTES.BLOG })],
  }),
});
