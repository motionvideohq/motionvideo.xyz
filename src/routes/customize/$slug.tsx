import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import { CopyPromptButton } from "@/components/copy-prompt-button";
import { DemoFrame } from "@/components/demo-frame";
import { PageMain } from "@/components/page";
import { PromptCustomizer } from "@/components/prompt-customizer";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import type { MotionVideo } from "@/lib/motion-catalog";
import { strongerTemplateFor } from "@/lib/prompt-templates";
import { createMetadata } from "@/seo/metadata";

const videos: MotionVideo[] = catalog.videos;

const link = "text-foreground underline underline-offset-4";

const CustomizeVideo = () => {
  const content = useIntlayer("customize-page");
  const { video } = Route.useLoaderData();
  const prompt = video.prompt ?? "";
  // Templates hold functions, so they are looked up here rather than passed
  // through loader data.
  const template = strongerTemplateFor(video);
  const handle = video.tweetUrl ? (
    <a
      href={video.tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-track="source_click"
      data-track-from="customize"
      data-track-slug={video.slug}
      className={link}
    >
      @{video.handle}
    </a>
  ) : (
    <span className="text-foreground">@{video.handle}</span>
  );

  return (
    <PageMain width="full" className="gap-8">
      <Link
        to={ROUTES.CUSTOMIZE}
        className="text-muted-foreground hover:text-foreground w-fit text-sm underline-offset-4 transition-colors hover:underline"
      >
        ← {content.allPrompts}
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* 9rem tall whatever the video's shape. */}
        <div
          className="max-w-full shrink-0"
          style={{
            width: `${((9 * video.width) / video.height).toFixed(2)}rem`,
          }}
        >
          <DemoFrame
            src={video.video}
            poster={video.poster}
            aspectRatio={video.width / video.height}
            autoplay="load"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {content.customizeTitle} {video.title}
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            {video.tweetUrl ? content.postBy : content.sharedBy} {handle}.{" "}
            <Link
              to="/videos/$slug"
              params={{ slug: video.slug }}
              className={link}
            >
              {content.watchVideo}
            </Link>
          </p>
        </div>
      </header>

      {template ? (
        <>
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold tracking-tight">
                {content.originalBy} @{video.handle}
              </h2>
              <CopyPromptButton
                text={prompt}
                analytics={{
                  from: "customize",
                  slug: video.slug,
                  version: "original",
                }}
              />
            </div>
            <pre className="bg-muted max-h-48 overflow-auto rounded-xl p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap">
              {prompt}
            </pre>
            <p className="text-muted-foreground text-sm text-pretty">
              {content.rewriteBefore}{" "}
              <Link
                to="/templates/$templateId"
                params={{ templateId: template.id }}
                className={link}
              >
                {template.title}
              </Link>
              {content.rewriteAfter}
            </p>
          </section>
          <PromptCustomizer
            template={template}
            model={video.model}
            slug={video.slug}
          />
        </>
      ) : (
        <PromptCustomizer
          prompt={prompt}
          model={video.model}
          slug={video.slug}
        />
      )}
    </PageMain>
  );
};

export const Route = createFileRoute("/customize/$slug")({
  component: CustomizeVideo,
  loader: ({ params }) => {
    const video = videos.find((entry) => entry.slug === params.slug);
    if (!video?.prompt) {
      throw notFound();
    }
    return { video };
  },
  // One page per gallery prompt, close to the video page: kept out of the
  // index, which already has the video and the templates.
  head: ({ loaderData, params }) =>
    createMetadata({
      canonical: `${ROUTES.CUSTOMIZE}/${params.slug}`,
      title: loaderData
        ? `Customize: ${loaderData.video.title}`
        : "Customize a prompt",
      description: loaderData
        ? `Make the prompt behind “${loaderData.video.title}” by @${loaderData.video.handle} yours: your subject, colors, size and dials.`
        : undefined,
      noIndex: true,
    }),
});
