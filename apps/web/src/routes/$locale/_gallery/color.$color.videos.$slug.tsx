import { createFileRoute } from "@tanstack/react-router";

import { redirectMotionVideo } from "@/lib/motion-video-route";

export const Route = createFileRoute(
  "/$locale/_gallery/color/$color/videos/$slug"
)({
  beforeLoad: redirectMotionVideo,
});
