import { cn } from "cn";
import { useEffect, useRef } from "react";

import kernel from "./kernel.js?raw";

// Hosts one Hairline figure (github.com/lucasmarkes/hairline), the way the
// skill's bench.html does. `kernel.js` and the figure are vendored verbatim
// and run as inline scripts: the kernel once per page (it defines `HL`), the
// figure on every mount, wrapped in a strict block so its top-level `const`s
// stay scoped and it can run again. The figure ends in `hairline({ ... })`,
// which hits a host defined only while it runs.

type Point = [number, number];

interface Figure {
  means: string;
  mount: (
    host: { read: { textContent: string }; stage: HTMLElement; svg: Element },
    value: number
  ) => { destroy: () => void };
  name: string;
  range: [number, number, number];
  tour: (Point | null)[] | null;
}

interface Kernel {
  inject: (root: Document) => void;
  LAP: (Point | null)[];
  mk: (tag: string, attrs: Record<string, string>, parent: Element) => Element;
  reducedMotion: () => boolean;
  tour: (stage: HTMLElement, stops: (Point | null)[]) => { stop: () => void };
}

declare global {
  interface Window {
    hairline?: (figure: Figure) => void;
    HL?: Kernel;
  }
}

const run = (code: string) => {
  const script = document.createElement("script");
  script.textContent = code;
  // SAFETY: an upcast; every Element is a ParentNode. The Workers types
  // redeclare Element#append (for HTMLRewriter), hiding the DOM signature.
  (document.head as ParentNode).append(script);
  script.remove();
};

/** Runs the figure's source and mounts it on `stage`; returns its tear-down. */
const mountFigure = (stage: HTMLElement, tag: HTMLElement, source: string) => {
  if (!window.HL) {
    run(kernel);
  }
  const { HL } = window;
  if (!HL) {
    return;
  }

  // A script's errors reach window.onerror, not this caller, so the host is
  // removed unconditionally; a figure that failed leaves `figure` unset.
  let figure: Figure | undefined;
  window.hairline = (f) => {
    figure = f;
  };
  run(`"use strict";{\n${source}\n}`);
  delete window.hairline;
  if (!figure) {
    return;
  }

  HL.inject(document);
  stage.dataset.hairline = figure.name;
  stage.setAttribute("role", "img");
  stage.setAttribute("aria-label", figure.means);
  const svg = HL.mk(
    "svg",
    { "aria-hidden": "true", viewBox: "0 0 400 320" },
    stage
  );
  let text = "";
  const read = {
    get textContent() {
      return text;
    },
    set textContent(value: string) {
      text = value;
      tag.textContent = value;
    },
  };
  const handle = figure.mount({ read, stage, svg }, figure.range[1]);
  if (!text) {
    read.textContent = "rest";
  }
  // The page plays the figure's lap until a real pointer arrives.
  const tour = HL.reducedMotion()
    ? null
    : HL.tour(stage, figure.tour ?? HL.LAP);

  return () => {
    tour?.stop();
    handle.destroy();
    svg.remove();
    tag.textContent = "";
    delete stage.dataset.hairline;
    stage.removeAttribute("role");
    stage.removeAttribute("aria-label");
  };
};

export const HairlineFigure = ({
  className,
  figure: source,
}: {
  className?: string;
  /** The figure's source, e.g. `import figure from "./name.js?raw"`. */
  figure: string;
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!stageRef.current || !readRef.current) {
      return;
    }
    return mountFigure(stageRef.current, readRef.current, source);
  }, [source]);

  return (
    <div className={cn("relative", className)}>
      <span
        ref={readRef}
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute top-3 right-3.5 z-10 font-mono text-[11px] leading-none tabular-nums"
      />
      {/* color-scheme pins the kernel's light-dark() palette to the site's
          theme rather than the OS's; plates take the page background. */}
      <div
        ref={stageRef}
        className="aspect-[5/4] w-full [color-scheme:light] [--hairline-plate:var(--background)] dark:[color-scheme:dark]"
      />
    </div>
  );
};
