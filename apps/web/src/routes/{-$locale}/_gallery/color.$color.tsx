import { createFileRoute, notFound } from "@tanstack/react-router";

import { COLOR_PAGES } from "@/lib/motion-video-route";

// The gallery renders in the `_gallery` layout, filtered by this route's
// `$color` param (a MOTION_COLORS slug). This route only validates the
// colour, rejecting those too thin for a page; its index owns the page's head
// tags and `videos/$slug` the video overlays.
export const Route = createFileRoute("/{-$locale}/_gallery/color/$color")({
  loader: ({ params }) => {
    if (!COLOR_PAGES.some((color) => color.slug === params.color)) {
      throw notFound();
    }
  },
});
