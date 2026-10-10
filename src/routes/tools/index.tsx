import { createFileRoute } from "@tanstack/react-router";

import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/tools` layout; this route only owns `/tools`.
export const Route = createFileRoute("/tools/")({
  head: () =>
    createMetadata({
      canonical: "/tools",
      title: "Tools for product films",
      description:
        "Discover video editors, AI video tools, motion design software, and mockups. Search public tools for your next product film.",
    }),
});
