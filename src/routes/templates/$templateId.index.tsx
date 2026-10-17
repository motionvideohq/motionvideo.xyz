import {
  Link,
  createFileRoute,
  getRouteApi,
  notFound,
} from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { Check } from "reicon-react/icons/Check";
import { Sparkles } from "reicon-react/icons/Sparkles";

import { CopyPromptButton } from "@/components/copy-prompt-button";
import { DemoFrame } from "@/components/demo-frame";
import { MotionVideoCard } from "@/components/motion-video";
import { pageContainerClass } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { VirtualMasonry } from "@/components/virtual-masonry";
import { ROUTES } from "@/constants/routes";
import type { MotionVideo } from "@/lib/motion-catalog";
import { DEFAULT_DIALS, fillTemplate } from "@/lib/prompt-customizer";
import { findPromptTemplate, templateVideos } from "@/lib/prompt-templates";
import type { PromptTemplate } from "@/lib/prompt-templates";
import { cn } from "@/lib/utils";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";

const routeApi = getRouteApi("/templates/$templateId/");

const sectionTitle = "text-xl font-semibold tracking-tight";
const promptBox =
  "bg-muted overflow-auto rounded-xl p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap";

/**
 * The first related video in the demo frame, playing. The caption says how
 * it was made: for a rewrite, with the original prompt rather than the
 * template.
 */
const Hero = ({
  template,
  video,
}: {
  template: PromptTemplate;
  video: MotionVideo;
}) => {
  const content = useIntlayer("templates-page");
  const ratio = video.width / video.height;
  const handle = (
    <Link
      to="/videos/$slug"
      params={{ slug: video.slug }}
      className="text-foreground underline underline-offset-4"
    >
      @{video.handle}
    </Link>
  );
  return (
    <div className="flex flex-col gap-2">
      {/* Capped at 70% of the viewport height, so tall videos stay on screen. */}
      <div
        className="mx-auto w-full"
        style={{ maxWidth: `min(100%, ${(70 * ratio).toFixed(2)}vh)` }}
      >
        <DemoFrame
          src={video.video}
          poster={video.poster}
          aspectRatio={ratio}
          autoplay="load"
        />
      </div>
      <p className="text-muted-foreground text-center text-xs">
        {template.original ? (
          <>
            {content.madeBy} {handle} {content.withOriginal}
          </>
        ) : (
          <>
            {content.relatedBy} {handle}
          </>
        )}
      </p>
    </div>
  );
};

const TemplateDetail = () => {
  const content = useIntlayer("templates-page");
  const { signedIn, templateId } = routeApi.useLoaderData();
  // The loader checked the id; templates hold functions, so they are looked
  // up here rather than passed through loader data.
  const template = findPromptTemplate(templateId);
  if (!template) {
    return null;
  }
  const videos = templateVideos(template);
  const [hero] = videos;
  const segments = fillTemplate(
    template.prompt,
    template.fields,
    {},
    DEFAULT_DIALS,
    template.dialSection
  );

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <main id="main-content" className="flex flex-1 flex-col gap-14 pb-16">
        <div
          className={cn(
            pageContainerClass("narrow"),
            "flex flex-col gap-10 pt-6"
          )}
        >
          <Link
            to={ROUTES.HOME}
            className="text-muted-foreground hover:text-foreground w-fit text-sm underline-offset-4 transition-colors hover:underline"
          >
            ← {content.back}
          </Link>

          {hero && <Hero template={template} video={hero} />}

          <header className="flex flex-col gap-3">
            <h1 className="text-4xl font-semibold tracking-tight text-balance">
              {template.title}
            </h1>
            <p className="text-muted-foreground text-pretty">
              {template.summary}
            </p>
          </header>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className={sectionTitle}>{content.templatePrompt}</h2>
              <CopyPromptButton
                text={segments.map((segment) => segment.text).join("")}
                analytics={{ from: "template", template: template.id }}
              />
            </div>
            <p className="text-muted-foreground text-sm">
              {content.fieldsHint}
            </p>
            <pre className={promptBox}>
              {segments.map((segment, index) => {
                const field = template.fields.find(
                  ({ key }) => key === segment.field
                );
                if (!field) {
                  // oxlint-disable-next-line react/no-array-index-key -- static text runs
                  return <span key={index}>{segment.text}</span>;
                }
                return (
                  <span
                    // oxlint-disable-next-line react/no-array-index-key -- a field can appear twice
                    key={index}
                    title={field.fallback}
                    className="bg-primary/25 text-foreground ring-primary/50 mx-px rounded px-1.5 py-px font-sans text-xs font-medium ring-1 ring-inset"
                  >
                    {field.label}
                  </span>
                );
              })}
            </pre>
            {/* The note sits beside the button at its 36px height: two short
              lines at most. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/templates/$templateId/customize"
                params={{ templateId: template.id }}
                data-track="template_customize"
                data-track-template={template.id}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-fit"
                )}
              >
                <Sparkles />
                {content.customize}
              </Link>
              <p className="text-muted-foreground text-xs leading-4 text-pretty sm:max-w-sm sm:text-right">
                {content.note}
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className={sectionTitle}>{content.improvements}</h2>
            <ul className="flex flex-col gap-3">
              {template.improvements.map((improvement) => (
                <li key={improvement} className="flex gap-3 text-pretty">
                  <Check className="text-primary mt-0.5 size-5 shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </section>

          {template.original && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className={sectionTitle}>{content.originalPrompt}</h2>
                <CopyPromptButton
                  text={template.original.prompt}
                  analytics={{
                    from: "template-original",
                    template: template.id,
                  }}
                />
              </div>
              <p className="text-muted-foreground text-sm">
                {template.original.label}.{" "}
                {videos.length > 0 && (
                  <>
                    {content.usedIn} {videos.length} {content.galleryVideos}
                  </>
                )}
              </p>
              <pre className={promptBox}>{template.original.prompt}</pre>
            </section>
          )}
        </div>

        {videos.length > 0 && (
          <section
            className={cn(pageContainerClass("full"), "flex flex-col gap-4")}
          >
            <h2 className={cn(sectionTitle, "flex items-baseline gap-2")}>
              {template.original ? content.madeWithOriginal : content.related}
              <span className="text-muted-foreground text-base font-normal tabular-nums">
                {videos.length}
              </span>
            </h2>
            <VirtualMasonry
              items={videos.map((video) => ({
                key: video.slug,
                aspectRatio: video.width / video.height,
                node: (
                  <MotionVideoCard
                    video={video}
                    paused={false}
                    open={false}
                    category={undefined}
                    search={{}}
                  />
                ),
              }))}
            />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/templates/$templateId/")({
  component: TemplateDetail,
  loader: async ({ params }) => {
    const template = findPromptTemplate(params.templateId);
    if (!template) {
      throw notFound();
    }
    const { signedIn } = await getLandingData();
    return { signedIn, templateId: template.id };
  },
  head: ({ params }) => {
    const template = findPromptTemplate(params.templateId);
    return createMetadata({
      canonical: `${ROUTES.TEMPLATES}/${params.templateId}`,
      ...(template && {
        description: template.summary,
        title: template.title,
      }),
    });
  },
});
