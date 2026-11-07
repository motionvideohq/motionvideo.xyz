import { createFileRoute, notFound } from "@tanstack/react-router";

import { NotFound } from "@/components/not-found";

// Deep unmatched paths (`/one/two/three`, `/fr/one/two/three`) still get the
// localized 404 page and a 404 status rather than a blank screen.
export const Route = createFileRoute("/{-$locale}/$")({
  beforeLoad: () => {
    throw notFound();
  },
  component: NotFound,
});
