import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { findMoveFamily } from "@/lib/move-families";
import type { MoveFamily } from "@/lib/move-families";
import { createMetadata } from "@/seo/metadata";

const PAGES: Record<MoveFamily, { title: string; description: string }> = {
  timing: {
    title: "Timing and easing moves",
    description:
      "Motion design timing techniques: easing, springs, anticipation, overshoot and follow-through, with examples from AI-made videos.",
  },
  type: {
    title: "Kinetic typography moves",
    description:
      "Kinetic type techniques: letter and word reveals, typewriter, scramble, mask reveals and headline punches, with examples from AI-made videos.",
  },
  transitions: {
    title: "Transition moves",
    description:
      "Scene transition techniques: match cuts, whip pans, wipes, iris and morph transitions, with examples from AI-made videos.",
  },
  ui: {
    title: "Product UI motion moves",
    description:
      "Product UI animation techniques: cursor-led demos, click ripples, card stacks, toasts and number tickers, with examples from AI-made videos.",
  },
  vector: {
    title: "Vector and shape moves",
    description:
      "Vector animation techniques: path draw-on, shape morphs, mask reveals, gooey merges and radial bursts, with examples from AI-made videos.",
  },
  generative: {
    title: "Generative motion moves",
    description:
      "Generative motion techniques: particles, flow fields, noise displacement, instanced grids and L-systems, with examples from AI-made videos.",
  },
  camera: {
    title: "Camera moves",
    description:
      "Virtual camera techniques: dolly in, push-in, orbit, parallax, rack focus and dolly zoom, with examples from AI-made videos.",
  },
  texture: {
    title: "Texture and finish moves",
    description:
      "Texture techniques for motion: film grain, glow, halftone, scanlines, mesh gradients and motion blur, with examples from AI-made videos.",
  },
  data: {
    title: "Data visualization moves",
    description:
      "Animated data techniques: bar chart races, line draws, counters, map routes and annotations, with examples from AI-made videos.",
  },
  sound: {
    title: "Sound and rhythm moves",
    description:
      "Audio-driven motion techniques: beat-synced cuts, kick pulses, waveforms, lyric sync and risers, with examples from AI-made videos.",
  },
};

// Head tags for a family page, e.g. `/moves/timing`. The parent route has
// already rejected unknown families.
export const Route = createFileRoute("/moves/$family/")({
  head: ({ params }) => {
    const family = findMoveFamily(params.family);
    return createMetadata({
      canonical: `${ROUTES.MOVES}/${params.family}`,
      ...(family && PAGES[family]),
    });
  },
});
