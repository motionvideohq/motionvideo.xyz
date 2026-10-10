import { createFileRoute } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { createMetadata } from "@/seo/metadata";

// The directory renders in the `/skills` layout; this route only owns `/skills`.
export const Route = createFileRoute("/skills/")({
  head: () =>
    createMetadata({
      canonical: ROUTES.SKILLS,
      title: "Agent skills for motion video",
      description:
        "Open-source agent skills for making motion videos and product films with AI coding agents that write, animate, and render video in code, curated by MotionVideo.",
    }),
});
