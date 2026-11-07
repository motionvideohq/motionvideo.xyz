import { createFileRoute, notFound } from "@tanstack/react-router";

import { findMotionType } from "@/lib/motion-catalog";

// The gallery renders in the `_gallery` layout, filtered by this route's
// `$type` param (prompt or skill). This route only validates the type; its
// index owns the page's head tags and `videos/$slug` the video overlays.
export const Route = createFileRoute("/{-$locale}/_gallery/type/$type")({
  loader: ({ params }) => {
    if (!findMotionType(params.type)) {
      throw notFound();
    }
  },
});
