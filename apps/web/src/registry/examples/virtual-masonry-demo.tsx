import { VirtualMasonry } from "@/registry/components/virtual-masonry";
import type { MasonryItem } from "@/registry/components/virtual-masonry";

// Cards of fixed ratios, so the grid sizes them without measuring, for the
// masonry's page on /design/components. Each card draws its own ratio; the
// grid only sets the lane's width.
const RATIOS = [16 / 9, 4 / 5, 1, 3 / 2, 4 / 3, 16 / 9, 1, 3 / 2];

const ITEMS: MasonryItem[] = RATIOS.map((aspectRatio, index) => ({
  aspectRatio,
  key: String(index),
  node: (
    <div
      className="bg-muted text-muted-foreground flex w-full items-center justify-center rounded-xl text-sm tabular-nums"
      style={{ aspectRatio }}
    >
      {index + 1}
    </div>
  ),
}));

export const VirtualMasonryDemo = () => <VirtualMasonry items={ITEMS} />;
