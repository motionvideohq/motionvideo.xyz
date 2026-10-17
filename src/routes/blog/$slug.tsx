import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useIntlayer, useLocale } from "react-intlayer";
import { ArrowLeft } from "reicon-react/icons/ArrowLeft";

import { BlogContent } from "@/components/blog-content";
import { PageMain } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import {
  BLOG_POSTS,
  blogPostVideos,
  findBlogPost,
  formatPostDate,
} from "@/lib/blog";
import { cn } from "@/lib/utils";
import { blogPostingJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const BlogPostPage = () => {
  const { post, videos } = Route.useLoaderData();
  const content = useIntlayer("blog");
  const { locale } = useLocale();
  const others = BLOG_POSTS.filter((entry) => entry.slug !== post.slug);
  return (
    <>
      <SiteHeader signedIn={false} />
      <PageMain width="narrow" className="gap-10">
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
              {post.title}
            </h1>
            <p className="text-muted-foreground text-lg text-pretty">
              {post.description}
            </p>
            <time
              dateTime={post.date}
              className="text-muted-foreground text-sm"
            >
              {formatPostDate(post.date, locale)}
            </time>
          </header>
          <BlogContent blocks={post.body} videos={videos} />
        </article>
        <nav
          aria-label={content.morePosts.value}
          className="flex flex-col gap-3 border-t border-dashed pt-8"
        >
          <h2 className="text-sm font-medium">{content.morePosts}</h2>
          <ul className="flex flex-col gap-4">
            {others.map((entry) => (
              <li key={entry.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: entry.slug }}
                  className="group flex flex-col gap-0.5"
                >
                  <span className="font-medium group-hover:underline group-hover:underline-offset-4">
                    {entry.title}
                  </span>
                  <span className="text-muted-foreground line-clamp-2 text-sm">
                    {entry.description}
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

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
  loader: ({ params }) => {
    const post = findBlogPost(params.slug);
    if (!post) {
      throw notFound();
    }
    // Only the poster-card fields of the videos the post shows, not the catalog.
    return { post, videos: blogPostVideos(post, catalog.videos) };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          ...createMetadata({
            canonical: `${ROUTES.BLOG}/${loaderData.post.slug}`,
            description: loaderData.post.description,
            title: loaderData.post.title,
          }),
          scripts: [blogPostingJsonLd(loaderData.post)],
        }
      : createMetadata({ title: "Post not found", noIndex: true }),
});
