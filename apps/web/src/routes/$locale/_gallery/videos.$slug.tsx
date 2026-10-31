import { createFileRoute } from "@tanstack/react-router";

import { MotionVideoOverlay } from "@/components/motion-video";
import { useLocalizedNavigate } from "@/hooks/use-localized-navigate";
import {
  galleryDestination,
  useVideoGalleryContext,
} from "@/lib/gallery-navigation";
import { scopeFilters } from "@/lib/motion-catalog";
import {
  loadMotionVideo,
  motionVideoHead,
  videoNeighbours,
} from "@/lib/motion-video-route";

const VideoRoute = () => {
  const { video } = Route.useLoaderData();
  const videoGallery = useVideoGalleryContext();
  const search = videoGallery?.search ?? {};
  const navigate = useLocalizedNavigate();
  const { previous, next } = videoNeighbours(video.slug, {
    ...search,
    ...scopeFilters(videoGallery?.scope),
  });
  // Stepping replaces the entry, so Back still leaves the overlay.
  const open = (slug: string) =>
    navigate({
      to: "/videos/$slug",
      params: { slug },
      search: {},
      state: { videoGallery },
      replace: true,
      resetScroll: false,
    });
  return (
    <MotionVideoOverlay
      video={video}
      openVideo={open}
      previous={previous ? () => open(previous) : undefined}
      next={next ? () => open(next) : undefined}
      onClose={() =>
        navigate({
          ...galleryDestination(videoGallery?.scope),
          search,
          resetScroll: false,
          viewTransition: true,
        })
      }
    />
  );
};

// Rendered inside the `_gallery` layout, so the grid stays visible behind it.
export const Route = createFileRoute("/$locale/_gallery/videos/$slug")({
  component: VideoRoute,
  loader: loadMotionVideo,
  head: motionVideoHead,
});
