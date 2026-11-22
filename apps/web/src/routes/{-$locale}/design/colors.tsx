import { createFileRoute } from "@tanstack/react-router";

import {
  DesignPage,
  designHead,
  loadDesignPage,
} from "@/components/design/design-page";

export const Route = createFileRoute("/{-$locale}/design/colors")({
  component: () => <DesignPage slugs={["colors"]} />,
  loader: () => loadDesignPage(["colors"]),
  head: ({ params }) => designHead(["colors"], params.locale),
});
