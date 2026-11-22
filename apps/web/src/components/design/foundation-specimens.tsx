import { useEffect, useRef, useState } from "react";

import { Button } from "@/registry/ui/button";

const colorTokens = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
] as const;

const ColorTokens = () => {
  const specimen = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const update = () => {
      if (!specimen.current) {
        return;
      }
      const style = getComputedStyle(specimen.current);
      setValues(
        Object.fromEntries(
          colorTokens.map((token) => [
            token,
            style.getPropertyValue(`--${token}`).trim(),
          ])
        )
      );
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={specimen}
      className="text-foreground grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {colorTokens.map((token) => (
        <div key={token} className="shadow-outline overflow-hidden rounded-xl">
          <div
            className="h-20 border-b"
            style={{ backgroundColor: `var(--${token})` }}
          />
          <div className="space-y-1 p-3">
            <p className="font-mono text-xs">--{token}</p>
            <p className="text-muted-foreground min-h-8 font-mono text-[0.65rem] break-words">
              {values[token] ?? "Computed in the active theme"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ColorPairs = () => (
  <>
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        [
          "bg-card text-card-foreground",
          "Card",
          "bg-card · text-card-foreground",
        ],
        [
          "bg-secondary text-secondary-foreground",
          "Secondary",
          "bg-secondary · text-secondary-foreground",
        ],
        [
          "bg-primary text-primary-foreground",
          "Primary action",
          "bg-primary · text-primary-foreground",
        ],
        [
          "bg-accent text-accent-foreground",
          "Highlighted surface",
          "bg-accent · text-accent-foreground",
        ],
      ].map(([className, title, label]) => (
        <div
          key={title}
          className={`${className} shadow-outline rounded-xl p-6`}
        >
          <p className="text-xl font-medium">{title}</p>
          <p className="mt-4 font-mono text-xs">{label}</p>
        </div>
      ))}
    </div>
    <div
      role="note"
      className="bg-destructive/10 text-destructive rounded-xl p-5"
    >
      <p className="font-medium">An upload could not be completed.</p>
      <p className="mt-1 text-sm">
        Error specimen: text-destructive on bg-destructive/10. Always describe
        the error in text, not color alone.
      </p>
    </div>
  </>
);

const typeScale = [
  [
    "Display",
    "text-5xl",
    "text-5xl font-semibold tracking-tight",
    "Make something move.",
  ],
  [
    "Page title",
    "text-4xl",
    "text-4xl font-semibold tracking-tight",
    "A clearer perspective",
  ],
  [
    "Section",
    "text-2xl",
    "text-2xl font-semibold tracking-tight",
    "Built for your workflow",
  ],
  ["Lead", "text-lg", "text-lg", "Good ideas deserve room to breathe."],
  [
    "Body",
    "text-base",
    "text-base leading-7",
    "Keep the message direct and the reading rhythm comfortable.",
  ],
  ["Label", "text-sm", "text-sm font-medium", "Project settings"],
  ["Metadata", "text-xs", "text-xs font-mono", "1920 × 1080 / 24 FPS"],
] as const;

const Typefaces = () => (
  <div className="text-foreground shadow-outline overflow-hidden rounded-xl">
    <div className="space-y-6 p-6 sm:p-8">
      <p className="text-muted-foreground text-sm">Timeless Sans · font-sans</p>
      <p className="font-sans text-6xl tracking-tight break-words sm:text-7xl">
        Ideas in motion.
      </p>
      <p className="text-muted-foreground font-sans text-sm">
        ABCDEFGHIJKLMNOPQRSTUVWXYZ
        <br />
        abcdefghijklmnopqrstuvwxyz 0123456789
      </p>
    </div>
    <div className="bg-muted/40 space-y-5 border-t p-6 font-mono sm:p-8">
      <p className="text-muted-foreground text-xs">Paper Mono · font-mono</p>
      <p className="text-3xl break-words">00:01:24:08</p>
      <p className="text-sm leading-7">
        const frame = 120;
        <br />
        {"export.render({ fps: 24 });"}
      </p>
    </div>
  </div>
);

const TypeScale = () => (
  <div className="text-foreground shadow-outline divide-y overflow-hidden rounded-xl">
    {typeScale.map(([label, token, className, sample]) => (
      <div key={label} className="grid gap-4 p-5 sm:grid-cols-[8rem_1fr]">
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <code className="text-muted-foreground font-mono text-xs">
            {token}
          </code>
        </div>
        <p className={`${className} min-w-0 break-words`}>{sample}</p>
      </div>
    ))}
  </div>
);

const MaterialsGallery = () => (
  <div className="text-foreground bg-muted/40 grid gap-6 rounded-xl p-6 sm:grid-cols-3">
    {[
      [
        "border bg-background",
        "Border",
        "border-border",
        "A structural edge that participates in the box model.",
      ],
      [
        "bg-card text-card-foreground shadow-outline",
        "Outline",
        "shadow-outline",
        "A hairline edge drawn with shadows, without changing layout.",
      ],
      [
        "bg-popover text-popover-foreground shadow-popover",
        "Popover",
        "shadow-popover",
        "The shared outline plus a soft, elevated shadow.",
      ],
    ].map(([className, label, token, text]) => (
      <div key={label} className={`${className} rounded-lg p-5`}>
        <p className="font-medium">{label}</p>
        <code className="text-muted-foreground mt-3 block font-mono text-xs">
          {token}
        </code>
        <p className="mt-4 text-sm leading-6">{text}</p>
      </div>
    ))}
  </div>
);

const RadiusScale = () => (
  <div className="text-foreground grid grid-cols-2 gap-4 sm:grid-cols-4">
    {[
      ["rounded-sm", "--radius-sm", "0.6 × base"],
      ["rounded-lg", "--radius-lg", "1 × base"],
      ["rounded-xl", "--radius-xl", "1.4 × base"],
      ["rounded-2xl", "--radius-2xl", "1.8 × base"],
    ].map(([className, token, ratio]) => (
      <div key={token} className="space-y-3">
        <div
          className={`${className} bg-secondary text-secondary-foreground shadow-outline flex h-24 items-center justify-center`}
        >
          <span className="font-mono text-xs">{className}</span>
        </div>
        <p className="font-mono text-xs">{token}</p>
        <p className="text-muted-foreground text-xs">{ratio}</p>
      </div>
    ))}
  </div>
);

const SpacingScale = () => (
  <div className="text-foreground shadow-outline space-y-4 rounded-xl p-6">
    {[1, 2, 4, 6, 8, 12, 16].map((step) => (
      <div key={step} className="flex items-center gap-4">
        <code className="w-16 shrink-0 font-mono text-xs">space-{step}</code>
        <div
          className="bg-primary h-5 rounded-sm"
          style={{ width: `calc(var(--spacing) * ${step})` }}
        />
        <span className="text-muted-foreground font-mono text-xs">
          {step} × --spacing
        </span>
      </div>
    ))}
  </div>
);

const MotionTracks = () => {
  const [end, setEnd] = useState(false);
  return (
    <>
      <div className="text-foreground bg-muted/40 shadow-outline space-y-6 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium">
            Same distance. Different character.
          </span>
          <Button variant="outline" onClick={() => setEnd((value) => !value)}>
            Replay {end ? "backward" : "forward"}
          </Button>
        </div>
        {[
          ["ease-out", "Settles quickly", "ease-out"],
          ["ease-in-out", "Moves between states", "ease-in-out"],
        ].map(([token, label, easing]) => (
          <div key={token} className="space-y-3">
            <div className="flex flex-wrap justify-between gap-2 text-xs">
              <code className="font-mono">--{token}</code>
              <span className="text-muted-foreground">{label}</span>
            </div>
            <div className="bg-background rounded-lg border p-2">
              <div className="grid grid-cols-[repeat(5,minmax(0,1fr))]">
                <div
                  className={`bg-primary shadow-outline h-10 rounded-md motion-safe:transition-transform motion-safe:duration-(--tabs-duration) ${easing} motion-reduce:transition-none`}
                  style={{
                    transform: end ? "translateX(400%)" : "translateX(0)",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <p className="text-muted-foreground text-xs" aria-live="polite">
          Position: {end ? "end" : "start"}. Duration: --tabs-duration (250ms).
        </p>
      </div>
      <div className="group bg-card shadow-outline focus-within:ring-ring rounded-xl p-6 focus-within:ring-2">
        <Button
          variant="outline"
          onClick={() => setEnd((value) => !value)}
          className="motion-safe:transition-transform motion-safe:duration-(--raise-duration) motion-safe:ease-out motion-safe:group-hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
        >
          Hover, focus, or replay
        </Button>
        <p className="text-muted-foreground mt-4 text-sm">
          A small lift, using --raise-duration (200ms), acknowledges attention.
          Activating this control also replays the tracks above.
        </p>
      </div>
    </>
  );
};

export const foundationMdxComponents = {
  ColorTokens,
  ColorPairs,
  Typefaces,
  TypeScale,
  MaterialsGallery,
  RadiusScale,
  SpacingScale,
  MotionTracks,
};
