import { createFileRoute } from "@tanstack/react-router";

import { findMotionCategory } from "@/lib/motion-catalog";
import type { MotionCategory } from "@/lib/motion-catalog";
import { createMetadata } from "@/seo/metadata";

const PAGES: Record<MotionCategory, { title: string; description: string }> = {
  "product-ui": {
    title: "Product UI motion videos",
    description:
      "AI-made motion videos of product interfaces: animated dashboards, app walkthroughs, and launch films, with the prompts and skills behind them.",
  },
  phone: {
    title: "Phone and mobile app motion videos",
    description:
      "AI-made motion videos of phones and mobile apps: animated screens, device mockups, and app launch films, with the prompts behind them.",
  },
  charts: {
    title: "Animated chart and data videos",
    description:
      "AI-made motion videos of charts and data: animated graphs, metrics, and number reveals, with the prompts and skills behind them.",
  },
  diagrams: {
    title: "Animated diagram videos",
    description:
      "AI-made motion videos of diagrams: animated flows, architectures, and explainers, with the prompts and skills behind them.",
  },
  "kinetic-type": {
    title: "Kinetic typography videos",
    description:
      "AI-made kinetic typography: animated text, titles, and type-driven motion videos, with the prompts and skills behind them.",
  },
  // oxlint-disable-next-line anti-slop/no-shape-in-symbol-names
  shapes: {
    title: "Animated shape and geometry videos",
    description:
      "AI-made motion videos of shapes and geometry: abstract loops, morphing forms, and graphic animation, with the prompts behind them.",
  },
  particles: {
    title: "Particle animation videos",
    description:
      "AI-made particle animations: swarms, dots, and generative motion videos, with the prompts and skills behind them.",
  },
  characters: {
    title: "Character animation videos",
    description:
      "AI-made character animations: mascots, avatars, and illustrated motion videos, with the prompts and skills behind them.",
  },
  photos: {
    title: "Photo motion videos",
    description:
      "AI-made motion videos built from photos and imagery: slideshows, collages, and photo animation, with the prompts behind them.",
  },
  music: {
    title: "Music and audio-reactive videos",
    description:
      "AI-made motion videos set to music: beat-synced edits, visualizers, and audio-reactive animation, with the prompts behind them.",
  },
  code: {
    title: "Code animation videos",
    description:
      "AI-made motion videos of code: animated editors, terminals, and developer tool launches, with the prompts and skills behind them.",
  },
};

// Head tags for a Discover category page, e.g. `/category/product-ui`. The
// parent route has already rejected unknown categories.
export const Route = createFileRoute("/_gallery/category/$category/")({
  head: ({ params }) => {
    const category = findMotionCategory(params.category);
    return createMetadata({
      canonical: `/category/${params.category}`,
      ...(category && PAGES[category]),
    });
  },
});
