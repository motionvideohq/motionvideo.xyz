import { createFileRoute } from "@tanstack/react-router";

import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/creatives` layout; this route only owns
// `/creatives`.
export const Route = createFileRoute("/creatives/")({
  head: () =>
    createMetadata({
      canonical: "/creatives",
      title: "Motion studios and designers",
      description:
        "Find motion studios and independent designers specializing in product launch films. Explore portfolios and discover your next creative partner.",
    }),
});
