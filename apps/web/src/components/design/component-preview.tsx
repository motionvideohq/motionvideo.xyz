import type { ComponentType } from "react";

import { ButtonDemo } from "@/registry/examples/button-demo";
import { VirtualMasonryDemo } from "@/registry/examples/virtual-masonry-demo";

// Live component specimens shared by the MDX design articles.

const DEMOS = {
  button: ButtonDemo,
  "virtual-masonry": VirtualMasonryDemo,
} satisfies Record<string, ComponentType>;

/**
 * Live registry demos inside the documentation's gridded preview stage.
 * `data-component-preview` keeps the masonry's page blur out of the demo.
 */
export const ComponentPreview = ({ name }: { name: keyof typeof DEMOS }) => {
  const Demo = DEMOS[name];
  return (
    <div
      data-component-preview
      className="border-border bg-background overflow-hidden rounded-xl border"
    >
      <div className="border-border text-muted-foreground flex items-center justify-between gap-4 border-b px-4 py-3 font-mono text-xs">
        <span>Preview</span>
        <span className="truncate">{name}</span>
      </div>
      <div className="bg-muted/15 relative isolate flex min-h-80 items-center justify-center p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-35"
        />
        <div className="flex w-full min-w-0 justify-center">
          <Demo />
        </div>
      </div>
    </div>
  );
};
