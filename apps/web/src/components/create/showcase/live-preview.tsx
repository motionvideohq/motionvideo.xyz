import { hasTemplate } from "@motionvideo/engine";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

// The hero player needs WebGL and the three.js composition, so it never
// renders on the server and loads as its own chunk; until then a plain frame
// of the same size holds its place.

const HeroPlayer = lazy(async () => {
  const module = await import("@/components/create/showcase/hero-player");
  return { default: module.HeroPlayer };
});

/** The templates the marketing previews cycle through: one per look. */
export const HERO_TEMPLATES = [
  "shelf",
  "tilted-band",
  "hand-fan",
  "browser-hero",
].filter(hasTemplate);

export const LivePreview = (props: ComponentProps<typeof HeroPlayer>) => {
  const placeholder = (
    <div className={cn("flex flex-col gap-3", props.className)}>
      <div className="bg-muted aspect-video animate-pulse rounded-xl border shadow-sm" />
      {props.chips !== false && <div className="h-7" />}
    </div>
  );
  return (
    <ClientOnly fallback={placeholder}>
      <Suspense fallback={placeholder}>
        <HeroPlayer {...props} />
      </Suspense>
    </ClientOnly>
  );
};
