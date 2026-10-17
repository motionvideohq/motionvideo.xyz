import { Link, createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { PageHeader, PageMain } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ROUTES } from "@/constants/routes";
import { PROMPT_TEMPLATES, templateVideos } from "@/lib/prompt-templates";
import type { PromptTemplate } from "@/lib/prompt-templates";
import { breadcrumbJsonLd, itemListJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";

const routeApi = getRouteApi("/templates/");

/** One template: the first related video's poster, title, summary, count. */
const TemplateCard = ({ template }: { template: PromptTemplate }) => {
  const content = useIntlayer("templates-page");
  const videos = templateVideos(template);
  const [cover] = videos;
  return (
    <li>
      <Link
        to="/templates/$templateId"
        params={{ templateId: template.id }}
        className="group bg-card shadow-outline hover:bg-muted/60 flex flex-col gap-4 overflow-hidden rounded-xl p-3 transition-colors sm:flex-row"
      >
        <span className="bg-muted aspect-video w-full shrink-0 overflow-hidden rounded-lg sm:w-56">
          {cover && (
            <img
              src={cover.poster}
              alt=""
              width={cover.width}
              height={cover.height}
              className="size-full object-cover"
            />
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-2 py-1 sm:pr-2">
          <span className="text-lg font-semibold tracking-tight">
            {template.title}
          </span>
          <span className="text-muted-foreground text-sm text-pretty">
            {template.summary}
          </span>
          <span className="text-muted-foreground mt-auto flex items-center gap-1.5 pt-1 text-xs">
            {videos.length > 0 && (
              <span>
                {videos.length} {content.relatedVideos}
              </span>
            )}
            <ArrowRight className="group-hover:text-foreground ml-auto size-4 transition-colors" />
          </span>
        </span>
      </Link>
    </li>
  );
};

const Templates = () => {
  const content = useIntlayer("templates-page");
  const { signedIn } = routeApi.useLoaderData();
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <PageMain width="narrow" className="gap-10">
        <PageHeader title={content.title.value} intro={content.intro} />
        <ul className="flex flex-col gap-4">
          {PROMPT_TEMPLATES.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </ul>
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/templates/")({
  component: Templates,
  loader: () => getLandingData(),
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.TEMPLATES,
      title: "Templates",
      description:
        "Prompt templates for AI motion videos, written by MotionVideo to be customized: a showreel, a launch film and a real-time 3D piece, with every part you would change as a field.",
    }),
    scripts: [
      breadcrumbJsonLd({ name: "Templates", path: ROUTES.TEMPLATES }),
      itemListJsonLd(
        "Prompt templates",
        PROMPT_TEMPLATES.map((template) => ({
          name: template.title,
          path: `${ROUTES.TEMPLATES}/${template.id}`,
        }))
      ),
    ],
  }),
});
