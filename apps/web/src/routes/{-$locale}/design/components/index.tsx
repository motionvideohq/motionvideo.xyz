import { createFileRoute } from "@tanstack/react-router";

import {
  DesignPage,
  designHead,
  loadDesignPage,
} from "@/components/design/design-page";

export const Route = createFileRoute("/{-$locale}/design/components/")({
  component: () => <DesignPage slugs={["components"]} />,
  loader: () => loadDesignPage(["components"]),
  head: ({ params }) => designHead(["components"], params.locale),
});
