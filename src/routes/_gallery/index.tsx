import { createFileRoute } from "@tanstack/react-router";

import { createMetadata } from "@/seo/metadata";

// The gallery itself renders in the `_gallery` layout; this route only owns `/`.
export const Route = createFileRoute("/_gallery/")({
  head: () =>
    createMetadata({
      canonical: "/",
      title: "Motion video inspiration",
      description:
        "Explore AI-made motion videos, their prompts, and creator skills. A searchable collection of motion design inspiration, curated by MotionVideo.",
    }),
});
