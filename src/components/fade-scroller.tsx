import { cn } from "cn";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * A horizontally scrolling `<nav>` whose edges fade out only where more
 * content is hidden: the left edge once scrolled, the right edge until the
 * end. Fade widths animate via the registered `--fade-start`/`--fade-end`
 * properties in styles.css.
 */
export const FadeScroller = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) => {
  const ref = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ start: false, end: true });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      // A pixel of slack absorbs subpixel scroll positions.
      const start = scrollLeft > 1;
      const end = scrollLeft + clientWidth < scrollWidth - 1;
      setEdges((current) =>
        current.start === start && current.end === end
          ? current
          : { start, end }
      );
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  return (
    <nav
      ref={ref}
      aria-label={label}
      data-fade-start={edges.start || undefined}
      data-fade-end={edges.end || undefined}
      className={cn(
        "flex [scrollbar-width:none] gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,#000_var(--fade-start),#000_calc(100%-var(--fade-end)),transparent)] transition-[--fade-start,--fade-end] duration-200 data-fade-end:[--fade-end:4rem] data-fade-start:[--fade-start:4rem] motion-reduce:transition-none [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {children}
    </nav>
  );
};
