import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useIntlayer, useLocale } from "react-intlayer";

import { PageMain } from "@/components/page";
import { PromptCustomizer } from "@/components/prompt-customizer";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import type { MotionVideo } from "@/lib/motion-catalog";
import { promptFor } from "@/lib/prompt-translations";
import { createMetadata } from "@/seo/metadata";

const videos: MotionVideo[] = catalog.videos;

const link = "text-foreground underline underline-offset-4";

const CustomizeVideo = () => {
  const content = useIntlayer("customize-page");
  const { locale } = useLocale();
  const { video } = Route.useLoaderData();
  // Start from the prompt as the video's detail view shows it: English
  // visitors get the translation of a Chinese or Japanese prompt.
  const prompt = promptFor(video, locale)?.text ?? "";
  const creator = video.creatorName ?? `@${video.handle}`;

  return (
    <PageMain width="full" className="gap-8">
      <Link
        to={ROUTES.CUSTOMIZE}
        className="text-muted-foreground hover:text-foreground w-fit text-sm underline-offset-4 transition-colors hover:underline"
      >
        ← {content.allPrompts}
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* The poster, 9rem tall whatever the video's shape. */}
        <img
          src={video.poster}
          alt=""
          width={video.width}
          height={video.height}
          className="bg-muted h-36 w-auto max-w-full shrink-0 self-start rounded-xl object-cover"
        />
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">
            {content.customizeTitle} {video.title}
          </h1>
          <p className="text-muted-foreground text-sm text-pretty">
            {video.tweetUrl ? content.postBy : content.sharedBy}{" "}
            {video.tweetUrl ? (
              <a
                href={video.tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track="source_click"
                data-track-from="customize"
                data-track-slug={video.slug}
                className={link}
              >
                {creator}
              </a>
            ) : (
              <span className="text-foreground">{creator}</span>
            )}
            .{" "}
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

      <PromptCustomizer prompt={prompt} slug={video.slug} model={video.model} />
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
  head: ({ loaderData, params }) =>
    createMetadata({
      canonical: `${ROUTES.CUSTOMIZE}/${params.slug}`,
      title: loaderData
        ? `Customize: ${loaderData.video.title}`
        : "Customize a prompt",
      description: loaderData
        ? `Make the prompt behind “${loaderData.video.title}” by @${loaderData.video.handle} yours: your subject, colors, size and dials. Free, in the browser.`
        : undefined,
    }),
});
