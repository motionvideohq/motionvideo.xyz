export default function layoutMasonry<
  T extends { key: string; aspectRatio?: number },
>(
  items: T[],
  width: number,
  heights: Record<string, number>,
  gap?: number
): {
  placements: { item: T; lane: number; top: number; height: number }[];
  laneWidth: number;
  totalHeight: number;
};
