import { createFileRoute } from "@tanstack/react-router";

import { DesignLayout } from "@/components/design/design-layout";

export const Route = createFileRoute("/{-$locale}/design")({
  component: DesignLayout,
});
