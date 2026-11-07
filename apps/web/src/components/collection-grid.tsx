import type { ReactNode } from "react";
import type { IconComponent } from "reicon-react";

import { VirtualMasonry } from "@/registry/components/virtual-masonry";
import type { MasonryItem } from "@/registry/components/virtual-masonry";

/**
 * The masonry grid section shared by the gallery and the resource
 * directories, including its max-width container.
 */
export const CollectionGrid = ({
  items,
  emptyState,
}: {
  items: MasonryItem[];
  emptyState?: ReactNode;
}) => (
  <main
    id="main-content"
    className="mx-auto w-full max-w-[1800px] px-4 pt-2.5 pb-16 sm:px-6"
  >
    <VirtualMasonry items={items} />
    {emptyState}
  </main>
);

/** Centered empty state shown when a collection has no matching items. */
export const CollectionEmptyState = ({
  icon: Icon,
  title,
  description,
}: {
  icon: IconComponent;
  title: ReactNode;
  description: ReactNode;
}) => (
  <div className="bg-muted/40 flex flex-col items-center gap-2 rounded-2xl py-14 text-center">
    <Icon className="text-muted-foreground size-7" aria-hidden="true" />
    <h2 className="font-medium">{title}</h2>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);
