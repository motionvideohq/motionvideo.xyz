import { createFileRoute, notFound } from "@tanstack/react-router";

import { findMotionModel } from "@/lib/motion-catalog";

// The gallery renders in the `_gallery` layout, filtered by this route's
// `$model` param (a motionModelSlug). This route only validates the model;
// its index owns the page's head tags and `videos/$slug` the video overlays.
export const Route = createFileRoute("/{-$locale}/_gallery/model/$model")({
  loader: ({ params }) => {
    if (!findMotionModel(params.model)) {
      throw notFound();
    }
  },
});
