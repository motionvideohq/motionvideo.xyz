import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface MasonryItem {
  key: string;
  /** width / height of fixed-ratio media; omit to measure the rendered item. */
  aspectRatio?: number;
  node: ReactNode;
}

interface Placement {
  item: MasonryItem;
  lane: number;
  top: number;
  height: number;
}

const GAP = 12;
const FALLBACK_HEIGHT = 380;
// Extra pixels mounted above and below the viewport.
const OVERSCAN = 900;
// Columns are added at these container widths (px): 1 → 5 lanes.
const LANE_BREAKPOINTS = [560, 900, 1200, 1600];
// Server render and first client render agree on a typical desktop layout.
const INITIAL_WIDTH = 1280;
const INITIAL_VIEWPORT = { scrollY: 0, height: 1000 };

const boxHeight = (entry: ResizeObserverEntry) =>
  entry.borderBoxSize?.[0]?.blockSize ??
  entry.target.getBoundingClientRect().height;

/**
 * Window-scrolled masonry: items fill the shortest lane in order, and only
 * items near the viewport are mounted. Fixed-ratio items are sized from their
 * ratio; the rest are measured once rendered.
 */
export const VirtualMasonry = ({ items }: { items: MasonryItem[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [layout, setLayout] = useState({ width: INITIAL_WIDTH, top: 0 });
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [heights, setHeights] = useState<Record<string, number>>({});

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const update = () => {
      const width = element.clientWidth;
      const top = element.getBoundingClientRect().top + window.scrollY;
      setLayout((current) =>
        current.width === width && current.top === top
          ? current
          : { width, top }
      );
    };
    update();
    // Body resizes cover content above the grid moving it (header wrapping).
    const observer = new ResizeObserver(update);
    observer.observe(element);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { scrollY, innerHeight: height } = window;
        setViewport((current) =>
          current.scrollY === scrollY && current.height === height
            ? current
            : { scrollY, height }
        );
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const observe = (element: HTMLElement | null) => {
    if (!element) {
      return;
    }
    if (!observerRef.current) {
      observerRef.current = new ResizeObserver((entries) => {
        setHeights((current) => {
          let next = current;
          for (const entry of entries) {
            const key =
              entry.target instanceof HTMLElement
                ? entry.target.dataset.key
                : undefined;
            const height = boxHeight(entry);
            if (key && current[key] !== height) {
              next = next === current ? { ...current } : next;
              next[key] = height;
            }
          }
          return next;
        });
      });
    }
    const observer = observerRef.current;
    observer.observe(element);
    return () => observer.unobserve(element);
  };

  const lanes =
    1 +
    LANE_BREAKPOINTS.filter((breakpoint) => layout.width >= breakpoint).length;
  const laneWidth = (layout.width - GAP * (lanes - 1)) / lanes;

  const { placements, totalHeight } = useMemo(() => {
    const ends: number[] = Array.from({ length: lanes }, () => 0);
    const placed: Placement[] = [];
    const place = (item: MasonryItem, lane: number) => {
      const height = item.aspectRatio
        ? laneWidth / item.aspectRatio
        : (heights[item.key] ?? FALLBACK_HEIGHT);
      placed.push({ item, lane, top: ends[lane] ?? 0, height });
      ends[lane] = (ends[lane] ?? 0) + height + GAP;
    };
    for (const item of items) {
      // Shortest lane; ties go left so the first row fills left to right.
      let lane = 0;
      for (let candidate = 1; candidate < lanes; candidate += 1) {
        if ((ends[candidate] ?? 0) < (ends[lane] ?? 0)) {
          lane = candidate;
        }
      }
      place(item, lane);
    }
    return {
      placements: placed,
      totalHeight: Math.max(0, ...ends) - (placed.length > 0 ? GAP : 0),
    };
  }, [items, lanes, laneWidth, heights]);

  const start = viewport.scrollY - layout.top - OVERSCAN;
  const end = viewport.scrollY - layout.top + viewport.height + OVERSCAN;

  return (
    <div ref={ref} className="relative w-full" style={{ height: totalHeight }}>
      {placements
        .filter(({ top, height }) => top < end && top + height > start)
        .map(({ item, lane, top }) => (
          <div
            key={item.key}
            ref={item.aspectRatio ? undefined : observe}
            data-key={item.key}
            className="absolute top-0 left-0"
            style={{
              width: laneWidth,
              transform: `translate(${lane * (laneWidth + GAP)}px, ${top}px)`,
            }}
          >
            {item.node}
          </div>
        ))}
    </div>
  );
};
