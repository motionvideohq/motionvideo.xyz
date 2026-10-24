import { Link, createFileRoute } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { PageHeader, PageMain } from "@/components/page";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import type { PromptTemplate } from "@/lib/prompt-templates";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getTemplateCovers } from "@/server/template-functions";
import type { TemplateCover } from "@/server/template-functions";

/** One template: its first gallery example's poster, name, summary, fields. */
const TemplateCard = ({
  template,
  cover,
}: {
  template: PromptTemplate;
  cover: TemplateCover | undefined;
}) => {
  const content = useIntlayer("templates-page");
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
              loading="lazy"
              className="size-full object-cover"
            />
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-2 py-1 sm:pr-2">
          <span className="text-lg font-semibold tracking-tight">
            {template.name}
          </span>
          <span className="text-muted-foreground text-sm text-pretty">
            {template.summary}
          </span>
          <span className="text-muted-foreground mt-auto flex items-center gap-1.5 pt-1 text-xs">
            {template.fields.length} {content.fieldCount}
            <ArrowRight
              aria-hidden="true"
              className="group-hover:text-foreground ml-auto size-4 transition-colors"
            />
          </span>
        </span>
      </Link>
    </li>
  );
};

const Templates = () => {
  const content = useIntlayer("templates-page");
  const locked = useIntlayer("locked-prompt");
  const { covers } = Route.useLoaderData();
  return (
    <PageMain width="narrow" className="gap-10">
      <div className="flex flex-col gap-5">
        <PageHeader title={content.title.value} intro={content.intro} />
        <p className="text-muted-foreground text-sm">{content.proNote}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            to={ROUTES.PRO}
            data-track="templates_unlock"
            data-track-template="list"
            className={buttonVariants({ variant: "gradient", size: "lg" })}
          >
            {locked.unlock}
          </Link>
          {/* ROUTES.DOCS_TEMPLATES, through the docs' catch-all route. */}
          <Link
            to="/docs/$"
            params={{ _splat: "templates" }}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {content.howToUse}
          </Link>
        </div>
      </div>
      <ul className="flex flex-col gap-4">
        {PROMPT_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            cover={covers[template.id]}
          />
        ))}
      </ul>
    </PageMain>
  );
};

export const Route = createFileRoute("/templates/")({
  component: Templates,
  loader: async () => ({ covers: await getTemplateCovers() }),
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.TEMPLATES,
      title: "Prompt templates",
      description:
        "Tested prompt structures for AI motion videos, with every part you would change as a field. The full prompts and the customizer are in MotionVideo Pro.",
    }),
    scripts: [breadcrumbJsonLd({ name: "Templates", path: ROUTES.TEMPLATES })],
  }),
});
