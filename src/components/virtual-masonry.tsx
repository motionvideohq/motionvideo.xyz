import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

// oxlint-disable-next-line import/no-duplicates -- ?raw is source text, not the executable module.
import layoutMasonry from "@/lib/masonry-layout.js";
import layoutSource from "@/lib/masonry-layout.js?raw";

export interface MasonryItem {
  key: string;
  /** width / height of fixed-ratio media; omit to measure the rendered item. */
  aspectRatio?: number;
  node: ReactNode;
}

const GAP = 12;
// Extra pixels mounted above and below the viewport.
const OVERSCAN = 900;
// The fallback is only used to choose the server's initial mounted window.
const INITIAL_WIDTH = 1280;
const INITIAL_VIEWPORT = { scrollY: 0, height: 1000 };

interface InitialLayout {
  width: number;
  top: number;
  heights: Record<string, number>;
}

const readInitialLayout = (id: string): InitialLayout | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }
  const serialized = document.querySelector<HTMLElement>(
    `#${CSS.escape(id)}`
  )?.dataset.masonryLayout;
  return serialized ? JSON.parse(serialized) : undefined;
};

// Run synchronously while parsing SSR HTML, before cards can paint at guessed
// widths. Use the same layout function as React; hydration adopts its snapshot.
const initialLayoutScript = (items: MasonryItem[]) => `
(() => {
  ${layoutSource.replace("export default ", "")}
  const grid = document.currentScript.previousElementSibling;
  const items = ${JSON.stringify(items.map(({ key, aspectRatio }) => ({ key, aspectRatio }))).replaceAll("<", "\\u003c")};
  const width = grid.clientWidth;
  const heights = {};
  const cards = [...grid.children];
  const { laneWidth } = layoutMasonry(items, width, heights);
  for (const card of cards) card.style.width = laneWidth + "px";
  for (const card of cards) {
    const item = items.find(item => item.key === card.dataset.key);
    if (!item.aspectRatio) heights[item.key] = card.getBoundingClientRect().height;
  }
  const { placements, totalHeight } = layoutMasonry(items, width, heights);
  const byKey = new Map(placements.map(placement => [placement.item.key, placement]));
  for (const card of cards) {
    const { lane, top } = byKey.get(card.dataset.key);
    card.style.transform = "translate(" + lane * (laneWidth + ${GAP}) + "px, " + top + "px)";
  }
  grid.style.height = totalHeight + "px";
  grid.dataset.masonryLayout = JSON.stringify({
    width,
    top: grid.getBoundingClientRect().top + window.scrollY,
    heights,
  });
})();
`;

const boxHeight = (entry: ResizeObserverEntry) =>
  entry.borderBoxSize?.[0]?.blockSize ??
  entry.target.getBoundingClientRect().height;

/**
 * Window-scrolled masonry: items fill the shortest lane in order, and only
 * items near the viewport are mounted. Fixed-ratio items are sized from their
 * ratio; the rest are measured once rendered.
 */
export const VirtualMasonry = ({ items }: { items: MasonryItem[] }) => {
  const id = useId();
  const initialLayout = useMemo(() => readInitialLayout(id), [id]);
  const [initializing, setInitializing] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [layout, setLayout] = useState(
    initialLayout
      ? { width: initialLayout.width, top: initialLayout.top }
      : { width: INITIAL_WIDTH, top: 0 }
  );
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [heights, setHeights] = useState<Record<string, number>>(
    initialLayout?.heights ?? {}
  );

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
    setViewport({ scrollY: window.scrollY, height: window.innerHeight });
    setInitializing(false);
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

  const { placements, totalHeight, laneWidth } = useMemo(
    () => layoutMasonry(items, layout.width, heights),
    [items, layout.width, heights]
  );
  // Hydrate exactly the cards emitted by the server. The parser-time script
  // has already placed them; switch to the real scroll window before paint.
  const initialKeys = useMemo(
    () =>
      initializing
        ? new Set(
            layoutMasonry(items, INITIAL_WIDTH, {})
              .placements.filter(
                ({ top }) => top < INITIAL_VIEWPORT.height + OVERSCAN
              )
              .map(({ item }) => item.key)
          )
        : undefined,
    [items, initializing]
  );
  const script = useMemo(() => initialLayoutScript(items), [items]);

  const start = viewport.scrollY - layout.top - OVERSCAN;
  const end = viewport.scrollY - layout.top + viewport.height + OVERSCAN;

  return (
    <>
      <div
        id={id}
        ref={ref}
        data-masonry-layout={initialLayout && JSON.stringify(initialLayout)}
        className="relative w-full"
        style={{ height: totalHeight }}
      >
        {placements
          .filter(({ item, top, height }) =>
            initialKeys
              ? initialKeys.has(item.key)
              : top < end && top + height > start
          )
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
      <script>{script}</script>
    </>
  );
};
