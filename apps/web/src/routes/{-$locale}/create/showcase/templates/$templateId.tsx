import {
  allParams,
  getTemplate,
  hasTemplate,
  SOCIAL_PRESETS,
  templatesIn,
} from "@motionvideo/engine";
import type { Aspect, TemplateDef } from "@motionvideo/engine";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import {
  SOCIAL_PRESET_IDS,
  TemplateGrid,
  TemplatePreview,
} from "@/components/create/showcase/template-card";
import { LocalizedLink as Link } from "@/components/localized-link";
import { PageMain } from "@/components/page";
import { SectionIcon } from "@/components/section-icon";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { findMove, movePath } from "@/lib/moves";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";

const sectionTitle = "text-xl font-semibold tracking-tight";

/**
 * Frame sizes that suit a template, from the device it shows: phones fill a
 * tall frame, browsers and laptops a wide one, plain cards work everywhere.
 * Every template adapts to any aspect; this is only a recommendation.
 */
const recommendedAspects = (template: TemplateDef): Aspect[] => {
  const frame = template.style?.cards?.frame;
  if (frame === "phone") {
    return ["9:16", "4:5", "1:1"];
  }
  if (frame === "browser" || frame === "laptop" || frame === "tablet") {
    return ["16:9", "4:3", "1:1"];
  }
  return ["16:9", "1:1", "9:16", "4:5"];
};

const TemplateDetail = () => {
  const content = useIntlayer("create-showcase-templates");
  const card = useIntlayer("showcase-template-card");
  const { templateId } = Route.useLoaderData();
  const template = getTemplate(templateId);
  const collection = card.collections[template.collection];
  const move = findMove(template.move);
  const related = templatesIn(template.collection).filter(
    (other) => other.id !== template.id
  );

  return (
    <>
      <SiteHeader />
      <PageMain layout="document" width="full">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <Link
            to={ROUTES.CREATE_SHOWCASE_TEMPLATES}
            className="text-muted-foreground hover:text-foreground w-fit text-sm underline-offset-4 transition-colors hover:underline"
          >
            ← {content.allTemplates}
          </Link>

          <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
            <div className="shadow-outline overflow-hidden rounded-xl">
              <TemplatePreview template={template} playing />
            </div>
            <div className="flex flex-col gap-5">
              <header className="flex flex-col gap-3">
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <SectionIcon section="showcase" className="size-4" />
                  <Link
                    to={ROUTES.CREATE_SHOWCASE_TEMPLATES}
                    hash={template.collection}
                    className="hover:text-foreground underline-offset-4 hover:underline"
                  >
                    {collection.name}
                  </Link>
                </p>
                <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight text-balance">
                  {template.name}
                  {template.tier === "pro" && (
                    <Badge variant="secondary">{card.pro}</Badge>
                  )}
                </h1>
                <p className="text-muted-foreground text-pretty">
                  {template.description || collection.blurb}
                </p>
              </header>
              <div className="flex flex-col gap-2">
                <Link
                  to={ROUTES.CREATE_SHOWCASE_EDITOR}
                  search={{ template: template.id }}
                  data-track="showcase_template_use"
                  data-track-template={template.id}
                  className={buttonVariants({
                    className: "self-start",
                    size: "xl",
                    variant: "gradient",
                  })}
                >
                  {content.useTemplate}
                  <ArrowRight aria-hidden="true" />
                </Link>
                <p className="text-muted-foreground text-xs">
                  {content.useNote}
                </p>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t pt-5 text-sm">
                <dt className="text-muted-foreground">{content.collection}</dt>
                <dd>{collection.name}</dd>
                <dt className="text-muted-foreground">{content.cards}</dt>
                <dd>
                  {content.cardsValue({
                    min: String(template.slots.min),
                    max: String(template.slots.max),
                    default: String(template.slots.default),
                  })}
                </dd>
                <dt className="text-muted-foreground">{content.loop}</dt>
                <dd>
                  {content.loopValue({
                    seconds: String(template.baseLoopSeconds),
                  })}
                </dd>
                <dt className="text-muted-foreground">{content.plan}</dt>
                <dd>{template.tier === "pro" ? content.proNote : card.free}</dd>
              </dl>
            </div>
          </section>

          <div className="grid gap-12 md:grid-cols-2">
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className={sectionTitle}>{content.aspects}</h2>
                <p className="text-muted-foreground text-sm">
                  {content.aspectsNote}
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm">
                {recommendedAspects(template).map((aspect) => (
                  <li key={aspect} className="flex items-baseline gap-3">
                    <span className="bg-secondary w-14 shrink-0 rounded-md px-2 py-0.5 text-center font-mono text-xs tabular-nums">
                      {aspect}
                    </span>
                    <span className="text-muted-foreground">
                      {SOCIAL_PRESET_IDS.filter(
                        (preset) => SOCIAL_PRESETS[preset].aspect === aspect
                      )
                        .map((preset) => card.presets[preset].value)
                        .join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className={sectionTitle}>{content.controls}</h2>
                <p className="text-muted-foreground text-sm">
                  {content.controlsNote}
                </p>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {allParams(template).map((param) => (
                  <li
                    key={param.key}
                    className="bg-secondary rounded-full px-3 py-1 text-sm"
                  >
                    {param.label}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {move && (
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className={sectionTitle}>{content.move}</h2>
                <p className="text-muted-foreground text-sm">
                  {content.moveNote}
                </p>
              </div>
              <Link
                to={movePath(move)}
                className="group bg-card shadow-outline hover:bg-muted/60 flex items-center gap-4 rounded-xl p-4 transition-colors"
              >
                <SectionIcon section="moves" className="size-5 shrink-0" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium">{move.name}</span>
                  <span className="text-muted-foreground line-clamp-2 text-sm">
                    {move.summary}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="text-muted-foreground group-hover:text-foreground ml-auto size-4 shrink-0 transition-colors"
                />
              </Link>
            </section>
          )}

          {related.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className={sectionTitle}>{content.related}</h2>
              <TemplateGrid templates={related} />
            </section>
          )}
        </div>
      </PageMain>
      <SiteFooter />
    </>
  );
};

// One page per template, for search: the loader only checks the id, since a
// template's layout function can't travel to the client as loader data.
export const Route = createFileRoute(
  "/{-$locale}/create/showcase/templates/$templateId"
)({
  component: TemplateDetail,
  loader: async ({ params }) => {
    if (!hasTemplate(params.templateId)) {
      throw notFound();
    }
    return { ...(await getLandingData()), templateId: params.templateId };
  },
  head: ({ loaderData, params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const copy = getIntlayer("create-showcase-templates", locale);
    if (!loaderData) {
      return createMetadata({ title: copy.metaTemplate });
    }
    const template = getTemplate(loaderData.templateId);
    return {
      ...createMetadata({
        title: `${template.name}: ${copy.metaTemplate}`,
        description: template.description || copy.metaTemplateDescription,
      }),
      scripts: [
        breadcrumbJsonLd(
          [
            {
              name: getIntlayer("create-hub", locale).title,
              path: ROUTES.CREATE,
            },
            {
              name: getIntlayer("site-header", locale).showcase,
              path: ROUTES.CREATE_SHOWCASE,
            },
            { name: copy.breadcrumb, path: ROUTES.CREATE_SHOWCASE_TEMPLATES },
            {
              name: template.name,
              path: `${ROUTES.CREATE_SHOWCASE_TEMPLATES}/${template.id}`,
            },
          ],
          locale
        ),
      ],
    };
  },
});
