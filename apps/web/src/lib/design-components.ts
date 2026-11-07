import { loader } from "fumadocs-core/source";
import { defineCollections } from "fumadocs-mdx/macro";
import { z } from "zod";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";

import registry from "../../registry.json";

// The component registry's pages, /design/components/<name>: one MDX file
// per registry item in content/design/components, named after the item in
// registry.json (the shadcn CLI's source, built to /r/<name>.json). Written
// in English in every locale, like the blog; only the chrome is translated.
// Besides Markdown, a page can use <ComponentPreview name="…" /> and the docs'
// <DocsTabs>/<DocsTab> (src/components/design/component-content.tsx).
//
// `async`: only the frontmatter ships with the bundle, so the index lists
// every component without loading their bodies; a page preloads its own.
const pages = defineCollections({
  async: true,
  dir: "content/design/components",
  schema: z.object({
    title: z.string(),
    /** One or two sentences for the index, the page and its meta description. */
    description: z.string(),
  }),
  type: "doc",
});

export const designComponents = loader({
  baseUrl: ROUTES.DESIGN_COMPONENTS,
  source: pages.toFumadocsSource(),
});

/** Every component page, in registry.json's order. */
export const DESIGN_COMPONENT_PAGES = registry.items.flatMap((item) => {
  const page = designComponents.getPage([item.name]);
  return page ? [page] : [];
});

export const findDesignComponent = (slug: string | undefined) =>
  slug ? designComponents.getPage([slug]) : undefined;

/** The first source file of a registry item, on GitHub. */
export const registrySourceUrl = (name: string) => {
  const file = registry.items.find((item) => item.name === name)?.files[0];
  return file
    ? `${LINK.GITHUB_REPO}/blob/main/apps/web/${file.path}`
    : LINK.GITHUB_REPO;
};
