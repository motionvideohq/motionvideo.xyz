import { notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { use } from "react";
import type { ReactNode } from "react";

import { DesignArticle } from "@/components/design/design-layout";
import { designMdxComponents } from "@/components/design/design-mdx-components";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES, docsMarkdownPath } from "@/constants/routes";
import { absoluteUrl } from "@/constants/url";
import { findDesignPage } from "@/lib/design";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import type { BreadcrumbItem } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

export const loadDesignPage = async (slugs: string[]) => {
  const page = findDesignPage(slugs);
  if (!page) {
    throw notFound();
  }
  await page.data.preload();
  return { slugs };
};

export const DesignPage = ({
  slugs,
  actions,
  eyebrow,
}: {
  slugs: string[];
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) => {
  const page = findDesignPage(slugs);
  if (!page) {
    throw notFound();
  }
  const { toc } = use(page.data.load());
  const Body = page.data.body;
  return (
    <DesignArticle
      title={page.data.title}
      description={page.data.description}
      toc={toc}
      url={page.url}
      source={`content/design/${page.path}`}
      lang="en"
      wide={page.data.wide}
      actions={actions}
      eyebrow={eyebrow}
    >
      <Body components={designMdxComponents} />
    </DesignArticle>
  );
};

export const designHead = (slugs: string[], localeInput?: string) => {
  const page = findDesignPage(slugs);
  if (!page) {
    return createMetadata({ title: "Design page not found" });
  }
  const locale = isLocale(localeInput) ? localeInput : DEFAULT_LOCALE;
  const breadcrumbs: BreadcrumbItem[] = [
    { page: "design", path: ROUTES.DESIGN },
  ];
  if (slugs[0] === "components" && slugs.length > 1) {
    breadcrumbs.push({
      name: getIntlayer("directory-meta", locale).designComponents.title,
      path: ROUTES.DESIGN_COMPONENTS,
    });
  }
  if (slugs.length > 0) {
    breadcrumbs.push({
      name: page.data.title,
      path: page.url,
    });
  }
  return {
    ...createMetadata({
      title: page.data.title,
      description: page.data.description,
    }),
    links: [
      {
        rel: "alternate",
        type: "text/markdown",
        href: absoluteUrl(docsMarkdownPath(page.url)),
      },
    ],
    scripts: [breadcrumbJsonLd(breadcrumbs, localeInput)],
  };
};
