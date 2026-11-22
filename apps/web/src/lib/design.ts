import { loader } from "fumadocs-core/source";
import { defineCollections } from "fumadocs-mdx/macro";
import { z } from "zod";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";

import registry from "../../registry.json";

// One collection for every design article. MDX owns the page content and
// headings; visual and interactive specimens are supplied by the renderer.
const pages = defineCollections({
  async: true,
  dir: "content/design",
  postprocess: { includeProcessedMarkdown: true },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    wide: z.boolean().optional(),
  }),
  type: "doc",
});

export const designSource = loader({
  baseUrl: ROUTES.DESIGN,
  source: pages.toFumadocsSource(),
});

/** An article from the design MDX collection. */
export type DesignPage = (typeof designSource)["$inferPage"];

export const findDesignPage = (slugs: string[]) => designSource.getPage(slugs);

const FOUNDATION_SLUGS = [
  "colors",
  "typography",
  "materials",
  "motion",
] as const;
export type DesignFoundationSlug = (typeof FOUNDATION_SLUGS)[number];

export const DESIGN_FOUNDATIONS = FOUNDATION_SLUGS.flatMap((slug) => {
  const page = findDesignPage([slug]);
  return page
    ? [
        {
          slug,
          title: page.data.title,
          description: page.data.description,
          url: page.url,
        },
      ]
    : [];
});

/** Only components published by our registry, in registry order. */
export const DESIGN_COMPONENT_PAGES = registry.items.flatMap((item) => {
  const page = findDesignPage(["components", item.name]);
  return page ? [page] : [];
});

/** The first source file of a registry item, on GitHub. */
export const registrySourceUrl = (name: string) => {
  const file = registry.items.find((item) => item.name === name)?.files[0];
  return file
    ? `${LINK.GITHUB_REPO}/blob/main/apps/web/${file.path}`
    : LINK.GITHUB_REPO;
};
