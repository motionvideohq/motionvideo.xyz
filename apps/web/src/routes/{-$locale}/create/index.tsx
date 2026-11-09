import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import {
  HERO_TEMPLATES,
  LivePreview,
} from "@/components/create/showcase/live-preview";
import { LocalizedLink as Link } from "@/components/localized-link";
import { HeroHeader, PageMain } from "@/components/page";
import { SectionIcon } from "@/components/section-icon";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";

// MotionVideo's own tools. One card per live tool; unbuilt tools get no card,
// only the line that more are coming.
const CreateHub = () => {
  const content = useIntlayer("create-hub");
  const header = useIntlayer("site-header");
  return (
    <>
      <SiteHeader />
      <PageMain layout="landing" width="full">
        <HeroHeader title={content.title} intro={content.intro} />
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <article className="bg-card shadow-outline grid gap-6 rounded-2xl p-3 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-8">
            <LivePreview templates={HERO_TEMPLATES} chips={false} />
            <div className="flex flex-col gap-4 p-3 md:pr-6">
              <div className="flex items-center gap-2.5">
                <SectionIcon section="showcase" className="size-5" />
                <h2 className="text-2xl font-semibold tracking-tight">
                  <Link
                    to={ROUTES.CREATE_SHOWCASE}
                    className="underline-offset-4 hover:underline"
                  >
                    {header.showcase}
                  </Link>
                </h2>
                <Badge variant="secondary">{content.freeAndPro}</Badge>
              </div>
              <p className="text-muted-foreground text-pretty">
                {content.showcasePitch}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={ROUTES.CREATE_SHOWCASE_EDITOR}
                  data-track="showcase_open_editor"
                  data-track-from="hub"
                  className={buttonVariants({
                    size: "lg",
                    variant: "gradient",
                  })}
                >
                  {content.openEditor}
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link
                  to={ROUTES.CREATE_SHOWCASE}
                  className={buttonVariants({ size: "lg", variant: "outline" })}
                >
                  {content.learnMore}
                </Link>
              </div>
            </div>
          </article>
          <p className="text-muted-foreground text-center text-sm">
            {content.more}{" "}
            <Link
              to={ROUTES.CREATE_PROJECTS}
              className="text-foreground underline underline-offset-4"
            >
              {content.projects}
            </Link>
          </p>
        </section>
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/create/")({
  component: CreateHub,
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const copy = getIntlayer("create-hub", locale);
    return {
      ...createMetadata({ title: copy.metaTitle, description: copy.intro }),
      scripts: [
        breadcrumbJsonLd({ name: copy.title, path: ROUTES.CREATE }, locale),
      ],
    };
  },
  loader: () => getLandingData(),
});
