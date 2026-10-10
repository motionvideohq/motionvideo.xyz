import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/extras` layout; this route only owns `/extras`.
export const Route = createFileRoute("/extras/")({
  head: () =>
    createMetadata({
      canonical: ROUTES.EXTRAS,
      title: "Motion video extras",
      description:
        "Articles, references, and other resources for making motion videos and product films that fit no other section, curated by MotionVideo.",
    }),
});
