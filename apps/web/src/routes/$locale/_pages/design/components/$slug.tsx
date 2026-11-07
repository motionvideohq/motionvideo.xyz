import { createFileRoute, notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { ArrowLeft } from "reicon-react/icons/ArrowLeft";

import { ComponentContent } from "@/components/design/component-content";
import { GitHubIcon } from "@/components/icons";
import { LocalizedLink as Link } from "@/components/localized-link";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import {
  findDesignComponent,
  registrySourceUrl,
} from "@/lib/design-components";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/ui/button";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

// One registry component: its live preview, install command, usage and
// props, from content/design/components/<slug>.mdx.
const DesignComponent = () => {
  const { slug } = Route.useLoaderData();
  const content = useIntlayer("design");
  // The loader already threw notFound() for unknown slugs.
  const page = findDesignComponent(slug);
  if (!page) {
    return null;
  }
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Link
          to={ROUTES.DESIGN_COMPONENTS}
          className={cn(
            buttonVariants({ variant: "subtle", size: "sm" }),
            "-ml-2.5 self-start"
          )}
        >
          <ArrowLeft data-icon="inline-start" />
          {content.allComponents}
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          {page.data.title}
        </h1>
        <p className="text-muted-foreground text-lg text-pretty">
          {page.data.description}
        </p>
        <a
          href={registrySourceUrl(slug)}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "self-start"
          )}
        >
          <GitHubIcon data-icon="inline-start" />
          {content.viewSource}
        </a>
      </header>
      <ComponentContent Body={page.data.body} />
    </article>
  );
};

export const Route = createFileRoute("/$locale/_pages/design/components/$slug")(
  {
    component: DesignComponent,
    // Bodies load lazily (`async` in src/lib/design-components.ts); fetch this
    // one before rendering so the page never suspends.
    loader: async ({ params }) => {
      const page = findDesignComponent(params.slug);
      if (!page) {
        throw notFound();
      }
      await page.data.preload();
      return { slug: params.slug };
    },
    head: ({ params }) => {
      const page = findDesignComponent(params.slug);
      if (!page) {
        return createMetadata({ title: "Component not found" });
      }
      const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
      return {
        ...createMetadata({
          description: page.data.description,
          title: page.data.title,
        }),
        scripts: [
          breadcrumbJsonLd(
            [
              { page: "design", path: ROUTES.DESIGN },
              {
                name: getIntlayer("directory-meta", locale).designComponents
                  .title,
                path: ROUTES.DESIGN_COMPONENTS,
              },
              { name: page.data.title, path: page.url },
            ],
            params.locale
          ),
        ],
      };
    },
  }
);
