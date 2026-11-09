import { createFileRoute } from "@tanstack/react-router";

import {
  DesignPage,
  designHead,
  loadDesignPage,
} from "@/components/design/design-page";

export const Route = createFileRoute("/{-$locale}/design/materials")({
  component: () => <DesignPage slugs={["materials"]} />,
  loader: () => loadDesignPage(["materials"]),
  head: ({ params }) => designHead(["materials"], params.locale),
});
