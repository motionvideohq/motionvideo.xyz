import { createFileRoute, notFound } from "@tanstack/react-router";
import { use, useRef } from "react";
import { useIntlayer, useLocale } from "react-intlayer";

import { ArticleLayout } from "@/components/article-layout";
import { BlogContent } from "@/components/blog-content";
import { DocsActions } from "@/components/docs/docs-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import catalog from "@/data/motion-catalog.json";
import {
  BLOG_FEEDS,
  BLOG_POSTS,
  findBlogPost,
  formatPostDate,
} from "@/lib/blog";
import { pickVideos } from "@/lib/video-picks";
import { blogPostingJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const BlogPostPage = () => {
  const { slug, videos } = Route.useLoaderData();
  const { locale: pathLocale } = Route.useParams();
  const body = useRef<HTMLDivElement>(null);
  const content = useIntlayer("blog");
  const { locale } = useLocale();
  // The loader already threw notFound() for unknown slugs.
  const post = findBlogPost(slug);
  if (!post) {
    return null;
  }
  const { toc } = use(post.data.load());
  return (
    <>
      <SiteHeader />
      <ArticleLayout
        entries={BLOG_POSTS}
        currentUrl={post.url}
        navigationLabel={content.back.value}
        toc={toc}
        renderActions={(inline) => (
          <DocsActions
            variant="article"
            title={post.data.title}
            description={post.data.description}
            url={pathLocale ? `/${pathLocale}${post.url}` : post.url}
            markdownUrl={`${post.url}.md`}
            lang="en"
            getArticle={() => body.current}
            inline={inline}
          />
        )}
      >
        <article className="flex flex-col gap-8">
          <header className="flex flex-col gap-4">
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
          <div ref={body}>
            <BlogContent Body={post.data.body} videos={videos} />
          </div>
        </article>
      </ArticleLayout>
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
