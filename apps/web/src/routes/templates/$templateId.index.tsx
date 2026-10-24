import {
  Link,
  createFileRoute,
  getRouteApi,
  notFound,
} from "@tanstack/react-router";
import { useId } from "react";
import { useIntlayer } from "react-intlayer";
import { Check } from "reicon-react/icons/Check";
import { Sliders } from "reicon-react/icons/Sliders";

import { CopyPromptButton } from "@/components/copy-prompt-button";
import { LockedPrompt } from "@/components/locked-prompt";
import { MotionVideoCard } from "@/components/motion-video";
import { pageContainerClass } from "@/components/page";
import { buttonVariants } from "@/components/ui/button";
import { VirtualMasonry } from "@/components/virtual-masonry";
import { ROUTES } from "@/constants/routes";
import type { MotionVideo } from "@/lib/motion-catalog";
import { DEFAULT_DIALS, fillTemplate } from "@/lib/prompt-customizer";
import { findPromptTemplate, templatePath } from "@/lib/prompt-templates";
import type { PromptTemplate } from "@/lib/prompt-templates";
import { cn } from "@/lib/utils";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import {
  getTemplatePrompt,
  getTemplateVideos,
} from "@/server/template-functions";

const layoutApi = getRouteApi("/templates");

const sectionTitle = "text-xl font-semibold tracking-tight";
const promptBox =
  "bg-muted overflow-auto rounded-xl p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap";
const link = "text-foreground underline underline-offset-4";

/** Pro: the prompt with its fields at their defaults, Copy and Customize. */
const PromptSection = ({
  template,
  prompt,
}: {
  template: PromptTemplate;
  prompt: string;
}) => {
  const content = useIntlayer("templates-page");
  const segments = fillTemplate(
    prompt,
    template.fields,
    {},
    DEFAULT_DIALS,
    template.dialSection
  );
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/templates/$templateId/customize"
          params={{ templateId: template.id }}
          data-track="template_customize_click"
          data-track-template={template.id}
          className={buttonVariants({ variant: "gradient" })}
        >
          <Sliders aria-hidden="true" />
          {content.customize}
        </Link>
        <CopyPromptButton
          prompt={segments.map((segment) => segment.text).join("")}
          analytics={{ from: "template", template: template.id }}
        />
      </div>
      <pre className={promptBox}>
        {segments.map((segment) =>
          segment.mark ? (
            <mark
              key={segment.key}
              className="bg-primary/20 text-foreground rounded-sm"
            >
              {segment.text}
            </mark>
          ) : (
            <span key={segment.key}>{segment.text}</span>
          )
        )}
      </pre>
      <p className="text-muted-foreground text-xs text-pretty">
        {content.promptNote}
      </p>
    </>
  );
};

/** Credit to the gallery prompt a template grew from, with that prompt. */
const Inspiration = ({ source }: { source: MotionVideo }) => {
  const content = useIntlayer("templates-page");
  return (
    <section className="flex flex-col gap-4">
      <h2 className={sectionTitle}>{content.originalPrompt}</h2>
      <p className="text-muted-foreground text-sm text-pretty">
        {content.inspiredBy}{" "}
        <Link
          to="/videos/$slug"
          params={{ slug: source.slug }}
          data-track="template_source_click"
          data-track-slug={source.slug}
          className={link}
        >
          {source.creatorName ?? `@${source.handle}`}
        </Link>
        . {content.ownWords}
      </p>
      {source.prompt && <pre className={promptBox}>{source.prompt}</pre>}
    </section>
  );
};

