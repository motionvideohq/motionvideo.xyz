import { COLLECTIONS, templatesIn } from "@motionvideo/engine";
import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { TemplateGrid } from "@/components/create/showcase/template-card";
import { LocalizedLink as Link } from "@/components/localized-link";
import { PageHeader, PageMain } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";

const ShowcaseTemplates = () => {
  const content = useIntlayer("create-showcase-templates");
  const card = useIntlayer("showcase-template-card");
  return (
    <>
      <SiteHeader />
      <PageMain layout="document" width="full" className="gap-14">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-14">
          <div className="flex flex-col gap-5">
            <PageHeader title={content.title.value} intro={content.intro} />
            <div className="flex flex-wrap gap-2">
              <Link
                to={ROUTES.CREATE_SHOWCASE_EDITOR}
                data-track="showcase_open_editor"
                data-track-from="templates"
                className={buttonVariants({ size: "lg", variant: "gradient" })}
              >
                {content.openEditor}
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                to={ROUTES.CREATE_SHOWCASE}
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                {content.aboutShowcase}
              </Link>
            </div>
          </div>
          {COLLECTIONS.map((collection) => (
            <section
              key={collection}
              id={collection}
              aria-labelledby={`${collection}-title`}
              className="flex scroll-mt-8 flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <h2
                  id={`${collection}-title`}
                  className="text-xl font-semibold tracking-tight"
                >
                  {card.collections[collection].name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {card.collections[collection].blurb}
                </p>
              </div>
              <TemplateGrid templates={templatesIn(collection)} />
            </section>
          ))}
        </div>
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/create/showcase/templates/")({
  component: ShowcaseTemplates,
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const copy = getIntlayer("create-showcase-templates", locale);
    return {
      ...createMetadata({
        title: copy.title,
        description: copy.metaDescription,
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
          ],
          locale
        ),
      ],
    };
  },
  loader: () => getLandingData(),
});
