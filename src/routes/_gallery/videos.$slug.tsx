import { createFileRoute } from "@tanstack/react-router";

import { MotionVideoOverlay } from "@/components/motion-video";
import {
  loadMotionVideo,
  motionVideoHead,
  videoNeighbours,
} from "@/lib/motion-video-route";

const VideoRoute = () => {
  const { video } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { previous, next } = videoNeighbours(video.slug, search);
  // Stepping replaces the entry, so Back still leaves the overlay.
  const open = (slug: string) =>
    navigate({
      to: "/videos/$slug",
      params: { slug },
      search,
      replace: true,
      resetScroll: false,
    });
  return (
    <MotionVideoOverlay
      video={video}
      previous={previous ? () => open(previous) : undefined}
      next={next ? () => open(next) : undefined}
      onClose={() =>
        navigate({
          to: "/",
          search,
          resetScroll: false,
          viewTransition: true,
        })
      }
    />
  );
};

// Rendered inside the `_gallery` layout, so the grid stays visible behind it.
export const Route = createFileRoute("/_gallery/videos/$slug")({
  component: VideoRoute,
  loader: loadMotionVideo,
  head: motionVideoHead,
});