const TemplateDetail = () => {
  const content = useIntlayer("templates-page");
  const { signedIn } = layoutApi.useLoaderData();
  const { template, prompt, examples, source } = Route.useLoaderData();
  const promptId = useId();

  return (
    <main id="main-content" className="flex flex-1 flex-col gap-14 pt-6 pb-16">
      <div className={cn(pageContainerClass("narrow"), "flex flex-col gap-10")}>
        <Link
          to={ROUTES.TEMPLATES}
          className="text-muted-foreground hover:text-foreground w-fit text-sm underline-offset-4 transition-colors hover:underline"
        >
          ← {content.allTemplates}
        </Link>

        <header className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            {template.name}
          </h1>
          <p className="text-muted-foreground text-pretty">
            {template.summary}
          </p>
        </header>

        <section aria-labelledby={promptId} className="flex flex-col gap-4">
          <h2 id={promptId} className={sectionTitle}>
            {content.prompt}
          </h2>
          {prompt.locked ? (
            <LockedPrompt
              title={content.lockedTitle}
              body={content.lockedBody}
              signInReason={content.signInReason}
              signedIn={signedIn}
              redirect={templatePath(template)}
              track={{
                "data-track": "templates_unlock",
                "data-track-template": template.id,
              }}
            />
          ) : (
            <PromptSection template={template} prompt={prompt.prompt} />
          )}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className={sectionTitle}>{content.improvements}</h2>
          <ul className="flex flex-col gap-3">
            {template.improvements.map((improvement) => (
              <li key={improvement} className="flex gap-3 text-pretty">
                <Check
                  aria-hidden="true"
                  className="text-primary mt-0.5 size-5 shrink-0"
                />
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className={sectionTitle}>{content.structure}</h2>
            <p className="text-muted-foreground text-sm">
              {content.structureNote}
            </p>
          </div>
          <ol className="flex flex-col gap-2">
            {template.outline.map((section) => (
              <li
                key={section.name}
                className="flex flex-col gap-0.5 text-sm sm:flex-row sm:gap-3"
              >
                <code className="text-muted-foreground shrink-0 font-mono text-xs leading-5 sm:w-36">
                  {`<${section.name}>`}
                </code>
                <span className="text-pretty">{section.covers}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className={sectionTitle}>{content.fields}</h2>
            <p className="text-muted-foreground text-sm">
              {content.fieldsNote}
            </p>
          </div>
          <dl className="flex flex-col gap-3">
            {template.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-0.5 text-sm">
                <dt className="font-medium">{field.label}</dt>
                <dd className="text-muted-foreground text-pretty">
                  {field.hint} {content.defaultValue} {field.placeholder}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {source && <Inspiration source={source} />}
      </div>

      {examples.length > 0 && (
        <section
          className={cn(pageContainerClass("full"), "flex flex-col gap-4")}
        >
          <h2 className={cn(sectionTitle, "flex items-baseline gap-2")}>
            {source ? content.madeWithOriginal : content.related}
            <span className="text-muted-foreground text-base font-normal tabular-nums">
              {examples.length}
            </span>
          </h2>
          <VirtualMasonry
            items={examples.map((video) => ({
              key: video.slug,
              aspectRatio: video.width / video.height,
              node: (
                <MotionVideoCard
                  video={video}
                  paused={false}
                  open={false}
                  scope={undefined}
                  search={{}}
                />
              ),
            }))}
          />
        </section>
      )}
    </main>
  );
};

// A template's public page: everything but the prompt for everyone, the
// prompt (with Copy and Customize) for Pro.
export const Route = createFileRoute("/templates/$templateId/")({
  component: TemplateDetail,
  loader: async ({ params }) => {
    const template = findPromptTemplate(params.templateId);
    if (!template) {
      throw notFound();
    }
    const [prompt, videos] = await Promise.all([
      getTemplatePrompt({ data: { id: template.id } }),
      getTemplateVideos({ data: { id: template.id } }),
    ]);
    return { template, prompt, ...videos };
  },
  head: ({ loaderData, params }) => {
    const path = `${ROUTES.TEMPLATES}/${params.templateId}`;
    return {
      ...createMetadata({
        canonical: path,
        title: loaderData?.template.name ?? "Template",
        description: loaderData?.template.summary,
      }),
      scripts: loaderData
        ? [
            breadcrumbJsonLd(
              { name: "Templates", path: ROUTES.TEMPLATES },
              { name: loaderData.template.name, path }
            ),
          ]
        : [],
    };
  },
});
