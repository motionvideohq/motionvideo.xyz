import type { MDXComponents } from "mdx/types";

import { ComponentPreview } from "@/components/design/component-preview";
import { foundationMdxComponents } from "@/components/design/foundation-specimens";
import { landingMdxComponents } from "@/components/design/landing-content";
import {
  DocsTab,
  DocsTabs,
  docsMdxComponents,
} from "@/components/docs/mdx-components";

export const designMdxComponents = {
  ...docsMdxComponents,
  ...foundationMdxComponents,
  ...landingMdxComponents,
  ComponentPreview,
  DocsTab,
  DocsTabs,
} satisfies MDXComponents;
