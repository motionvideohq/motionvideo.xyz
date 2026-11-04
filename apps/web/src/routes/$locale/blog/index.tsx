import { createFileRoute } from "@tanstack/react-router";
import { useIntlayer, useLocale } from "react-intlayer";

import { EntryCard } from "@/components/entry-card";
import { FeedButtons } from "@/components/feed-buttons";
import { PageHeader, PageMain } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import { BLOG_FEEDS, BLOG_POSTS, formatPostDate } from "@/lib/blog";
import { pickVideos } from "@/lib/video-picks";
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
      <PageMain layout="document" width="narrow">
        <PageHeader
          title={content.title.value}
          intro={
            locale === "en"
              ? content.intro.value
              : `${content.intro.value} ${content.englishOnly.value}`
          }
          actions={<FeedButtons feeds={BLOG_FEEDS} />}
        />
        <ol className="flex flex-col gap-4">
          {BLOG_POSTS.map((post) => (
            <li key={post.url}>
              <EntryCard
                to="/blog/$slug"
                params={{ slug: post.slugs.join("/") }}
                cover={covers[post.data.cover]}
                title={post.data.title}
                description={post.data.description}
                meta={
                  <time dateTime={post.data.date}>
                    {formatPostDate(post.data.date, locale)}
                  </time>
                }
              />
            </li>
          ))}
        </ol>
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/$locale/blog/")({
  component: Blog,
  // Only the cover posters' fields, not the catalog.
  loader: () => ({
    covers: pickVideos(
      BLOG_POSTS.map((post) => post.data.cover),
      catalog.videos
    ),
  }),
  head: ({ params }) => ({
    ...createMetadata({
      description:
        "Notes on making motion graphics with AI coding agents: prompt structure, rendering, launch films, and what the prompts in the gallery have in common.",
      title: "Blog",
    }),
    links: BLOG_FEEDS.links,
    scripts: [
      breadcrumbJsonLd({ page: "blog", path: ROUTES.BLOG }, params.locale),
    ],
  }),
});
