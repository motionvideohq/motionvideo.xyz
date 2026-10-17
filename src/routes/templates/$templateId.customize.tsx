import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import { DemoFrame } from "@/components/demo-frame";
import { PageMain } from "@/components/page";
import { PromptCustomizer } from "@/components/prompt-customizer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ROUTES } from "@/constants/routes";
import { findPromptTemplate, templateVideos } from "@/lib/prompt-templates";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";

const CustomizeTemplate = () => {
  const content = useIntlayer("customize-page");
  const { signedIn, templateId } = Route.useLoaderData();
  // The loader checked the id; templates hold functions, so they are looked
  // up here rather than passed through loader data.
  const template = findPromptTemplate(templateId);
  if (!template) {
    return null;
  }
  const [example] = templateVideos(template);

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <PageMain width="full" className="gap-8">
        <Link
          to="/templates/$templateId"
          params={{ templateId: template.id }}
          className="text-muted-foreground hover:text-foreground w-fit text-sm underline-offset-4 transition-colors hover:underline"
        >
          ← {template.title}
        </Link>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* No video has been made with a template yet: the visual is the
              closest gallery video, and the caption says how it was made. */}
          {example && (
            <div
              className="flex max-w-full shrink-0 flex-col gap-1.5"
              style={{
                width: `${((9 * example.width) / example.height).toFixed(2)}rem`,
              }}
            >
              <DemoFrame
                src={example.video}
                poster={example.poster}
                aspectRatio={example.width / example.height}
                autoplay="load"
              />
              <p className="text-muted-foreground text-xs text-pretty">
                {template.original ? (
                  <>
                    {content.madeBy} @{example.handle} {content.withOriginal}
                  </>
                ) : (
                  <>
                    {content.relatedBy} @{example.handle}
                    {content.withOwnPrompt}
                  </>
                )}
              </p>
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              {content.customizeTitle} {template.title}
            </h1>
            <p className="text-muted-foreground text-sm text-pretty">
              {template.summary}
            </p>
          </div>
        </header>

        <PromptCustomizer template={template} />
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/templates/$templateId/customize")({
  component: CustomizeTemplate,
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
      canonical: `${ROUTES.TEMPLATES}/${params.templateId}/customize`,
      ...(template && {
        description: `Fill in ${template.title.replace(/^The /u, "the ")}: your details go straight into the prompt, and three dials set creativity, pace and polish.`,
        title: `Customize: ${template.title}`,
      }),
    });
  },
});
