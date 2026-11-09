import { createFileRoute } from "@tanstack/react-router";

import {
  DesignPage,
  designHead,
  loadDesignPage,
} from "@/components/design/design-page";

export const Route = createFileRoute("/{-$locale}/design/motion")({
  component: () => <DesignPage slugs={["motion"]} />,
  loader: () => loadDesignPage(["motion"]),
  head: ({ params }) => designHead(["motion"], params.locale),
});
