import type { ReactNode } from "react";
import type { IconComponent } from "reicon-react";

import { VirtualMasonry } from "@/components/virtual-masonry";
import type { MasonryItem } from "@/components/virtual-masonry";

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

/**
 * A quiet 16:9 tile in the grid that says a collection has nothing to show,
 * so the intro and the sponsored tile keep their places beside it.
 */
export const CollectionEmptyCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: IconComponent;
  title: ReactNode;
  description: ReactNode;
}) => (
  <div className="bg-muted/40 flex aspect-video flex-col justify-between rounded-xl p-4">
    <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-lg">
      <Icon aria-hidden="true" className="size-4" />
    </span>
    <span className="flex flex-col gap-0.5">
      <span className="font-medium">{title}</span>
      <span className="text-muted-foreground text-sm">{description}</span>
    </span>
  </div>
);
