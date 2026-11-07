import { createFileRoute, notFound } from "@tanstack/react-router";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowLeft } from "reicon-react/icons/ArrowLeft";

import { BlogContent } from "@/components/blog-content";
import { LocalizedLink as Link } from "@/components/localized-link";
import { PageMain } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import {
  BLOG_FEEDS,
  BLOG_POSTS,
  findBlogPost,
  formatPostDate,
} from "@/lib/blog";
import { cn } from "@/lib/utils";
import { pickVideos } from "@/lib/video-picks";
import { buttonVariants } from "@/registry/ui/button";
import { blogPostingJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const BlogPostPage = () => {
  const { slug, videos } = Route.useLoaderData();
  const content = useIntlayer("blog");
  const { locale } = useLocale();
  // The loader already threw notFound() for unknown slugs.
  const post = findBlogPost(slug);
  if (!post) {
    return null;
  }
  const others = BLOG_POSTS.filter((entry) => entry.url !== post.url);
  return (
    <>
      <SiteHeader />
      <PageMain layout="document" width="narrow">
        <article className="flex flex-col gap-8">
          <header className="flex flex-col gap-4">
            <Link
              to={ROUTES.BLOG}
              className={cn(
                buttonVariants({ variant: "subtle", size: "sm" }),
                "-ml-2.5 self-start"
              )}
            >
              <ArrowLeft data-icon="inline-start" />
              {content.back}
            </Link>
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              {post.data.title}
            </h1>
            <p className="text-muted-foreground text-lg text-pretty">
              {post.data.description}
            </p>
            <time
              dateTime={post.data.date}
              className="text-muted-foreground text-sm"
            >
              {formatPostDate(post.data.date, locale)}
            </time>
          </header>
          <BlogContent Body={post.data.body} videos={videos} />
        </article>
        <nav
          aria-label={content.morePosts.value}
          className="flex flex-col gap-3 border-t border-dashed pt-8"
        >
          <h2 className="text-sm font-medium">{content.morePosts}</h2>
          <ul className="flex flex-col gap-4">
            {others.map((entry) => (
              <li key={entry.url}>
                <Link
                  to={ROUTES.BLOG_POST}
                  params={{ slug: entry.slugs.join("/") }}
                  className="group flex flex-col gap-0.5"
                >
                  <span className="font-medium group-hover:underline group-hover:underline-offset-4">
                    {entry.data.title}
                  </span>
                  <span className="text-muted-foreground line-clamp-2 text-sm">
                    {entry.data.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/blog/$slug")({
  component: BlogPostPage,
  // Bodies load lazily (`async` in src/lib/blog.ts); fetch this one before
  // rendering so the page never suspends. Only the poster-card fields of the
  // videos the post shows ship, not the catalog.
  loader: async ({ params }) => {
    const post = findBlogPost(params.slug);
    if (!post) {
      throw notFound();
    }
    await post.data.preload();
    return {
      slug: params.slug,
      videos: pickVideos(post.data.videos, catalog.videos),
    };
  },
  head: ({ params }) => {
    const post = findBlogPost(params.slug);
    return post
      ? {
          ...createMetadata({
            description: post.data.description,
            title: post.data.title,
          }),
          links: BLOG_FEEDS.links,
          scripts: [
            blogPostingJsonLd(
              { ...post.data, slug: params.slug },
              params.locale
            ),
          ],
        }
      : createMetadata({ title: "Post not found" });
  },
});
