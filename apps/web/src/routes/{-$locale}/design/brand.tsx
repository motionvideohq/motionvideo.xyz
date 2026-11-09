import { createFileRoute } from "@tanstack/react-router";

import {
  DesignPage,
  designHead,
  loadDesignPage,
} from "@/components/design/design-page";

export const Route = createFileRoute("/{-$locale}/design/brand")({
  component: () => <DesignPage slugs={["brand"]} />,
  loader: () => loadDesignPage(["brand"]),
  head: ({ params }) => designHead(["brand"], params.locale),
});
