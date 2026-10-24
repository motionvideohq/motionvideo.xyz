import { createFileRoute, notFound } from "@tanstack/react-router";

import { findMoveFamily } from "@/lib/move-families";

// The grid renders in the `/moves` layout, filtered by this route's `$family`
// param. This route only checks the param: its index owns the family page's
// head tags and `$slug` the move overlays.
export const Route = createFileRoute("/moves/$family")({
  beforeLoad: ({ params }) => {
    if (!findMoveFamily(params.family)) {
      throw notFound();
    }
  },
});
