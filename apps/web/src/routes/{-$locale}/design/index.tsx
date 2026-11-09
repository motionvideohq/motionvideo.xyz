import { createFileRoute } from "@tanstack/react-router";

import {
  DesignPage,
  designHead,
  loadDesignPage,
} from "@/components/design/design-page";

export const Route = createFileRoute("/{-$locale}/design/")({
  component: () => <DesignPage slugs={[]} />,
  loader: () => loadDesignPage([]),
  head: ({ params }) => designHead([], params.locale),
});
