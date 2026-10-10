import { createFileRoute } from "@tanstack/react-router";

import { MotionVideoOverlay } from "@/components/motion-video";
import { findMotionCategory } from "@/lib/motion-catalog";
import {
  loadMotionVideo,
  motionVideoHead,
  videoNeighbours,
} from "@/lib/motion-video-route";

const CategoryVideoRoute = () => {
  const { video } = Route.useLoaderData();
  const { category } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { previous, next } = videoNeighbours(video.slug, {
    ...search,
    category: findMotionCategory(category),
  });
  // Stepping replaces the entry, so Back still leaves the overlay.
  const open = (slug: string) =>
    navigate({
      to: "/category/$category/videos/$slug",
      params: { category, slug },
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
          to: "/category/$category",
          params: { category },
          search,
          resetScroll: false,
          viewTransition: true,
        })
      }
    />
  );
};

// A video opened from a category page: the grid behind it keeps the category
// filter, and closing returns to the category page. The parent route validates
// the category; the head tags (and canonical) are the video's.
export const Route = createFileRoute(
  "/_gallery/category/$category/videos/$slug"
)({
  component: CategoryVideoRoute,
  loader: loadMotionVideo,
  head: motionVideoHead,
});
