import { createFileRoute, notFound } from "@tanstack/react-router";

import { findMotionCategory } from "@/lib/motion-catalog";

// The gallery renders in the `_gallery` layout, filtered by this route's
// `$category` param. This route only validates the category; its index owns
// the page's head tags and `videos/$slug` the video overlays (no component:
// the matched child renders in its place).
export const Route = createFileRoute("/_gallery/category/$category")({
  loader: ({ params }) => {
    if (!findMotionCategory(params.category)) {
      throw notFound();
    }
  },
});
