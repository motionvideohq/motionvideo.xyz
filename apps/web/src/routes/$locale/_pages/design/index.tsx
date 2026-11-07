import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { LocalizedLink as Link } from "@/components/localized-link";
import { Logomark } from "@/components/logo";
import { PageHeader } from "@/components/page";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/registry/ui/button";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

// The design hub: the brand guidelines and the component registry, each a
// card with a glimpse of what's behind it.

const cardClass =
  "group shadow-outline hover:bg-muted/40 flex flex-col overflow-hidden rounded-xl transition-colors";

const Design = () => {
  const content = useIntlayer("design");
  const sections = useIntlayer("site-footer");
  return (
    <>
      <PageHeader title={sections.design.value} intro={content.intro.value} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to={ROUTES.DESIGN_BRAND} className={cardClass}>
          <div
            aria-hidden="true"
            className="bg-muted/50 flex aspect-video items-center justify-center"
          >
            <Logomark className="text-foreground h-10 w-auto" />
          </div>
          <Card
            title={sections.brand.value}
            description={content.brandDescription.value}
          />
        </Link>
        <Link to={ROUTES.DESIGN_COMPONENTS} className={cardClass}>
          {/* inert: a picture of the button, not a control. */}
          <div
            aria-hidden="true"
            inert
            className="bg-muted/50 flex aspect-video items-center justify-center gap-2"
          >
            <Button variant="gradient" size="lg">
              Get Pro
            </Button>
            <Button variant="outline" size="lg">
              Outline
            </Button>
          </div>
          <Card
            title={content.components.value}
            description={content.componentsDescription.value}
          />
        </Link>
      </div>
    </>
  );
};

const Card = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col gap-1 p-4">
    <span className="text-foreground flex items-center gap-1 font-medium">
      {title}
      <ArrowRight
        aria-hidden="true"
        className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </span>
    <span className="text-sm">{description}</span>
  </div>
);

export const Route = createFileRoute("/$locale/_pages/design/")({
  component: Design,
  head: ({ params }) => {
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).design;
    return {
      ...createMetadata({
        description: meta.description,
        title: meta.title,
      }),
      scripts: [
        breadcrumbJsonLd(
          { page: "design", path: ROUTES.DESIGN },
          params.locale
        ),
      ],
    };
  },
});
