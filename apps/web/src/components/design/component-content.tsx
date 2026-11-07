import type { MDXComponents } from "mdx/types";
import type { ComponentType, ReactNode } from "react";

import {
  DocsTab,
  DocsTabs,
  docsMdxComponents,
} from "@/components/docs/mdx-components";
import { ButtonDemo } from "@/registry/examples/button-demo";
import { MagneticDropzoneDemo } from "@/registry/examples/magnetic-dropzone-demo";
import { VirtualMasonryDemo } from "@/registry/examples/virtual-masonry-demo";

// The body of a component page on /design/components: the docs' Markdown
// styles (headings, code blocks with copy, tables), tabs for install
// commands, and the component running live.

const DEMOS = {
  button: ButtonDemo,
  "magnetic-dropzone": MagneticDropzoneDemo,
  "virtual-masonry": VirtualMasonryDemo,
} satisfies Record<string, ComponentType>;

/**
 * `<ComponentPreview name="button" />`: the item's demo
 * (src/registry/examples) on a plain stage. `data-component-preview` keeps
 * page chrome keyed on the component (the masonry's page blur) out of it.
 */
const ComponentPreview = ({ name }: { name: keyof typeof DEMOS }) => {
  const Demo = DEMOS[name];
  return (
    <div
      data-component-preview
      className="shadow-outline bg-background flex min-h-64 items-center justify-center rounded-xl p-6 sm:p-10"
    >
      <div className="flex w-full justify-center">
        <Demo />
      </div>
    </div>
  );
};

const components: MDXComponents = {
  ...docsMdxComponents,
  ComponentPreview,
  DocsTab,
  DocsTabs,
};

/** A component page's compiled MDX body. */
export const ComponentContent = ({
  Body,
}: {
  Body: (props: { components?: MDXComponents }) => ReactNode;
}) => (
  <div className="text-muted-foreground flex min-w-0 flex-col gap-5 leading-7">
    <Body components={components} />
  </div>
);
