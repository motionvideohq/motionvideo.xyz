import { createFileRoute } from "@tanstack/react-router";

import {
  DesignPage,
  designHead,
  loadDesignPage,
} from "@/components/design/design-page";

export const Route = createFileRoute("/{-$locale}/design/typography")({
  component: () => <DesignPage slugs={["typography"]} />,
  loader: () => loadDesignPage(["typography"]),
  head: ({ params }) => designHead(["typography"], params.locale),
});
