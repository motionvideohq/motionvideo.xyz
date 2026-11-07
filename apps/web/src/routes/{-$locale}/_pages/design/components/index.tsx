import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { LocalizedLink as Link } from "@/components/localized-link";
import { PageHeader } from "@/components/page";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { DESIGN_COMPONENT_PAGES } from "@/lib/design-components";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

// Every registry component, linking to its page (live preview, install
// command, usage and props).
const DesignComponents = () => {
  const content = useIntlayer("design");
  return (
    <>
      <PageHeader
        title={content.components.value}
        intro={content.componentsIntro.value}
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {DESIGN_COMPONENT_PAGES.map((page) => (
          <li key={page.url} className="flex">
            <Link
              to={ROUTES.DESIGN_COMPONENT}
              params={{ slug: page.slugs.join("/") }}
              className="group shadow-outline hover:bg-muted/40 flex w-full flex-col gap-1 rounded-xl p-4 transition-colors"
            >
              <span className="text-foreground flex items-center gap-1 font-medium">
                {page.data.title}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </span>
              <span className="text-sm text-pretty">
                {page.data.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/_pages/design/components/")({
  component: DesignComponents,
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const meta = getIntlayer("directory-meta", locale).designComponents;
    return {
      ...createMetadata({
        description: meta.description,
        title: meta.title,
      }),
      scripts: [
        breadcrumbJsonLd(
          [
            { page: "design", path: ROUTES.DESIGN },
            { name: meta.title, path: ROUTES.DESIGN_COMPONENTS },
          ],
          params.locale
        ),
      ],
    };
  },
});
